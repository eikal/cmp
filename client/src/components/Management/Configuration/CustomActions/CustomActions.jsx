import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import HelpIcon from '@material-ui/icons/Help';
import ListItemText from '@material-ui/core/ListItemText';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import LabelIcon from '@material-ui/icons/Label';
import LabelOffIcon from '@material-ui/icons/LabelOff';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import DescriptionIcon from '@material-ui/icons/Description';
import CodeIcon from '@material-ui/icons/Code';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import MUIDataTable from "mui-datatables";
import Loader from '../../../shared/Loader';
import CreateActionJobCategoryModal from './Modals/CreateActionJobCategory';
import EditActionJobCategoryModal from './Modals/EditActionJobCategory';
import DeleteActionJobCategoryModal from './Modals/DeleteActionJobCategory';
import CreateActionJobModal from './Modals/CreateActionJob';
import DeleteActionJobModal from './Modals/DeleteActionJob';
import DefaultActionJobModal from './Modals/DefaultActions.jsx';
import { getCloudspaceID } from '../../../../helpers/auth.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';

const CustomActions = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);

    const [projects, setProjects] = useState([]);
    const [projectObj, setProjectObj] = useState('');

    const [actionJobsCategories, setActionsJobsCategories] = useState(null);
    const [actionJobs, setActionJobs] = useState(null);

    const [rowsSelected, setRowsSelected] = useState([0]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedActionJob, setSelectedActionJob] = useState('');

    const [isOpenActionJobCategoryModal, setIsOpenActionJobCategoryModal] = useState(false);
    const [isOpenEditActionJobCategoryModal, setIsOpenEditActionJobCategoryModal] = useState(false);
    const [isOpenDeleteActionJobCategoryModal, setIsOpenDeleteActionJobCategoryModal] = useState(false);
    const [isOpenActionJobModal, setIsOpenActionJobModal] = useState(false);
    const [isOpenDeleteActionJobModal, setIsOpenDeleteActionJobModal] = useState(false);
    const [isOpenDefaultActionJobModal, setIsOpenDefaultActionJobModal] = useState(false);

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MUIDataTable: {
                    responsiveScrollMaxHeight: {
                        maxHeight: '792px !important'
                    },
                    paper: {
                        height: '910px'
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
        fetchData();
        clearDataOnChangeCloudspace();
    }, [getCloudspaceID()]);

    const fetchData = async () => {
        await getProjects();
    };

    const clearDataOnChangeCloudspace = () => {
        if (actionJobsCategories) {
            setActionsJobsCategories([]);
        }
        if (actionJobs) {
            setActionJobs(null);
        }
    };

    const onClickRefresh = () => {
        fetchActionJobsByProjectID(projectObj.id);
    }

    const onClickCreateNewActionJobCategory = () => {
        setIsOpenActionJobCategoryModal(true);
    };

    const onClickHelpIcon = () => {
        setIsOpenHelpModal(true);
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    }

    const onClickEditActionJobCategory = () => {
        setIsOpenEditActionJobCategoryModal(true);
    };

    const onClickCreateNewActionJob = () => {
        setSelectedActionJob('');
        setIsOpenActionJobModal(true);
    };

    const onClickDeleteActionJobCategory = () => {
        setIsOpenDeleteActionJobCategoryModal(true);
    };

    const onClickEditActionJob = (row) => (e) => {
        setIsOpenActionJobModal(true);
        setSelectedActionJob(row);
    };

    const onClickDeleteActionJob = (row) => (e) => {
        setIsOpenDeleteActionJobModal(true);
        setSelectedActionJob(row);
    };

    const handleClickActionJobCategory = (actionJobCategory, i) => async (e) => {
        setActionJobs(actionJobCategory.actions);
        setSelectedIndex(i);
    };

    const callbackCloseActionJobCategoryModal = () => {
        setIsOpenActionJobCategoryModal(false);
    };

    const callbackCloseEditActionJobCategoryModal = () => {
        setIsOpenEditActionJobCategoryModal(false);
    };

    const callbackCloseDeleteActionJobCategoryModal = () => {
        setIsOpenDeleteActionJobCategoryModal(false);
    };

    const callbackCloseActionJobModal = () => {
        setIsOpenActionJobModal(false);
        setSelectedActionJob('');
    };

    const callbackCloseDeleteActionJobModal = () => {
        setIsOpenDeleteActionJobModal(false);
        setSelectedActionJob('');
    };

    const callbackCloseDeleteDefaultActionJobModal = () => {
        setIsOpenDefaultActionJobModal(false);
        setActionsJobsCategories([]);
        setIsLoading(false);
    };

    const callbackSaveActionJobCategoryModal = async (newActionJobCategoryObj) => {
        try {
            const isCategorylabelExist = actionJobsCategories.some((actionJobCategory) => actionJobCategory.name.toLowerCase() === newActionJobCategoryObj.name.toLowerCase());
            if (isCategorylabelExist) {
                toast.error("Action Job Category already exists, Please change to different name", { position: "bottom-right" });
                setIsOpenActionJobCategoryModal(false);
                return;
            }
            setIsLoading(true);
            newActionJobCategoryObj.projectID = projectObj.id;
            const actionJobResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/create-label`, newActionJobCategoryObj, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                newActionJobCategoryObj.displayName = newActionJobCategoryObj.name;
                newActionJobCategoryObj.name = newActionJobCategoryObj.name.toLowerCase();
                newActionJobCategoryObj.isActive = actionJobResponse.data.data.isActive;
                newActionJobCategoryObj.actions = [];
                newActionJobCategoryObj.id = actionJobResponse.data.data._id;
                newActionJobCategoryObj.createdBy = actionJobResponse.data.data.createdBy;
                newActionJobCategoryObj.updatedDate = actionJobResponse.data.data.updatedDate;
                setActionsJobsCategories(oldArray => [...oldArray, newActionJobCategoryObj]);
                toast.success("Action job category created successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to create new action job category", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenActionJobCategoryModal(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to create new action job category", { position: "bottom-right" });
            setIsOpenActionJobCategoryModal(false);
        }
    };

    const callbackSaveEditActionJobCategoryModal = async (newActionJobCategoryObj) => {
        try {
            setIsLoading(true);
            newActionJobCategoryObj.labelID = actionJobsCategories[selectedIndex]._id || actionJobsCategories[selectedIndex].id;
            const actionJobResponse = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/update-label`, newActionJobCategoryObj, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                const updatedActionJobCategories = actionJobsCategories;
                updatedActionJobCategories[selectedIndex].displayName = newActionJobCategoryObj.name;
                updatedActionJobCategories[selectedIndex].name = newActionJobCategoryObj.name.toLowerCase();
                updatedActionJobCategories[selectedIndex].description = newActionJobCategoryObj.description;
                updatedActionJobCategories[selectedIndex].isActive = newActionJobCategoryObj.isActive;
                updatedActionJobCategories[selectedIndex].bt_role = newActionJobCategoryObj.bt_role;
                updatedActionJobCategories[selectedIndex].updatedDate = new Date().toISOString();
                setActionsJobsCategories(updatedActionJobCategories);
                toast.success("Action job category updated successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to updated job category", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenEditActionJobCategoryModal(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to updated job category", { position: "bottom-right" });
            setIsOpenEditActionJobCategoryModal(false);
        }
    };

    const callbackSaveDeleteActionJobCategoryModal = async () => {
        try {
            setIsLoading(true);
            const actionJobCategory = actionJobsCategories[selectedIndex];
            const actionJobCategoryID = actionJobCategory._id || actionJobCategory.id
            const actionJobResponse = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/delete-label/${actionJobCategoryID}`, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                const foundCategoryIndex = actionJobsCategories.findIndex((category) => category._id === actionJobCategoryID);
                const newArrayOfCategories = actionJobsCategories;
                newArrayOfCategories.splice(foundCategoryIndex, 1)
                setActionsJobsCategories(newArrayOfCategories);
                toast.success("Action job category deleted successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to delete action job category", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenDeleteActionJobCategoryModal(false);
            setSelectedIndex(null);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to delete action job category", { position: "bottom-right" });
            setIsOpenDeleteActionJobCategoryModal(false)
        }
    };

    const callbackSaveActionJobModal = async (newActionJobObj) => {
        try {
            const isActionJobExist = actionJobs.some((actionJob) => actionJob.displayName.toLowerCase() === newActionJobObj.name.toLowerCase());
            if (isActionJobExist) {
                toast.error("Action Job already exists, Please change to different name", { position: "bottom-right" });
                setIsOpenActionJobModal(false);
                return;
            }
            setIsLoading(true);
            const actionJobCategory = actionJobsCategories[selectedIndex];
            const actionJobCategoryID = actionJobCategory._id || actionJobCategory.id
            newActionJobObj.labelID = actionJobCategoryID;
            const actionJobResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/create-action`, newActionJobObj, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                newActionJobObj.displayName = newActionJobObj.name;
                newActionJobObj.name = newActionJobObj.name.toLowerCase();
                newActionJobObj._id = actionJobResponse.data.data._id;
                newActionJobObj.createdBy = actionJobResponse.data.data.createdBy;
                newActionJobObj.updatedDate = actionJobResponse.data.data.updatedDate;
                newActionJobObj.roles = actionJobResponse.data.data.roles;
                setActionJobs(oldArray => [...oldArray, newActionJobObj]);
                const updatedActionJobsCategories = [...actionJobsCategories];
                updatedActionJobsCategories[selectedIndex].actions.push(newActionJobObj);
                setActionsJobsCategories(updatedActionJobsCategories);
                toast.success("Action job created successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to create action job", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenActionJobModal(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to create action job", { position: "bottom-right" });
            setIsOpenActionJobModal(false)
        }
    };

    const callbackUpdatedActionJobModal = async (updatedActionJobObj) => {
        try {
            setIsLoading(true);
            const actionJobCategory = actionJobsCategories[selectedIndex];
            const actionJobCategoryID = actionJobCategory._id || actionJobCategory.id
            updatedActionJobObj.labelID = actionJobCategoryID;
            const actionJobResponse = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/update-action`, updatedActionJobObj, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                const actionJobIndex = actionJobs.findIndex((actionJob) => actionJob._id === updatedActionJobObj.actionID)
                const updatedActionJobs = actionJobs;
                updatedActionJobs[actionJobIndex].displayName = updatedActionJobObj.name;
                updatedActionJobs[actionJobIndex].name = updatedActionJobObj.name.toLowerCase();
                updatedActionJobs[actionJobIndex].description = updatedActionJobObj.description;
                updatedActionJobs[actionJobIndex].type = updatedActionJobObj.type;
                updatedActionJobs[actionJobIndex].value = updatedActionJobObj.value;
                updatedActionJobs[actionJobIndex].isActive = updatedActionJobObj.isActive;
                updatedActionJobs[actionJobIndex].roles = updatedActionJobObj.roles;
                updatedActionJobs[actionJobIndex].updatedDate = new Date().toISOString();
                setActionJobs(updatedActionJobs);
                toast.success("Action job updated successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to update action job", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenActionJobModal(false);
            setSelectedActionJob('');
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to update action job", { position: "bottom-right" });
            setIsOpenActionJobModal(false)
            setSelectedActionJob('');
        }
    };

    const callbackDeletedActionJobModal = async (deletedActionJobObj) => {
        try {
            setIsLoading(true);
            const actionJobCategory = actionJobsCategories[selectedIndex];
            const actionJobCategoryID = actionJobCategory._id || actionJobCategory.id
            deletedActionJobObj.labelID = actionJobCategoryID;
            const actionJobResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/delete-action`, deletedActionJobObj, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                const actionJobIndex = actionJobs.findIndex((actionJob) => actionJob._id === deletedActionJobObj.actionID)
                const newArrayOfActionJobs = actionJobs;
                newArrayOfActionJobs.splice(actionJobIndex, 1)
                setActionJobs(newArrayOfActionJobs);
                toast.success("Action job deleted successfully", { position: "bottom-right" });
            } else {
                toast.error("Failed to delete action job", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenDeleteActionJobModal(false);
            setSelectedActionJob('');
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to delete action job", { position: "bottom-right" });
            setIsOpenDeleteActionJobModal(false)
            setSelectedActionJob('');
        }
    };

    const callbackSaveDefaultActionJobModal = async () => {
        try {
            setIsLoading(true);
            const dataObj = { projectID: projectObj.id };
            const actionJobResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/create-default-actions`, dataObj, { withCredentials: true });
            if (actionJobResponse && actionJobResponse.data.statusCode === 200) {
                const actionJobsCategories = actionJobResponse.data.data;
                setActionsJobsCategories(actionJobsCategories);
                toast.success("Action job created successfully", { position: "bottom-right" });
            } else {
                setActionsJobsCategories([])
                toast.error("Failed to create action job", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenDefaultActionJobModal(false);
        } catch (ex) {
            setIsLoading(false);
            setActionsJobsCategories([]);
            setIsOpenDefaultActionJobModal(false);
            toast.error("Failed to create action job", { position: "bottom-right" });


        }
    };


    const getProjects = async () => {
        try {
            const cloudspaceID = getCloudspaceID()
            if (!cloudspaceID) return;
            const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (projectsResponse && projectsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Projects", { position: "bottom-right" });
            } else {
                const projects = [];
                for (const project of projectsResponse.data.data) {
                    projects.push({ name: project.project.name, id: project.project._id });
                }
                setProjects(projects);
                return projects;
            }
        } catch (ex) {
            toast.error("Failed to get projects", { position: "bottom-right" });
        }
    };

    const fetchActionJobsByProjectID = async (projectID) => {
        try {
            setIsLoading(true);
            const actionJobsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/project/${projectID}`, { withCredentials: true });
            if (actionJobsResponse && actionJobsResponse.data.statusCode === 200) {
                if (actionJobsResponse.data.data.length === 0) {
                    setIsOpenDefaultActionJobModal(true);
                    return;
                }
                setActionsJobsCategories(actionJobsResponse.data.data);
            } else {
                toast.error("Failed to get Action Jobs", { position: "bottom-right" });
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get Action Jobs", { position: "bottom-right" });
        }
    };


    const checkActionType = (type) => {
        if (type === 'sshCommand') {
            return <Tooltip title={'SSH Command'}>
                <CodeIcon aria-controls="simple-menu" ></CodeIcon>
            </Tooltip>
        } else {
            return <Tooltip title={'File/Directory View'}>
                <DescriptionIcon aria-controls="simple-menu" ></DescriptionIcon>
            </Tooltip>
        }
    };

    const helpModal = <Dialog disableBackdropClick={true} maxWidth='md' fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Actions explanation</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <div>SSH Command may be a service command, script, or any executable command. For Example:</div>
                <div style={{ marginLeft: 15 }}>
                    <div><li>systemctl restart apacheds.service -i</li></div>
                    <div><li>python /opt/scripts/restartApacheds.py</li></div>
                </div>

                <br></br>
                <br></br>
                <div>File/Directory View is a list of directory paths, or full directory path used for view/edit files. For Example:</div>
                <div style={{ marginLeft: 15 }}>
                    <div><li>/opt/ic/logs/InvestigationCenter.log</li></div>
                    <div><li>/opt/ic/Appserver/logs</li></div>
                </div>

            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    return (
        <div style={{ width: '100%' }}>
            {helpModal}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {
                    !projectObj ?
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 15 }}>
                                <div style={{ height: "300px" }}>
                                    <FormControl style={{ width: '25%' }} >
                                        <InputLabel id="demo-simple-select-label">Select Project</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select-label"
                                            value={projectObj.name}
                                            onChange={(event, newValue) => {
                                                setProjectObj({ id: event.target.value.id, name: event.target.value })
                                                setSelectedIndex(null);
                                                fetchActionJobsByProjectID(event.target.value.id);
                                            }}
                                            MenuProps={{
                                                anchorOrigin: {
                                                    vertical: "bottom",
                                                    horizontal: "left"
                                                },
                                                getContentAnchorEl: null
                                            }}
                                        >
                                            {
                                                projects.length === 0 &&
                                                <MenuItem disabled>
                                                    No Options
                                                </MenuItem>
                                            }
                                            {
                                                projects.map((row) => (
                                                    <MenuItem key={row.name} value={row}>
                                                        {row.name}
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                </div>

                            </div>
                        </div>
                        : null
                }

                {
                    projectObj.name && actionJobsCategories ?
                        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 25 }}>
                            <div style={{ width: '25%' }}>
                                <Card style={{}}>
                                    <CardContent>
                                        <div style={{ display: 'flex', marginLeft: 8 }}>
                                            <FormControl style={{ width: '100%' }} >
                                                <InputLabel>Select Project</InputLabel>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Select style={{ width: '100%' }}
                                                        labelId="demo-simple-select-label"
                                                        id="demo-simple-select-label"
                                                        value={projectObj.name}
                                                        onChange={(event, newValue) => {
                                                            setProjectObj({ id: event.target.value.id, name: event.target.value })
                                                            setSelectedIndex(null);
                                                            fetchActionJobsByProjectID(event.target.value.id);
                                                        }}
                                                        MenuProps={{
                                                            anchorOrigin: {
                                                                vertical: "bottom",
                                                                horizontal: "left"
                                                            },
                                                            getContentAnchorEl: null
                                                        }}
                                                    >
                                                        {
                                                            projects.map((row) => (
                                                                <MenuItem key={row.name} value={row}>
                                                                    {row.name}
                                                                </MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                    <Tooltip title={'Refresh'}>
                                                        <IconButton onClick={onClickRefresh}>
                                                            <RefreshIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={'Create new Action-Job Category'}>
                                                        <IconButton onClick={onClickCreateNewActionJobCategory}>
                                                            <AddCircleOutlineIcon aria-controls="simple-menu"></AddCircleOutlineIcon >
                                                        </IconButton>
                                                    </Tooltip>
                                                    {
                                                        (selectedIndex || selectedIndex === 0) ?
                                                            <Tooltip title={'Edit Action-Job Category'}>
                                                                <IconButton onClick={onClickEditActionJobCategory}>
                                                                    <EditIcon aria-controls="simple-menu"></EditIcon >
                                                                </IconButton>
                                                            </Tooltip>
                                                            : null
                                                    }
                                                    {
                                                        (selectedIndex || selectedIndex === 0) ?
                                                            <Tooltip title={'Delete Action-Job Category'}>
                                                                <IconButton onClick={onClickDeleteActionJobCategory} >
                                                                    <DeleteIcon aria-controls="simple-menu"></DeleteIcon >
                                                                </IconButton>
                                                            </Tooltip>
                                                            : null
                                                    }
                                                </div>
                                            </FormControl>
                                        </div>
                                        <br></br>
                                        <div style={{ height: 800, maxHeight: 800, overflow: 'auto' }}>
                                            <List component="nav" aria-label="main mailbox folders">
                                                {
                                                    actionJobsCategories && Array.isArray(actionJobsCategories) && actionJobsCategories.map((actionJobCategory, i) => (
                                                        <ListItem selected={selectedIndex === i} style={{}} onClick={handleClickActionJobCategory(actionJobCategory, i)} button>
                                                            <ListItemIcon>
                                                                {
                                                                    actionJobCategory.isActive ? <LabelIcon /> : <LabelOffIcon />
                                                                }
                                                            </ListItemIcon>
                                                            <ListItemText primary={actionJobCategory.displayName} />
                                                        </ListItem>
                                                    ))
                                                }
                                            </List>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {
                                actionJobs && (selectedIndex || selectedIndex === 0) ?
                                    <div style={{ width: '75%', marginLeft: 15, marginRight: 15 }}>
                                        <MuiThemeProvider theme={getMuiTheme()}>
                                            <MUIDataTable
                                                title={`${actionJobsCategories && actionJobsCategories[selectedIndex]?.displayName} Action Jobs Configuration`}
                                                data={
                                                    actionJobs.map((row, i) => {
                                                        return [
                                                            row._id,
                                                            row.displayName,
                                                            row.type,
                                                            row.isActive,
                                                            row.description,
                                                            { value: row.value, type: row.type },
                                                            <div>
                                                                <Tooltip title={'Edit'}>
                                                                    <Button onClick={onClickEditActionJob(row)} aria-controls="simple-menu" aria-haspopup="true" >
                                                                        <EditIcon aria-controls="simple-menu" >
                                                                        </EditIcon>
                                                                    </Button>
                                                                </Tooltip>
                                                                <Tooltip title={'Remove'}>
                                                                    <Button onClick={onClickDeleteActionJob(row)} aria-controls="simple-menu" aria-haspopup="true" >
                                                                        <DeleteIcon aria-controls="simple-menu" >
                                                                        </DeleteIcon>
                                                                    </Button>
                                                                </Tooltip>
                                                            </div>
                                                        ]
                                                    })
                                                }
                                                columns={[
                                                    { name: "ID", options: { display: false, filter: false } },
                                                    {
                                                        name: "Name",
                                                        label: "Name",
                                                        options: {
                                                            customBodyRender: value => {
                                                                return <span style={{ fontWeight: 500 }} >{value}</span>
                                                            }
                                                        }
                                                    },
                                                    {
                                                        name: "Type",
                                                        label: "Type",
                                                        options: {
                                                            customBodyRender: value => {
                                                                return checkActionType(value);
                                                            }
                                                        }
                                                    },
                                                    {
                                                        name: "Active",
                                                        label: "Active",
                                                        options: {
                                                            customBodyRender: value => {
                                                                if (value) {
                                                                    return <Tooltip title={'Active'} >
                                                                        <DoneIcon style={{ color: '#4bd28f' }} ></DoneIcon>
                                                                    </Tooltip>
                                                                }
                                                                return <Tooltip title={'In Active'} >
                                                                    <ClearIcon style={{ color: 'rgb(255, 77, 77)' }} ></ClearIcon>
                                                                </Tooltip>
                                                            }
                                                        }
                                                    },
                                                    {
                                                        name: "Description",
                                                        label: "Description",
                                                        options: {
                                                            customBodyRender: value => {
                                                                if (value.toString().length > 50) {
                                                                    return <Tooltip title={<span style={{ fontSize: 18 }}>{value.toString()}</span>}>
                                                                        <span>{value.toString().slice(0, 50) + '...'}</span>
                                                                    </Tooltip>
                                                                } else {
                                                                    return value.toString();
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        name: "Value",
                                                        label: "Value",
                                                        options: {
                                                            filter: false,
                                                            customBodyRender: elm => {
                                                                const value = elm.value;
                                                                if (elm.type === 'sshCommand' && value.length === 1) {
                                                                    if (value.toString().length > 50) {
                                                                        return <Tooltip title={<span style={{ fontSize: 18 }}>{value.toString()}</span>}>
                                                                            <span>{value.toString().slice(0, 50) + '...'}</span>
                                                                        </Tooltip>
                                                                    } else {
                                                                        return value.toString();
                                                                    }
                                                                } else {
                                                                    return <Tooltip
                                                                        title={<span style={{ fontSize: 18 }}>
                                                                            {
                                                                                value.map((item) => <li style={{ marginBottom: 7 }}>{item}</li>)
                                                                            }
                                                                        </span>}>
                                                                        <MoreHorizIcon></MoreHorizIcon>
                                                                    </Tooltip>
                                                                }

                                                            }
                                                        }
                                                    },
                                                    { name: "Actions", options: { filter: false, sort: false } },
                                                ]}
                                                options={{
                                                    searchOpen: false,
                                                    filter: true,
                                                    responsive: 'scrollMaxHeight',
                                                    viewColumns: true,
                                                    print: false,
                                                    download: false,
                                                    rowsPerPage: 10,
                                                    tableBodyHeight: '800px',
                                                    rowsPerPageOptions: [10, 20, 50, 100],
                                                    selectableRows: 'single',
                                                    rowsSelected: rowsSelected,
                                                    selectableRowsOnClick: true,
                                                    selectableRowsHideCheckboxes: true,
                                                    selectToolbarPlacement: 'none',
                                                    customToolbar: () => {
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                                <Tooltip title={'Create Action-Job'}>
                                                                    <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={onClickCreateNewActionJob}  >
                                                                        <AddCircleOutlineIcon aria-controls="simple-menu"></AddCircleOutlineIcon >
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={'Help'}>
                                                                    <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={onClickHelpIcon}  >
                                                                        <HelpIcon aria-controls="simple-menu"></HelpIcon >
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>

                                                        );
                                                    },
                                                }}
                                            />
                                        </MuiThemeProvider>
                                    </div>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
                <Loader isLoading={isLoading}></Loader>
                <CreateActionJobCategoryModal
                    isOpenActionJobCategoryModal={isOpenActionJobCategoryModal}
                    callbackCloseActionJobCategoryModal={callbackCloseActionJobCategoryModal}
                    callbackSaveActionJobCategoryModal={callbackSaveActionJobCategoryModal}
                >
                </CreateActionJobCategoryModal>
                <EditActionJobCategoryModal
                    isOpenEditActionJobCategoryModal={isOpenEditActionJobCategoryModal}
                    actionJobCategory={actionJobsCategories && actionJobsCategories[selectedIndex]}
                    callbackCloseEditActionJobCategoryModal={callbackCloseEditActionJobCategoryModal}
                    callbackSaveEditActionJobCategoryModal={callbackSaveEditActionJobCategoryModal}
                >
                </EditActionJobCategoryModal>
                <DeleteActionJobCategoryModal
                    isOpenDeleteActionJobCategoryModal={isOpenDeleteActionJobCategoryModal}
                    callbackCloseDeleteActionJobCategoryModal={callbackCloseDeleteActionJobCategoryModal}
                    callbackSaveDeleteActionJobCategoryModal={callbackSaveDeleteActionJobCategoryModal}
                >
                </DeleteActionJobCategoryModal>
                <CreateActionJobModal
                    isOpenActionJobModal={isOpenActionJobModal}
                    selectedActionJob={selectedActionJob}
                    callbackCloseActionJobModal={callbackCloseActionJobModal}
                    callbackSaveActionJobModal={callbackSaveActionJobModal}
                    callbackUpdatedActionJobModal={callbackUpdatedActionJobModal}
                >
                </CreateActionJobModal>
                <DeleteActionJobModal
                    isOpenDeleteActionJobModal={isOpenDeleteActionJobModal}
                    selectedActionJob={selectedActionJob}
                    callbackDeletedActionJobModal={callbackDeletedActionJobModal}
                    callbackCloseDeleteActionJobModal={callbackCloseDeleteActionJobModal}
                >
                </DeleteActionJobModal>
                <DefaultActionJobModal
                    isOpenDefaultActionJobModal={isOpenDefaultActionJobModal}
                    projectObj={projectObj?.name}
                    callbackCloseDeleteDefaultActionJobModal={callbackCloseDeleteDefaultActionJobModal}
                    callbackSaveDefaultActionJobModal={callbackSaveDefaultActionJobModal}
                >
                </DefaultActionJobModal>
                <ToastContainer />
            </div>
        </div>
    );
};

export default CustomActions;
