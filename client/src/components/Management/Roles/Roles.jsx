import React, { useState, useEffect } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import HelpIcon from '@material-ui/icons/Help';
import MUIDataTable from "mui-datatables";
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import Tooltip from '@material-ui/core/Tooltip';
import TabRoles from './TabsRoles.jsx';
import Loader from '../../shared/Loader';
import { getCloudspaceID } from '../../../helpers/auth.js';
import { titleCase } from '../../../helpers/helpers.js';
import { getLocalDateTime } from '../../../helpers/date.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'



const Roles = () => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [rowsSelected, setRowsSelected] = useState([0])
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
        setColumns(getColumns());
        fetchData();
    }, [getCloudspaceID()]);


    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };

    const fetchUpdatedData = () => {
        fetchData(true);
    }

    const fetchData = async (isUpdateMode = false) => {
        try {
            setIsLoading(true);
            const cloudspaceID = getCloudspaceID();
            const rolesResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/auth/role?id=${cloudspaceID}`, { withCredentials: true })
            if (rolesResponse && rolesResponse.data.statusCode !== 200) {
                toast.error("Failed to get all roles", { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            const rolesArray = [rolesResponse.data.data.admin, rolesResponse.data.data.advanced, rolesResponse.data.data.basic]
            setRoles(rolesArray);
            if (isUpdateMode) {
                setSelectedRole(rolesArray[rowsSelected[0]]);
            } else {
                setSelectedRole(rolesArray[0]);
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get all roles", { position: "bottom-right" });
        }
    }

    const getColumns = () => {
        return [
            { name: "ID", options: { display: false } },
            "Name",
            "Description",
            "Users",
            "Groups",
            {
                name: "Updated Date",
                label: "Updated Date",
                options: {
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
            }

        ]
    }

    const callbackUpdateUsers = (users, role, action) => {
        const newRoles = roles;
        const foundRoleIndex = roles.findIndex((roleObj) => roleObj.name === role);
        const foundRole = roles.find((roleObj) => roleObj.name === role);
        foundRole.users = users;
        foundRole.updatedDate = new Date().toISOString();
        newRoles[foundRoleIndex] = foundRole
        setRoles(newRoles);
        setRowsSelected([foundRoleIndex])
    }

    const callbackUpdateGroups = (groups, role, action) => {
        const newRoles = roles;
        const foundRoleIndex = roles.findIndex((roleObj) => roleObj.name === role);
        const foundRole = roles.find((roleObj) => roleObj.name === role);
        foundRole.groups = groups;
        foundRole.updatedDate = new Date().toISOString();
        newRoles[foundRoleIndex] = foundRole
        setRoles(newRoles);
        setRowsSelected([foundRoleIndex])
    }



    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Roles and Permissions</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Users and Groups access to the resources are constrained by the permissions that they are granted.
                These permissions are also used to restrict the set of servers, projects and other resources that a user or a group is able to access and modify.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>


    return (
        <Grid container wrap="nowrap">
            <Loader isLoading={isLoading}></Loader>
            <div style={{ width: '100%' }}>

                <div style={{ display: 'flex', width: '100%', }}>
                    <Typography style={{ fontWeight: 300 }} variant="h4">Roles</Typography>
                    <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                        <HelpIcon aria-controls="simple-menu"></HelpIcon>
                    </Button>
                </div>
                <br></br>
                <br></br>
                <div style={{ width: '95%', marginBottom: 30 }}>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Roles List"}
                            data={
                                roles.map((row, i) => {
                                    return [
                                        row._id,
                                        titleCase(row.name),
                                        row.description,
                                        row.users.length,
                                        row.groups.length,
                                        row.updatedDate
                                    ]
                                })
                            }
                            columns={columns}
                            options={{
                                searchOpen: false,
                                filter: true,
                                responsive: 'scrollMaxHeight',
                                viewColumns: true,
                                print: false,
                                download: false,
                                rowsPerPage: 10,
                                rowsPerPageOptions: [50],
                                selectableRows: 'single',
                                rowsSelected: rowsSelected,
                                selectableRowsOnClick: true,
                                selectableRowsHideCheckboxes: true,
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
                                onRowsSelect: (rowsSelected, allRows) => {
                                    setRowsSelected(allRows.map((row) => row.dataIndex));
                                    setSelectedRole(roles[rowsSelected[0].dataIndex])
                                },
                                customToolbar: () => {
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Tooltip title={'Refresh'} >
                                                <IconButton onClick={fetchUpdatedData}>
                                                    <RefreshIcon aria-controls="simple-menu"  >
                                                    </RefreshIcon>
                                                </IconButton>
                                            </Tooltip>
                                        </div>

                                    );
                                }
                            }}
                        />
                    </MuiThemeProvider>
                </div>
                <TabRoles
                    selectedRole={selectedRole}
                    callbackUpdateUsers={callbackUpdateUsers}
                    callbackUpdateGroups={callbackUpdateGroups}
                ></TabRoles>
            </div>
            {helpModal}
            <ToastContainer />
        </Grid>
    );
};

export default Roles;
