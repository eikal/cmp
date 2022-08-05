import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import JSONPretty from 'react-json-pretty';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import MUIDataTable from "mui-datatables";
import Tooltip from '@material-ui/core/Tooltip';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import UpdateIcon from '@material-ui/icons/Update';
import FileEditor from '../../shared/MonacoFileEditor/FileEditor.jsx'
import TabPanel from '../../shared/TabPanel/TabPanel.jsx';
import Loader from '../../shared/Loader';
import EditableField from './EditableField';
import { timeSince } from '../../../helpers/date';
import { toast } from 'react-toastify';
import axios from 'axios';

const PupetTab = (props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [host, setHost] = useState(null);
    const [isOpenReportModal, setIsOpenReportModal] = useState(false);
    const [reports, setReports] = useState([]);
    const [report, setReport] = useState([]);
    const [facts, setFacts] = useState(null);
    const [yaml, setYaml] = useState(null);
    const [value, setValue] = useState(props.changeTabPuppetReport ? 3 : 0);
    const [searchIcon, setSearchIcon] = useState(false);

    const useStyles = makeStyles((theme) => ({
        root: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
        },
        tabs: {
            borderRight: `1px solid ${theme.palette.divider}`,
        },
        mameCol: {
            width: '25%',
            fontWeight: 'inherit'
        }
    }));

    const classes = useStyles();

    const muiTheme = () =>
        createMuiTheme({
            overrides: {
                MUIDataTable: {
                    responsiveBase: {
                        '@media (min-width: 980px)': {
                            height: '500px !important'
                        },
                        '@media (min-width: 1820px)': {
                            height: '800px !important'
                        }
                    },
                },
                MUIDataTableToolbar: {
                    filterPaper: {
                        width: '300px !important'
                    }
                },
                MuiFormControl: {
                    root: {
                        display: 'grid !important'
                    }
                }
            }
        });

    useEffect(() => {
        fetchData();
        if (value === 1) {
            fetchFacts();
        } else if (value === 2) {
            openYAML();
        } else if (value === 3) {
            fetchReports();
        }
    }, [props.serverDetails]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const hostResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/host/${props.serverDetails.fullHostname}`, { withCredentials: true });
            if (hostResponse && hostResponse.data.statusCode !== 200) {
                toast.error("Failed to get puppet data", { position: "bottom-right" });
            } else {
                setHost(hostResponse.data.data);
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false)
            toast.error("Failed to get puppet data", { position: "bottom-right" });
        }
    };

    const fetchFacts = async () => {
        try {
            setIsLoading(true);
            const factsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/facts/${props.serverDetails.fullHostname}`, { withCredentials: true });
            if (factsResponse && factsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Facts", { position: "bottom-right" });
            } else {
                setFacts(factsResponse.data.data);
            }
            setIsLoading(false)
        } catch (ex) {
            setIsLoading(false)
            toast.error("Failed to get Facts", { position: "bottom-right" });
        }
    };

    const fetchYAML = async () => {
        try {
            const yamlResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/yaml/${props.serverDetails.fullHostname}`, { withCredentials: true });
            if (yamlResponse && yamlResponse.data.statusCode !== 200) {
                toast.error("Failed to get YAML", { position: "bottom-right" });
            } else {
                setYaml(yamlResponse.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get YAML", { position: "bottom-right" });
        }
    };

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const reportsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/reports/${props.serverDetails.fullHostname}`, { withCredentials: true });
            if (reportsResponse && reportsResponse.data.statusCode !== 200) {
                toast.error("Failed to get reports", { position: "bottom-right" });
            } else {
                setReports(reportsResponse.data.data);
            }
            setIsLoading(false)
        } catch (ex) {
            setIsLoading(false)
            toast.error("Failed to get reports", { position: "bottom-right" });
        }
    };

    const fetchReportByID = async (reportId) => {
        try {
            const reportResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/report/${reportId}`, { withCredentials: true });
            if (reportResponse && reportResponse.data.statusCode !== 200) {
                toast.error("Failed to get report", { position: "bottom-right" });
            } else {
                setReport(reportResponse.data.data.logs);
            }
        } catch (ex) {
            toast.error("Failed to get report", { position: "bottom-right" });
        }
    };

    function reportLevelColor(val) {
        if (val === 'notice') {
            return '#00659c';
        } else if (val === 'info') {
            return '#ccc';
        } else if (val === 'warning') {
            return '#ec7a08';
        } else if (val === 'err') {
            return '#cc0000';
        }
    }

    function a11yProps(index) {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    const buildStatus = (statusObj) => {
        if (!statusObj) {
            return <div style={{ color: 'rgb(224, 224, 224)', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Pending
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <HourglassEmptyIcon></HourglassEmptyIcon>
                </div>
            </div>
        }
        if (statusObj.status === 'Running') {
            return <div style={{ color: 'rgb(75, 210, 143)', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Running
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <CheckCircleIcon></CheckCircleIcon>
                </div>
            </div>
        }
        if (statusObj.status === 'Stopped') {
            return <div style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Stopped
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <CheckCircleIcon></CheckCircleIcon>
                </div>
            </div>
        } else {
            return <div style={{ color: '#fa0', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Unstable
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <CheckCircleIcon></CheckCircleIcon>
                </div>
            </div>
        }
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const openYAML = async () => {
        setIsLoading(true);
        await fetchYAML();
        setIsLoading(false);
    };

    const handleReportModal = (reportID) => async (e) => {
        setIsLoading(true);
        await fetchReportByID(reportID);
        setIsOpenReportModal(true);
        setIsLoading(false);
    };

    const handlecCloseReportModal = () => {
        setIsOpenReportModal(false);
        setReport([])
    };

    const callbackUpdateField = async () => {
        try {
            axios.post(`${process.env.REACT_APP_API_ENDPOINT}/foreman-collector/server`,
                { serverID: props.serverDetails._id },
                { withCredentials: true });
            toast.info("Start update server facts...", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to update server facts", { position: "bottom-right" });
        }
    };

    const reportModal =
        <Dialog disableBackdropClick={false} fullWidth open={isOpenReportModal} onClose={handlecCloseReportModal} aria-labelledby="form-dialog-title" maxWidth={'xxl'}>
            <DialogContent>
                <MuiThemeProvider theme={muiTheme()}>
                    <MUIDataTable style={{ boxShadow: 'none' }}
                        data={
                            report && Array.isArray(report) && report.map((row, i) => {
                                return [
                                    row?.level,
                                    row?.source?.source,
                                    row?.message?.message
                                ]
                            })
                        }
                        columns={[
                            {
                                name: "Level",
                                label: "Level",
                                options: {
                                    customBodyRender: value => {
                                        return <span className="reportLevel" style={{
                                            backgroundColor: reportLevelColor(value),
                                            color: '#fff',
                                            padding: '.2em .6em .3em',
                                            fontSize: '85%'
                                        }} >{value}</span>
                                    }
                                }
                            },
                            { name: "Resource", options: { filter: false, sort: false } },
                            { name: "Message", options: { filter: false, sort: false } }
                        ]}
                        options={{
                            viewColumns: true,
                            print: false,
                            searchOpen: true,
                            search: searchIcon,
                            onSearchClose: () => {
                                setSearchIcon(true)
                            },
                            onSearchOpen: () => {
                                setSearchIcon(false)
                            },
                            download: false,
                            filter: true,
                            filterType: 'multiselect',
                            rowsPerPage: 200,
                            rowsPerPageOptions: [50],
                            elevation: 0,
                            selectableRowsHideCheckboxes: true,
                        }}
                    />
                </MuiThemeProvider>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handlecCloseReportModal} color="primary">Close</Button>
            </DialogActions>
        </Dialog >

    const serverPuppetTab =
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Loader isLoading={isLoading}></Loader>
            <Tabs style={{ width: '10%', display: 'table' }}
                orientation="vertical"
                TabIndicatorProps={{ style: { background: 'rgba(0, 0, 0, 0.87)' } }}
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                className={classes.tabs}>

                <Tab label="Properties" {...a11yProps(0)} />
                <Tab label="Facts" {...a11yProps(1)} onClick={fetchFacts} />
                <Tab label="Yaml" {...a11yProps(2)} onClick={openYAML} />
                <Tab label="Reports" {...a11yProps(3)} onClick={fetchReports} />
                <Tab label="External Facts" {...a11yProps(4)} />
            </Tabs>
            <TabPanel value={value} index={0} style={{ width: '90%' }}>
                <TableBody style={{ display: 'table', width: '100%' }}>
                    <TableRow>
                        <TableCell className="mameCol"  >Puppet Status</TableCell>
                        <TableCell >{buildStatus(props.serverDetails?.statusCheck?.puppet?.status)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol"   >Puppet Configuration</TableCell>
                        <TableCell >{buildStatus(props.serverDetails?.statusCheck?.puppet?.configuration)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol"   >Puppet Agent</TableCell>
                        <TableCell >{buildStatus(props.serverDetails?.statusCheck?.puppet?.agent)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Domain</TableCell>
                        <TableCell>{host?.name?.substring(host?.name?.indexOf('.') + 1)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >IP Address</TableCell>
                        <TableCell>{host?.ip}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Host Name</TableCell>
                        <TableCell>{host?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Boot Time</TableCell>
                        <TableCell>{host?.uptime_seconds ? timeSince(Date.parse(new Date(Date.now() - host?.uptime_seconds * 1000))) + ' ago' : null}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Operating System</TableCell>
                        <TableCell>{host?.operatingsystem_name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Environment</TableCell>
                        <TableCell>
                            <EditableField type="autoComplete" value={host?.environment_name} optionsApi="entity/foreman/environments"
                                putApi={"entity/foreman/host/" + host?.name} field="environment_name" label="Environment"
                                callbackUpdateField={callbackUpdateField}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Host Group</TableCell>
                        <TableCell>
                            <EditableField type="autoComplete" value={host?.hostgroup_name} optionsApi="entity/foreman/"
                                putApi={"entity/foreman/host/" + host?.name} field="hostgroup_name" label="Host Group"
                                callbackUpdateField={callbackUpdateField}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant='head' className="mameCol" > Update Facts</TableCell>
                        <TableCell>
                            <Tooltip title={'Update facts'} >
                                <IconButton onClick={callbackUpdateField}>
                                    <UpdateIcon>
                                    </UpdateIcon>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </TabPanel>
            <TabPanel value={value} index={1} style={{ width: '90%' }}>
                <TableBody style={{ display: 'table', width: '100%' }}>
                    <TableRow>
                        <TableCell className="mameCol" >bt_lob</TableCell>
                        <TableCell>{facts?.bt_lob}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_role</TableCell>
                        <TableCell>{facts?.bt_role}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Alias</TableCell>
                        <TableCell>{facts?.bt_alias}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_customer</TableCell>
                        <TableCell>{facts?.bt_customer}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_tier</TableCell>
                        <TableCell>{facts?.bt_tier}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_env</TableCell>
                        <TableCell>{facts?.bt_env}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_product</TableCell>
                        <TableCell>{facts?.bt_product}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_infra_cluster</TableCell>
                        <TableCell>{facts?.bt_infra_cluster}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >bt_infra_network</TableCell>
                        <TableCell>{facts?.bt_infra_network}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >firewall Group</TableCell>
                        <TableCell>{facts?.firewall_group}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >CPU</TableCell>
                        <TableCell>{facts?.cpu}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="mameCol" >Memory</TableCell>
                        <TableCell>{facts?.memory}</TableCell>
                    </TableRow>
                </TableBody>
            </TabPanel>
            <TabPanel value={value} index={2} style={{ width: '90%' }}>
                {<JSONPretty id="json-pretty" data={yaml} keyStyle="color:purple" stringStyle="color:green" style={{ fontSize: "1.2em" }} />}
            </TabPanel>
            <TabPanel value={value} index={3} style={{ width: '90%' }}>
                {reportModal}
                <MuiThemeProvider theme={muiTheme()}>
                    <MUIDataTable style={{ boxShadow: 'none', width: '100%' }}
                        data={
                            reports && Array.isArray(reports) && reports.map((row, i) => {
                                return [
                                    <Button title={'Click To Reload'} onClick={handleReportModal(row.id)} color="primary" style={{ textTransform: 'none' }}>
                                        {timeSince(Date.parse(row.created_at))} ago
                                    </Button>,
                                    row?.Applied,
                                    row?.Restarted,
                                    row?.Failed > 0 ?
                                        <div style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold' }}>
                                            {row.Failed}</div>
                                        : row.Failed,
                                    row?.Restart_Failures
                                ]
                            })
                        }
                        columns={[
                            {
                                name: "Last report",
                                options: { selectableRows: false }
                            }, {
                                name: "Applied"
                            }, {
                                name: "Restarted"
                            }, {
                                name: "Failed"
                            }, {
                                name: "Restart Failures"
                            },
                        ]}
                        options={{
                            viewColumns: false,
                            print: false,
                            search: false,
                            searchOpen: false,
                            download: false,
                            filter: false,
                            rowsPerPage: 100,
                            rowsPerPageOptions: [50],
                            elevation: 0,
                            selectableRowsHideCheckboxes: true,
                        }
                        }
                    />
                </MuiThemeProvider>
            </TabPanel>
            <TabPanel value={value} index={4} style={{ width: '90%' }}>
                <FileEditor file={{ path: '/etc/puppetlabs/facter/facts.d/', fileName: 'bt_facts.json' }} serverDetails={props.serverDetails} minimap={false} />
            </TabPanel>
        </div>

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {serverPuppetTab}
        </div>
    )
}
export default PupetTab;