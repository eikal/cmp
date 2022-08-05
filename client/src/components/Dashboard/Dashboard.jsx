import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import HelpIcon from '@material-ui/icons/Help';
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import StorageIcon from '@material-ui/icons/Storage';
import CircularProgress from '@material-ui/core/CircularProgress';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Link from '@material-ui/core/Link';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import PieChart from '../shared/Charts/PieChart.jsx';
import LineChart from '../shared/Charts/LineChart.jsx'
import { Card, CardContent } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { getCloudspaceID } from '../../helpers/auth.js';
import { getLocalDateTime } from '../../helpers/date.js';
import { titleCase } from '../../helpers/helpers.js'
import Loader from '../shared/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css'

const StyledTableCell = withStyles((theme) => ({
    body: {
        fontSize: 14,
        fontWeight: 400,
        family: `"Roboto", "Helvetica", "Arial", sans- serif`
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {}
}))(TableRow);


const useStyles = makeStyles({
    table: {
        minWidth: 700,
    },
    container: {
        maxHeight: 500,
    },
});

const defaultChartsData = {
    labels: [],
    datasets: []
};

const Dashboard = (props) => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        projects: 0,
        tiers: 0,
        servers: 0
    });
    const [projectTypes, setProjectTypes] = useState(defaultChartsData);
    const [statusCheckTypes, setStatusCheckTypes] = useState(defaultChartsData);
    const [alertsCurrent, setAlertsCurrent] = useState(defaultChartsData);
    const [latestActionJobs, setLatestActionJobs] = useState([]);
    const [statusCheckOvertime, setStatusCheckOvertime] = useState(defaultChartsData);

    const classes = useStyles();
    const history = useHistory();


    useEffect(() => {
        localStorage.setItem('tabIndex', 0);
        fetchData();
    }, [getCloudspaceID()]);

    const handleOpenHelpModal = () => {
        setIsOpenHelpModal(true)
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };

    const fetchData = () => {
        if (props?.history?.location?.state?.from === 'login') {
            setIsLoading(true);
            setTimeout(() => {
                getProjects();
                fetchAlerts(7);
                getJobs();
                getStatusCheckData()
                setIsLoading(false);
            }, 1000);
        } else {
            getProjects();
            fetchAlerts(7);
            getJobs();
            getStatusCheckData();
        }
    };

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => {
            fetchData();
            setIsLoading(false);
        }, 1000);
    };

    const getProjects = async () => {
        try {
            const cloudspaceID = getCloudspaceID()
            if (!cloudspaceID) return;
            const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (projectsResponse && projectsResponse.data.statusCode !== 200) {
                toast.error("Failed to get data", { position: "bottom-right" });
            } else {
                const dashboardData = buildData(projectsResponse.data.data);
                setDashboardData(dashboardData.totalData);
                const pieChartProjectRGB = ['rgb(0, 112, 185, 0.9)', 'rgb(0, 112, 185, 0.6)', 'rgb(0, 112, 185,0.3)']
                const pieChartProjectData = setCurrentPieChart(dashboardData.projectTypesTotal, pieChartProjectRGB);
                setProjectTypes(pieChartProjectData);
                const pieChartStatusCheckRGB = ['rgb(75, 210, 143)', 'rgb(255, 170, 0)', 'rgb(255,77,77)']
                const pieChartStatusCheckData = setCurrentPieChart(dashboardData.statusCheckTypes, pieChartStatusCheckRGB);
                setStatusCheckTypes(pieChartStatusCheckData)
            }
        } catch (ex) {
            toast.error("Failed to get data", { position: "bottom-right" });
        }
    };

    const fetchAlerts = async (days) => {
        try {
            const cloudspaceID = getCloudspaceID();
            if (!cloudspaceID) return;
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/alerts/analytics?days=${days}&cloudspace=${cloudspaceID}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to dashboard data", { position: "bottom-right" });
                return;
            }
            const currentAlerts = setAlertsCurrentPieChart(alertsResponse.data.data.currentAlerts);
            setAlertsCurrent(currentAlerts);
        } catch (ex) {
            toast.error("Failed to dashboard data", { position: "bottom-right" });
        }
    };

    const getJobs = async () => {
        try {
            const cloudspaceID = getCloudspaceID();
            if (!cloudspaceID) return;
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/action-job/dashboard/jobs?cloudspaceID=${cloudspaceID}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to dashboard data", { position: "bottom-right" });
                return;
            }
            setLatestActionJobs(alertsResponse.data.data);
        } catch (ex) {
            toast.error("Failed to dashboard data", { position: "bottom-right" });
        }
    };

    const getStatusCheckData = async () => {
        try {
            const cloudspaceID = getCloudspaceID();
            if (!cloudspaceID) return;
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/status-check/dashboard?cloudspaceID=${cloudspaceID}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to dashboard data", { position: "bottom-right" });
                return;
            }
            const statsDataPrecentage = buildPercentageStatusCheck(alertsResponse.data.data);
            const chartData = buildStatusCheckOvertimeChart(statsDataPrecentage, 7);
            setStatusCheckOvertime(chartData)
        } catch (ex) {
            toast.error("Failed to dashboard data", { position: "bottom-right" });
        }
    };

    const buildData = (projects) => {
        const totalData = {
            projects: 0,
            tiers: 0,
            servers: 0
        };
        const projectTypesTotal = {
            legacy: 0,
            wls: 0,
            general: 0,
        };
        const statusCheckTypes = {
            running: 0,
            unstable: 0,
            stopped: 0,
        }

        for (const project of projects) {
            if (project.project.solution.toLowerCase().includes('legacy')) projectTypesTotal.legacy++;
            if (project.project.solution.toLowerCase().includes('wls')) projectTypesTotal.wls++;
            if (project.project.solution.toLowerCase().includes('general')) projectTypesTotal.general++;
            totalData.projects++
            for (const relation of project.relations) {
                if (relation.tier) {
                    totalData.tiers++
                }
                if (relation.servers.length > 0) {
                    totalData.servers = totalData.servers + relation.servers.length;
                }
                for (const server of relation.servers) {
                    if (server.statusCheck) {
                        if (server.statusCheck.generalStatus.toLowerCase().includes('stopped')) statusCheckTypes.stopped++;
                        if (server.statusCheck.generalStatus.toLowerCase().includes('running')) statusCheckTypes.running++;
                        if (server.statusCheck.generalStatus.toLowerCase().includes('unstable')) statusCheckTypes.unstable++;
                    }

                }
            }
        }
        return { totalData, projectTypesTotal, statusCheckTypes };
    }

    const setCurrentPieChart = (dataObject, backgroundColor) => {
        const data = {};
        const labels = [];
        const datasets = [];
        const dataResult = [];
        for (const alertObject in dataObject) {
            labels.push(titleCase(alertObject));
            dataResult.push(dataObject[alertObject])
        }
        let customLabels = labels.map((label, index) => `${label}: ${dataResult[index]}`)
        datasets.push({
            label: '',
            data: dataResult,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1,
        })
        data.labels = customLabels;
        data.datasets = datasets;
        return data;
    };

    const setAlertsCurrentPieChart = (dataObject) => {
        const data = {};
        const labels = [];
        const datasets = [];
        const dataResult = [];
        for (const alertObject of dataObject) {
            labels.push(titleCase(alertObject.type));
            dataResult.push(alertObject.count)
        }
        let customLabels = labels.map((label, index) => `${label}: ${dataResult[index]}`)
        datasets.push({

            label: '',
            data: dataResult,
            backgroundColor: [
                'rgb(255,77,77)',
                'rgb(153 153 153)',
                'rgb(0, 112, 185, 0.9)',

            ],
            borderColor: [
                'rgb(255,77,77)',
                'rgb(153 153 153)',
                'rgb(0, 112, 185, 0.9)',

            ],
            borderWidth: 1,
        })
        data.labels = customLabels;
        data.datasets = datasets;
        return data;
    };

    const alertSeverityLevelColor = (value) => {
        if (value.toLowerCase() === 'failed') {
            return 'rgb(255, 77, 77)';
        }
        if (value.toLowerCase() === 'completed with errors') {
            return 'rgb(255, 170, 0)';
        }
        if (value.toLowerCase() === 'completed') {
            return 'rgb(75, 210, 143)';
        }

        if (value.toLowerCase() === 'killed') {
            return 'rgb(0, 0, 0)';
        }
        if (value.toLowerCase() === 'in progress') {
            return 'rgb(0, 0, 0,0.5)';
        }
    };

    const buildStatusCheckOvertimeChart = (dataObject, days) => {
        const data = {}
        const dates = [...Array(Number(days))].map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return `${d.getDate()}/${d.getMonth() + 1}`
        })
        data.labels = dates.reverse();
        const datasets = [];
        datasets.push({
            label: 'Running',
            data: (dataObject[0].map((data) => data.count)).reverse(),
            fill: true,
            backgroundColor: "rgb(75, 210, 143,0.2)",
            borderColor: "rgb(75, 210, 143)",
            tension: 0.3
        })
        datasets.push({
            label: 'Unstable',
            data: (dataObject[1].map((data) => data.count)).reverse(),
            fill: true,
            backgroundColor: "rgb(255, 170, 0,0.2)",
            borderColor: "rgb(255, 170, 0)",
            tension: 0.3
        })
        datasets.push({
            label: 'Stopped',
            data: (dataObject[2].map((data) => data.count)).reverse(),
            fill: true,
            backgroundColor: "rgb(255,77,77,0.2)",
            borderColor: "rgb(255,77,77)",
            tension: 0.3
        })
        data.datasets = datasets;
        return data;
    };

    const buildPercentageStatusCheck = (dataObject) => {
        const dataObjectPrecentage = { ...dataObject };
        const days = dataObject[0].length;
        for (let i = 0; i < days; i++) {
            const sumStatusCheckPerDay = dataObject[0][i].count + dataObject[1][i].count + dataObject[2][i].count
            dataObjectPrecentage[0][i].count = dataObject[0][i].count / sumStatusCheckPerDay * 100;
            dataObjectPrecentage[1][i].count = dataObject[1][i].count / sumStatusCheckPerDay * 100;
            dataObjectPrecentage[2][i].count = dataObject[2][i].count / sumStatusCheckPerDay * 100;
        }
        return dataObjectPrecentage;
    };

    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Dashboard</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Provides information for resources that are producing logs data
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    return (

        <Grid container wrap="nowrap">
            <Loader isLoading={isLoading}></Loader>
            <ToastContainer />
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '98%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography style={{ fontWeight: 300 }} variant="h4">Dashboard</Typography>
                        <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                            <HelpIcon aria-controls="simple-menu"></HelpIcon>
                        </Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Tooltip title={'Refresh'} onClick={refreshData} >
                            <Button variant='outlined'>
                                <RefreshIcon aria-controls="simple-menu" ></RefreshIcon>
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                <div style={{ marginTop: 30, width: '98%' }}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', flexDirection: 'row' }} >
                                <div style={{ width: '33%', display: 'flex' }}>
                                    <Card elevation={4} key={'projectsCard'} style={{ height: '200px', width: '95%' }}>
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

                                <div style={{ width: '33%', display: 'flex', justifyContent: 'center' }}>
                                    <Card elevation={4} key={'tiersCard'} style={{ height: '200px', width: '95%' }}>
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

                                <div style={{ width: '33%', display: 'flex', justifyContent: 'center' }}>
                                    <Card elevation={4} key={'serversCard'} style={{ height: '200px', width: '95%' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30, marginBottom: 30 }}>
                                <div style={{ display: 'flex', width: '100%' }}>
                                    <div style={{ width: '98%' }}>
                                        <TableContainer style={{ height: '100%' }} className={classes.container} elevation={5} component={Paper}>
                                            {
                                                latestActionJobs && latestActionJobs.length > 0 ?
                                                    <Table className={classes.table} aria-label="customized table">
                                                        <TableHead>
                                                            <Typography style={{ fontSize: 18, fontWeight: 600, marginLeft: 10, marginTop: 10 }} variant="h6" id="tableTitle" component="div">
                                                                Latest Action Jobs
                                                            </Typography>
                                                            <TableRow>
                                                                <StyledTableCell align="left" >Server</StyledTableCell>
                                                                <StyledTableCell align="left" >Project</StyledTableCell>
                                                                <StyledTableCell align="left" >Tier</StyledTableCell>
                                                                <StyledTableCell align="left" >Job</StyledTableCell>
                                                                <StyledTableCell align="left" >Created By</StyledTableCell>
                                                                <StyledTableCell align="left" >Updated Date</StyledTableCell>
                                                                <StyledTableCell align="left" >Status</StyledTableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                latestActionJobs && latestActionJobs.map((row) => (
                                                                    <StyledTableRow key={row.name}>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            <Link onClick={() => history.push(`/servers`, { server: row.serverFullHostname, type: 'fullHostname', from: 'dashboard' })}
                                                                                style={{ cursor: 'pointer' }}> {row.serverFullHostname}
                                                                            </Link>
                                                                        </StyledTableCell>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {row.project}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {row.tier}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {row.jobLabelName}
                                                                        </StyledTableCell>

                                                                        <StyledTableCell component="th" scope="row">
                                                                            {row.createdBy}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {row.updatedDate ? getLocalDateTime(row.updatedDate) : getLocalDateTime(row.createdDate)}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            <span className="reportLevel" style={{
                                                                                backgroundColor: alertSeverityLevelColor(row.status),
                                                                                color: '#fff',
                                                                                padding: '.2em .6em .3em',
                                                                                fontSize: '100%',
                                                                                borderRadius: '25px'
                                                                            }} >{row.status}</span>
                                                                        </StyledTableCell>
                                                                    </StyledTableRow>
                                                                ))
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                    :
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: '400px'
                                                    }}>
                                                        <CircularProgress color='primary' size={120} />
                                                    </div>
                                            }
                                        </TableContainer>
                                    </div>
                                </div>
                                <div className="charts-selector">
                                    <div style={{ display: 'flex', width: '100%', marginTop: 30 }}>
                                        {
                                            statusCheckOvertime &&
                                            <div style={{ width: '98%' }}>
                                                <LineChart
                                                    data={statusCheckOvertime}
                                                    height={353}
                                                    titleText={`Status-Check Overtime`}
                                                    labelFontSize={12}
                                                    titleFontSize={15}
                                                    isPercentageMode={true}
                                                    tooltipFooterText={'This value represents the percentage of helthness of the servers'}
                                                >
                                                </LineChart>
                                            </div>
                                        }
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div style={{ width: '30%' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                {statusCheckTypes && <div style={{ width: '100%' }}>
                                    <PieChart
                                        data={statusCheckTypes}
                                        height={367}
                                        legendAlign={'center'}
                                        titleText={'Status Check Types'}
                                        enabledToolip={false}
                                        labelFontSize={15}
                                        titleFontSize={18}
                                    >
                                    </PieChart>
                                </div>
                                }
                            </div>
                            <div style={{ width: '100%', display: 'flex', marginTop: '20px', justifyContent: 'center' }}>
                                {
                                    alertsCurrent &&
                                    <div style={{ width: '100%' }}>
                                        <PieChart
                                            data={alertsCurrent}
                                            height={367}
                                            legendAlign={'center'}
                                            titleText={'Alerts Overview'}
                                            enabledToolip={false}
                                            labelFontSize={15}
                                            titleFontSize={18}
                                        >
                                        </PieChart>
                                    </div>
                                }
                            </div>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                {projectTypes && <div style={{ width: '100%' }}>
                                    <PieChart
                                        data={projectTypes}
                                        height={367}
                                        legendAlign={'center'}
                                        titleText={'Project Types'}
                                        enabledToolip={false}
                                        labelFontSize={15}
                                        titleFontSize={18}
                                    >
                                    </PieChart>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {helpModal}
        </Grid >
    );
};

export default Dashboard;
