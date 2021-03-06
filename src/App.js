import React, { Component } from "react";
import * as $ from "jquery";
import * as _ from "underscore";
import { authEndpoint, clientId, scopes } from "./config";
import "./App.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Spinner, Row, Col, ListGroup, Image, Alert} from 'react-bootstrap';
import Sidebar from "react-sidebar";

import Typography from "@material-ui/core/Typography";

import MaterialTitlePanel from "./Components/TitlePanel";
import SidebarContent from "./Components/SidebarContent";
import Followee from "./Components/Followee";
import SearchBox from "./Components/SearchBox";
import BottomNavigationComponent from "./Components/BottomNavigation";
import TabsNavigationComponent from "./Components/TabsNavigation";
import Follower from "./Components/Follower";
import {db, functions} from './fire';
import Logo from './logo.png'

require('dotenv').config();

const local = process.env.REACT_APP_IS_LOCAL==="true"

let wp_URL = (local ?
    "http://".concat(window.location.hostname.concat(":").concat(process.env.REACT_APP_PORT)) :
    process.env.REACT_APP_WP_URL)

const queryString = require('query-string');
const redirectUri = window.location.href.split("?")[0]

const styles = {
  contentHeaderMenuLink: {
    textDecoration: "none",
    color: "white",
    padding: 8
  },
  content: {
    padding: 0,
    height: "100%",
    overflow: "hidden"
  }
};

const mql = window.matchMedia(`(min-width: 800px)`);

class App extends Component {
  intervalId;
  //userSubscription = () => {console.log("attempt unsubscribe")};
  followingSubscription = () => {console.log("attempt unsubscribe")};
  followersSubscription = () => {console.log("attempt unsubscribe")};
  //recommendedSubscription = () => {console.log("attempt unsubscribe")};

  constructor(props) {
    super(props);

    this.state = {
      code: null,
      alert: null,
      alert_subtext: "",
      user_id: localStorage.getItem('user_id'),
      location: this.props.location,
      docked: mql.matches,
      open: false,
      user: null,
      following: null,
      followers: null,
      recommended_follows: null,
      home_tab_index: 0,
      bottom_tab: "home",
      following_loading_ids: [],
      followers_loading_ids: [],
    };

    this.createUser = this.createUser.bind(this);
    this.updateFollowing = this.updateFollowing.bind(this)
    this.getUser = this.getUser.bind(this);
    this.getFollowing = this.getFollowing.bind(this);
    this.getFollowers = this.getFollowers.bind(this);
    this.getRecommendedFollows = this.getRecommendedFollows.bind(this);
    this.clearSession = this.clearSession.bind(this);
    this.toggleFollow = this.toggleFollow.bind(this);
    this.toggleListen = this.toggleListen.bind(this);
    this.handleHomeTabChange = this.handleHomeTabChange.bind(this);
    this.handleBottomTabChange = this.handleBottomTabChange.bind(this);

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.onSetOpen = this.onSetOpen.bind(this);
  }

  componentDidMount() {
    mql.addListener(this.mediaQueryChanged);

    let _code = queryString.parse(this.state.location.search).code;
    if (this.state.user_id){
      this.getUser(this.state.user_id)
    }
    else if (_code) {
      this.setState({
        code: _code
      });
      this.createUser(_code);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.intervalID);
    this.followersSubscription();
    this.followingSubscription();
  }

  clearSession() {
    localStorage.clear()
    this.followersSubscription();
    this.followingSubscription();
    this.setState({
      code: null,
      user_id: null,
      user: null,
    })
  }

  onSetOpen(open) {
    this.setState({ open });
  }

  mediaQueryChanged() {
    this.setState({
      docked: mql.matches,
      tab: "home",
      open: false
    });
  }

  toggleOpen(ev) {
    this.setState({ open: !this.state.open });
    if (ev) {
      ev.preventDefault();
    }
  }

