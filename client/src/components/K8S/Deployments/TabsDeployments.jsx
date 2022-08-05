import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MetadataTab from '../Shared/MetadataTab.jsx';
import InformationTab from './Tabs/InformationTab.jsx';
import PodsStatusTab from './Tabs/PodsStatusTab.jsx';
import ConditionsTab from './Tabs/ConditionsTab.jsx';
import ReplicaSetTab from './Tabs/ReplicaSetTab.jsx';
import EventsTab from '../Shared/EventsTab.jsx'
import TabPanel from '../../shared/TabPanel/TabPanel.jsx';


const TabsPods = (props) => {

    const [valueTab, setValueTab] = useState(0);


    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    }

    return (
        <div style={{ width: '100%', marginBottom: 30, display: props.isHideTabPannel ? 'none' : 'block' }}>
            <TableContainer component={Paper}>
                <AppBar style={{ backgroundColor: '#606060' }} position="static">
                    <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                        <Tab label="Metadata" />
                        <Tab label="Information" />
                        <Tab label="Pods" />
                        <Tab label="Conditions" />
                        <Tab label="Replica Set" />
                        <Tab label="Events" />

                    </Tabs>
                </AppBar>
                <TabPanel value={valueTab} index={0}>
                    <MetadataTab
                        genericMetadata={props.deploymentMetadata}
                    ></MetadataTab>
                </TabPanel>
                <TabPanel value={valueTab} index={1}>
                    <InformationTab
                        deploymentMetadata={props.deploymentMetadata}
                    ></InformationTab>
                </TabPanel>
                <TabPanel value={valueTab} index={2}>
                    <PodsStatusTab
                        deploymentMetadata={props.deploymentMetadata}
                    ></PodsStatusTab>
                </TabPanel>
                <TabPanel value={valueTab} index={3}>
                    <ConditionsTab
                        deploymentMetadata={props.deploymentMetadata}
                    ></ConditionsTab>
                </TabPanel>
                <TabPanel value={valueTab} index={4}>
                    <ReplicaSetTab
                        deploymentMetadata={props.deploymentMetadata}
                    ></ReplicaSetTab>
                </TabPanel>
                <TabPanel value={valueTab} index={5}>
                    <EventsTab
                        genericMetadata={props.deploymentMetadata}
                    ></EventsTab>
                </TabPanel>
            </TableContainer>
        </div>
    )
}
export default TabsPods;
