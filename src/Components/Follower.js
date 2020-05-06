import React from "react";
import {ListGroup} from "react-bootstrap";
import Avatar from "@material-ui/core/Avatar";
import IconButton from '@material-ui/core/IconButton';
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import {makeStyles} from '@material-ui/core/styles';
import CircularProgress from "@material-ui/core/CircularProgress";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CheckIcon from "@material-ui/icons/Check";
import {green} from "@material-ui/core/colors";

const useStyles = makeStyles({
    root: {
        outline: "none !important",
    },
});

const Follower = props => {


    const following = (props.user.followers||[]).includes(props.user_id)
    return (
        <ListGroup.Item
        >
            <div style={
                {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                }
            }>
                <ListItemAvatar style={{marginRight: '3%'}}>
                        <Avatar
                            alt={props.user.spotify_display_name}
                            src={props.user.spotify_profile_picture}
                            style={{
                                height: 50,
                                width: 50,
                            }}
                        />
                </ListItemAvatar>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%"
                }}>
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

                    {!props.loading_ids.includes(props.user.id) && (
                        <React.Fragment>
                            {!following && (
                                <IconButton edge="end" aria-label="follow" onClick={() => {props.toggleFollow(props.user.id, following); props.switchFollow()}}>
                                    <PersonAddIcon color={"primary"}/>
                                </IconButton>
                            )}
                            {following && (
                                <CheckIcon style={{ color: green[500] }}/>
                            )}
                        </React.Fragment>
                    )}
                    {(props.loading_ids.includes(props.user.id)) && (
                        <CircularProgress color="inherit" size={20} />
                    )}
                </div>
            </div>
        </ListGroup.Item>
    );
}
export default Follower;