  getUser(user_id){
    const userRef = db.collection("users").doc(user_id);
    const self = this;
    userRef.get().then(function(doc) {
      if (doc.exists) {
        self.setState({
          user: doc.data()
        })
        self.updateFollowing(user_id)
        self.getFollowers(user_id)
      } else {
        self.clearSession()
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });

    /*
    this.userSubscription();
    this.userSubscription = userRef.onSnapshot(function(doc) {
      if (doc.exists) {
        self.setState({
          user: doc.data()
        })
        self.updateFollowing(user_id, false)
        self.getFollowers(user_id)
        //self.getRecommendedFollows(doc.data())
      } else {
        self.clearSession()
        console.log("No such document!");
      }
    })
     */
  }

  createUser(code){
    $.ajax({
      url: `${wp_URL}/api/users/createUser`,
      type: "POST",
      data: $.param({"code": code, "redirect_uri": redirectUri}),
      success: data => {
        const json = $.parseJSON(data)
        if (json.id){ // set "true" for testing
          localStorage.setItem('user_id', json.id);
          this.setState({
            user_id: json.id
          })
          this.getUser(json.id);
        }
      },
      error: error_msg => {
        console.log(error_msg)
      }
    });
  }

  updateFollowing(user_id, update){
    $.ajax({
      url: `${wp_URL}/api/users/updateFollowing`,
      type: "POST",
      data: $.param({"id": user_id}),
      success: data => {
        if(!update) this.getFollowing(user_id)
        this.intervalID = setTimeout(()=>{this.updateFollowing(user_id, true)}, 10000);
      },
      error: error_msg => {
        console.log(error_msg)
      }
    });
  }

  getFollowing(user_id){
    const usersRef = db.collection("users").where("followers", "array-contains", user_id);
    const self = this;
    this.followingSubscription()
    this.followingSubscription = usersRef
        .onSnapshot(function(querySnapshot) {
          let following = [];
          querySnapshot.forEach(function(doc) {
            following.push({ ...doc.data(), ...{'id': doc.id}});
          });
          following.sort(function(a, b) {
            if((a.listeners||[]).includes(user_id) > (b.listeners||[]).includes(user_id)) return -1;
            if((a.listeners||[]).includes(user_id) < (b.listeners||[]).includes(user_id)) return 1;

            if((a.spotify_playback||{}).is_active > (b.spotify_playback||{}).is_active) return -1;
            if((a.spotify_playback||{}).is_active < (b.spotify_playback||{}).is_active) return 1;
          });
          self.setState({
            following: following,
          })
        });
  }

  getFollowers(user_id){
    const usersRef = db.collection("users").where("following", "array-contains", user_id);
    const self = this;
    this.followersSubscription()
    this.followersSubscription = usersRef
        .onSnapshot(function(querySnapshot) {
          let followers = [];
          querySnapshot.forEach(function(doc) {
            followers.push({ ...doc.data(), ...{'id': doc.id}});
          });
          self.setState({
            followers: followers,
          })
        });
  }

  getRecommendedFollows(user){
    const following = user.following || []
    if(following.length>0){
      const usersRef = db.collection("users").where(
          "followers", "array-contains-any", _.sample(following, 10));
      const self = this;
      this.recommendedSubscription()
      this.recommendedSubscription = usersRef
          .onSnapshot(function(querySnapshot) {
            let recommended_follows = [];
            querySnapshot.forEach(function(doc) {
              if(!following.includes(doc.id))
                recommended_follows.push({ ...doc.data(), ...{'id': doc.id}});
            });
            self.setState({
              recommended_follows: recommended_follows,
            })
          });
    }
  }

  toggleFollow(id, following){
    const following_joined = this.state.following_loading_ids.concat(id);
    const followers_joined = this.state.followers_loading_ids.concat(id);
    this.setState({
      following_loading_ids: following_joined,
      followers_loading_ids: followers_joined
    })
    const self = this;
    const cloudFunction = following ?
        functions.httpsCallable('removeFollower') :
        functions.httpsCallable('addFollower');
    cloudFunction({follower_id: this.state.user_id, followee_id: id}).then(function(result) {
      self.setState({
        following_loading_ids: [],
        follower_loading_ids: []
      })
      return true
    }).catch(function(error) {
      console.log(error)
      return false
    });
  }

  toggleListen(id, listening){
    const joined = this.state.following_loading_ids.concat(id);
    this.setState({
      following_loading_ids: joined,
    })
    const self = this;
    if (!listening){
      $.ajax({
        url: `${wp_URL}/api/spotify/playback/transfer/${id}/${self.state.user_id}`,
        type: "POST",
        success: data => {
          if ([200, 204].includes(data.status_code)){
            functions.httpsCallable('clearListeners')({listener_id: this.state.user_id}).then(function(result){
              functions.httpsCallable('addListener')({listener_id: self.state.user_id, listenee_id: id}).then(function(result) {
                self.clearAlert();
                self.setState({
                  following_loading_ids: [],
                })
              })
            })
          } else if (data.status_code === 404){
            self.setState({
              following_loading_ids: [],
              alert: "Whoops! Something went wrong",
              alert_subtext: "Open Spotify on any device and start playing something before trying again"
            })
          }
        },
        error: error_msg => {
          self.setState({
            following_loading_ids: [],
          })
          console.log(error_msg)
        }
      });
    }
    else{
      functions.httpsCallable('removeListener')({listener_id: self.state.user_id, listenee_id: id}).then(function(result) {
        self.setState({
          following_loading_ids: [],
        })
      })
    }
  }

  handleHomeTabChange(event, newValue){
    this.setState({
      home_tab_index: newValue
    })
  }

  handleBottomTabChange(event, newValue){
    this.setState({
      bottom_tab: newValue
    })
  }

  clearAlert = () => {
    this.setState({
      alert: null,
      alert_subtext: ""
    })
  }

  render() {

    const sidebar = <SidebarContent
        user={this.state.user}
        clearSession={this.clearSession}
    />;

    const contentHeader = (
        <span>
        {!this.state.docked && (
            <a
                onClick={this.toggleOpen}
                href="#"
                style={styles.contentHeaderMenuLink}
            >
              =
            </a>
        )}
          <span>{this.state.bottom_tab.charAt(0).toUpperCase() + this.state.bottom_tab.slice(1)}</span>
      </span>
    );

    const sidebarProps = {
      sidebar,
      docked: this.state.docked,
      open: this.state.open,
      onSetOpen: this.onSetOpen,
    };

    const following = this.state.following ? this.state.following.map((f, index) => <Followee
        key={index}
        user_id={this.state.user_id}
        user={f}
        toggleFollow={this.toggleFollow}
        toggleListen={this.toggleListen}
        loading_ids={this.state.following_loading_ids}
        listening_id={this.state.listening_id}
    >
    </Followee>) : [];

    const followers = this.state.followers ? this.state.followers.map((f, index) => <Follower
        key={index}
        user_id={this.state.user_id}
        user={f}
        toggleFollow={this.toggleFollow}
        loading_ids={this.state.followers_loading_ids}
        switchFollow={()=>f.following=!f.following}
    />) : [];

    const recommended_follows = this.state.recommended_follows ? this.state.recommended_follows.map((f, index) => <Follower
        key={index}
        user_id={this.state.user_id}
        user={f}
        toggleFollow={this.toggleFollow}
        loading_ids={this.state.followers_loading_ids}
        switchFollow={()=>f.following=!f.following}
    />) : [];

    return (
        <div className="App">
            {!this.state.code && !this.state.user_id && (
                <React.Fragment>
                  <div style={{maxHeight: 150, maxWidth: 150, marginBottom: '1%'}}>
                    <Image src={Logo} roundedCircle fluid/>
                  </div>
                  <Typography variant="h4" gutterBottom>
                    Guppy
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                   Tune in, not out
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    You listen to music on Spotify, we'll handle the rest
                  </Typography>
                <Button
                    style={{marginTop: '3%'}}
                    href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                    "%20"
                )}&response_type=code&show_dialog=true`}>Continue with Spotify</Button>
                </React.Fragment>
            )}
            {this.state.user && (
                <Sidebar {...sidebarProps}>
                  <MaterialTitlePanel title={contentHeader}>
                    <div style={styles.content}>
                      <Container style={{padding: 0, margin: 0}}>
                        <Row style={{margin: 0, height: "100%"}}>
                          <Col
                              xs={12} sm={12} md={7}
                              style={{
                                  padding: 0,
                                  height: "100%",
                                  overflowY: "hidden",
                                  borderRight: 'solid 1px rgba(0,0,0,.125)',
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "flex-start",
                                  alignItems: "center"
                              }}>
                            {!this.state.following && (
                                  <Spinner animation="grow" variant="primary" style={{marginTop: "10%"}}/>
                            )}
                            {this.state.following && this.state.bottom_tab==="home" && (
                                <TabsNavigationComponent
                                    first_tab={
                                      <React.Fragment>
                                        {this.state.alert && (
                                            <Alert variant="danger" onClose={this.clearAlert} dismissible>
                                              <Alert.Heading>{this.state.alert}</Alert.Heading>
                                              <p>
                                                {this.state.alert_subtext}
                                              </p>
                                            </Alert>
                                        )}
                                      <ListGroup
                                          variant="flush"
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                          }}>
                                        {following}
                                      </ListGroup>
                                      </React.Fragment>
                                    }
                                    second_tab={
                                      <ListGroup variant="flush" style={{width: "100%"}}>
                                        {followers}
                                      </ListGroup>
                                    }
                                    value={this.state.home_tab_index}
                                    handleTabChange={this.handleHomeTabChange}
                                />
                            )}
                            {this.state.following && this.state.bottom_tab==="search" && (
                                <SearchBox
                                    user_id={this.state.user_id}
                                    loading_ids={this.state.following_loading_ids}
                                    toggleFollow={this.toggleFollow}
                                    recommended_follows={recommended_follows}
                                />
                            )}
                          </Col>
                          {this.state.docked && (
                              <Col sx={0} sm={0} md={5}
                                   style={{
                                     padding: 0,
                                     display: "flex",
                                     flexDirection: "column",
                                     justifyContent: "flex-start",
                                     alignItems: "center"
                                   }}>
                                {!this.state.following && (
                                    <Spinner animation="grow" variant="primary" style={{marginTop: "10%"}}/>
                                )}
                                {this.state.following && (
                                    <SearchBox
                                        user_id={this.state.user_id}
                                        loading_ids={this.state.following_loading_ids}
                                        toggleFollow={this.toggleFollow}
                                        recommended_follows={recommended_follows}
                                    />
                                )}
                              </Col>
                          )}
                        </Row>
                      </Container>
                    </div>
                    {!this.state.docked && (
                        <BottomNavigationComponent
                            tab={this.state.bottom_tab}
                            handleTabChange={this.handleBottomTabChange}
                        />
                    )}
                  </MaterialTitlePanel>
                </Sidebar>
            )}
        </div>
    );
  }
}

export default App;