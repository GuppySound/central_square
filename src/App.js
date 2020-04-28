import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, scopes } from "./config";
import "./App.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Spinner, Col, ListGroup} from 'react-bootstrap';
import Sidebar from "react-sidebar";
import {BottomNavigation, BottomNavigationAction} from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home'
import SearchIcon from '@material-ui/icons/Search'

import MaterialTitlePanel from "./Components/TitlePanel";
import SidebarContent from "./Components/SidebarContent";
import Followee from "./Components/Followee";
import db from './fire';

require('dotenv').config();

let wp_URL = ((process.env.REACT_APP_IS_LOCAL) ? process.env.REACT_APP_WP_URL_LOCAL : process.env.REACT_APP_WP_URL)

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
  constructor(props) {
    super(props);
    this.state = {
      code: null,
      user_id: localStorage.getItem('user_id'),
      location: this.props.location,
      viewing_profile: false,
      docked: mql.matches,
      open: false,
      user: null,
      following: null
    };

    mql.addEventListener("change", () => {
      this.mediaQueryChanged();
    });

    this.createUser = this.createUser.bind(this);
    this.updateFollowing = this.updateFollowing.bind(this)
    this.getUser = this.getUser.bind(this);
    this.getFollowing = this.getFollowing.bind(this);
    this.clearSession = this.clearSession.bind(this);

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.onSetOpen = this.onSetOpen.bind(this);
  }

  componentDidMount() {
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

  onSetOpen(open) {
    this.setState({ open });
  }

  mediaQueryChanged() {
    this.setState({
      docked: mql.matches,
      open: false
    });
  }

  toggleOpen(ev) {
    this.setState({ open: !this.state.open });
    if (ev) {
      ev.preventDefault();
    }
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

  getUser(user_id){
    const userRef = db.collection("users_development").doc(user_id);
    const self = this;
    userRef.get().then(function(doc) {
      if (doc.exists) {
        self.setState({
          "user": doc.data()
        })
        self.updateFollowing(user_id)
      } else {
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
  }

  getFollowing(user_id){
    const usersRef = db.collection("users_development").where("followers", "array-contains", user_id);
    const self = this;
    usersRef
        .onSnapshot(function(querySnapshot) {
          var following = [];
          querySnapshot.forEach(function(doc) {
            following.push(doc.data());
          });
          following.sort(function(a, b) {
            return (b.spotify_playback||{}).is_active - (a.spotify_playback||{}).is_active;
          });
          self.setState({
            "following": following
          })
        });
  }

  clearSession() {
    localStorage.clear()
    this.setState({
      'code': null,
      'user_id': null,
      'user': null,
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
      rootId: "root",
      sidebarId: "sidebar",
      contentId: "content",
      overlayId: "overlay"
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
                          <Col
                              sm={7}
                              style={
                                {
                                  padding: 0,
                                  boxShadow: "rgba(0, 0, 0, 0.15) 2px 2px 4px",
                                  height: "100%",
                                  overflowY: "scroll",
                                }
                              }>
                            {!this.state.following && (
                                <div style={{
                                  height: "100%",
                                  width: "100%",
                                  paddingTop: "20%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "flex-start",
                                  alignItems: "center"
                                }}>
                                  <Spinner animation="grow" variant="primary"/>
                                </div>
                            )}
                            {this.state.following && (
                                <ListGroup variant="flush">
                                  {following}
                                </ListGroup>
                            )}
                          </Col>
                          <Col sm={5}></Col>
                      </Container>
                    </div>
                    {!this.state.docked && (
                        <BottomNavigation
                            value={0}
                            style={{'width': '100%', 'borderTop': 'solid 1px rgba(0,0,0,.125)'}}
                            showLabels
                        >
                          <BottomNavigationAction icon={<HomeIcon />} />
                          <BottomNavigationAction icon={<SearchIcon />} />
                        </BottomNavigation>
                    )}
                  </MaterialTitlePanel>
                </Sidebar>
            )}
        </div>
    );
  }
}

export default App;