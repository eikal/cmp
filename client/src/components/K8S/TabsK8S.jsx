import React, { useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../shared/TabPanel/TabPanel.jsx';
import Overview from './Overview.jsx'
import Pods from './Pods/Pods.jsx';
import Deployments from './Deployments/Deployments.jsx';


function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '850px',
        width: '100%'
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
}));

export default function VerticalTabs(props) {
    const classes = useStyles();
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'row' }} >
            <Tabs
                style={{ width: 200, display: 'table' }}
                TabIndicatorProps={{ style: { background: 'rgba(0, 0, 0, 0.87)' } }}
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                className={classes.tabs}
            >
                <Tab label="Insights" {...a11yProps(0)} />
                <Tab label="Pods" {...a11yProps(1)} />
                <Tab label="Deployments" {...a11yProps(2)} />

            </Tabs>
            <TabPanel value={value} index={0} style={{ width: '100%', justifyContent: 'center' }}>
                <Overview
                    namespace={props?.namespace}
                    cloudspace={props?.cloudspace}
                >
                </Overview>
            </TabPanel>
            <TabPanel value={value} index={1} style={{ width: '100%', justifyContent: 'center' }}>
                <Pods
                    namespace={props?.namespace}
                    cloudspace={props?.cloudspace}
                >
                </Pods>
            </TabPanel>
            <TabPanel value={value} index={2} style={{ width: '100%', justifyContent: 'center' }}>
                <Deployments
                    namespace={props?.namespace}
                    cloudspace={props?.cloudspace}
                >
                </Deployments>
            </TabPanel>
        </div>
    );
}
