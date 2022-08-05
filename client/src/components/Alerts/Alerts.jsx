import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPannel from '../shared/TabPanel/TabPanel.jsx';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import HelpIcon from '@material-ui/icons/Help';
import AlertsTable from './AlertsTable.jsx';
import AlertsDashboard from './AlertsDashboard.jsx'
import TimelineIcon from '@material-ui/icons/Timeline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import '../shared/StatusIcon/style.css'
import 'react-toastify/dist/ReactToastify.css'

const Alerts = (props) => {
    const childRef = useRef()
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [alertDaysDashboard, setAlertDaysDashboard] = useState('7');
    const [valueTab, setValueTab] = useState(0);

    useEffect(() => {
    }, []);

    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };


    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const handleChangeDaysDashboard = (e) => {
        if (e.target.innerText.includes('7')) {
            setAlertDaysDashboard('7');
            childRef.current.changeAlertDaysDashboard('7')
            return;
        }
        if (e.target.innerText.includes('14')) {
            setAlertDaysDashboard('14');
            childRef.current.changeAlertDaysDashboard('14')
            return;
        }
        if (e.target.innerText.includes('30')) {
            setAlertDaysDashboard('30');
            childRef.current.changeAlertDaysDashboard('30')
            return;
        } else {
            setAlertDaysDashboard('45');
            childRef.current.changeAlertDaysDashboard('45')
        }
    }


    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Alerts</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Alerting with Prometheus is separated into two parts. Alerting rules in Prometheus servers send alerts to an Alertmanager.
                The Alertmanager then manages those alerts, including silencing, inhibition, aggregation and sending out notifications via methods such as email, on-call notification systems, and chat platforms.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    return (

        <Grid container wrap="nowrap">
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography style={{ fontWeight: 300 }} variant="h4">Alerts</Typography>

                        <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                            <HelpIcon aria-controls="simple-menu"></HelpIcon>
                        </Button>

                    </div>
                    <div style={{ marginRight: 100, display: 'flex', flexDirection: 'row' }}>
                        <Button variant="outlined"
                            style={{
                                backgroundColor: alertDaysDashboard === '7' ? '#d3d3d3' : null,
                                marginRight: 5
                            }}
                            onClick={handleChangeDaysDashboard}>7D
                        </Button>
                        <Button variant="outlined"
                            style={{
                                backgroundColor: alertDaysDashboard === '14' ? '#d3d3d3' : null,
                                marginRight: 5
                            }}
                            onClick={handleChangeDaysDashboard}>14D
                        </Button>
                        <Button variant="outlined"
                            style={{
                                backgroundColor: alertDaysDashboard === '30' ? '#d3d3d3' : null,
                                marginRight: 5
                            }}
                            onClick={handleChangeDaysDashboard}>30D
                        </Button>
                        <Button variant="outlined"
                            style={{
                                backgroundColor: alertDaysDashboard === '45' ? '#d3d3d3' : null,
                                marginRight: 5
                            }}
                            onClick={handleChangeDaysDashboard}>ALL
                        </Button>
                    </div>
                </div>
                <div>
                    {helpModal}
                </div>

                <div style={{ marginTop: 30, width: '95%' }}>
                    <AlertsDashboard
                        alertDaysDashboard={alertDaysDashboard}
                        ref={childRef}
                    >
                        
                    </AlertsDashboard>
                    <br></br>
                    <br></br>
                    <Tabs indicatorColor="primary" value={valueTab} centered onChange={handleChangeTab} aria-label="simple tabs example">
                        <Tab label="Open Alerts" icon={<ErrorOutlineIcon />} {...a11yProps(0)} />
                        <Tab label="History" icon={<TimelineIcon />}{...a11yProps(1)} />
                    </Tabs>
                    <TabPannel deletePadding={true} value={valueTab} index={0}>
                        <AlertsTable
                            alertType={'firing'}>
                        </AlertsTable>
                    </TabPannel>
                    <TabPannel deletePadding={true} value={valueTab} index={1}>
                        <AlertsTable
                            alertType={'resolved'}>
                        </AlertsTable>
                    </TabPannel>
                </div>
            </div>
        </Grid>
    );
};

export default Alerts;
