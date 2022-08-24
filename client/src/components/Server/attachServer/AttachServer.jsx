import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { Card, CardContent } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import HostsTransferList from './HostsTransferList.jsx';
import amazonlogo from '../../../assets/logos/AmazonWebService-Logo.png';
import btlogo from '../../../assets/logos/Inspector-Logo';
import gcplogo from '../../../assets/logos/GCP-Logo.png';
import azurelogo from '../../../assets/logos/Azure-Logo.png';
import axios from 'axios';
import Loader from '../../shared/Loader';
import { useDebouncedCallback } from 'use-debounce';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    }
}));

const AttachServer = (props) => {
    const classes = useStyles();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedExistingPoject, setSelectedExistingPoject] = useState('');
    const [selectedExistingTiers, setSelectedExistingTiers] = useState('');
    const [tiers, setTiers] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [hostsForCreation, setHostsForCreation] = useState([]);
    const [isLoadingNextButton, setIsLoadingNextButton] = useState(false);
    const [hostnames, setHostnames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMoadl, setIsLoadingModal] = useState(true);
    const [searchOption, setSearchOption] = useState('hostgroup');

    useEffect(() => {
        if (props.openExistingServer) {
            setTimeout(() => {
                setIsLoadingModal(false);
            }, 1000);
        }
    }, [props.openExistingServer]);

    const debounced = useDebouncedCallback(async (value) => {
        setIsLoading(true)
        await getHostnames(value)
        setIsLoading(false)
    }, 1000);

    const steps = getSteps();

    const handleCloseExisting = () => {
        props.callbackOpenExistingServer(false);
        clearData();
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const clearData = () => {
        setActiveStep(0);
        setSelectedExistingPoject('');
        setSelectedExistingTiers('');
        setTiers([]);
        setHosts([]);
        setHostsForCreation([]);
        setIsLoadingNextButton(false);
    };

    const handleNext = () => {
        if (activeStep === 0) {

        }
        if (activeStep === 1) {
            if (!selectedExistingPoject) {
                toast.error("Please select project", { position: "bottom-right" });
                return;
            }
        }
        if (activeStep === 2) {
            if (!selectedExistingTiers) {
                toast.error("Please select tier", { position: "bottom-right" });
                return;
            }
        }
        if (activeStep === 3) {
            if (hostsForCreation.length === 0) {
                toast.error("Please attach at least 1 server", { position: "bottom-right" });
                return;
            }
            sendExistingServers();
            props.callbackOpenExistingServer(false);
            clearData();
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const callbackSelectedHosts = (rightItems) => {
        setHostsForCreation(rightItems)
    }

    const getHostnames = async (query) => {
        try {
            const hostnameResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/hostnames/${query}`, { withCredentials: true });
            if (hostnameResponse && hostnameResponse.data.statusCode !== 200) {
                toast.error("Failed to get hostnames", { position: "bottom-right" });
            } else {
                setHostnames(hostnameResponse.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get hostnames", { position: "bottom-right" });
        }
    };

    const getHostsByHostgroupID = async (id) => {
        try {
            const hostgroupResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/hostgroup/${id}`, { withCredentials: true });
            if (hostgroupResponse && hostgroupResponse.data.statusCode !== 200) {
                toast.error("Failed to get hosts", { position: "bottom-right" });
            } else {
                if (hostgroupResponse.data.data?.length > 0) {
                    setHosts(hostgroupResponse.data.data)
                } else {
                    toast.info("There are no hosts for this hostgroup", { position: "bottom-right" });
                }
            }
        } catch (ex) {
            toast.error("Failed to get hosts", { position: "bottom-right" });
        }
    };

    const updateHosts = async (hostname) => {
        try {
            setHosts([hostname])
        } catch (ex) {
            toast.error("Failed to update hosts", { position: "bottom-right" });
        }
    };

    const sendExistingServers = async () => {
        try {
            props.callbackIsLoading(true);
            const res = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/foreman/servers`, { servers: hostsForCreation, tierID: selectedExistingTiers?.id }, { withCredentials: true });
            if (res && res.data.statusCode !== 200) {
                toast.error("Failed to send existing servers", { position: "bottom-right" });
            } else {
                const mergeArray = props.servers.concat(res.data.data);
                props.callbackSetServers(mergeArray);
                toast.success("New servers attached", { position: "bottom-right" });
            }
            clearData();
            props.callbackIsLoading(false);
        } catch (ex) {
            toast.error("Failed to  send existing servers", { position: "bottom-right" });
            props.callbackIsLoading(false);
            clearData();
        }
    };

    const handleChangeSearchOption = (event) => {
        setSearchOption(event.target.value);
    }
    function getSteps() {
        return ['Select Data Source', 'Select Project', 'Select Tier', 'Select Servers'];
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Card key={'cloudspacesCard'} style={{ height: '200px', width: '95%' }}>
                            <CardContent>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', cursor: 'pointer' }}>
                                    <img onClick={handleNext} style={{ width: "300px", marginTop: 50 }} loading={'lazy'} alt={'btLogo'} src={btlogo} />
                                </div>
                            </CardContent>
                        </Card>
                        <Tooltip title={'Not available'}>
                            <Card key={'cloudspacesCard'} style={{ height: '200px', width: '95%', marginLeft: 30 }}>
                                <CardContent>

                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <img style={{ width: "300px" }} alt={'amazonlogo'} loading={'lazy'} src={amazonlogo} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Tooltip>
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row', marginTop: 50 }}>
                        <Tooltip title={'Not available'}>
                            <Card key={'cloudspacesCard'} style={{ height: '200px', width: '95%' }}>
                                <CardContent>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <img style={{ width: "300px" }} alt={'gcplogo'} loading={'lazy'} src={gcplogo} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Tooltip>
                        <Tooltip title={'Not available'}>
                            <Card key={'cloudspacesCard'} style={{ height: '200px', width: '95%', marginLeft: 30 }}>
                                <CardContent>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <img style={{ width: "300px" }} alt={'azurelogo'} loading={'lazy'} src={azurelogo} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Tooltip>
                    </div>
                </div>;
            case 1:
                return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h5" >Choose Project:</Typography>
                    <br></br>
                    <Autocomplete
                        disabled={props.projects.length === 0 ? true : false}
                        id="projects"
                        key='projects'
                        options={props.projects}
                        defaultValue={selectedExistingPoject ? selectedExistingPoject : ""}
                        getOptionLabel={(option) => option.name}
                        style={{ width: 800 }}
                        renderInput={(params) => <TextField {...params} label="Projects" variant="outlined" />}
                        onClose={(e, value) => {
                            if (e.target.innerText) {
                                setIsLoadingNextButton(true)
                                const project = props.projects.find((project) => e.target.innerText === project.name);
                                setSelectedExistingPoject({ name: project.name, id: project.id });
                                setTiers(project.tiers);
                                setIsLoadingNextButton(false)
                            }
                        }}
                    />
                    {props.projects.length === 0 && <CircularProgress color='primary' size={40} />}
                </div>;
            case 2:
                return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h5" >Choose Tier:</Typography>
                    <br></br>
                    <Autocomplete
                        id="tiers"
                        key='tiers'
                        options={tiers}
                        defaultValue={selectedExistingTiers ? selectedExistingTiers : ''}
                        getOptionLabel={(option) => option.name}
                        style={{ width: 800 }}
                        renderInput={(params) => <TextField {...params} label="Tiers" variant="outlined" />}
                        onClose={(e, value) => {
                            if (e.target.innerText) {
                                setIsLoadingNextButton(true)
                                const tier = tiers.find((tier) => e.target.innerText === tier.name);
                                setSelectedExistingTiers(tier);
                                setIsLoadingNextButton(false)
                            }
                        }}
                    />
                </div>;
            case 3:
                return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', alignItems: 'left' }}>
                        <Typography variant="h5" >Choose Servers by:</Typography>
                        <FormControl component="fieldset">
                            <RadioGroup row aria-label="Search Option" name="searchOption" value={searchOption} onChange={handleChangeSearchOption}>
                                <FormControlLabel value="hostgroup" control={<Radio color="default" size="small" />} label="Hostgroup" />
                                <FormControlLabel value="hostname" control={<Radio color="default" size="small" />} label="Hostname" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <br />
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Autocomplete
                            id="hostgroup"
                            key='hostgroup'
                            options={searchOption === 'hostgroup' ? [...props.hostGroups] : [...hostnames]}
                            getOptionLabel={(option) => option.name}
                            style={{ width: 500 }}
                            renderOption={(option) => (
                                <div style={{ width: '100%' }}>
                                    <span style={{
                                        float: 'right',
                                        backgroundColor: "grey",
                                        borderRadius: '10%',
                                        color: '#fff',
                                        padding: '.2em .6em',
                                        fontSize: '85%'
                                    }} >{option.type}</span>
                                    <span>{option.name}</span>
                                </div>
                            )}
                            renderInput={(params) => <TextField {...params} label={searchOption === 'hostgroup' ? 'Hostgroup' : 'Hostname'} variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }} />}
                            onInputChange={searchOption === 'hostname' ? async (e, value) => {
                                if (e.type === 'change' && value.length > 2) {
                                    debounced(value)
                                }
                            } : null
                            }
                            onChange={async (e, value) => {
                                if (!hostsForCreation.some(obj => obj?.name === value?.name)) {
                                    if (value?.name) {
                                        setIsLoadingNextButton(true)
                                        if (value.type.includes("hostgroup")) {
                                            await getHostsByHostgroupID(value.id);
                                        } else {
                                            await updateHosts(value);
                                        }
                                        setIsLoadingNextButton(false)
                                    }
                                }
                            }}
                        />
                    </div>
                    <br></br>
                    {
                        hosts?.length > 0 ?
                            <div style={{ display: 'flex' }}>
                                <HostsTransferList
                                    availableHosts={hosts}
                                    currentAllServers={props.allServers.map(host => ({ name: host.fullHostname }))}
                                    callbackSelectedHosts={callbackSelectedHosts}
                                ></HostsTransferList>
                            </div>
                            : null
                    }
                </div>;
            default:
                return 'Unknown stepIndex';
        }
    }

    return (
        <Dialog disableBackdropClick={false} maxWidth='xxl' fullWidth={true} open={props.openExistingServer} onClose={handleCloseExisting} >
            <DialogTitle id="form-dialog-title">
                Attach  Server(s)
                <IconButton style={{ float: 'right' }} aria-label="close" className={classes.closeButton} onClick={handleCloseExisting}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent style={{ height: '800px' }}>
                <DialogContentText >
                    <div className={classes.root}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <div>
                            <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
                        </div>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack}>Back </Button>
                {
                    activeStep !== 0 && <Button variant="contained" onClick={handleNext} disabled={isLoadingNextButton}>
                        {activeStep === steps.length - 1 ? 'Save' : 'Next'}{isLoadingNextButton && <CircularProgress color='primary' size={14} />}
                    </Button>
                }

            </DialogActions>
            <ToastContainer />
            <Loader isLoading={isLoadingMoadl}></Loader>
        </Dialog>
    );
};

export default AttachServer;
