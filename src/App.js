import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, scopes } from "./config";
import "./App.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Spinner, Row, Col, ListGroup} from 'react-bootstrap';
import Sidebar from "react-sidebar";

import MaterialTitlePanel from "./Components/TitlePanel";
import SidebarContent from "./Components/SidebarContent";
import Followee from "./Components/Followee";
import SearchBox from "./Components/SearchBox";
import BottomNavigationComponent from "./Components/BottomNavigation";
import {db, functions} from './fire';

require('dotenv').config();

const local = process.env.REACT_APP_IS_LOCAL==="true"

let wp_URL = (local ?
    "http://".concat(window.location.hostname.concat(":").concat(process.env.REACT_APP_PORT)) : process.env.REACT_APP_WP_URL)

const collection = local ? "users_development" : "users_production"
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
  firebaseSubscription = () => {this.console.log("attempt unsubscribe")};

  constructor(props) {
    super(props);

    this.state = {
      code: null,
      user_id: localStorage.getItem('user_id'),
      location: this.props.location,
      docked: mql.matches,
      open: false,
      user: null,
      following: null,
      tab: "home",
      loading_ids: [],
    };

    this.createUser = this.createUser.bind(this);
    this.updateFollowing = this.updateFollowing.bind(this)
    this.getUser = this.getUser.bind(this);
    this.getFollowing = this.getFollowing.bind(this);
    this.clearSession = this.clearSession.bind(this);
    this.toggleFollow = this.toggleFollow.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);

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
    this.firebaseSubscription()
  }

  clearSession() {
    localStorage.clear()
    this.firebaseSubscription()
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
    const userRef = db.collection(collection).doc(user_id);
    const self = this;
    userRef.get().then(function(doc) {
      if (doc.exists) {
        self.setState({
          user: doc.data()
        })
        self.updateFollowing(user_id)
      } else {
        self.clearSession()
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
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

  updateFollowing(user_id){
    $.ajax({
      url: `${wp_URL}/api/users/updateFollowing`,
      type: "POST",
      data: $.param({"id": user_id}),
      success: data => {
        this.getFollowing(user_id)
      },
      error: error_msg => {
        console.log(error_msg)
      }
    });
  }

  getFollowing(user_id){
    const usersRef = db.collection(collection).where("followers", "array-contains", user_id);
    const self = this;
    this.firebaseSubscription = usersRef
        .onSnapshot(function(querySnapshot) {
          var following = [];
          querySnapshot.forEach(function(doc) {
            following.push(doc.data());
          });
          following.sort(function(a, b) {
            return (b.spotify_playback||{}).is_active - (a.spotify_playback||{}).is_active;
          });
          self.setState({
            following: following,
            loading_ids: []
          })
        });
    this.intervalID = setTimeout(()=>{this.updateFollowing(user_id)}, 10000);
  }

  toggleFollow(id, following){
    const joined = this.state.loading_ids.concat(id);
    this.setState({ loading_ids: joined })
    const _suffix = local ? "Development" : ""
    const cloudFunction = following ?
        functions.httpsCallable('removeFollower'.concat(_suffix)) :
        functions.httpsCallable('addFollower'.concat(_suffix));
    cloudFunction({follower_id: this.state.user_id, followee_id: id}).then(function(result) {
      return true
    }).catch(function(error) {
      return false
    });
  }

  handleTabChange(event, newValue){
    this.setState({
      tab: newValue
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
          <span> Following</span>
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
        user={f}
    >
    </Followee>) : [];

    return (
        <div className="App">
            {!this.state.code && !this.state.user_id && (
                <Button
                    href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                    "%20"
                )}&response_type=code&show_dialog=true`}>Connect with Spotify</Button>
            )}
            {this.state.user && (
                <Sidebar {...sidebarProps}>
                  <MaterialTitlePanel title={contentHeader}>
                    <div style={styles.content}>
                      <Container style={{"padding": 0}}>
                        <Row style={{margin: 0, height: "100%"}}>
                          <Col
                              xs={12} sm={12} md={7}
                              style={{
                                  padding: 0,
                                  height: "100%",
                                  overflowY: "scroll",
                                  borderRight: 'solid 1px rgba(0,0,0,.125)',
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "flex-start",
                                  alignItems: "center"
                              }}>
                            {!this.state.following && (
                                  <Spinner animation="grow" variant="primary" style={{marginTop: "10%"}}/>
                            )}
                            {this.state.following && this.state.tab==="home" && (
                                <ListGroup variant="flush" style={{width: "100%"}}>
                                  {following}
                                </ListGroup>
                            )}
                            {this.state.following && this.state.tab==="search" && (
                                <SearchBox
                                    user_id={this.state.user_id}
                                    loading_ids={this.state.loading_ids}
                                    toggleFollow={this.toggleFollow}
                                    collection={collection}
                                ></SearchBox>
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
                                <SearchBox
                                    user_id={this.state.user_id}
                                    loading_ids={this.state.loading_ids}
                                    toggleFollow={this.toggleFollow}
                                    collection={collection}
                                ></SearchBox>
                              </Col>
                          )}
                        </Row>
                      </Container>
                    </div>
                    {!this.state.docked && (
                        <BottomNavigationComponent
                            tab={this.state.tab}
                            handleTabChange={this.handleTabChange}
                        ></BottomNavigationComponent>
                    )}
                  </MaterialTitlePanel>
                </Sidebar>
            )}
        </div>
    );
  }
}

export default App;