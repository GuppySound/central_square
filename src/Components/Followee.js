import React from "react";
import {ListGroup} from "react-bootstrap";
import Badge from '@material-ui/core/Badge';
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { withStyles } from '@material-ui/core/styles';

const StyledBadge = withStyles((theme) => ({
    badge: {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            // animation: '$ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}))(Badge);

const Followee = props => {

    const playback = props.user.spotify_playback || {}
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
                    {playback.is_playing && (
                        <StyledBadge
                            overlap="circle"
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            variant="dot"
                        >
                            <Avatar alt={props.user.spotify_display_name} src={props.user.spotify_profile_picture} style={{
                                height: 50,
                                width: 50,
                            }} />
                        </StyledBadge>
                    )}
                    {!playback.is_playing && (
                        <Avatar alt={props.user.spotify_display_name} src={props.user.spotify_profile_picture} style={{
                            height: 50,
                            width: 50,
                        }} />
                    )}
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
                    <div className={"listening-status"}>
                        {playback.track_name} - {playback.artist_name}
                    </div>
                </div>

            </div>
        </ListGroup.Item>
    );
}
export default Followee;
