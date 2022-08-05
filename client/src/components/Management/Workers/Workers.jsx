import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Tooltip from '@material-ui/core/Tooltip';
import Button from "@material-ui/core/Button";
import HelpIcon from '@material-ui/icons/Help';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SyncIcon from '@material-ui/icons/Sync';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import MUIDataTable from "mui-datatables";
import { getLocalDateTime } from '../../../helpers/date.js';
import '../../shared/StatusIcon/style.css'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import Loader from '../../shared/Loader';

const Workers = () => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [isOpenSyncModal, setIsOpenSyncModal] = useState(false);
    const [branches, setBranches] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const timeout = 2500;
    const [userInput] = useState();
    const [items, setItems] = useState([]);

    useEffect(() => {
        getAgentStatus();
        getSourceSyncStatus();
        setTimeout(() => {
            setIsLoading(false);
        }, timeout);
    }, []);


    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };
    const handleChange = (e) => {
        const numOfBranch = e.currentTarget.value ? parseInt(e.currentTarget.value) : 10;
        setItems(branches.slice(0, numOfBranch));
    }

    const handleOpenSyncModal = async () => {
        try {
            setIsLoading(true);
            const numOfBranch = userInput ? userInput : 10;
            const res = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/source-sync/branchList`, { withCredentials: true });
            if (res && res.data && res.data.data && res.data.data[0].displayId && res.data.statusCode === 200) {
                var branchArr = res.data.data.map(({ displayId }) => displayId)
                // filter out master and feature branches + reverse sorting
                branchArr = branchArr.filter(displayId => !Number.isNaN(parseInt(displayId[0]))).sort().reverse();
                // branches is array that hold all branches that return from repo
                setBranches(branchArr);
                // items hold only displayed branches
                setItems(branchArr.slice(0, numOfBranch));
                setIsOpenSyncModal(true)
            } else {
                toast.error("Failed to get branches list", { position: "bottom-right" });
                return;
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            if (ex.response && ex.response.data && ex.response.data.message) {
                toast.error("Failed to get branches list", { position: "bottom-right" });
            }
            toast.error("Failed to get branches list", { position: "bottom-right" });
        };
    }

    const handleCloseSyncModal = () => {
        setIsOpenSyncModal(false);
    };

    const getAgentStatus = async () => {
        try {
            const agentStatus = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/agent/check-health`, { withCredentials: true, timeout: timeout });
            if (agentStatus && agentStatus.data && agentStatus.data.data && agentStatus.data.data.lastUpdatedDate && agentStatus.data.statusCode === 200) {
                setWorkers(workers => [...workers, { name: 'Agent', status: true, lastUpdatedDate: agentStatus.data.data.lastUpdatedDate }])
                return;
            }
            if (agentStatus && agentStatus.data.statusCode === 200) {
                setWorkers(workers => [...workers, { name: 'Agent', status: true, lastUpdatedDate: 'None' }])
                return;
            }
            else {
                setWorkers(workers => [...workers, { name: 'Agent', status: false, lastUpdatedDate: 'None' }])
            }
        } catch (ex) {
            setWorkers(workers => [...workers, { name: 'Agent', status: false, lastUpdatedDate: 'None' }])
        }
    }

    const getSourceSyncStatus = async () => {
        try {
            const sourceSyncStatus = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/source-sync/check-health`, { withCredentials: true, timeout: timeout });
            if (sourceSyncStatus && sourceSyncStatus.data && sourceSyncStatus.data.data && sourceSyncStatus.data.data.lastUpdatedDate && sourceSyncStatus.data.statusCode === 200) {
                setWorkers(workers => [...workers, { name: 'Source-Sync', status: true, lastUpdatedDate: sourceSyncStatus.data.data.lastUpdatedDate, action: 'exec' }]);
                return;
            }
            if (sourceSyncStatus && sourceSyncStatus.data.statusCode === 200) {
                setWorkers(workers => [...workers, { name: 'Source-Sync', status: true, lastUpdatedDate: 'None', action: 'exec' }])
                return;
            }
            else {
                setWorkers(workers => [...workers, { name: 'Source-Sync', status: false, lastUpdatedDate: 'None' }])
            }
        } catch (ex) {
            setWorkers(workers => [...workers, { name: 'Source-Sync', status: false, lastUpdatedDate: 'None' }])
        }
    }

    const syncNow = async () => {
        try {
            handleCloseSyncModal();
            const sourceSyncStatus = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/source-sync/sync`, { branches: items }, { withCredentials: true });
            if (sourceSyncStatus && sourceSyncStatus.data.statusCode === 200) {
                toast.success("Sync completed successfully", { position: "bottom-right" });
                return;
            }
            else {
                toast.error("Sync failed", { position: "bottom-right" });
            };
        } catch (ex) {
            toast.error("Sync failed unexpectedly", { position: "bottom-right" });
        }
    }

    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Workers</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Workers describe the microservices status: Active/Inactive.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    const syncModal = <Dialog disableBackdropClick={true} maxWidth='xl' open={isOpenSyncModal} onClose={handleCloseSyncModal} aria-labelledby="form-dialog-title">
        <Loader isLoading={isLoading}></Loader>
        <DialogTitle id="form-dialog-title" ></DialogTitle>
        <DialogContent style={{ height: '600px', width: '800px' }}>
            <Typography variant="h5" style={{ float: 'left', marginRight: '1em' }} gutterBottom>
                Previous branches to sync:
            </Typography>
            <div style={{ marginBottom: '2em' }}>
                <TextField style={{ width: '8em' }} name="branchNum" value={userInput} InputProps={{ inputProps: { min: 1, max: branches.length } }}
                    onChange={handleChange} defaultValue="10" type="number" InputLabelProps={{
                        shrink: true,
                    }} />
            </div>
            <List>
                {items.map(item => (
                    <ListItem key={item} >
                        <ListItemText primary={item} />
                    </ListItem>
                ))}
            </List>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseSyncModal} color="primary" >Cancel</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={syncNow} color="primary" >Sync now</Button>
        </DialogActions>
    </Dialog >

    return (
        <Grid container wrap="nowrap">
            <Loader isLoading={isLoading}></Loader>
            <div style={{ width: '100%' }}>

                <div style={{ display: 'flex', width: '100%', }}>
                    <Typography style={{ fontWeight: 300 }} variant="h4">Workers</Typography>
                    <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                        <HelpIcon aria-controls="simple-menu"></HelpIcon>
                    </Button>
                </div>
                {helpModal}
                {syncModal}
                <br></br>
                <br></br>
                <div style={{ width: '95%', marginBottom: 30 }}>
                    <MUIDataTable
                        title={"Workers List"}
                        data={
                            workers.map((row, i) => {
                                return [
                                    row.name,
                                    row.status ? <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} positive pulse></status-indicator>
                                        :
                                        <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} negative pulse></status-indicator>,
                                    getLocalDateTime(row.lastUpdatedDate),
                                    row.action === 'exec' ?
                                        <Tooltip title="Sync Now">
                                            <Button style={{ marginLeft: -10 }} aria-haspopup="true" onClick={handleOpenSyncModal}  >
                                                <SyncIcon ></SyncIcon>
                                            </Button></Tooltip> : null
                                ]
                            })
                        }
                        columns={["Name", "Status", "Last Updted Date", "Action"]}
                        options={{
                            searchOpen: false,
                            filter: false,
                            viewColumns: true,
                            print: false,
                            download: false,
                            rowsPerPage: 10,
                            rowsPerPageOptions: [10, 20, 50, 100],
                            selectableRows: 'none',
                        }}
                    />
                </div>
            </div>
        </Grid>
    );
};

export default Workers;
