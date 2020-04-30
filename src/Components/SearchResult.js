import React from "react";
import {ListGroup} from "react-bootstrap";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";


const SearchResult = props => {

    return (
        <ListGroup.Item>
            <div style={
                {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                }
            }>
                <ListItemAvatar style={{marginRight: '3%'}}>
                    <Avatar alt={props.user.spotify_display_name} src={props.user.spotify_profile_picture} style={{
                        height: 40,
                        width: 40,
                    }} />
                </ListItemAvatar>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}>
                    <div>
                        {props.user.spotify_display_name}
                    </div>
                </div>

            </div>
        </ListGroup.Item>
    );
}
export default SearchResult;