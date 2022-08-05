import React, { useState } from 'react';
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
import CustomActions from './CustomActions';
import SshKey from './SshKey';
import Loader from '../../shared/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const Configuration = (props) => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [valueTab, setValueTab] = useState(0);

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
        <DialogTitle id="form-dialog-title">Configuration</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Manage Cloudspace configuration
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
                        <Typography style={{ fontWeight: 300 }} variant="h4">Configuration</Typography>
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
                                <Tab label="Custom actions"  {...a11yProps(0)} />
                                <Tab label="SSH Key"  {...a11yProps(1)} />
                            </Tabs>
                        </AppBar>
                        <TabPannel deletePadding={true} value={valueTab} index={0}>
                            <CustomActions></CustomActions>
                        </TabPannel>
                        <TabPannel deletePadding={true} value={valueTab} index={1}>
                            <SshKey></SshKey>
                        </TabPannel>
                    </TableContainer>

                </div>
            </div>
        </Grid>
    );
};

export default Configuration;
