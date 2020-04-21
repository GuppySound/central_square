import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, scopes } from "./config";
import Player from "./Player";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'
import {Container, Row, Col, Navbar, Image} from 'react-bootstrap'
import { ArrowLeft } from 'react-bootstrap-icons';

const queryString = require('query-string');

const redirectUri = window.location.href

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: null,
      user_id: localStorage.getItem('user_id'),
      location: this.props.location,
      viewing_profile: false
    };

    this.swapAccessToken = this.swapAccessToken.bind(this);
    this.clearSession = this.clearSession.bind(this);
    // this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  componentDidMount() {
    let _code = queryString.parse(this.state.location.search).code;
    if (this.state.user_id){
      // this.getCurrentlyFollowing(this.state.user_id)
    }
    else if (_code) {
      this.setState({
        code: _code
      });
      this.swapAccessToken(_code);
    }
  }

  swapAccessToken(code){
    $.ajax({
      url: "https://iconic-hue-273619.appspot.com/auth/getTokens",
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

  clearSession = () => {
    console.log("Session Cleared")
    localStorage.clear()
    this.setState({
      'code': null,
      'user_id': null
    })
  }

  viewMe = () => {
    this.setState({
      viewing_profile: true
    })
  }

  viewFollowing = () => {
    this.setState({
      viewing_profile: false
    })
  }

  render() {
    return (
        <div className="App">
            {!this.state.code && !this.state.user_id && (
                <Button href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                    "%20"
                )}&response_type=code&show_dialog=true`}>Connect with Spotify</Button>
            )}
            {this.state.code && !this.state.user_id && (
                <Spinner animation="grow" variant="primary" />
            )}
            {this.state.user_id && (
                <Container>
                  <Row>
                    <Navbar>
                      {!this.state.viewing_profile && (
                          <Navbar.Brand>
                          <Image
                              src="https://upload.wikimedia.org/wikipedia/commons/7/70/Larry_David_at_the_2009_Tribeca_Film_Festival_2.jpg"
                              roundedCircle
                              className={"profile-image"}
                              onClick={this.viewMe}
                          />
                          Following
                          </Navbar.Brand>
                      )}
                      {this.state.viewing_profile && (
                          <Navbar.Brand>
                          <ArrowLeft
                              size={50}
                              onClick={this.viewFollowing}
                          />
                          Me
                          </Navbar.Brand>
                      )}
                    </Navbar>
                  </Row>
                  <Row>
                    {!this.state.viewing_profile && (
                      <Col style={{"padding": 0}}>
                        <ul className="list-group">
                          <li className="list-group-item">Cras justo odio</li>
                          <li className="list-group-item">Dapibus ac facilisis in</li>
                          <li className="list-group-item">Morbi leo risus</li>
                          <li className="list-group-item">Porta ac consectetur ac</li>
                          <li className="list-group-item">Vestibulum at eros</li>
                        </ul>
                      </Col>
                    )}
                    {this.state.viewing_profile && (
                        <Col>
                          <Button variant="danger" onClick={this.clearSession}>Clear Session</Button>
                        </Col>
                    )}
                  </Row>
                </Container>
            )}
        </div>
    );
  }
}

export default App;