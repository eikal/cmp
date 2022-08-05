import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import MonitoringTab from './Tabs/Monitoring/Monitoring.jsx';
import JobsTab from './Tabs/Jobs.jsx';
import DetailsTab from './Tabs/Details.jsx';
import PuppetTab from './Tabs/Puppet.jsx';
import AlertTab from './Tabs/Alerts/Alerts.jsx';
import StatusChaeckTab from './Tabs/StatusCheck/StatusCheck.jsx';
import Cloudshell from './Tabs/Cloudshell/Cloudshell.jsx';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RefreshIcon from '@material-ui/icons/Refresh';
import Button from '@material-ui/core/Button';
import TabPanel from '../shared/TabPanel/TabPanel.jsx';
import Loader from '../shared/Loader';
import { isBasicUser } from '../../helpers/auth.js';


const TabsServer = forwardRef((props, ref) => {
    const childRef = useRef()

    const [isLoading, setIsLoading] = useState(false);
    const [valueTab, setValueTab] = useState(0);
    const [changeTabPuppetReport, setChangeTabPuppetReport] = useState(false)


    useImperativeHandle(ref, () => ({
        handleChangeTab(newValue) {
            setValueTab(newValue);
        },
        handleOpenJobModal(action, actionLabelName) {
            childRef.current.handleOpenJobModalFunc(action, actionLabelName);
        }
    }));

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
        setChangeTabPuppetReport(false);
    }

    const reloadServer = () => {
        props.reloadServer(props.serverDetails._id);
    }


    const updateServerDetails = (serverDetails) => {
        props.updateServerDetails(serverDetails)
    }

    const callbackChangePuppetReportTab = () => {
        setChangeTabPuppetReport(true);
        setValueTab(1);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }

    return (
        props.serverDetails ? <div style={{ width: '95%', marginBottom: 30, display: props.isHideTabPannel ? 'none' : 'block' }}>
            <TableContainer component={Paper}>
                <AppBar style={{ backgroundColor: '#606060' }} position="static">
                    <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                        <Tab label="Details" />
                        <Tab label="Puppet" />
                        <Tab label="Status Check" />
                        <Tab label="Monitoring" />
                        <Tab label="Alerts" />
                        <Tab label="Audit Trail" />
                        { !isBasicUser() && <Tab label="Cloudshell" /> }
                        <Button onClick={reloadServer} style={{ marginLeft: 'auto' }} aria-controls="simple-menu" aria-haspopup="true">
                            <RefreshIcon style={{ color: 'white' }} aria-controls="simple-menu" ></RefreshIcon>
                        </Button>
                    </Tabs>
                </AppBar>
                <TabPanel value={valueTab} index={0}>
                    <DetailsTab
                        serverDetails={props.serverDetails}
                        updateServerDetails={updateServerDetails}
                    ></DetailsTab>
                </TabPanel>
                <TabPanel value={valueTab} index={1}>
                    <PuppetTab
                        serverDetails={props.serverDetails}
                        changeTabPuppetReport={changeTabPuppetReport}>
                    </PuppetTab>
                </TabPanel>
                <TabPanel value={valueTab} index={2}>
                    <StatusChaeckTab
                        callbackChangePuppetReportTab={callbackChangePuppetReportTab}
                        serverDetails={props.serverDetails}>
                    </StatusChaeckTab>
                </TabPanel>
                <TabPanel value={valueTab} index={3}>
                    <MonitoringTab
                        serverDetails={props.serverDetails}
                    ></MonitoringTab>
                </TabPanel>
                <TabPanel value={valueTab} index={4}>
                    <AlertTab
                        serverDetails={props.serverDetails}
                    ></AlertTab>
                </TabPanel>
                <TabPanel value={valueTab} index={5}>
                    <JobsTab
                        serverDetails={props.serverDetails} ref={childRef}
                    ></JobsTab>
                </TabPanel>
                <TabPanel value={valueTab} index={6} style={{ backgroundColor: '#000' }}>
                    <Cloudshell
                        serverDetails={props.serverDetails}
                    ></Cloudshell>
                </TabPanel>
            </TableContainer>

            <Loader isLoading={isLoading}></Loader>
        </div> : null
    )
})
export default TabsServer;
