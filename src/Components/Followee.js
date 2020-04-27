import React from "react";
import {Image, ListGroup} from "react-bootstrap";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";

const Followee = props => {

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
                    <Avatar alt={props.name} src={props.profile_image} style={{
                        height: 50,
                        width: 50,
                    }} />
                </ListItemAvatar>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}>
                    <div>
                        {props.name}
                    </div>
                    <div className={"listening-status"}>
                        {props.listening_status}
                    </div>
                </div>

            </div>
        </ListGroup.Item>
    );
}
export default Followee;