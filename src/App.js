import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, scopes } from "./config";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import {Container, Row, Col, Navbar, Image, Media, ListGroup} from 'react-bootstrap';
import Sidebar from "react-sidebar";
import MaterialTitlePanel from "./material_title_panel";
import SidebarContent from "./sidebar_content";
require('dotenv').config();

let wp_URL = ((process.env.REACT_APP_IS_LOCAL) ? process.env.REACT_APP_WP_URL_LOCAL : process.env.REACT_APP_WP_URL)

const queryString = require('query-string');

const redirectUri = window.location.href

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
      open: false
    };

    this.swapAccessToken = this.swapAccessToken.bind(this);
    this.clearSession = this.clearSession.bind(this);

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.onSetOpen = this.onSetOpen.bind(this);
    // this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
  }

  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged);
  }

  componentDidMount() {
    let _code = queryString.parse(this.state.location.search).code;
    if (this.state.user_id){
    }
    else if (_code) {
      this.setState({
        code: _code
      });
      this.swapAccessToken(_code);
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

  swapAccessToken(code){
    $.ajax({
      url: `${wp_URL}/auth/getTokens`,
      type: "GET",
      data: $.param({"code": code, "redirect_uri": redirectUri}),
      success: data => {
        if (data.user_id || true){ // set "true" for testing
          localStorage.setItem('user_id', data.user_id);
          this.setState({
            user_id: data.user_id || "testing"
          })
        }
      }
    });
  }

  clearSession() {
    console.log("session cleared")
    localStorage.clear()
    this.setState({
      'code': null,
      'user_id': null
    })
  }

  render() {

    const sidebar = <SidebarContent
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

    const following = [];

    for (let ind = 0; ind < 20; ind++) {
      following.push(
        <ListGroup.Item>Larry David #{ind}</ListGroup.Item>
      );
    }

    return (
        <div className="App">
            {!this.state.code && !this.state.user_id && (
                <Button
                    href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                    "%20"
                )}&response_type=code&show_dialog=true`}>Connect with Spotify</Button>
            )}
            {this.state.code && !this.state.user_id && (
                <Spinner animation="grow" variant="primary" />
            )}
            {this.state.user_id && (
                <Sidebar {...sidebarProps}>
                  <MaterialTitlePanel title={contentHeader}>
                    <div style={styles.content}>
                      <Container>
                          <Col
                              sm={7}
                              style={
                                {
                                  "padding": 0,
                                  "box-shadow": "rgba(0, 0, 0, 0.15) 2px 2px 4px",
                                  "height": "100%",
                                  "overflow-y": "scroll"
                                }
                              }>
                            <ListGroup variant="flush">
                              {following}
                            </ListGroup>
                          </Col>
                          <Col sm={5}></Col>
                      </Container>
                    </div>
                  </MaterialTitlePanel>
                </Sidebar>
            )}
        </div>
    );
  }
}

export default App;