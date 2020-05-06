import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useStyles = makeStyles({
    root: {
        outline: "none !important",
    },
});

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            style={{width: '100%', height: '100%'}}
            hidden={value !== index}
        >
            {value === index && (
                <React.Fragment>
                    {children}
                </React.Fragment>
            )}
        </div>
    );
}

const TabsNavigationComponent = props => {

    const classes = useStyles();

    return (
        <React.Fragment>
            <Tabs
                value={props.value}
                onChange={props.handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                style={{marginBottom: '2%'}}
            >
                <Tab label="Following" classes={{root: classes.root}}/>
                <Tab label="Followers" classes={{root: classes.root}}/>
            </Tabs>

            <TabPanel value={props.value} index={0} >
                {props.first_tab}
            </TabPanel>
            <TabPanel value={props.value} index={1} >
                {props.second_tab}
            </TabPanel>
        </React.Fragment>
    )
}

export default TabsNavigationComponent