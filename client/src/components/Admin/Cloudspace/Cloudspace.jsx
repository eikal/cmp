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
import TextField from '@material-ui/core/TextField';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import MUIDataTable from "mui-datatables";
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import StorageIcon from '@material-ui/icons/Storage';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import Loader from '../../shared/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';

import {
    Avatar,
    Box,
    Card,
    CardContent,

} from '@material-ui/core';
import 'react-toastify/dist/ReactToastify.css'

const Cloudspace = (props) => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [cloudspaces, setCloudspaces] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        cloudspaces: 0,
        projects: 0,
        tiers: 0,
        servers: 0

    })
    const [columns, setColumns] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openModalDeleteCloudspace, setOpenModalDeleteCloudspace] = useState(false);
    const [isEditCloudspace, setIsEditCloudspace] = useState(false);
    const [cloudspaceName, setCloudspaceName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCloudspaceID, setSlectedCloudspaceID] = useState('');

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MuiTableCell: {
                    body: {
                        "&:nth-child(1)": {
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
        fetchData();
        setColumns(getColumns());
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const results = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/cloudspace/admin`, { withCredentials: true });
            if (results?.data?.statusCode === 200) {
                const dashboardData = buildData(results.data.data);
                setDashboardData(dashboardData)
                setCloudspaces(results.data.data)
            } else {
                toast.error("Failed to get cloudspaces", { position: "bottom-right" });
            }
            setIsLoading(false);
        } catch (ex) {
            toast.error("Failed to get cloudspaces", { position: "bottom-right" });
            setIsLoading(false);
        }
    }

    const buildData = (cloudspaces) => {
        const totalData = {
            cloudspaces: 0,
            projects: 0,
            tiers: 0,
            servers: 0
        };
        for (const cloudspace of cloudspaces) {
            totalData.cloudspaces++;
            for (const project of cloudspace.projects) {
                totalData.projects++
                for (const relation of project.relations) {
                    if (relation.tier) {
                        totalData.tiers++
                    }
                    if (relation.servers.length > 0) {
                        totalData.servers = totalData.servers + relation.servers.length;
                    }
                }
            }
        }
        return totalData;
    }

    const handleSaveModal = async () => {
        try {
            if (!cloudspaceName) {
                toast.error("Cloudspace Name cannot be empty", { position: "bottom-right" });
                return;
            }
            if (cloudspaceName.length < 2) {
                toast.error("Cloudspace Name cannot be less than 2 characters", { position: "bottom-right" });
                return;
            }
            if (!description) {
                toast.error("Description cannot be empty", { position: "bottom-right" });
                return;
            }
            if (!isEditCloudspace) {
                const newCloudspaceRes = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/cloudspace`,
                    {
                        name: cloudspaceName.replace(/\s+/g, ' ').trim(),
                        description: description,
                    },
                    { withCredentials: true }
                );
                if (newCloudspaceRes && newCloudspaceRes.data.statusCode === 200) {
                    toast.success("New Cloudspace has been created", { position: "bottom-right" });
                    const newCloudspace = {
                        projects: [],
                        cloudspace: {
                            _id: newCloudspaceRes.data.data._id,
                            name: newCloudspaceRes.data.data.name,
                            description: newCloudspaceRes.data.data.description,
                            createdBy: newCloudspaceRes.data.data.createdBy,
                            createdDate: newCloudspaceRes.data.data.createdDate,
                        }
                    }
                    setCloudspaces(cloudspaces => [...cloudspaces, newCloudspace])
                } else {
                    toast.error("Failed to create new Cloudspace", { position: "bottom-right" });
                }
                setOpenModal(false);
                clearCloudspaceModal();
                window.location.reload();
            } else {
                const editCloudspaceRes = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/cloudspace/${selectedCloudspaceID}`,
                    {
                        name: cloudspaceName.replace(/\s+/g, ' ').trim(),
                        description: description,
                    },
                    { withCredentials: true }
                );
                if (editCloudspaceRes && editCloudspaceRes.data.statusCode === 200) {
                    toast.success("Cloudspace has been edited", { position: "bottom-right" });
                    const existingCloudspaceIndex = cloudspaces.findIndex((cloudspace, index) => {
                        if (cloudspace.cloudspace._id === selectedCloudspaceID)
                            return true;
                    });
                    const newArrayOfCloudspaces = cloudspaces;
                    const editedCloudspace = {
                        projects: cloudspaces[existingCloudspaceIndex].projects,
                        cloudspace: editCloudspaceRes.data.data
                    }
                    newArrayOfCloudspaces[existingCloudspaceIndex] = editedCloudspace;
                    setCloudspaces(newArrayOfCloudspaces);

                } else {
                    toast.error("Failed to update Cloudspace", { position: "bottom-right" });
                }
                setIsEditCloudspace(false);
                setOpenModal(false);
                clearCloudspaceModal();
                if (JSON.parse(localStorage.getItem('cloudspace')).id === selectedCloudspaceID) {
                    if (JSON.parse(localStorage.getItem('cloudspace')).name !== cloudspaceName.replace(/\s+/g, ' ').trim()) {
                        localStorage.setItem('cloudspace', JSON.stringify({ id: selectedCloudspaceID, name: cloudspaceName.replace(/\s+/g, ' ').trim() }))
                    }
                }
                window.location.reload();
            }
        } catch (ex) {
            clearCloudspaceModal();
            setOpenModal(false);
            toast.error("Failed to update Cloudspace", { position: "bottom-right" });
        }

    };

    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };

    const fillCloudspaceName = (e) => {
        setCloudspaceName(e.target.value);
    };

    const fillDescription = (e) => {
        setDescription(e.target.value);
    };

    const handleCloseModal = () => {
        clearCloudspaceModal();
        setOpenModal(false);
        setIsEditCloudspace(false);
    };

    const clearCloudspaceModal = () => {
        setCloudspaceName('');
        setDescription('');
        setSlectedCloudspaceID(null);
    };

    const handleCreateNewCloudspace = () => {
        setOpenModal(true);
    }

    const editCloudspace = (row) => (e) => {
        setIsEditCloudspace(true);
        setOpenModal(true);
        setCloudspaceName(row.name);
        setDescription(row.description);
        setSlectedCloudspaceID(row._id)

    };

    const deleteCloudspace = (row) => async (e) => {
        setOpenModalDeleteCloudspace(true);
        setSlectedCloudspaceID(row._id)
    };

    const handleCloseModalDeleteCloudspace = () => {
        clearCloudspaceModal();
        setOpenModalDeleteCloudspace(false);
    };

    const handleSaveModalDeleteCloudspace = async (e) => {
        try {
            const isCloudspaceDeleted = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/entity/cloudspace/${selectedCloudspaceID}`, { withCredentials: true });
            if (isCloudspaceDeleted && isCloudspaceDeleted.data.statusCode === 200) {
                toast.success("Cloudspace has been deleted", { position: "bottom-right" });
                const existingCloudspaceIndex = cloudspaces.findIndex((cloudspace, index) => {
                    if (cloudspace.cloudspace._id === setSlectedCloudspaceID)
                        return true;
                });
                const newArrayOfCloudspaces = cloudspaces;
                newArrayOfCloudspaces.splice(existingCloudspaceIndex, 1)
                setCloudspaces(newArrayOfCloudspaces);
            } else {
                toast.error("Failed to delete cloudpace", { position: "bottom-right" });
            }
            clearCloudspaceModal();
            setOpenModalDeleteCloudspace(false);
            if (JSON.parse(localStorage.getItem('cloudspace')).id === selectedCloudspaceID) {
                localStorage.removeItem('cloudspace');
                window.location.reload();
            } else {
                window.location.reload();
            }
        } catch (ex) {
            clearCloudspaceModal();
            setOpenModalDeleteCloudspace(false);
            toast.error("Failed to delete cloudspace", { position: "bottom-right" });
        }
    };

    const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteCloudspace} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Are you sure you want to delete this cloudspace?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                In a case of deletion releted project,tiers and servers will be deleted
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalDeleteCloudspace} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteCloudspace} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>





    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">CloudSpaces</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Manage your CloudSpaces teams
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    const editCreateModal = <Dialog disableBackdropClick={true} fullWidth open={openModal} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{!isEditCloudspace ? 'Create New Cloudspace' : 'Edit Cloudspace'}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {!isEditCloudspace ? 'Create a new CloudSpace' : 'Edit a CloudSpace'}
            </DialogContentText>
            <TextField
                value={cloudspaceName}
                required
                autoFocus
                margin="dense"
                id="cloudspaceName"
                label="CloudSpace Name"
                type="string"
                fullWidth
                color='rgb(0, 112, 185)'
                onChange={fillCloudspaceName}
            />
            <TextField
                value={description}
                required
                autoFocus
                margin="dense"
                id="description"
                label="Description"
                type="string"
                fullWidth
                onChange={fillDescription}
            />
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Cancel</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModal} color="primary">Save</Button>
        </DialogActions>
    </Dialog>

    const getColumns = () => {
        return [
            { name: "ID", options: { display: false } },
            "Name",
            "Description",
            "CreatedBy",
            "CreatedDate",
            "Projects",
            { name: "Actions", options: { filter: false, sort: false } }
        ];
    }

    return (

        <Grid container wrap="nowrap">
            <ToastContainer />
            <Loader isLoading={isLoading}></Loader>
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography style={{ fontWeight: 300 }} variant="h4">CloudSpaces</Typography>

                        <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                            <HelpIcon aria-controls="simple-menu"></HelpIcon>
                        </Button>

                    </div>
                </div>
                <div>
                    {helpModal}
                    {editCreateModal}
                    {deleteModal}
                </div>

                <div style={{ marginTop: 30, width: '95%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
                            <Card key={'cloudspacesCard'} style={{ height: '200px', width: '95%' }}>
                                <CardContent>

                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div>
                                            <Grid container spacing={3} sx={{ justifyContent: 'space-between' }} >
                                                <Grid item>
                                                    <Typography color="textSecondary" gutterBottom variant="h6"> CloudSpaces</Typography>
                                                    <Typography color="textPrimary" variant="h3">{dashboardData.cloudspaces}</Typography>
                                                </Grid>
                                            </Grid>
                                        </div>
                                        <div>
                                            <Grid item>
                                                <ListItemIcon ><CloudCircleIcon /></ListItemIcon>
                                            </Grid>
                                        </div>
                                    </div>
                                </CardContent>

                            </Card>
                        </div>

                        <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
                            <Card key={'projectsCard'} style={{ height: '200px', width: '95%' }}>
                                <CardContent>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div>
                                            <Grid container spacing={3} sx={{ justifyContent: 'space-between' }} >
                                                <Grid item>
                                                    <Typography color="textSecondary" gutterBottom variant="h6"> Projects</Typography>
                                                    <Typography color="textPrimary" variant="h3">{dashboardData.projects}</Typography>
                                                </Grid>
                                            </Grid>
                                        </div>
                                        <div>
                                            <Grid item>
                                                <ListItemIcon ><AccountTreeIcon /></ListItemIcon>
                                            </Grid>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
                            <Card key={'tiersCard'} style={{ height: '200px', width: '95%' }}>
                                <CardContent>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div>
                                            <Grid container spacing={3} sx={{ justifyContent: 'space-between' }} >
                                                <Grid item>
                                                    <Typography color="textSecondary" gutterBottom variant="h6"> Tiers</Typography>
                                                    <Typography color="textPrimary" variant="h3">{dashboardData.tiers}</Typography>
                                                </Grid>
                                            </Grid>
                                        </div>
                                        <div>
                                            <Grid item>
                                                <ListItemIcon ><DashboardIcon /></ListItemIcon>
                                            </Grid>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
                            <Card key={'serversCard'} style={{ height: '200px', width: '95%' }}>
                                <CardContent>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div>
                                            <Grid container spacing={3} sx={{ justifyContent: 'space-between' }} >
                                                <Grid item>
                                                    <Typography color="textSecondary" gutterBottom variant="h6"> Servers</Typography>
                                                    <Typography color="textPrimary" variant="h3">{dashboardData.servers}</Typography>
                                                </Grid>
                                            </Grid>
                                        </div>
                                        <div>
                                            <Grid item>
                                                <ListItemIcon ><StorageIcon /></ListItemIcon>
                                            </Grid>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                    <br></br>
                    <br></br>
                    <div>
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                title={"Cloudspace List"}
                                data={
                                    cloudspaces.map((row, i) => {
                                        return [
                                            row.cloudspace._id,
                                            row.cloudspace.name,
                                            row.cloudspace.description,
                                            row.cloudspace.createdBy,
                                            row.cloudspace.createdDate,
                                            row.projects.length,
                                            <div>
                                                <Tooltip title={'Edit'}>
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={editCloudspace(row.cloudspace)}>
                                                        <EditIcon aria-controls="simple-menu" >
                                                        </EditIcon>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title={'Remove'}>
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={deleteCloudspace(row.cloudspace)}>
                                                        <DeleteIcon aria-controls="simple-menu" >
                                                        </DeleteIcon>
                                                    </Button>
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
                                    rowsPerPage: 250,
                                    rowsPerPageOptions: [50],
                                    selectableRowsHideCheckboxes: true,
                                    selectableRowsOnClick: false,
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
                                    customToolbar: () => {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Tooltip title={'Refresh'} onClick={fetchData} >
                                                    <IconButton>
                                                        <RefreshIcon aria-controls="simple-menu"  >
                                                        </RefreshIcon>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={'Create'} onClick={handleCreateNewCloudspace} >
                                                    <IconButton>
                                                        <AddIcon aria-controls="simple-menu"  >
                                                        </AddIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        );
                                    }
                                }}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        </Grid>
    );
};

export default Cloudspace;
