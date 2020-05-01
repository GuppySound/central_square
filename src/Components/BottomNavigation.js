import React from 'react';
import {BottomNavigation, BottomNavigationAction} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        outline: "none !important",
    },
});

const BottomNavigationComponent = props => {

    const classes = useStyles();

    return (
        <BottomNavigation
            value={props.tab}
            style={{width: '100%', borderTop: 'solid 1px rgba(0,0,0,.125)'}}
            showLabels
            onChange={props.handleTabChange}
        >
            <BottomNavigationAction
                icon={<HomeIcon />}
                value="home"
                label="Home"
                classes={{root: classes.root}}
            />
            <BottomNavigationAction
                icon={<SearchIcon />}
                value="search"
                label="Search"
                classes={{root: classes.root}}
            />
        </BottomNavigation>
    )
}

export default BottomNavigationComponent