import React from "react";
import PropTypes from "prop-types";
import MaterialTitlePanel from "./TitlePanel";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import HomeIcon from '@material-ui/icons/Home';
import GroupIcon from '@material-ui/icons/Group';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

const styles = {
    sidebar: {
        width: 256,
        height: "100%"
    },
    sidebarLink: {
        display: "block",
        padding: "16px 0px",
        color: "#757575",
        textDecoration: "none"
    },
    divider: {
        margin: "8px 0",
        height: 1,
        backgroundColor: "#757575"
    },
    content: {
        height: "100%",
        backgroundColor: "white"
    },
    paper: {
        width: "100%",
    }
};

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

const SidebarContent = props => {
    const style = props.style
        ? { ...styles.sidebar, ...props.style }
        : styles.sidebar;

    return (
        <MaterialTitlePanel title="Menu" style={style}>
            <div style={styles.content}>
                <List component="nav" aria-label="main mailbox folders">
                    <ListItemLink href="#home">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemLink>
                    <ListItemLink href="#followers">
                        <ListItemIcon>
                            <GroupIcon />
                        </ListItemIcon>
                        <ListItemText primary="Followers" />
                    </ListItemLink>
                </List>
                <Divider />
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar alt={props.user.spotify_display_name} src={props.user.spotify_profile_picture} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={props.user.spotify_display_name}
                            secondary={
                                <Button
                                    color="secondary"
                                    style={{"padding":0}}
                                    onClick={props.clearSession}>
                                    Log Out
                                </Button>
                            }
                        />
                    </ListItem>
                </List>
            </div>
        </MaterialTitlePanel>
    );
};

SidebarContent.propTypes = {
    style: PropTypes.object
};

export default SidebarContent;