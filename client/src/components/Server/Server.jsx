import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TabsServer from './TabsServer.jsx'
import Loader from '../shared/Loader';
import AttachServer from './attachServer/AttachServer.jsx'
import Actions from './Actions.jsx';
import { IconButton } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from "@material-ui/core/Typography";
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import MUIDataTable from "mui-datatables";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import RefreshIcon from '@material-ui/icons/Refresh';
import Badge from '@material-ui/core/Badge';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import SyncIcon from '@material-ui/icons/Sync';
import '../shared/Style/shakeElement.css'
import { isBasicUser, getCloudspaceID } from '../../helpers/auth.js';
import { getLocalDateTime } from '../../helpers/date.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import moment from 'moment';


const Server = (props) => {
    const history = useHistory();
    const [servers, setServers] = useState([]);
    const [allServers, setAllServers] = useState([]);
    const [customActions, setCustomActions] = useState(null);
    const [rowsSelected, setRowsSelected] = useState([0])
    const [columns, setColumns] = useState([]);


    const [openExistingServer, setOpenExistingServer] = useState(false);
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [openModalDeleteServer, setOpenModalDeleteServer] = useState(false);
    const [openModalDeleteServers, setOpenModalDeleteServers] = useState(false);
    const [openModalEditServer, setOpenModalEditServer] = useState(false);

    const [serverDetails, setServerDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedServerID, setSlectedServerID] = useState('');
    const [serverSelectedTier, setServerSelectedTier] = useState('');
    const [serverSelectedProject, setServerSelectedProject] = useState('');

    const [filterListServer, setFilterListServer] = useState(props.history.location.state ? [props.history.location.state] : null)

    const [projects, setProjects] = useState([]);
    const [hostGroups, setHostGroups] = useState([]);

    const [isHideTabPannel, setIsHideTabPannel] = useState(false);
    const [clickOnRowMetaData, setClickOnRowMetaData] = useState(0);
    const [disableActionsButtom, setDisableActionsButtom] = useState(false);
    const [currentJobRunning, setCurrentJobRunning] = useState([]);

    const childRef = useRef()

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MuiTableCell: {
                    body: {
                        "&:nth-child(2)": {
                            fontWeight: 'bold'
                        }
                    }
                },
                MUIDataTableToolbar: {
                    actions: {
                        display: 'flex',
                        flexDirection: 'row-reverse'
                    }
                },
            }
        });


    useEffect(() => {
        if (history?.location?.state?.from === 'dashboard') {
            childRef.current.handleChangeTab(5)
        }
        localStorage.setItem('tabIndex', 3);
        props.updateTabIndex();
        fetchData()
        setColumns(getColumns());
    }, [getCloudspaceID()]);


    const fetchData = async () => {
        try {
            setIsLoading(true);
            setCurrentJobRunning([])
            const cloudspaceID = getCloudspaceID()
            if (!cloudspaceID) return;
            const serversRes = await getServers(cloudspaceID);
            if (serversRes && serversRes.length !== 0) {
                setServerDetials(serversRes);
            } else {
                setServerDetails('');
            }
            setIsLoading(false);
            getCustomActions();
        } catch (ex) {
            setIsLoading(false)
            toast.error("Failed to get servers", { position: "bottom-right" });
        }
    };


    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };

    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    };

    const handleClickOpenExisting = async () => {
        const cloudspaceID = getCloudspaceID()
        if (!cloudspaceID) return;
        const projectsArr = await getProjects(cloudspaceID);
        if (!projectsArr || projectsArr.length === 0) {
            toast.info("Please create at least one project", { position: "bottom-right" });
            return;
        }
        getHostgroups();
        getAllServers();
        setOpenExistingServer(true);
    };

    const callbackIsLoading = (value) => {
        setIsLoading(value);
    };

    const callbackOpenExistingServer = (value) => {
        setOpenExistingServer(value)
        if (!value) {
            setProjects([]);
        }
    };

    const callbackSetServers = (value) => {
        setServers(value);
    };

    const clearServerModal = () => {
        setSlectedServerID('');
        setServerSelectedTier('');
    };

    const deleteServer = (row) => async (e) => {
        setOpenModalDeleteServer(true);
        setSlectedServerID(row._id)
        setServerSelectedTier({ id: row.tierID })
    };

    const deleteServers = (rowsSelected) => async (e) => {
        setOpenModalDeleteServers(true);
        setRowsSelected(rowsSelected);
    };

    const editServer = (row) => async (e) => {
        setIsLoading(true);
        const cloudspaceID = getCloudspaceID()
        await getProjects(cloudspaceID);
        setServerSelectedTier({ id: row.tierID, name: row.tierName })
        setServerSelectedProject({ id: row.projectID, name: row.projectName })
        setServerDetails(row);
        setSlectedServerID(row._id)
        setOpenModalEditServer(true);
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        clearServerModal()
    };

    const handleCloseEditServerModal = () => {
        setOpenModalEditServer(false);
        clearServerModal()
        setProjects([]);
    }

    const handleCloseModalDeleteServer = () => {
        clearServerModal()
        setOpenModalDeleteServer(false);
        setOpenModalDeleteServers(false);
    };


    const handleTierLinkClick = (val) => (e) => {
        if (!val) {
            history.push(`/tiers`)
        } else {
            history.push(`/tiers`, { project: serverDetails.projectName, tier: val })
        }
    };

    const handleProjectLinkClick = (val) => (e) => {
        if (!val) {
            history.push(`/projects`)
        } else {
            history.push(`/projects`, { project: val })
        }
    };

    const refreshServers = async () => {
        setIsLoading(true);
        await fetchData();
        setIsHideTabPannel(true);
        setRowsSelected([]);
        setIsLoading(false);
    };

    const getProjects = async (cloudspaceID) => {
        try {
            const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (projectsResponse && projectsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Projects", { position: "bottom-right" });
                return;
            } else {
                const projects = [];
                for (const project of projectsResponse.data.data) {
                    const tiers = [];
                    if (project.relations) {
                        for (const tier of project.relations) {
                            if (tier.tier) {
                                tiers.push({ name: tier.tier.name, id: tier.tier._id })
                            }

                        }
                    }
                    projects.push({ name: project.project.name, id: project.project._id, tiers: tiers });
                }
                setProjects(projects);
                return projects;
            }
        } catch (ex) {
            toast.error("Failed to get projects", { position: "bottom-right" });
        }
    };

    const getHostgroups = async () => {
        try {
            const hostgroupResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman`, { withCredentials: true });
            if (hostgroupResponse && hostgroupResponse.data.statusCode !== 200) {
                toast.error("Failed to get hostgroups", { position: "bottom-right" });
            } else {
                setHostGroups(hostgroupResponse.data.data)
            }
        } catch (ex) {
            toast.error("Failed to get hostgroups", { position: "bottom-right" });
        }
    };

    const getServers = async (cloudspaceID) => {
        try {
            const serversResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/server?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (serversResponse && serversResponse.data.statusCode !== 200) {
                toast.error("Failed to get Servers", { position: "bottom-right" });
                return;
            }
            setServers(serversResponse.data.data);
            return serversResponse.data.data;
        } catch (ex) {
            toast.error("Failed to get Servers", { position: "bottom-right" });
            return;
        }
    };

    const getAllServers = async () => {
        try {
            const serversResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/server/all`, { withCredentials: true });
            if (serversResponse && serversResponse.data.statusCode !== 200) {
                toast.error("Failed to get Servers", { position: "bottom-right" });
                return;
            }
            setAllServers(serversResponse.data.data);
        } catch (ex) {
            toast.error("Failed to get Servers", { position: "bottom-right" });
            return;
        }
    };

    const getCustomActions = async () => {
        try {
            const cloudspaceID = getCloudspaceID();
            if (!cloudspaceID) return;
            const customActionResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/cloudspace/${cloudspaceID}`, { withCredentials: true });
            if (customActionResponse && customActionResponse.data.statusCode !== 200) {
                toast.error("Failed to get custom actions", { position: "bottom-right" });
                return;
            }
            setCustomActions(customActionResponse.data.data);
        } catch (ex) {
            toast.error("Failed to get custom actions", { position: "bottom-right" });
            return;
        }
    }

    const setServerDetials = async (servers) => {
        try {
            let serverDetails;
            if (filterListServer && ['projectName'].includes(filterListServer[0]?.type)) {
                const findIndex = servers.findIndex((server) => server.projectName === filterListServer[0]?.project);
                serverDetails = servers[findIndex];
                setRowsSelected([findIndex])
                setServerDetails(serverDetails);
                return;
            }
            if (filterListServer && ['tierName'].includes(filterListServer[0]?.type)) {
                const findIndex = servers.findIndex((server) => server.projectName === filterListServer[0]?.project && server.tierName === filterListServer[0]?.tier);
                serverDetails = servers[findIndex];
                setRowsSelected([findIndex])
                setServerDetails(serverDetails);
                return;
            }
            if (filterListServer && ['fullHostname', 'id'].includes(filterListServer[0]?.type)) {
                for (let i = 0; i < servers.length; i++) {
                    if (servers[i]._id === filterListServer[0].server || servers[i].fullHostname === filterListServer[0].server) {
                        serverDetails = servers[i];
                        setRowsSelected([i])
                        setServerDetails(serverDetails);
                        return;
                    }
                }
            }
            serverDetails = servers.length > 0 ? servers[0] : null;
            setServerDetails(serverDetails);
        } catch (ex) {
            toast.error("Failed to set Server details ", { position: "bottom-right" });
        }
    };

    const updateServerDetails = async (serverObj) => {
        setServerDetails(serverObj);
        const editedServers = servers;
        const foundServerIndex = editedServers.findIndex((server) => server._id === serverObj._id);
        const foundServer = editedServers.find((server) => server._id === serverObj._id);
        foundServer.investigationCenterURL = serverObj.investigationCenterURL;
        editedServers[foundServerIndex] = foundServer;
        setServers(editedServers);
    }

    const handleSaveModalDeleteServers = async (e) => {
        try {
            setIsLoading(true);
            const rows = rowsSelected;
            const serverArray = [];
            for (const index of rows) {
                serverArray.push({ id: servers[index]._id, tierId: servers[index].tierID })
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/server/deleteServers`, serverArray, { withCredentials: true });
            if (response.data.statusCode === 200) {
                let updatedServers = [...servers];
                for (const serverToDelete of serverArray) {
                    const foundServerIndex = updatedServers.findIndex((serverObj) => serverObj._id === serverToDelete.id);
                    updatedServers.splice(foundServerIndex, 1);
                }
                setServers(updatedServers)
                toast.success("Servers has been deleted successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to delete servers", { position: "bottom-right" });
            }
            setIsLoading(false);
            setRowsSelected([]);
            setOpenModalDeleteServers(false);
        } catch (ex) {
            setIsLoading(false);
            setRowsSelected([]);
            setOpenModalDeleteServers(false);
            toast.error("Failed to delete servers", { position: "bottom-right" });
        }
    };

    const handleSaveModalDeleteServer = async (e) => {
        try {
            const tierId = serverSelectedTier.id
            const isServerDeleted = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/server/deleteServers`, [{ tierId: tierId, id: selectedServerID }], { withCredentials: true });
            if (isServerDeleted && isServerDeleted.data.statusCode === 200) {
                toast.success("Server has been deleted", { position: "bottom-right" });
                const existingServerIndex = servers.findIndex((server, index) => {
                    if (server._id === selectedServerID)
                        return true;
                });
                const newArrayOfServers = servers;
                newArrayOfServers.splice(existingServerIndex, 1)
                setServers(newArrayOfServers);
            } else {
                toast.error("Failed to delete server", { position: "bottom-right" });
            }
            clearServerModal();
            setOpenModalDeleteServer(false);
        } catch (ex) {
            clearServerModal();
            setOpenModalDeleteServer(false);
            toast.error("Failed to delete server", { position: "bottom-right" });
        }
    };

    const handleSaveModalEditServer = async (e) => {
        try {
            if (servers.find((server) => server._id === selectedServerID && server.tierID === serverSelectedTier.id)) {
                toast.error("Server already exist in this tier", { position: "bottom-right" });
                handleCloseEditServerModal();
                return;
            }
            const isServerUpdated = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/server/updateTier`,
                {
                    tierID: serverSelectedTier.id,
                    serverID: selectedServerID
                },
                { withCredentials: true }
            );
            if (isServerUpdated && isServerUpdated.data.statusCode === 200) {
                toast.success("Server has been updated", { position: "bottom-right" });
                const existingServerIndex = servers.findIndex((server, index) => {
                    if (server._id === selectedServerID)
                        return true;
                });
                const newArrayOfServers = servers;
                newArrayOfServers[existingServerIndex].tierID = serverSelectedTier.id;
                newArrayOfServers[existingServerIndex].tierName = serverSelectedTier.name;
                newArrayOfServers[existingServerIndex].projectID = serverSelectedProject.id;
                newArrayOfServers[existingServerIndex].projectName = serverSelectedProject.name;
                setServers(newArrayOfServers);
            } else {
                toast.error("Failed to update server", { position: "bottom-right" });
            }
            handleCloseEditServerModal();
        } catch (ex) {
            handleCloseEditServerModal();
            toast.error("Failed to update server", { position: "bottom-right" });
        }
    };



    const executeAction = async (action, actionLabelName, params, isShowOutput) => {
        try {
            childRef.current.handleChangeTab(5); // change tab to jobs
            setCurrentJobRunning([]);
            const serverArray = [];
            for (const index of rowsSelected) {
                serverArray.push({ id: servers[index]._id, address: servers[index].fullHostname })
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/jobs`,
                {
                    cloudspaceID: getCloudspaceID(),
                    serverArray: serverArray,
                    job: action,
                    jobLabelName: actionLabelName,
                    params: params,
                    isShowOutput: isShowOutput
                },
                { withCredentials: true });
            if (isShowOutput && serverArray.length === 1) {
                childRef.current.handleOpenJobModal(action, actionLabelName);
            }
            setIsLoading(false);
            if (response.data.statusCode === 200) {
                if (rowsSelected.length > 1) {
                    toast.success("Jobs sent successfully. For details, go to 'Audit Trail'", { position: "bottom-right", autoClose: 2000 });
                } else {
                    toast.success("Jobs sent successfully", { position: "bottom-right", autoClose: 2000 });
                }
                setCurrentJobRunning(serverArray.map((server) => { return server.id }))
                return;
            }
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to sent Jobs", { position: "bottom-right" });
        }
    };


    const reloadServer = async (serverID) => {
        try {
            setIsLoading(true);
            const serverResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/server/${serverID}`, { withCredentials: true });
            if (serverResponse && serverResponse.data.statusCode === 200) {
                setServerDetails(serverResponse.data.data);
                let serversArray = [...servers];
                let index = servers.findIndex(server => server._id === serverID);
                serversArray[index] = serverResponse.data.data;
                setServers(serversArray);
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
        }
    }

    const statusCheckSwitch = (statusCheck, jobsInProgress, serverID, isTextResponse = false, openAlerts) => {
        if (statusCheck === 'Running') {
            if (isTextResponse) return <span style={{ color: 'rgb(75, 210, 143)', fontWeight: 'bold' }}>Running</span>
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Running'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} positive pulse></status-indicator>
                </Tooltip>
                {
                    openAlerts ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 15 }}>
                        <div class="shakeElement">
                            <Tooltip title={'Open Alerts'}>
                                <Badge badgeContent={openAlerts} color="error">
                                    <NotificationsActiveIcon style={{ fontSize: 25 }}></NotificationsActiveIcon>
                                </Badge>
                            </Tooltip>
                        </div>
                    </div> : null
                }
                {
                    currentJobRunning.includes(serverID) ? <div style={{ marginLeft: 15 }}>
                        <Badge color="primary" variant="dot">
                            <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                        </Badge>
                    </div>
                        :
                        jobsInProgress ? <div style={{ marginLeft: 15 }}>
                            <Badge color="primary" variant="dot">
                                <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                            </Badge>
                        </div> : null
                }
            </div>
        }
        if (statusCheck === 'Unstable') {
            if (isTextResponse) return <span style={{ color: 'rgb(255, 170, 0)', fontWeight: 'bold' }}>Unstable</span>
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Unstable'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} intermediary pulse></status-indicator>
                </Tooltip>
                {
                    openAlerts ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 15 }}>
                        <div class="shakeElement">
                            <Tooltip title={'Open Alerts'}>
                                <Badge badgeContent={openAlerts} color="error">
                                    <NotificationsActiveIcon style={{ fontSize: 25 }}></NotificationsActiveIcon>
                                </Badge>
                            </Tooltip>
                        </div>
                    </div> : null
                }
                {
                    currentJobRunning.includes(serverID) ? <div style={{ marginLeft: 15 }}>
                        <Badge color="primary" variant="dot">
                            <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                        </Badge>
                    </div>
                        :
                        jobsInProgress ? <div style={{ marginLeft: 15 }}>
                            <Badge color="primary" variant="dot">
                                <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                            </Badge>
                        </div> : null
                }
            </div>
        }
        if (statusCheck === 'Stopped') {
            if (isTextResponse) return <span style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold' }}>Stopped</span>
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Stopped'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} negative pulse></status-indicator>
                </Tooltip>
                {
                    openAlerts ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 15 }}>
                        <div class="shakeElement">
                            <Tooltip title={'Open Alerts'}>
                                <Badge badgeContent={openAlerts} color="error">
                                    <NotificationsActiveIcon style={{ fontSize: 25 }}></NotificationsActiveIcon>
                                </Badge>
                            </Tooltip>
                        </div>
                    </div> : null
                }
                {
                    currentJobRunning.includes(serverID) ? <div style={{ marginLeft: 15 }}>
                        <Badge color="primary" variant="dot">
                            <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                        </Badge>
                    </div>
                        :
                        jobsInProgress ? <div style={{ marginLeft: 15 }}>
                            <Badge color="primary" variant="dot">
                                <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                            </Badge>
                        </div> : null
                }
            </div>
        }
        else {
            if (isTextResponse) return <span style={{ color: 'rgb(0, 0, 0)', fontWeight: 'bold' }}>Pending</span>
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Pending'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} inprogress pulse></status-indicator>
                </Tooltip>
                {
                    openAlerts ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 15 }}>
                        <div class="shakeElement">
                            <Tooltip title={'Open Alerts'}>
                                <Badge badgeContent={openAlerts} color="error">
                                    <NotificationsActiveIcon style={{ fontSize: 25 }}></NotificationsActiveIcon>
                                </Badge>
                            </Tooltip>
                        </div>
                    </div> : null
                }
                {
                    currentJobRunning.includes(serverID) ? <div style={{ marginLeft: 15 }}>
                        <Badge color="primary" variant="dot">
                            <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                        </Badge>
                    </div>
                        :
                        jobsInProgress ? <div style={{ marginLeft: 15 }}>
                            <Badge color="primary" variant="dot">
                                <SyncIcon style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }} />
                            </Badge>
                        </div> : null
                }
            </div>
        }
    };

    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Servers</DialogTitle>
        <DialogContent>
            <DialogContentText>
                The Servers page lists the servers associated with the projects and the tiers.
                A server can be one of the following: Application, Management, ElasticSearch, DB, NFS.
                When attaching a new server, you are required to select a project and a tier.
                Each server can be associated to one project only.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>


    const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteServer} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Are you sure you want to delete this server?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                In a case of deletion all relation to tier will also be deleted
            </DialogContentText>
            <DialogContentText>
                <b>{servers[rowsSelected] ? servers[rowsSelected].fullHostname : null}</b>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalDeleteServer} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteServer} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    const deleteServersModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteServers} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Are you sure you want to delete these servers?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                In a case of deletion all relations to tiers will also be deleted
            </DialogContentText>
            <DialogContentText style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <List>
                    {rowsSelected.map((value) => {
                        return (
                            <ListItem key={value}>
                                <ListItemText primary={
                                    <b>{servers[value] ? servers[value].fullHostname : null}</b>} />
                            </ListItem>
                        );
                    })}
                    <ListItem />
                </List>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalDeleteServer} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteServers} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    const editModal = <Dialog disableBackdropClick={true} fullWidth open={openModalEditServer} onClose={handleCloseEditServerModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Edit Server</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Change server realtions with all the relevant data
            </DialogContentText>
            <FormControl style={{ width: '100%' }} >
                <InputLabel id="select-project1-label">Select Project</InputLabel>
                <Select
                    labelId="select-project1-label"
                    id="select-project1-label"
                    defaultValue=""
                    value={serverSelectedProject?.id}
                    onChange={(event, newValue) => {
                        setServerSelectedProject({ id: event.target.value, name: newValue.props.children })
                        const foundProject = projects.find(project => project.id === event.target.value);
                        if (foundProject.tiers.length > 0) {
                            setServerSelectedTier({ id: foundProject.tiers[0].id, name: foundProject.tiers[0].name })
                        }
                    }}
                >
                    {projects.length > 0 && projects.map((row, index) => (
                        row.tiers && row.tiers.length > 0 && <MenuItem key={index} value={row.id}>{row.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <br></br>
            <br></br>
            <FormControl style={{ width: '100%' }} >
                <InputLabel id="select-tier1-label">Select Tier</InputLabel>
                <Select
                    labelId="select-tier1-label"
                    id="select-tier1-label"
                    defaultValue=""
                    value={serverSelectedTier?.id}
                    onChange={(event, newValue) => {
                        setServerSelectedTier({ id: event.target.value, name: newValue.props.children })
                    }}
                >
                    {projects.length > 0 && serverSelectedProject && (projects.find((project) => project.id === serverSelectedProject.id)).tiers.map((row, index) => (
                        <MenuItem key={index} value={row.id}>{row.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseEditServerModal} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalEditServer} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    const getDefaultColumns = () => {
        return [
            { name: "Alias", options: { filter: false } },
            { name: "IP Address", options: { filter: false } },
            "Hostgroup",
            "Environment",
            { name: "BT Lob", options: { display: false } },
            { name: "BT Role", options: { display: false } },
            { name: "BT Customer", options: { display: false } },
            { name: "BT Tier", options: { display: false } },
            { name: "BT Product", options: { display: false } },
            { name: "CPU", options: { display: false } },
            { name: "Memory", options: { display: false } },
            { name: "OS", options: { display: false } },
            {
                name: "Created Date",
                label: "Created Date",
                options: {
                    display: false,
                    customBodyRender: value => {
                        return getLocalDateTime(value);
                    },
                    sortCompare: (order) => {
                        return (obj1, obj2) => {
                            let val1 = moment(obj1.data).unix();
                            let val2 = moment(obj2.data).unix();
                            return (val1 - val2) * (order === "asc" ? 1 : -1);
                        };
                    }
                }
            },
            { name: "Health", options: { display: false } },
            { name: "Status", options: { filter: false, sort: false } },
            { name: "Actions", options: { filter: false, sort: false } }
        ]
    }

    const getColumns = () => {
        const columnsArr = [];
        if (filterListServer && filterListServer[0]?.type === 'id') {
            columnsArr.push({ name: "ID", options: { display: false, filterList: filterListServer.map(server => (server.server)), filter: false } })
            columnsArr.push({ name: "Hostname", options: { display: true, filter: false } })
            columnsArr.push({ name: "Project", options: { display: true } })
            columnsArr.push({ name: "Tier", options: { display: true } })
        }

        if (filterListServer && filterListServer[0]?.type === 'fullHostname') {
            columnsArr.push({ name: "ID", options: { display: false, filter: false } })
            columnsArr.push({ name: "Hostname", options: { display: true, filterList: filterListServer.map(server => (server.server)), filter: false } })
            columnsArr.push({ name: "Project", options: { display: true } })
            columnsArr.push({ name: "Tier", options: { display: true } })
        }


        if (filterListServer && filterListServer[0]?.type === 'projectName') {
            columnsArr.push({ name: "ID", options: { display: false, filter: false } })
            columnsArr.push({ name: "Hostname", options: { display: true, filter: false } })
            columnsArr.push({ name: "Project", options: { display: true, filterList: [filterListServer[0].project], filter: true } })
            columnsArr.push({ name: "Tier", options: { display: true } })

        }

        if (filterListServer && filterListServer[0]?.type === 'tierName') {
            columnsArr.push({ name: "ID", options: { display: false, filter: false } })
            columnsArr.push({ name: "Hostname", options: { display: true, filter: false } })
            columnsArr.push({ name: "Project", options: { display: true, filterList: [filterListServer[0].project], filter: true } })
            columnsArr.push({ name: "Tier", options: { display: true, filterList: [filterListServer[0].tier], filter: true } })

        }

        if (!filterListServer) {
            columnsArr.push({ name: "ID", options: { display: false, filterList: filterListServer, filter: false } })
            columnsArr.push({ name: "Hostname", options: { display: true, filter: false } })
            columnsArr.push({ name: "Project", options: { display: true } })
            columnsArr.push({ name: "Tier", options: { display: true } })
        }
        const defaultCoulmns = getDefaultColumns();
        return columnsArr.concat(defaultCoulmns);
    }


    return (
        <Grid container wrap="nowrap">
            <Loader isLoading={isLoading}></Loader>
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                <div style={{ marginBottom: 8 }}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                        <Link style={{ cursor: 'pointer' }} color="inherit" onClick={handleProjectLinkClick(null)}>
                            Projects
                        </Link>
                        {
                            rowsSelected.length > 0 && serverDetails?.projectName &&
                            <Link style={{ cursor: 'pointer' }} color="inherit" onClick={handleProjectLinkClick(serverDetails.projectName)}>Project - {serverDetails.projectName}</Link>
                        }
                        {
                            rowsSelected.length > 0 && serverDetails?.tierName &&
                            <Link style={{ cursor: 'pointer' }} color="inherit" onClick={handleTierLinkClick(serverDetails.tierName)}>Tier - {serverDetails.tierName}</Link>
                        }
                        {
                            rowsSelected.length > 0 && serverDetails && <span>Servers</span>
                        }
                    </Breadcrumbs>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography style={{ fontWeight: 300 }} variant="h4">Servers</Typography>
                        <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                            <HelpIcon aria-controls="simple-menu"></HelpIcon>
                        </Button>
                    </div>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Actions
                                disableActionsButtom={rowsSelected.length === 0 || disableActionsButtom ? true : false}
                                executeAction={executeAction}
                                selectedServers={rowsSelected?.map((value) => servers[value] ? servers[value] : null)}
                                serverDetails={serverDetails?.fullHostname}
                                customActions={customActions}
                            >
                            </Actions>
                            <Button disabled={isBasicUser()} variant="contained" style={{ marginRight: 10 }} onClick={handleClickOpenExisting}>
                                Attach Server(s)
                            </Button>
                            <Button disabled variant="contained" style={{ marginRight: 100 }}>
                                Create New Server
                            </Button>
                        </div>
                    </div>
                </div>

                {helpModal}
                {deleteModal}
                {deleteServersModal}
                {editModal}
                <AttachServer
                    hostGroups={hostGroups}
                    projects={projects}
                    allServers={allServers}
                    servers={servers}
                    openExistingServer={openExistingServer}
                    callbackIsLoading={callbackIsLoading}
                    callbackOpenExistingServer={callbackOpenExistingServer}
                    callbackSetServers={callbackSetServers}
                >
                </AttachServer>
                <div style={{ width: '95%', margin: '30px 0px' }}>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Servers List"}
                            data={
                                servers.map((row, i) => {
                                    return [
                                        row._id,
                                        row.fullHostname,
                                        row.projectName,
                                        row.tierName,
                                        row.alias,
                                        row.ip_address,
                                        row.hostgroup,
                                        row.environment,
                                        row.bt_lob,
                                        row.bt_role,
                                        row.bt_customer,
                                        row.bt_tier,
                                        row.bt_product,
                                        row.cpu,
                                        row.memory,
                                        row.os_version,
                                        row.createdDate,
                                        row?.statusCheck?.generalStatus,
                                        statusCheckSwitch(row.statusCheck ? row.statusCheck.generalStatus : null, row.jobsInProgress, row._id, false, row.openAlerts),
                                        <div>
                                            <Tooltip title={'Edit'}>
                                                <IconButton disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true" onClick={editServer(row)}>
                                                    <EditIcon aria-controls="simple-menu" >
                                                    </EditIcon>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={'Remove'}>
                                                <IconButton disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true" onClick={deleteServer(row)}>
                                                    <DeleteIcon aria-controls="simple-menu" >
                                                    </DeleteIcon>
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    ]
                                })
                            }
                            columns={columns}
                            options={{
                                searchOpen: true,
                                filter: true,
                                responsive: 'scrollMaxHeight',
                                viewColumns: true,
                                print: false,
                                download: false,
                                rowsPerPage: 10,
                                rowsPerPageOptions: [50],
                                rowsSelected: rowsSelected,
                                selectableRowsOnClick: true,
                                selectToolbarPlacement: 'none',
                                onViewColumnsChange: (changedColumn, action) => {
                                    for (const col of columns) {
                                        if (col.name === changedColumn) {
                                            if (action === 'add') {
                                                col.options.display = true;
                                            } else {
                                                col.options.display = false;
                                            }

                                        }
                                    }
                                    setColumns(columns)
                                },
                                onFilterChange: (changedColumn, filterList, type, changeColumn) => {
                                    if (changedColumn === 'ID' || changedColumn === 'Hostname' || changedColumn === 'Project' || changedColumn === 'Tier') {
                                        const newColumns = columns;
                                        newColumns[0].options.filterList = null;
                                        newColumns[0].options.filter = true;
                                        newColumns[1].options.filterList = null;
                                        newColumns[1].options.filter = true;
                                        newColumns[2].options.filterList = null;
                                        newColumns[2].options.filter = true;
                                        newColumns[3].options.filterList = null;
                                        newColumns[3].options.filter = true;
                                        setColumns(newColumns);
                                        setFilterListServer(null);
                                        setIsHideTabPannel(true);
                                        setRowsSelected([]);
                                        return;
                                    }
                                    for (const list of filterList) {
                                        if (list.length !== 0) {
                                            setIsHideTabPannel(true);
                                            setRowsSelected([]);
                                            return;
                                        }
                                    }
                                    setFilterListServer(null);
                                    setIsHideTabPannel(true);
                                    setRowsSelected([]);
                                },
                                onSearchChange: (searchText) => {
                                    setIsHideTabPannel(true);
                                    setRowsSelected([]);
                                },
                                onCellClick: (celdata, cellMeta) => {
                                    setRowsSelected([cellMeta.dataIndex]);
                                    const metaSum = clickOnRowMetaData + 1
                                    setClickOnRowMetaData(metaSum);
                                    setDisableActionsButtom(false);
                                },
                                onRowsSelect: (rowsSelected, allRows) => {

                                    if (rowsSelected.length === 1 && clickOnRowMetaData + 1 === 2) {
                                        setIsHideTabPannel(false);
                                        setServerDetails(servers[rowsSelected[0].dataIndex]);
                                        setClickOnRowMetaData(0);
                                        return;
                                    }
                                    if (allRows.length === 0) {
                                        setRowsSelected([])
                                        setIsHideTabPannel(true);
                                        setDisableActionsButtom(true);
                                        return;
                                    }
                                    if (allRows.length >= 1) {
                                        setRowsSelected(allRows.map((row) => row.dataIndex));
                                        setDisableActionsButtom(false);
                                        return;
                                    }
                                    if (filterListServer) {
                                        setFilterListServer(null);
                                        setIsHideTabPannel(false);
                                        setServerDetails(servers[rowsSelected[0].dataIndex]);
                                        return;
                                    }
                                    setIsHideTabPannel(false);
                                    setDisableActionsButtom(false);
                                    setRowsSelected(allRows.map((row) => row.dataIndex));
                                    setServerDetails(servers[allRows[0].dataIndex]);
                                },
                                customToolbar: () => {
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Tooltip title={'Refresh'} >
                                                <IconButton onClick={refreshServers}>
                                                    <RefreshIcon aria-controls="simple-menu" ></RefreshIcon>
                                                </IconButton>
                                            </Tooltip>
                                            {
                                                rowsSelected.length > 1 ?
                                                    <Tooltip title={'Remove Selected'}>
                                                        <IconButton onClick={deleteServers(rowsSelected)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    : null
                                            }
                                        </div>
                                    );
                                },
                            }}
                        />
                    </MuiThemeProvider>
                    <ToastContainer />
                </div>
                <TabsServer
                    isHideTabPannel={isHideTabPannel}
                    serverDetails={serverDetails}
                    ref={childRef}
                    reloadServer={reloadServer}
                    updateServerDetails={updateServerDetails}
                ></TabsServer>
            </div>
        </Grid>
    );
};

export default Server;
