import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Link from '@material-ui/core/Link';
import TableContainer from '@material-ui/core/TableContainer';
import TabPanel from '../shared/TabPanel/TabPanel.jsx'
import { List, ListItem, Avatar, ListItemText, Divider } from '@material-ui/core';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ExpandLess from "@material-ui/icons/ExpandLess";
import Typography from "@material-ui/core/Typography";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import DnsIcon from '@material-ui/icons/Dns';
import DirectionsIcon from '@material-ui/icons/Directions';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ComputerIcon from '@material-ui/icons/Computer';
import Button from '@material-ui/core/Button';
import { getLocalDateTime } from '../../helpers/date.js';
import { isBasicUser } from '../../helpers/auth.js';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    divDetails: {
        color: '#545b64', fontWeight: 500
    }

}));

const TabsTier = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const [valueTab, setValueTab] = useState(0);
    const [nestedServers, setNestedServers] = useState([]);
    const [openServerExpend, setOpenServerExpend] = useState({})
    const [namespaces, setNamespaces] = useState([]);
    const [selectedNamespace, setSelectedNamespace] = useState(null);
    const [openModalDeleteNamespace, setopenModalDeleteNamespace] = useState(false);

    useEffect(() => {
        if (props.tierDetails) {
            const hostgroupsObj = {};
            for (const server of props.tierDetails.servers) {
                if (hostgroupsObj[server.hostgroup]) {
                    hostgroupsObj[server.hostgroup].push({ name: server.fullHostname, id: server._id, statusCheck: server.statusCheck, ip_address: server.ip_address })
                } else {
                    hostgroupsObj[server.hostgroup] = [];
                    hostgroupsObj[server.hostgroup].push({ name: server.fullHostname, id: server._id, statusCheck: server.statusCheck, ip_address: server.ip_address })
                }
            }
            const hostgroupArray = [];
            for (const hostgroup in hostgroupsObj) {
                hostgroupArray.push({ hostgroup: hostgroup, servers: hostgroupsObj[hostgroup] })
            }
            setNestedServers(hostgroupArray);
            getNamespaces();
        }
    }, [props.tierDetails]);

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };
    const handleClick = (param) => {
        setOpenServerExpend((prevState) => { return { ...prevState, [param]: !prevState[param] } })
    };
    const statusCheckSwitch = (statusCheck, isTextResponse = false) => {
        if (statusCheck === 'Running') {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(75, 210, 143)', fontWeight: 'bold' }}>Running</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} positive pulse></status-indicator></span>
            </span>

        }
        if (statusCheck === 'Unstable') {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(255, 170, 0)', fontWeight: 'bold' }}>Unstable</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} intermediary pulse></status-indicator></span>
            </span>
        }
        if (statusCheck === 'Stopped') {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold' }}>Stopped</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} negative pulse></status-indicator></span>
            </span>
        }
        else {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(0, 0, 0)', fontWeight: 'bold' }}>Pending</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} inprogress pulse></status-indicator></span>
            </span>
        }
    }

    const getNamespaces = async () => {
        try {
            const namespacesResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/onboard/tier?tierID=${props.tierDetails.tier._id}`, { withCredentials: true },);
            if (namespacesResponse && namespacesResponse.data.statusCode !== 200) {
                toast.error("Failed to get Namespaces", { position: "bottom-right" });
                return;
            } else {
                setNamespaces(namespacesResponse.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get Namespaces", { position: "bottom-right" });
        }

    }

    const clickOpenDeleteNamespaceModal = (namespace) => (e) => {
        setopenModalDeleteNamespace(true);
        setSelectedNamespace(namespace);
    }

    const removeNamespace = async (e) => {
        try {
            const data = {
                tierID: props.tierDetails.tier._id,
                namespace: selectedNamespace
            }
            const namespacesResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/remove/tier`, data, { withCredentials: true },);
            if (namespacesResponse && namespacesResponse.data.statusCode !== 200) {
                toast.error("Failed to remove namespace", { position: "bottom-right" });
                setSelectedNamespace(null)
                setopenModalDeleteNamespace(false);
            } else {
                const arrayNamespaces = namespaces.namespaces;
                const foundNamespacendex = arrayNamespaces.findIndex((elm) => selectedNamespace === elm);
                arrayNamespaces.splice(foundNamespacendex, 1);
                const currentNamespace = namespaces;
                currentNamespace.namespaces = arrayNamespaces;
                setNamespaces(currentNamespace);
                setSelectedNamespace(null)
                setopenModalDeleteNamespace(false);
                toast.success("Succeeded to get remove namespace", { position: "bottom-right" });

            }
        } catch (ex) {
            setSelectedNamespace(null)
            setopenModalDeleteNamespace(false);
            toast.error("Failed to remove namespace", { position: "bottom-right" });
        }

    }

    const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteNamespace} onClose={() => setopenModalDeleteNamespace(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Are you sure you want to delete this namespace?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                In a case of deletion the namespace will not be available in K8S dashboard
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={() => setopenModalDeleteNamespace(false)} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={removeNamespace} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    const tierDetailsTab = props.tierDetails ?
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '50%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Tier Details:</div>
                <Divider style={{ marginBottom: 20 }}></Divider>
                <div>
                    <span className={classes.divDetails}>Tier Name:</span>
                    <div >{props.tierDetails.tier.name}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Tier ID:</span>
                    <div >{props.tierDetails.tier._id}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Tier Description:</span>
                    <div >{props.tierDetails.tier.description}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Created Date:</span>
                    <div >{getLocalDateTime(props.tierDetails.tier.createdDate)}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Created By:</span>
                    <div >{props.tierDetails.tier.createdBy}</div>
                </div>
            </div>
            <div style={{ width: '50%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Related:</div>
                <Divider style={{ marginBottom: 20 }}></Divider>
                <List>
                    <ListItem style={{ paddingLeft: 0 }} key={props.tierDetails.project.id}>
                        <Avatar>{props.tierDetails.project.name.split('')[0].toUpperCase() + props.tierDetails.project.name.split('')[1].toUpperCase()}</Avatar>
                        <div>
                            <ListItemText style={{ marginLeft: 15 }}
                                primary={`Project Name: ${props.tierDetails.project.name}`}
                            />
                            <div style={{ marginLeft: 15 }}>
                                <div>
                                    Project ID:
                                    <span>
                                        <Link onClick={() => history.push(`/projects`, { projectID: props.tierDetails.project.id })}
                                            style={{ cursor: 'pointer' }}> {props.tierDetails.project.id}
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ListItem>
                </List >
            </div>
        </div> : null

    const serversDetailsTab = nestedServers && nestedServers.length > 0 ? <div>
        {
            nestedServers.map((nestedObj, key) => {
                return (
                    <div key={nestedObj.hostgroup}>
                        <ListItem button onClick={() => handleClick(nestedObj.hostgroup)} divider={key < nestedServers.length - 1}>
                            <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>{nestedObj.hostgroup}</Typography>} />
                            {openServerExpend[nestedObj.hostgroup] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openServerExpend[nestedObj.hostgroup]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {nestedObj.servers.map((server, index) => (
                                    <Card className={classes.root} variant="outlined">
                                        <CardContent>
                                            <ListItem key={index}>
                                                <Avatar>{server.name.includes('vl') ? <DnsIcon /> : <ComputerIcon />}</Avatar>
                                                <div>
                                                    <ListItemText style={{ marginLeft: 15 }}
                                                        primary={server.name}
                                                    />
                                                    <div style={{ marginLeft: 15 }}>
                                                        <div>IP Address: {server.ip_address}</div>
                                                        <div>
                                                            Server ID:
                                                            <span>
                                                                <Link onClick={() => history.push(`/servers`, { server: server.id, type: 'id' })}
                                                                    style={{ cursor: 'pointer' }}> {server.id}
                                                                </Link>
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span>Status:</span> {statusCheckSwitch(server?.statusCheck?.generalStatus, true)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListItem>
                                        </CardContent>
                                    </Card>
                                ))}
                            </List>
                        </Collapse>
                    </div>
                )
            })
        }
    </div> : null

    const namespacesDetailsTab = namespaces && namespaces.namespaces && namespaces.namespaces.length > 0 ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>K8S Namespaces:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>
            <List>
                {namespaces.namespaces.map((namespace, i) => (

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <ListItem style={{ paddingLeft: 0 }}
                            divider={i < namespace.length - 1}
                            key={namespace}
                        >
                            <Avatar variant="square" >{namespace.split('')[0].toUpperCase() + namespace.split('')[1].toUpperCase()}</Avatar>
                            <div>
                                <ListItemText style={{ marginLeft: 15 }}
                                    primary={`${namespace}`}
                                />
                            </div>
                        </ListItem>
                        <IconButton disabled={isBasicUser()} onClick={clickOpenDeleteNamespaceModal(namespace)}>
                            <DeleteSweepIcon />
                        </IconButton>
                    </div>


                ))}
            </List>
        </div> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body">There is no namespaces related</Typography>
        </div>

    const goToServerLink = nestedServers && nestedServers.length > 0 ? <div>
        <div style={{ marginLeft: 10, marginBottom: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', fontSize: 18, fontWeight: 500 }}>
                <DirectionsIcon />
                <span style={{ marginLeft: 5 }}>
                    <Link onClick={() => history.push(`/servers`,
                        {
                            project: props.tierDetails.project.name,
                            tier: props.tierDetails.tier.name,
                            type: 'tierName'
                        }
                    )}
                        style={{ cursor: 'pointer' }}>Go To Servers
                    </Link>
                </span>
            </div>
        </div>
    </div> : null


    return (
        props.tierDetails ? <div style={{ width: '95%', marginBottom: 30 }}>
            <TableContainer component={Paper}>
                <AppBar style={{ backgroundColor: '#606060' }} position="static">
                    <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                        <Tab label="Details" />
                        <Tab label="Servers" />
                        <Tab label="K8S Namespaces" />
                    </Tabs>
                </AppBar>
                <TabPanel value={valueTab} index={0}>
                    {tierDetailsTab}
                </TabPanel>
                <TabPanel value={valueTab} index={1}>
                    {goToServerLink}
                    {serversDetailsTab}
                </TabPanel>
                <TabPanel value={valueTab} index={2}>
                    {namespacesDetailsTab}
                </TabPanel>
                {deleteModal}
            </TableContainer>
            <ToastContainer />
        </div> : null
    )
}
export default TabsTier;
