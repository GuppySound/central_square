import React from "react";
import {ListGroup} from "react-bootstrap";
import Badge from '@material-ui/core/Badge';
import Avatar from "@material-ui/core/Avatar";
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import {makeStyles, withStyles} from '@material-ui/core/styles';
import CircularProgress from "@material-ui/core/CircularProgress";

const ITEM_HEIGHT = 48;

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

const useStyles = makeStyles({
    root: {
        outline: "none !important",
    },
});

const Followee = props => {

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                        <div className={"listening-status"}>
                            {playback.track_name} - {playback.artist_name}
                        </div>
                    </div>

                        {!props.loading_ids.includes(props.user.id) && (
                            <div>
                            <IconButton
                                aria-label="more"
                                aria-controls="long-menu"
                                aria-haspopup="true"
                                classes={{root: classes.root}}
                                onClick={handleClick}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                            style: {
                                maxHeight: ITEM_HEIGHT * 3.5,
                                width: '15ch',
                            },
                        }}
                            >
                            <MenuItem key={"tune_in"} selected={false} onClick={handleClose}>
                            Tune In
                            </MenuItem>
                            <MenuItem
                            key={"unfollow"}
                            selected={false}
                            onClick={() => {props.toggleFollow(props.user.id, true); handleClose()}}>
                            Unfollow
                            </MenuItem>
                            </Menu>
                            </div>
                        )}
                        {props.loading_ids.includes(props.user.id) && (
                            <div>
                            <CircularProgress color="inherit" size={20} />
                            </div>
                        )}
                </div>
            </div>
        </ListGroup.Item>
    );
}
export default Followee;
