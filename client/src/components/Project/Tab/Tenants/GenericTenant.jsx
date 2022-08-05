import React, { useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import SettingsIcon from '@material-ui/icons/Settings';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import DialogTitle from '@material-ui/core/DialogTitle';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from "@material-ui/core/Typography";
import RefreshIcon from '@material-ui/icons/Refresh';
import JSONPretty from 'react-json-pretty';
import Collapse from "@material-ui/core/Collapse";
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import FindReplaceIcon from '@material-ui/icons/FindReplace';
import MUIDataTable from "mui-datatables";
import Switch from '@material-ui/core/Switch';
import DetailsIcon from '@material-ui/icons/Details';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { Divider } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPannel from '../../../shared/TabPanel/TabPanel.jsx';
import SearchBar from "material-ui-search-bar";
import Loader from '../../../shared/Loader';
import EditUserModal from './Modals/EditUserModal.jsx';
import CreateUserModal from './Modals/CreateUserModal.jsx';
import CreateTenantModal from './Modals/CreateTenantModal.jsx';
import EditTenantModal from './Modals/EditTenantModal.jsx';
import { getLocalDateTime } from '../../../../helpers/date.js';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const WlsTenant = (props) => {

    const [valueTab, setValueTab] = useState(1);
    const [fullScreenIsLoading, setFullScreenIsLoading] = useState(false);
    const [loadingTestConnection, setLoadingTestConnection] = useState(false);

    const [tierObj, setTierObj] = useState('');
    const [tenants, setTenants] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('');
    const [tenantUsers, setTenantUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    const [rowsSelected, setRowsSelected] = useState([0]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [openConfigModal, setOpenConfigModal] = useState(false);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [openModalDeleteUser, setOpenModalDeleteUser] = useState(false);
    const [openCreateUserModal, setOpenCreateUserModal] = useState(false);
    const [openCreateTenantModal, setOpenTenantModal] = useState(false);
    const [openModalEnabledUser, setOpenModalEnabledUser] = useState(false);
    const [openModalDeleteTenant, setOpenModalDeleteTenant] = useState(false);
    const [openModalEditTenant, setOpenModalEditTenant] = useState(false);


    const [keycloakURL, setKeycloakURL] = useState('');
    const [keycloakUsername, setKeycloakUsername] = useState('keycloak');
    const [keycloakPassword, setKeycloakPassword] = useState('keycloak');
    const [keycloakGrantType, setKeycloakGrantType] = useState('password');
    const [keycloakClientID, setKeycloakClientID] = useState('admin-cli');

    const [cfrmApiGatewayURL, setCfrmApiGatewayURL] = useState('');
    const [cfrmUsername, setCfrmUsername] = useState('ic_admin');
    const [cfrmPassword, setCfrmPassword] = useState('ic_admin');
    const [cfrmGrantType, setCfrmGrantType] = useState('password');
    const [cfrmClientID, setCfrmClientID] = useState('InvestigationCenter');

    const [dbUsername, setDbUsername] = useState();
    const [dbPassword, setDbPassword] = useState();
    const [dbConnectionString, setDbConnectionString] = useState('us01vlcfrmdb01.saas-n.com:1560/CFRMNY2DV01');
    const [dbHomePath, setDbHomePath] = useState('/opt/bt/oracle_client19c64/product/19.3/client');

    const [apacheHostname, setApacheHostname] = useState();
    const [apachePort, setApachePort] = useState('10389');
    const [apacheUsername, setApacheUsername] = useState('uid=admin,ou=system');
    const [apachePassword, setApachePassword] = useState('secret');


    const [openKeycloakConfigExpend, setOpenKeycloakConfigExpend] = useState(true);
    const [openCfrmUrlConfigExpend, setOpenCfrmUrlConfigExpend] = useState(true);
    const [openDBConfigExpend, setOpenDBConfigExpend] = useState(true);
    const [openApacheConfigExpend, setOpenApacheConfigExpend] = useState(true);

    const [isShowSearch, setIsShowSearch] = useState(false);
    const [rows, setRows] = useState([]);
    const [searched, setSearched] = useState('');

    useEffect(() => {
        setSelectedIndex(null);
        setTenants('');
        setRows('');
        setTierObj('');
        setSelectedTenant('');
        setSelectedUser('');
        setTenantUsers([]);
    }, [props.selectedProjectDetails]);

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MUIDataTable: {
                    responsiveScrollMaxHeight: {
                        maxHeight: '733px !important'
                    },
                    paper: {
                        height: '850px'
                    }
                }
            }
        });

    const getTenants = (tier) => async (e) => {
        try {
            if (tier.id) {
                tier._id = tier.id
            }
            setTenants('');
            setRows('');
            setFullScreenIsLoading(true);
            setTierObj({ id: tier._id, name: tier.name });
            const configuration = await getConfigurationByTier(tier._id)
            if (!configuration) {
                toast.info("Please config tenant", { position: "bottom-right" });
                setFullScreenIsLoading(false);
                return;

            }
            const serverResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/${tier._id}?solutionType=${props.solutionType}`, { withCredentials: true });
            if (serverResponse && serverResponse.data.statusCode === 200) {
                setTenants(sortTenants(serverResponse.data.data));
                setRows(serverResponse.data.data);
                setSelectedTenant(serverResponse.data.data[0])
            }
            setFullScreenIsLoading(false)
        } catch (ex) {
            toast.error('Failed to get tenants, Please check tier credentials', { position: "bottom-right" })
            setFullScreenIsLoading(false)
        }
    }

    const getConfigurationByTier = async (tierID) => {
        const configResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/config/${tierID}`, { withCredentials: true });
        if (configResponse && configResponse.data.statusCode === 200 && configResponse.data.data) {
            return configResponse.data.data;
        }
        return null;
    }

    const clickOpenConfigModal = async () => {
        const configuration = await getConfigurationByTier(tierObj.id);
        if (configuration && props.solutionType === 'wls') {
            setKeycloakURL(configuration.keycloakURL);
            setCfrmApiGatewayURL(configuration.cfrmApiGatewayURL);
            setKeycloakUsername(configuration.keycloakUsername);
            setKeycloakPassword(configuration.keycloakPassword);
            setKeycloakClientID(configuration.keycloakClientID);
            setKeycloakGrantType(configuration.keycloakGrantType);
            setCfrmUsername(configuration.cfrmUsername);
            setCfrmPassword(configuration.cfrmPassword);
            setCfrmClientID(configuration.cfrmClientID);
            setCfrmGrantType(configuration.cfrmGrantType);
            setDbUsername('');
            setDbPassword('');
            setDbConnectionString('');
            setDbHomePath('')
        }
        if (configuration && props.solutionType === 'legacy') {
            setCfrmApiGatewayURL(configuration.cfrmApiGatewayURL);
            setCfrmUsername('');
            setCfrmPassword('');
            setCfrmClientID('');
            setCfrmGrantType('');
            setDbUsername(configuration.dbUsername);
            setDbPassword(configuration.dbPassword);
            setDbConnectionString(configuration.dbConnectionString);
            setDbHomePath(configuration.dbHomePath)
            setApacheHostname(configuration.apacheHostname)
            setApachePort(configuration.apachePort)
            setApacheUsername(configuration.apacheUsername)
            setApachePassword(configuration.apachePassword)
        }
        setOpenConfigModal(true);
    }

    const clickOpenAddTenantModal = async () => {
        setOpenTenantModal(true);
    }

    const clickOpenEditTenantModal = async () => {
        setOpenModalEditTenant(true);
    }

    const handleCloseConfigModal = () => {
        setKeycloakURL('');
        setCfrmApiGatewayURL('');
        setKeycloakUsername('');
        setKeycloakPassword('');
        setKeycloakGrantType('');
        setKeycloakClientID('');
        setCfrmUsername('');
        setCfrmPassword('');
        setCfrmClientID('');
        setCfrmGrantType('');
        setDbUsername('');
        setDbPassword('');
        setDbConnectionString('');
        setDbHomePath('')
        setOpenConfigModal(false);
    }

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };

    const handleSaveConfigModal = async () => {
        try {
            let data = {
                keycloakURL: keycloakURL,
                cfrmApiGatewayURL: cfrmApiGatewayURL,
                keycloakUsername: keycloakUsername,
                keycloakPassword: keycloakPassword,
                keycloakGrantType: keycloakGrantType,
                keycloakClientID: keycloakClientID,
                cfrmUsername: cfrmUsername,
                cfrmPassword: cfrmPassword,
                cfrmGrantType: cfrmGrantType,
                cfrmClientID: cfrmClientID,
                tierID: tierObj.id,
                checkConnection: false,
                solutionType: props.solutionType
            }
            if (props.solutionType === 'legacy') {
                data = {
                    cfrmApiGatewayURL: cfrmApiGatewayURL,
                    tierID: tierObj.id,
                    checkConnection: false,
                    solutionType: props.solutionType,
                    dbUsername: dbUsername,
                    dbPassword: dbPassword,
                    dbConnectionString: dbConnectionString,
                    dbHomePath: dbHomePath,
                    apacheHostname: apacheHostname,
                    apachePort: apachePort,
                    apacheUsername: apacheUsername,
                    apachePassword: apachePassword
                }
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/config`, data, { withCredentials: true });
            if (response && response.data.statusCode === 200) {
                toast.info("Configuration saved", { position: "bottom-right" });
            } else {
                toast.error("Failed to save Configuration", { position: "bottom-right" });
            }
        } catch (ex) {
            toast.error("Failed to save Configuration", { position: "bottom-right" });
        }
        try {
            const serverResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/${tierObj.id}?solutionType=${props.solutionType}`, { withCredentials: true });
            if (serverResponse && serverResponse.data.statusCode === 200) {
                setTenants(sortTenants(serverResponse.data.data));
                setRows(serverResponse.data.data)
                setSelectedTenant(serverResponse.data.data[0])
                setOpenConfigModal(false);
            } else {
                toast.error("Failed to get Tenants, Please check credentials", { position: "bottom-right" });
            }

        } catch (ex) {
            toast.error("Failed to get Tenants, Please check credentials", { position: "bottom-right" });
        }
    }

    const handleTestConnecticityConfigModal = async () => {
        try {
            setLoadingTestConnection(true);
            let data = {
                keycloakURL: keycloakURL,
                cfrmApiGatewayURL: cfrmApiGatewayURL,
                keycloakUsername: keycloakUsername,
                keycloakPassword: keycloakPassword,
                keycloakGrantType: keycloakGrantType,
                keycloakClientID: keycloakClientID,
                cfrmUsername: cfrmUsername,
                cfrmPassword: cfrmPassword,
                cfrmGrantType: cfrmGrantType,
                cfrmClientID: cfrmClientID,
                tierID: tierObj.id,
                checkConnection: true,
                solutionType: props.solutionType
            }
            if (props.solutionType === 'legacy') {
                data = {
                    cfrmApiGatewayURL: cfrmApiGatewayURL,
                    tierID: tierObj.id,
                    checkConnection: true,
                    solutionType: props.solutionType,
                    dbUsername: dbUsername,
                    dbPassword: dbPassword,
                    dbConnectionString: dbConnectionString,
                    dbHomePath: dbHomePath,
                    apacheHostname: apacheHostname,
                    apachePort: apachePort,
                    apacheUsername: apacheUsername,
                    apachePassword: apachePassword
                }
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/config`, data, { withCredentials: true });
            if (response && response.data.statusCode === 200) {
                if (props.solutionType === 'wls') {
                    if (response.data.data?.keycloak === false && response.data.data?.csApiGetway === false) {
                        toast.error("Please check keycloak credentials", { position: "bottom-right" });
                        setLoadingTestConnection(false);
                        return;
                    }
                    if (response.data.data?.keycloak === true && response.data.data?.csApiGetway === true) {
                        toast.success("Test connection to keycloak and CS API Getway succeeded", { position: "bottom-right" });
                        setLoadingTestConnection(false);
                        return;
                    }
                    if (response.data.data?.keycloak === false) {
                        toast.error("Please check keycloak credentials", { position: "bottom-right" });
                    } else {
                        toast.success("Test connection to keycloak succeeded", { position: "bottom-right" });
                    }
                    if (response.data.data?.csApiGetway === false) {
                        toast.error("Please check CS API Getway credentials", { position: "bottom-right" });
                    } else {
                        toast.success("Test connection to CS API Getway succeeded", { position: "bottom-right" });
                    }
                } else {
                    if (response.data.data?.db === true && response.data.data?.csApiGetway === true && response.data.data?.apacheds === true) {
                        toast.success("Test connection to DB ,CFRM API Getway and ApacheDS succeeded", { position: "bottom-right" });
                        setLoadingTestConnection(false);
                        return;
                    }
                    if (response.data.data?.db === false) {
                        toast.error("Please check DB credentials", { position: "bottom-right" });
                    } else {
                        toast.success("Test connection to DB succeeded", { position: "bottom-right" });
                    }
                    if (response.data.data?.csApiGetway === false) {
                        toast.error("Please check CFRM API Getway credentials", { position: "bottom-right" });
                    } else {
                        toast.success("Test connection to CFRM API Getway succeeded", { position: "bottom-right" });
                    }
                    if (response.data.data?.apacheds === false) {
                        toast.error("Please check ApacheDS credentials", { position: "bottom-right" });
                    } else {
                        toast.success("Test connection to ApacheDS succeeded", { position: "bottom-right" });
                    }
                }

            } else {
                toast.error("Failed to check test connection", { position: "bottom-right" });
            }
            setLoadingTestConnection(false);

        } catch (error) {
            setLoadingTestConnection(false);
            toast.error("Failed to check test connection", { position: "bottom-right" });
        }
    }

    const handleClickTenant = (tenant, i) => async (e) => {
        try {
            setFullScreenIsLoading(true);
            setSelectedTenant(tenant);
            setSelectedIndex(i)
            await handleDetailsModal();
            const usersResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/users`,
                { tierID: tierObj.id, tenantID: tenant.tenantID, solutionType: props.solutionType }, { withCredentials: true });
            if (usersResponse && usersResponse.data.statusCode === 200 && usersResponse.data.data) {
                setTenantUsers(usersResponse.data.data);
            }
            setFullScreenIsLoading(false);
        } catch (ex) {
            if (ex?.response?.status === 404) {
                toast.error(`Tenant '${tenant.displayName}' exists in IC but not in Keycloak as Relam, Users not available`, { position: "bottom-right" });
            } else {
                toast.error(`Failed to get Users tenant: ${tenant.displayName}`, { position: "bottom-right" });
            }

            setTenantUsers([]);
            setFullScreenIsLoading(false);
        }

    }

    const sortTenants = (tenants) => {
        return tenants.sort((a, b) => a.tenantID.localeCompare(b.tenantID))
    }

    const fillKeycloakURL = (e) => {
        setKeycloakURL(e.target.value);
    }

    const fillCfrmApiGatewayURL = (e) => {
        setCfrmApiGatewayURL(e.target.value);
    }

    const fillkeycloakUsername = (e) => {
        setKeycloakUsername(e.target.value);
    }

    const fillKeycloakPassword = (e) => {
        setKeycloakPassword(e.target.value);
    }

    const fillKeycloakGrantType = (e) => {
        setKeycloakGrantType(e.target.value);
    }

    const fillKeycloakClientID = (e) => {
        setKeycloakClientID(e.target.value);
    }

    const fillCfrmUsername = (e) => {
        setCfrmUsername(e.target.value);
    }

    const fillCfrmPassword = (e) => {
        setCfrmPassword(e.target.value);
    }

    const fillCfrmGrantType = (e) => {
        setCfrmGrantType(e.target.value);
    }

    const fillCfrmClientID = (e) => {
        setCfrmClientID(e.target.value);
    }



    const fillDbUsername = (e) => {
        setDbUsername(e.target.value);
    }

    const fillDbPassword = (e) => {
        setDbPassword(e.target.value);
    }

    const fillDbConnectionString = (e) => {
        setDbConnectionString(e.target.value);
    }

    const fillDbHomePath = (e) => {
        setDbHomePath(e.target.value);
    }



    const handleDetailsModal = async () => {
        if (props.solutionType === 'wls') {
            const configuration = await getConfigurationByTier(tierObj.id);
            setCfrmApiGatewayURL(configuration.cfrmApiGatewayURL);
        }
    }


    const handleCreateUserModal = () => {
        setOpenCreateUserModal(true)
    }


    const editUser = (row) => (e) => {
        setSelectedUser(row);
        setOpenUserModal(true);
    };

    const deleteUser = (row) => async (e) => {
        setSelectedUser(row);
        setOpenModalDeleteUser(true)
    };

    const handleCloseDeleteUserModalModal = (e) => {
        setOpenModalDeleteUser(false)
    };

    const handleCloseModalEnabledUser = (e) => {
        setOpenModalEnabledUser(false)
    };

    const handleCloseDeleteTenantModal = (e) => {
        setOpenModalDeleteTenant(false);
    };

    const handleSaveModalDeleteTenant = async () => {
        try {
            if (selectedTenant.status !== 'INACTIVE') {
                toast.error("You can only delete inactive tenants", { position: "bottom-right" });
                setOpenModalDeleteTenant(false);
                return;
            }
            const data = {
                tenantID: selectedTenant.tenantID,
                tierID: tierObj.id,
                solutionType: props.solutionType
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/delete`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("Tenant deleted successfully", { position: "bottom-right" });
                const tenantsList = tenants;
                const foundUserIndex = tenantsList.findIndex((tenant) => selectedTenant.tenantID === tenant.tenantID);
                tenantsList.splice(foundUserIndex, 1);
                setTenants(sortTenants(tenantsList));
                setOpenModalDeleteTenant(false);
                setSelectedIndex(null);
                return;
            }
            setOpenModalDeleteTenant(false);
            toast.error("Failed to delete tenant", { position: "bottom-right" });

        } catch (ex) {
            if (ex?.response?.status === 400) {
                setOpenModalDeleteTenant(false);
                toast.error(ex.response.data.message, { position: "bottom-right" });
                return;
            }
            setOpenModalDeleteTenant(false);
            toast.error("Failed to delete tenant", { position: "bottom-right" });
        }
    }

    const requestSearch = (searchedVal) => {
        const filteredRows = rows.filter((row) => {
            return row.displayName.toLowerCase().includes(searchedVal.toLowerCase());
        });
        setSelectedIndex(null);
        setTenants(sortTenants(filteredRows));
    };

    const cancelSearch = () => {
        setSearched("");
        requestSearch(searched);
    };

    const handleSaveDeleteUserModalModal = async (e) => {
        try {
            setOpenModalDeleteUser(false);
            setFullScreenIsLoading(true);
            const data = {
                userID: selectedUser.id || selectedUser.username,
                tenantID: selectedTenant.tenantID,
                tierID: tierObj.id,
                solutionType: props.solutionType
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user/delete`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("User deleted successfully", { position: "bottom-right" });
                const users = tenantUsers;
                let foundUserIndex;
                if (selectedUser.id) {
                    foundUserIndex = users.findIndex((user) => selectedUser.id === user.id);
                } else {
                    foundUserIndex = users.findIndex((user) => selectedUser.username === user.username);
                }
                users.splice(foundUserIndex, 1);
                setTenantUsers(users);
                setFullScreenIsLoading(false);
                return;
            }
            setFullScreenIsLoading(false);
            toast.error("Failed to delete user", { position: "bottom-right" });
        } catch (ex) {
            setFullScreenIsLoading(false);
            toast.error("Failed to delete user", { position: "bottom-right" })
        }
    };

    const callbackCloseEditUserModal = () => {
        setSelectedUser(null);
        setOpenUserModal(false);
    }

    const callbackCloseCreateUserModal = () => {
        setOpenCreateUserModal(false)
    }

    const callbackCloseCreateTenantModal = async () => {
        setOpenTenantModal(false);
        const serverResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/${tierObj.id}?solutionType=${props.solutionType}`, { withCredentials: true });
        if (serverResponse && serverResponse.data.statusCode === 200) {
            setTenants(sortTenants(serverResponse.data.data));
            setRows(serverResponse.data.data)
        }
    }

    const callbackCloseEditTenantModal = async () => {
        setOpenModalEditTenant(false);
    }

    const callbackSaveEditTenantModal = (displayName, status) => {
        setOpenModalEditTenant(false);
        setFullScreenIsLoading(true);
        const editedTenants = tenants;
        const foundTenantIndex = editedTenants.findIndex((tenant) => tenant.tenantID === selectedTenant.tenantID);
        const foundTenant = editedTenants.find((tenant) => tenant.tenantID === selectedTenant.tenantID);
        foundTenant.displayName = displayName;
        foundTenant.status = status ? 'ACTIVE' : 'INACTIVE';
        editedTenants[foundTenantIndex] = foundTenant;
        setTenants(editedTenants);
        setFullScreenIsLoading(false);
    }

    const callbackUpdateUserDetails = (data) => {
        const users = tenantUsers;
        const foundUserIndex = users.findIndex((user) => data.userID === user.id);
        const foundUser = users.find((user) => data.userID === user.id);
        foundUser.enabled = data.enabled;
        foundUser.name = data.firstName + ' ' + data.lastName;
        foundUser.email = data.email;
        users[foundUserIndex] = foundUser
        setTenantUsers(users);
    }

    const callbackCreateUser = (data) => {
        const users = tenantUsers;
        const newUser = {
            createdTimestamp: data.createdTimestamp,
            enabled: data.enabled,
            id: data.id,
            name: data.firstName + " " + data.lastName,
            username: data.username,
            email: data.email
        }
        if (!data.firstName) {
            newUser.name = 'None'
        }
        users.push(newUser);
        setTenantUsers(users);
        setOpenCreateUserModal(false);
    }

    const handleChangeEnable = (user) => (event) => {
        setOpenModalEnabledUser(true)
        setSelectedUser(user)
    };

    const changeUserEnalbedStatusToUser = async () => {
        try {
            setOpenModalEnabledUser(false)
            setFullScreenIsLoading(true);
            const data = {
                userID: selectedUser.id || selectedUser.username,
                tenantID: selectedTenant.tenantID,
                tierID: tierObj.id,
                enabled: !selectedUser.enabled,
                solutionType: props.solutionType
            }
            const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user/details`, data, { withCredentials: true })
            if (response.data.statusCode !== 200) {
                toast.error("Failed change user status", { position: "bottom-right" });
            } else {
                const users = tenantUsers;
                let foundUser, foundUserIndex;
                if (props.solutionType === 'legacy') {
                    foundUser = users.find((elm) => data.userID === elm.username);
                    foundUserIndex = users.findIndex((elm) => data.userID === elm.username);
                    foundUser.enabled = data.enabled === true ? 1 : 0;
                } else {
                    foundUser = users.find((elm) => data.userID === elm.id);
                    foundUserIndex = users.findIndex((elm) => data.userID === elm.id);
                    foundUser.enabled = data.enabled;
                }
                users[foundUserIndex] = foundUser;
                setTenantUsers(users);
                toast.success("User status updated successfully", { position: "bottom-right" });
            }
            setFullScreenIsLoading(false);
        } catch (ex) {
            setFullScreenIsLoading(false);
            setOpenModalEnabledUser(false)
            toast.error("Failed change user status", { position: "bottom-right" });
        }
    }

    const enabledModal = <Dialog disableBackdropClick={true} fullWidth open={openModalEnabledUser} onClose={handleCloseModalEnabledUser} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change user status</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to change user: {selectedUser?.username} status to: {selectedUser?.enabled ? 'INACTIVE' : 'ACTIVE'}?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalEnabledUser} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={changeUserEnalbedStatusToUser} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteUser} onClose={handleCloseDeleteUserModalModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Delete User</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete this user?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseDeleteUserModalModal} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveDeleteUserModalModal} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    const deleteTenantModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteTenant} onClose={handleCloseDeleteTenantModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Delete Tenant</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete this tenant?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseDeleteTenantModal} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteTenant} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>


    const configModal = <Dialog disableBackdropClick={true} maxWidth='md' fullWidth open={openConfigModal} onClose={handleCloseConfigModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{`Configure Tenant`}</DialogTitle>
        <DialogContent >
            <DialogContentText>
                Configure Tenant by Tier {tierObj?.name?.name}
            </DialogContentText>
            {
                props.solutionType === 'wls' ? <div>
                    <ListItem button onClick={() => setOpenKeycloakConfigExpend(!openKeycloakConfigExpend)} divider={true}>
                        <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>Keycloak</Typography>} />
                        {openKeycloakConfigExpend ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={openKeycloakConfigExpend} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem key={'keycloagConfigDetails'} style={{ display: 'inherit' }} >
                                <div>
                                    <ListItemText style={{ marginLeft: 15 }}
                                        primary={
                                            <div>
                                                <Tooltip title={'Example: https://cfrm-ppd-keycloak.saas-p.com'}>
                                                    <TextField
                                                        value={keycloakURL}
                                                        required
                                                        margin="dense"
                                                        id="keycloakURL"
                                                        label="URL"
                                                        type="string"
                                                        fullWidth
                                                        onChange={fillKeycloakURL}
                                                    />
                                                </Tooltip>
                                                <TextField
                                                    value={keycloakUsername}
                                                    required
                                                    margin="dense"
                                                    id="keycloakUsername"
                                                    label="Username"
                                                    type="string"
                                                    fullWidth
                                                    onChange={fillkeycloakUsername}
                                                />
                                                <TextField
                                                    value={keycloakPassword}
                                                    required
                                                    margin="dense"
                                                    id="keycloakPassword"
                                                    label="Password"
                                                    type="password"
                                                    fullWidth
                                                    onChange={fillKeycloakPassword}
                                                />
                                                <TextField
                                                    value={keycloakClientID}
                                                    required
                                                    margin="dense"
                                                    id="keycloakClientID"
                                                    label="Client ID"
                                                    type="string"
                                                    fullWidth
                                                    onChange={fillKeycloakClientID}
                                                />
                                                <TextField
                                                    value={keycloakGrantType}
                                                    required
                                                    margin="dense"
                                                    id="keycloakGrantType"
                                                    label="Grant Type"
                                                    type="string"
                                                    fullWidth
                                                    onChange={fillKeycloakGrantType}
                                                />
                                            </div>
                                        }
                                    />
                                </div>
                            </ListItem>
                        </List>
                    </Collapse>
                </div>
                    :
                    null
            }

            <ListItem button onClick={() => setOpenCfrmUrlConfigExpend(!openCfrmUrlConfigExpend)} divider={true}>
                <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>{props.solutionType === 'wls' ? 'CS API Gateway' : 'CFRM API'}</Typography>} />
                {openKeycloakConfigExpend ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openCfrmUrlConfigExpend} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem key={'cfrmConfigDetails'} style={{ display: 'inherit' }} >
                        <div>
                            <ListItemText style={{ marginLeft: 15 }}
                                primary={
                                    <div>
                                        <Tooltip title={props.solutionType === 'wls' ?
                                            'Example: https://cfrm-ppd-api-gateway.saas-p.com'
                                            :
                                            'Example: https://us01vl0cobt1-dv.saas-n.com:7780'
                                        }>
                                            <TextField
                                                value={cfrmApiGatewayURL}
                                                required
                                                margin="dense"
                                                id="cfrmApiGatewayURL"
                                                label="URL"
                                                type="string"
                                                fullWidth
                                                onChange={fillCfrmApiGatewayURL}
                                            />
                                        </Tooltip>
                                        <TextField
                                            value={cfrmUsername}
                                            required
                                            margin="dense"
                                            id="keycloakUsername"
                                            label="Username"
                                            type="string"
                                            fullWidth
                                            onChange={fillCfrmUsername}
                                            disabled={props.solutionType === 'legacy'}
                                        />
                                        <TextField
                                            value={cfrmPassword}
                                            required
                                            margin="dense"
                                            id="keycloakPassword"
                                            label="Password"
                                            type="password"
                                            fullWidth
                                            onChange={fillCfrmPassword}
                                            disabled={props.solutionType === 'legacy'}
                                        />
                                        <TextField
                                            value={cfrmClientID}
                                            required
                                            margin="dense"
                                            id="cfrmClientID"
                                            label="Client ID"
                                            type="string"
                                            fullWidth
                                            onChange={fillCfrmClientID}
                                            disabled={props.solutionType === 'legacy'}
                                        />
                                        <TextField
                                            value={cfrmGrantType}
                                            required
                                            margin="dense"
                                            id="cfrmGrantType"
                                            label="Grant Type"
                                            type="string"
                                            fullWidth
                                            onChange={fillCfrmGrantType}
                                            disabled={props.solutionType === 'legacy'}
                                        />
                                    </div>
                                }
                            />
                        </div>
                    </ListItem>
                </List>
            </Collapse>
            {props.solutionType === 'legacy' ? <div>
                <ListItem button onClick={() => setOpenDBConfigExpend(!openDBConfigExpend)} divider={true}>
                    <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>DB API</Typography>} />
                    {openDBConfigExpend ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openDBConfigExpend} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem key={'DbConfigDetails'} style={{ display: 'inherit' }} >
                            <div>
                                <ListItemText style={{ marginLeft: 15 }}
                                    primary={
                                        <div>
                                            <TextField
                                                value={dbUsername}
                                                required
                                                margin="dense"
                                                id="dbUsername"
                                                label="Username"
                                                type="string"
                                                fullWidth
                                                onChange={fillDbUsername}
                                            />
                                            <TextField
                                                value={dbPassword}
                                                required
                                                margin="dense"
                                                id="dbPassword"
                                                label="Password"
                                                type="password"
                                                fullWidth
                                                onChange={fillDbPassword}
                                            />
                                            <Tooltip title={'For Example, us01vlcfrmdb01.saas-n.com:1560/CFRMNY2DV01'}>
                                                <TextField
                                                    value={dbConnectionString}
                                                    required
                                                    margin="dense"
                                                    id="connectionString"
                                                    label="Connection String"
                                                    type="string"
                                                    fullWidth
                                                    onChange={fillDbConnectionString}
                                                />
                                            </Tooltip>
                                            <Tooltip title={'For Example, /opt/bt/oracle_client19c64/product/19.3/client'}>
                                                <TextField
                                                    value={dbHomePath}
                                                    required
                                                    margin="dense"
                                                    id="dbHomePath"
                                                    label="ORACLE HOME"
                                                    type="string"
                                                    fullWidth
                                                    onChange={fillDbHomePath}
                                                />
                                            </Tooltip>
                                        </div>
                                    }
                                />
                            </div>
                        </ListItem>
                    </List>
                </Collapse>
            </div>
                : null
            }
            {props.solutionType === 'legacy' ? <div>
                <ListItem button onClick={() => setOpenApacheConfigExpend(!openApacheConfigExpend)} divider={true}>
                    <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>ApacheDS Connection</Typography>} />
                    {openApacheConfigExpend ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openApacheConfigExpend} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem key={'apacheConfigDetails'} style={{ display: 'inherit' }} >
                            <div>
                                <ListItemText style={{ marginLeft: 15 }}
                                    primary={
                                        <div>
                                            <TextField
                                                value={apacheHostname}
                                                required
                                                margin="dense"
                                                id="apacheHostname"
                                                label="Hostname"
                                                type="string"
                                                fullWidth
                                                onChange={(e) => setApacheHostname(e.target.value)}
                                            />
                                            <TextField
                                                value={apacheUsername}
                                                required
                                                margin="dense"
                                                id="apacheUsername"
                                                label="Username"
                                                type="string"
                                                fullWidth
                                                onChange={(e) => setApacheUsername(e.target.value)}
                                            />
                                            <TextField
                                                value={apachePassword}
                                                required
                                                margin="dense"
                                                id="apachePassword"
                                                label="Password"
                                                type="password"
                                                fullWidth
                                                onChange={(e) => setApachePassword(e.target.value)}
                                            />
                                            <TextField
                                                value={apachePort}
                                                required
                                                margin="dense"
                                                id="apachePort"
                                                label="Port"
                                                type="string"
                                                fullWidth
                                                onChange={(e) => setApachePort(e.target.value)}
                                            />
                                        </div>
                                    }
                                />
                            </div>
                        </ListItem>
                    </List>
                </Collapse>
            </div>
                : null
            }
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseConfigModal} color="primary">Cancel</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveConfigModal} color="primary">Save</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleTestConnecticityConfigModal} color="primary">
                {loadingTestConnection && <CircularProgress color='primary' size={20} />}
                Test Connection
            </Button>
        </DialogActions>
    </Dialog>

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <div style={{ width: '100%', marginBottom: 15 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {
                    !tenants ?
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>Manage Tenants</span>
                                    </div>
                                    <div>
                                        <Tooltip title={'Configure Tier details'}>
                                            <IconButton disabled={!tierObj.name} onClick={clickOpenConfigModal}>
                                                <SettingsIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                                <Divider style={{ marginBottom: 20 }}></Divider>
                                <div style={{ height: "300px" }}>
                                    <FormControl style={{ width: '25%' }} >
                                        <InputLabel id="demo-simple-select-label">Select Tier</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select-label"
                                            value={tierObj.name}
                                            onChange={(event, newValue) => {
                                                setTierObj({ id: event.target.value._id, name: event.target.value })
                                                setSelectedIndex(null);
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
                                                props?.selectedProjectDetails?.relations.map((row) => (

                                                    row.tier && <MenuItem key={row.tier.name} value={row.tier} onClick={getTenants(row.tier)}>
                                                        {row.tier.name}
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
                    tierObj.name && tenants ?
                        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 25 }}>
                            <div style={{ width: '25%' }}>
                                <Card style={{}}>
                                    <CardContent>
                                        <div style={{ display: 'flex', marginLeft: 8 }}>
                                            <FormControl style={{ width: '100%' }} >
                                                <InputLabel>Select Tier</InputLabel>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                                                    <Select style={{ width: '100%' }}
                                                        value={tierObj.name}
                                                        onChange={(event, newValue) => {
                                                            setTierObj({ id: event.target.value._id, name: event.target.value })
                                                            setSelectedIndex(null);

                                                        }}>
                                                        {
                                                            props?.selectedProjectDetails?.relations.map((row) => (
                                                                row.tier && <MenuItem key={row.tier.name} value={row.tier} onClick={getTenants(row.tier)}>
                                                                    {row.tier.name}
                                                                </MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                    <Tooltip title={'Configure Tier details'}>
                                                        <IconButton disabled={!tierObj.name} onClick={clickOpenConfigModal}>
                                                            <SettingsIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={'Refresh'}>
                                                        <IconButton onClick={getTenants(tierObj)}>
                                                            <RefreshIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {
                                                        !isShowSearch ?
                                                            <Tooltip title={'Search Tenant'}>
                                                                <IconButton onClick={() => setIsShowSearch(!isShowSearch)}>
                                                                    <SearchIcon aria-controls="simple-menu"></SearchIcon >
                                                                </IconButton>
                                                            </Tooltip>
                                                            :
                                                            <Tooltip title={'Close Search Tenant'}>
                                                                <IconButton onClick={() => setIsShowSearch(!isShowSearch)}>
                                                                    <FindReplaceIcon aria-controls="simple-menu"></FindReplaceIcon >
                                                                </IconButton>
                                                            </Tooltip>
                                                    }
                                                    <Tooltip title={'Create new Tenant'}>
                                                        <IconButton onClick={clickOpenAddTenantModal}>
                                                            <AddCircleOutlineIcon aria-controls="simple-menu"></AddCircleOutlineIcon >
                                                        </IconButton>
                                                    </Tooltip>

                                                    {
                                                        (selectedIndex || selectedIndex === 0) ?
                                                            <Tooltip title={'Edit Tenant'}>
                                                                <IconButton onClick={clickOpenEditTenantModal}>
                                                                    <EditIcon aria-controls="simple-menu"></EditIcon >
                                                                </IconButton>
                                                            </Tooltip>
                                                            : null
                                                    }
                                                    {
                                                        props.solutionType === 'legacy' && (selectedIndex || selectedIndex === 0) ?
                                                            <Tooltip title={'Delete Tenant'}>
                                                                <IconButton onClick={() => setOpenModalDeleteTenant(true)}>
                                                                    <DeleteIcon aria-controls="simple-menu"></DeleteIcon >
                                                                </IconButton>
                                                            </Tooltip>
                                                            : null
                                                    }


                                                </div>

                                            </FormControl>

                                        </div>
                                        <br></br>
                                        <div style={{ marginBottom: 10 }}>
                                            {
                                                isShowSearch ?
                                                    <SearchBar
                                                        value={searched}
                                                        onChange={(searchVal) => requestSearch(searchVal)}
                                                        onCancelSearch={() => cancelSearch()}
                                                        placeholder={'Search'}

                                                    />
                                                    :
                                                    <Typography type="body1" style={{ fontWeight: 'bold' }} >Tenants List</Typography>
                                            }

                                        </div>

                                        <div style={{ height: 800, maxHeight: 800, overflow: 'auto' }}>

                                            <List component="nav" aria-label="main mailbox folders">
                                                {
                                                    tenants && Array.isArray(tenants) && tenants.map((tenant, i) => (
                                                        <ListItem selected={selectedIndex === i} style={{}} onClick={handleClickTenant(tenant, i)} button>
                                                            {
                                                                tenant.status === 'ACTIVE' && <Tooltip title={'Active'}>
                                                                    <ListItemIcon>
                                                                        <CloudQueueIcon style={{ color: 'rgb(75, 210, 143)' }} />
                                                                    </ListItemIcon>
                                                                </Tooltip>
                                                            }
                                                            {
                                                                tenant.status === 'INACTIVE' && <Tooltip title={'Inactive'}>
                                                                    <ListItemIcon>
                                                                        <CloudOffIcon style={{ color: 'rgb(255, 77, 77)' }} />
                                                                    </ListItemIcon>
                                                                </Tooltip>
                                                            }
                                                            {
                                                                tenant.status === 'SETUP' && <Tooltip title={'Setup'}>
                                                                    <ListItemIcon>
                                                                        <CloudQueueIcon style={{ color: 'rgb(255, 170, 0' }} />
                                                                    </ListItemIcon>
                                                                </Tooltip>
                                                            }
                                                            <Tooltip title={tenant?.displayName}>
                                                                <ListItemText primary={tenant.tenantID} />
                                                            </Tooltip>
                                                        </ListItem>
                                                    ))
                                                }
                                            </List>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {
                                selectedIndex || selectedIndex === 0 ?
                                    <div style={{ width: '75%', marginLeft: 15 }}>
                                        <div >

                                            <Tabs indicatorColor="primary" value={valueTab} centered onChange={handleChangeTab} aria-label="simple tabs example">
                                                <Tab label="Details" icon={<DetailsIcon />} {...a11yProps(0)} />
                                                <Tab label="Users" icon={<PeopleAltIcon />}{...a11yProps(1)} />
                                            </Tabs>
                                            <TabPannel value={valueTab} index={0}>
                                                <div >
                                                    <Typography type="body2">Display Name: {selectedTenant.displayName}</Typography>
                                                    <Typography type="body2" >Description: {selectedTenant.description ? selectedTenant.description : 'None'}</Typography>
                                                    <Typography type="body2" >TenantID: {selectedTenant.tenantID}</Typography>
                                                    {
                                                        props.solutionType === 'wls' && cfrmApiGatewayURL ? <div>
                                                            <Typography type="body2" >Watchlist screening: <Link target="_blank" rel="noopener noreferrer" href={`${cfrmApiGatewayURL.replace('api', 'ui')}/watchlist-screening?tenant-id=${selectedTenant.tenantID}`}>
                                                                {`${cfrmApiGatewayURL.replace('api', 'ui')}/watchlist-screening?tenant-id=${selectedTenant.tenantID}`}
                                                            </Link></Typography>
                                                            <Typography type="body2" >Investigation Center: <Link target="_blank" rel="noopener noreferrer" href={`${cfrmApiGatewayURL.replace('api', 'ui')}/InvestigationCenter?tenant-id=${selectedTenant.tenantID}`}>
                                                                {`${cfrmApiGatewayURL.replace('api', 'ui')}/InvestigationCenter?tenant-id=${selectedTenant.tenantID}`}
                                                            </Link></Typography>
                                                        </div> : null
                                                    }
                                                    {
                                                        selectedTenant.status && selectedTenant.status === 'ACTIVE' &&
                                                        <div style={{ display: 'flex', flexDirection: 'row', whiteSpace: 'pre' }}>
                                                            <Typography type="body2">Status: </Typography>
                                                            <Typography style={{ color: "green" }} type="body2">{selectedTenant.status}</Typography>
                                                        </div>
                                                    }
                                                    {
                                                        selectedTenant.status && selectedTenant.status === 'INACTIVE' &&
                                                        <div style={{ display: 'flex', flexDirection: 'row', whiteSpace: 'pre' }}>
                                                            <Typography type="body2">Status: </Typography>
                                                            <Typography style={{ color: "red" }} type="body2">{selectedTenant.status}</Typography>
                                                        </div>
                                                    }
                                                    {
                                                        selectedTenant.status && selectedTenant.status === 'SETUP' &&
                                                        <div style={{ display: 'flex', flexDirection: 'row', whiteSpace: 'pre' }}>
                                                            <Typography type="body2">Status: </Typography>
                                                            <Typography type="body2">{selectedTenant.status}</Typography>
                                                        </div>
                                                    }

                                                    <div>
                                                        <Typography type="body2">Properties: </Typography>
                                                        <Typography type="body2"> <JSONPretty id="json-pretty" data={selectedTenant.properties} keyStyle="color:purple" stringStyle="color:green"></JSONPretty></Typography>
                                                    </div>
                                                </div>

                                            </TabPannel>
                                            <TabPannel value={valueTab} index={1}>
                                            <MuiThemeProvider theme={getMuiTheme()}>
                                                <MUIDataTable
                                                    title={'Users'}
                                                    data={
                                                        tenantUsers.map((row, i) => {
                                                            return [
                                                                row?.id ? row.id : '',
                                                                row?.username,
                                                                <Switch
                                                                    checked={row?.enabled}
                                                                    onChange={handleChangeEnable(row)}
                                                                    color="primary"
                                                                    name="checkedB"
                                                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                                                />,
                                                                row?.enabled ? 'True' : 'False',
                                                                row?.name ? row.name : 'None',
                                                                row?.email ? row.email : 'None',
                                                                row?.createdTimestamp ? getLocalDateTime(new Date(row.createdTimestamp).toISOString()) : 'None',
                                                                <div>
                                                                    <Tooltip title={'Edit'}>
                                                                        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={editUser(row)}>
                                                                            <EditIcon aria-controls="simple-menu" >
                                                                            </EditIcon>
                                                                        </Button>
                                                                    </Tooltip>
                                                                    <Tooltip title={'Remove'}>
                                                                        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={deleteUser(row)}>
                                                                            <DeleteIcon aria-controls="simple-menu" >
                                                                            </DeleteIcon>
                                                                        </Button>
                                                                    </Tooltip>
                                                                </div>
                                                            ]
                                                        })
                                                    }
                                                    columns={[
                                                        { name: "ID", options: { display: props?.solutionType === 'wls' ? true : false } },
                                                        "Username",
                                                        { name: "Enabled", options: { filter: false, sort: false } },
                                                        { name: "Enabled", options: { filter: true, display: false, viewColumns: false } },
                                                        "Full Name",
                                                        "Email",
                                                        "Created Date",
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
                                                        rowsPerPageOptions: [10, 20, 50, 100],
                                                        selectableRows: 'single',
                                                        rowsSelected: rowsSelected,
                                                        selectableRowsOnClick: true,
                                                        selectableRowsHideCheckboxes: true,
                                                        selectToolbarPlacement: 'none',
                                                        customToolbar: () => {
                                                            return (
                                                                <Tooltip title={'Create user'}>
                                                                    <IconButton aria-controls="simple-menu" disabled={props?.solutionType === 'legacy'} aria-haspopup="true" onClick={handleCreateUserModal} >
                                                                        <AddCircleOutlineIcon aria-controls="simple-menu"></AddCircleOutlineIcon >
                                                                    </IconButton>
                                                                </Tooltip>
                                                            );
                                                        },
                                                    }}
                                                />
                                                </MuiThemeProvider>
                                            </TabPannel>
                                        </div>

                                    </div>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
                <Loader isLoading={fullScreenIsLoading}></Loader>
                {deleteModal}
                {deleteTenantModal}
                {configModal}
                {enabledModal}
                <EditUserModal
                    userDetails={selectedUser}
                    tenantDetails={selectedTenant}
                    tier={tierObj}
                    isOpen={openUserModal}
                    solutionType={props.solutionType}
                    callbackCloseEditUserModal={callbackCloseEditUserModal}
                    callbackUpdateUserDetails={callbackUpdateUserDetails}>
                </EditUserModal>
                <CreateUserModal
                    tenantDetails={selectedTenant}
                    tenantUsers={tenantUsers}
                    tier={tierObj}
                    isOpen={openCreateUserModal}
                    callbackCloseCreateUserModal={callbackCloseCreateUserModal}
                    callbackCreateUser={callbackCreateUser}>
                </CreateUserModal>
                <CreateTenantModal
                    tier={tierObj}
                    tenants={tenants}
                    isOpen={openCreateTenantModal}
                    callbackCloseCreateTenantModal={callbackCloseCreateTenantModal}
                    solutionType={props.solutionType}>
                </CreateTenantModal>
                <EditTenantModal
                    tenantDetails={selectedTenant}
                    tier={tierObj}
                    solutionType={props.solutionType}
                    isOpen={openModalEditTenant}
                    callbackCloseEditTenantModal={callbackCloseEditTenantModal}
                    callbackSaveEditTenantModal={callbackSaveEditTenantModal}
                >
                </EditTenantModal>
                <ToastContainer />
            </div>
        </div>
    )
}
export default WlsTenant;