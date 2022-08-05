import React, { useState } from 'react';

import MetadataTab from '../Shared/MetadataTab.jsx';
import InformationTab from './Tabs/InformationTab.jsx';
import ControlledByTab from './Tabs/ControlledByTab.jsx';
import EventsTab from '../Shared/EventsTab.jsx';
import ContainerTab from './Tabs/ContainerTab.jsx';
import InitContainerTab from './Tabs/InitContainerTab.jsx';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
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
                        <Tab label="Controlled By" />
                        <Tab label="Events" />
                        <Tab label="Containers" />
                        <Tab label="Init Containers" />
                    </Tabs>
                </AppBar>
                <TabPanel value={valueTab} index={0}>
                    <MetadataTab
                        genericMetadata={props.podMetadata}
                    ></MetadataTab>
                </TabPanel>
                <TabPanel value={valueTab} index={1}>
                    <InformationTab
                        podMetadata={props.podMetadata}
                    ></InformationTab>
                </TabPanel>
                <TabPanel value={valueTab} index={2}>
                    <ControlledByTab
                        podMetadata={props.podMetadata}
                    ></ControlledByTab>
                </TabPanel>
                <TabPanel value={valueTab} index={3}>
                    <EventsTab
                        genericMetadata={props.podMetadata}
                    ></EventsTab>
                </TabPanel>
                <TabPanel value={valueTab} index={4}>
                    <ContainerTab
                        podMetadata={props.podMetadata}
                    ></ContainerTab>
                </TabPanel>
                <TabPanel value={valueTab} index={5}>
                    <InitContainerTab
                        podMetadata={props.podMetadata}
                    ></InitContainerTab>
                </TabPanel>
            </TableContainer>
        </div>
    )
}
export default TabsPods;
