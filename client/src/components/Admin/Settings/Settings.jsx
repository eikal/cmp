import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import HelpIcon from '@material-ui/icons/Help';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import TableContainer from '@material-ui/core/TableContainer';
import TabPannel from '../../shared/TabPanel/TabPanel.jsx';
import Paper from '@material-ui/core/Paper';
import EnvironmentVariable from './EnvironmentVariable';
import Loader from '../../shared/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const Settings = (props) => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
    };

    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Settings</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Manage CMP configurations
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    return (

        <Grid container wrap="nowrap">
            <ToastContainer />
            <Loader isLoading={isLoading}></Loader>
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography style={{ fontWeight: 300 }} variant="h4">Settings</Typography>

                        <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                            <HelpIcon aria-controls="simple-menu"></HelpIcon>
                        </Button>

                    </div>
                </div>
                <div>
                    {helpModal}
                </div>

                <div style={{ marginTop: 30, width: '95%' }}>
                    <TableContainer component={Paper}>
                        <AppBar style={{ backgroundColor: '#606060' }} position="static">
                            <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                                <Tab label="Environment variable"  {...a11yProps(0)} />
                            </Tabs>
                        </AppBar>
                        <TabPannel deletePadding={true} value={valueTab} index={0}>
                            <EnvironmentVariable></EnvironmentVariable>
                        </TabPannel>
                    </TableContainer>

                </div>
            </div>
        </Grid>
    );
};

export default Settings;
