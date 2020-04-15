import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import Player from "./Player";
import logo from "./logo.svg";
import "./App.css";
import {
  useLocation
} from "react-router-dom";

const queryString = require('query-string');

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: null,
      token: null,
      location: this.props.location,
      item: {
        album: {
          images: [{ url: "https://upload.wikimedia.org/wikipedia/en/1/1a/Exmilitary_artwork.png" }]
        },
        name: "test song",
        artists: [{ name: "test artist" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0
    };

    this.swapAccessToken = this.swapAccessToken.bind(this);
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }
  componentDidMount() {
    let _code = queryString.parse(this.state.location.search).code;
    const user = localStorage.getItem('user');

    if (_code) {
      this.setState({
        code: _code
      });
      this.swapAccessToken(_code);
      // this.getCurrentlyPlaying(_token);
    }
  }

  swapAccessToken(code){
    console.log(code)
    $.ajax({
      url: "https://iconic-hue-273619.appspot.com/auth/getCode",
      type: "POST",
      data: $.param({"code": code}),
      success: data => {
        console.log(data)
        localStorage.setItem('user', 'ryan');
        this.getCurrentlyPlaying(data.access_token)
      }
    });
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        console.log(data)
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms
        });
      }
    });
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            {this.state.token && (
                <Player
                    item={this.state.item}
                    is_playing={this.state.is_playing}
                    progress_ms={this.progress_ms}
                />
            )}
          </header>
        </div>
    );
  }
}

export default App;