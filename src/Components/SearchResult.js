import React from "react";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CheckIcon from "@material-ui/icons/Check";
import {green} from "@material-ui/core/colors";
import CircularProgress from "@material-ui/core/CircularProgress";
import ListItem from "@material-ui/core/ListItem";


const SearchResult = props => {

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt={props.spotify_display_name} src={props.spotify_profile_picture} style={{
                    height: 40,
                    width: 40,
                }} />
            </ListItemAvatar>
            <ListItemText
                primary={props.spotify_display_name}
            />
            <ListItemSecondaryAction>
                {!props.loading_ids.includes(props.id) && (
                    <React.Fragment>
                        {!props.following && (
                            <IconButton edge="end" aria-label="follow" onClick={() => {props.toggleFollow(props.id, props.following); props.switchFollow()}}>
                                <PersonAddIcon color={"primary"}/>
                            </IconButton>
                        )}
                        {props.following && (
                            <CheckIcon style={{ color: green[500] }}/>
                        )}
                    </React.Fragment>
                )}
                {(props.loading_ids.includes(props.id)) && (
                    <CircularProgress color="inherit" size={20} />
                )}
            </ListItemSecondaryAction>
        </ListItem>
    );
}
export default SearchResult;