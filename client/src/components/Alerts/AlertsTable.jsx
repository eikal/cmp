import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import DoneIcon from '@material-ui/icons/Done';
import NotificationsPausedIcon from '@material-ui/icons/NotificationsPaused';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import CommentIcon from '@material-ui/icons/Comment';
import CardContent from "@material-ui/core/CardContent";
import Link from '@material-ui/core/Link';
import Card from "@material-ui/core/Card";
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import BeenhereIcon from '@material-ui/icons/Beenhere';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { timeSince, getLocalDateTime } from '../../helpers/date.js';
import MUIDataTable from "mui-datatables";
import Loader from '../shared/Loader';
import { getCloudspaceID } from '../../helpers/auth.js';
import axios from 'axios'
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'


const AlertTab = (props) => {

    const useStyles = makeStyles((theme) => ({
        divDetails: {
            color: '#606060'
        }
    }));

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MUIDataTableToolbar: {
                    actions: {
                        display: 'flex',
                        flexDirection: 'row-reverse'
                    }
                }
            }
        });

    const classes = useStyles();
    const history = useHistory();
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenAckModal, setIsOpenAckModal] = useState(false);
    const [ackComment, setAckComment] = useState({ id: '', comment: '' });



    useEffect(() => {
        if (!props.nestedServers && !props.serverDetails) {
            fetchData()
        }
    }, [getCloudspaceID()]);

    useEffect(() => {
        if (props.serverDetails) {
            fetchData()
        }
    }, [props.serverDetails]);

    useEffect(() => {
        if (props.nestedServers) {
            fetchData()
        }
    }, [props.nestedServers]);


    const fetchData = () => {
        if (!props.nestedServers && !props.serverDetails) {
            if (props.alertType === 'firing') {
                fetchAllAlerts('firing');
            }
            if (props.alertType === 'resolved') {
                fetchAllAlerts('resolved');
            }
            return;
        }
        if (props.nestedServers) {
            const serversArr = fetchServersFromNestedServers();
            if (props.alertType === 'firing') {
                fetchFiringAlertsDataForServers('firing', serversArr);
            }
            if (props.alertType === 'resolved') {
                fetchFiringAlertsDataForServers('resolved', serversArr);
            }
            return;
        } else {
            if (props.alertType === 'firing') {
                fetchFiringAlertsData('firing');
            }
            if (props.alertType === 'resolved') {
                fetchFiringAlertsData('resolved');
            }
        }

    }

    const fetchFiringAlertsData = async (alertType) => {
        try {
            setIsLoading(true);
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/alerts/server/${props.serverDetails.fullHostname}?type=${alertType}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to get alerts", { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            setAlerts(alertsResponse.data.data);
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get all alerts", { position: "bottom-right" });
        }
    }

    const fetchFiringAlertsDataForServers = async (alertType, serversArr) => {
        try {
            setIsLoading(true);
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/alerts/servers?type=${alertType}&servers=${serversArr}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to get alerts", { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            setAlerts(alertsResponse.data.data);
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get all alerts", { position: "bottom-right" });
        }
    }

    const fetchAllAlerts = async (alertType) => {
        try {
            const cloudspaceID = getCloudspaceID();
            if (!cloudspaceID) return;
            setIsLoading(true);
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/alerts/all?type=${alertType}&cloudspace=${cloudspaceID}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to get alerts", { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            setAlerts(alertsResponse.data.data);
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get all alerts", { position: "bottom-right" });
        }
    }

    const fetchServersFromNestedServers = () => {
        const servers = [];
        for (const nestedServers of props.nestedServers) {
            for (const server of nestedServers.servers) {
                servers.push(server.name)
            }
        }
        return servers;
    }

    const handleUpdateAckAlert = async () => {
        try {
            setIsLoading(true);
            setIsOpenAckModal(false);
            let newComment = ackComment.comment;
            if (!ackComment.comment) {
                newComment = `Alert Acknowledged by user: ${localStorage.getItem('username')}`
            }
            const alertsResponse = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/alerts/${ackComment.id}`, { comment: newComment }, { withCredentials: true });
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to update alert", { position: "bottom-right" });
                setIsLoading(false);
                setAckComment({ id: '', comment: '' })
                return;
            }
            const newAlertsList = alerts;
            const foundAlertIndex = alerts.findIndex((alertObj) => alertObj._id === ackComment.id);
            const foundAlert = alerts[foundAlertIndex];
            foundAlert.isAcknowledged = true;
            foundAlert.updatedDate = new Date().toISOString();
            foundAlert.comments.push({ reason: newComment, createdBy: localStorage.getItem('username'), updatedDate: new Date() })
            newAlertsList[foundAlertIndex] = foundAlert
            setAlerts(newAlertsList);
            setIsLoading(false);
            setAckComment({ id: '', comment: '' })
            toast.success("Succeeded to update alert", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to update alert", { position: "bottom-right" });
            setAckComment({ id: '', comment: '' })
            setIsOpenAckModal(false);
            setIsLoading(false);
        }

    }

    const handleClickAckAlert = (id) => (e) => {
        setAckComment(prevState => ({ ...prevState, id: id }));
        setIsOpenAckModal(true);
    };

    const handleCloseAckModal = () => {
        setAckComment({ id: '', comment: '' })
        setIsOpenAckModal(false);
    };


    const handleChangeAckComment = (event) => {
        setAckComment(prevState => ({ ...prevState, comment: event.target.value }));
    };



    const alertStateIcon = (value) => {
        if (value.state === 'firing') {
            if (value.isAcknowledged) {
                return <Tooltip title={'Acknowledged'} >
                    <NotificationsOffIcon style={{ color: 'rgb(255, 170, 0)' }}></NotificationsOffIcon>
                </Tooltip>
            }
            return <Tooltip title={'Firing'} >
                <NotificationImportantIcon style={{ color: 'rgb(255, 77, 77)' }}></NotificationImportantIcon>
            </Tooltip>
        }
        if (value.state === 'pending') {
            return <Tooltip title={'Pending'} >
                <NotificationsPausedIcon style={{ opacity: 0.3 }}></NotificationsPausedIcon>
            </Tooltip>
        } else {
            return <Tooltip title={'Resolved'} >
                <DoneIcon style={{ color: '#4bd28f' }} ></DoneIcon>
            </Tooltip>
        }
    }

    const alertSeverityLevelColor = (value) => {
        if (value?.toLowerCase() === 'critical' || value?.toLowerCase() === 'crit') {
            return 'rgb(255, 77, 77)';
        }
        if (value?.toLowerCase() === 'warning' || value?.toLowerCase() === 'warn') {
            return 'rgb(255, 170, 0)';
        }
        if (value?.toLowerCase() === 'notify') {
            return 'rgb(255, 170, 0)';
        }
        return 'rgb(0,0,0)';
    }

    const alertSeverityLevel = (value) => {
        if (value?.toLowerCase() === 'critical' || value?.toLowerCase() === 'crit') {
            return 'Critical';
        }
        if (value?.toLowerCase() === 'warning' || value?.toLowerCase() === 'warn') {
            return 'Warning';
        }
        if (value?.toLowerCase() === 'notify') {
            return 'Notify';
        }
        return 'NA';
    }


    const ackModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenAckModal} onClose={handleCloseAckModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Acknowledge Alert</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Add Comment for Acknowledge Alert
            </DialogContentText>
            <TextField
                style={{ width: '100%' }}
                id="standard-multiline-flexible"
                multiline
                maxRows={4}
                placeholder="Comment..."
                value={ackComment.comment}
                onChange={handleChangeAckComment}
                required
            />
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseAckModal} color="primary">Cancel</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleUpdateAckAlert} color="primary">Save</Button>
        </DialogActions>
    </Dialog>

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            <ToastContainer />
            <Loader isLoading={isLoading}></Loader>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Alerts List"}
                    data={
                        alerts.map((row, i) => {
                            return [
                                row._id,
                                row.state,
                                { state: row.state, isAcknowledged: row?.isAcknowledged },
                                row?.isAcknowledged ? true : false,
                                row?.project?.name,
                                row?.tier?.name,
                                row.server,
                                row.name,
                                row?.lastState || 'NA',
                                row?.summary.length <= 90 ? row.summary : row.summary.slice(0, 90) + '...',
                                row?.annotations?.description || 'NA',
                                JSON.stringify(row.labels),
                                alertSeverityLevel(row.labels.severity),
                                timeSince(new Date(row.createdDate)) + ' ago',
                                row.createdDate,
                                row.updatedDate,
                                <div>
                                    <Tooltip title={'Comments'} >
                                        <IconButton disabled={true} size={'small'}>
                                            <CommentIcon fontSize="small" aria-controls="simple-menu"  >
                                            </CommentIcon>
                                        </IconButton>
                                    </Tooltip>
                                    {
                                        row.state === 'firing' && !row.isAcknowledged && <Tooltip title={'Acknowledge'} >
                                            <IconButton size={'small'} onClick={handleClickAckAlert(row._id)}>
                                                <BeenhereIcon fontSize="small" aria-controls="simple-menu"  >
                                                </BeenhereIcon>
                                            </IconButton>
                                        </Tooltip>
                                    }
                                </div>
                            ]
                        })
                    }
                    columns={[
                        { name: "ID", options: { display: false, filter: false } },
                        {
                            name: "Status",
                            label: "Status",
                            options: {
                                display: false,
                                filter: true,
                                viewColumns: false,
                            }
                        },
                        {
                            name: "Status",
                            label: "Status",
                            options: {
                                customBodyRender: value => {
                                    return alertStateIcon(value)
                                },
                                viewColumns: true,
                                filter: false,

                            }
                        },
                        {
                            name: "Acknowledge",
                            label: "Acknowledge",
                            options: {
                                viewColumns: false,
                                filter: true,
                                display: false,
                                customBodyRender: (val) => {
                                    return val === true ? "True" : "False";
                                }
                            }
                        },
                        {
                            name: "Project",
                            label: "Project",
                            options: {
                                display: !props.serverDetails && !props.nestedServers ? true : false,
                                filter: !props.serverDetails && !props.nestedServers ? true : false,
                                viewColumns: !props.serverDetails && !props.nestedServers ? true : false,
                            }
                        },
                        {
                            name: "Tier",
                            label: "Tier",
                            options: {
                                display: !props.serverDetails && !props.nestedServers ? true : false,
                                filter: !props.serverDetails && !props.nestedServers ? true : false,
                                viewColumns: !props.serverDetails && !props.nestedServers ? true : false,
                            }
                        },
                        {
                            name: "Server",
                            label: "Server",
                            options: {
                                display: !props.serverDetails ? true : false,
                                filter: !props.serverDetails ? true : false,
                                viewColumns: !props.serverDetails ? true : false,
                                customBodyRender: value => {
                                    return <Link onClick={() => history.push(`/servers`, { server: value, type: 'fullHostname' })}
                                        style={{ cursor: 'pointer' }}> {value}
                                    </Link>
                                }
                            }
                        },
                        {
                            name: "Name",
                            label: "Name",
                            options: {
                                customBodyRender: value => {
                                    return <span style={{ color: '#1658eb', fontWeight: 'bold' }}>{value}</span>
                                }
                            }
                        },
                        {
                            name: "Last Status",
                            options: {
                                display: props.alertType === 'resolved' ? true : false,
                                filter: false,
                                viewColumns: props.alertType === 'resolved' ? true : false,
                            }
                        },
                        {
                            name: "Summary",
                            options: {
                                filter: false,
                            }
                        },
                        {
                            name: "Description",
                            options: {
                                display: false,
                                filter: false,
                                viewColumns: false,
                            }
                        },
                        {
                            name: "Details",
                            options: {
                                display: false,
                                filter: false,
                                viewColumns: false,
                            }
                        },
                        {
                            name: "Severity",
                            label: "Severity",
                            options: {
                                customBodyRender: value => {
                                    return <span className="reportLevel" style={{
                                        backgroundColor: alertSeverityLevelColor(value),
                                        color: '#fff',
                                        padding: '.2em .6em .3em',
                                        fontSize: '100%'
                                    }} >{value}</span>
                                }
                            }
                        },
                        {
                            name: "Age",
                            options: {
                                display: props.alertType === 'firing' ? true : false,
                                filter: false,
                                viewColumns: props.alertType === 'firing' ? true : false,
                            }
                        },
                        {
                            name: "Trigger Time",
                            options: {
                                display: props.alertType === 'firing' ? true : false,
                                filter: false,
                                viewColumns: true,
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
                        {
                            name: "Resolved Time",
                            label: "Resolved Time",
                            options: {
                                display: props.alertType === 'resolved' ? true : false,
                                filter: false,
                                viewColumns: props.alertType === 'resolved' ? true : false,
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
                        { name: "Actions", options: { filter: false, sort: false } }
                    ]}
                    options={{
                        searchOpen: true,
                        filter: true,
                        responsive: "vertical",
                        viewColumns: true,
                        print: true,
                        download: true,
                        filterType: "dropdown",
                        expandableRows: true,
                        rowsPerPage: 10,
                        rowsPerPageOptions: [50],
                        selectableRows: 'single',
                        selectableRowsHideCheckboxes: true,
                        selectToolbarPlacement: 'none',
                        customToolbar: () => {
                            return (
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Tooltip title={'Refresh'} >
                                        <IconButton onClick={fetchData}>
                                            <RefreshIcon aria-controls="simple-menu"  >
                                            </RefreshIcon>
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            );
                        },
                        renderExpandableRow: (rowData, rowMeta) => {
                            return (
                                <tr>
                                    <td colSpan={12} style={{ backgroundColor: 'rgb(224, 224, 224)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 50, marginTop: 15, marginBottom: 15 }}>
                                            <Card variant="outlined" style={{ width: '95%', borderTop: '3px solid #2196f3' }}>
                                                <CardContent>
                                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                                                            <div style={{ width: '80%' }}>
                                                                <div>
                                                                    <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Summary:</span>
                                                                </div>
                                                                <div>
                                                                    <span className={classes.divDetails}>{alerts[rowMeta.dataIndex]?.annotations?.summary}</span>
                                                                </div>
                                                            </div>
                                                            <br></br>
                                                            <br></br>
                                                            <div style={{ width: '80%' }}>
                                                                <div>
                                                                    <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Description:</span>
                                                                </div>
                                                                <div>
                                                                    <span className={classes.divDetails}>{alerts[rowMeta.dataIndex]?.annotations?.description || 'NA'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ width: '50%' }}>

                                                            <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Details:</span>
                                                            <br></br>
                                                            <div>
                                                                <span style={{ fontWeight: 500 }}>Last State</span>
                                                                <span className={classes.divDetails}>: {alerts[rowMeta.dataIndex]?.lastState || 'NA'}</span>
                                                            </div>
                                                            {
                                                                Object.keys(alerts[rowMeta.dataIndex].labels).map(key =>
                                                                    <div key={key}>
                                                                        <span style={{ fontWeight: 500 }}>{key}</span>
                                                                        <span className={classes.divDetails}>: {alerts[rowMeta.dataIndex]?.labels[key]}</span>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }
                    }}
                />
            </MuiThemeProvider>
            {ackModal}
        </div>
    )
}
export default AlertTab;
