import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { getCloudspaceID } from '../../../helpers/auth.js';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    }

}));

const OnboardNamespaceModal = (props) => {
    const classes = useStyles();
    const [namespaces, setNamespaces] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [selectedExistingPoject, setSelectedExistingPoject] = useState('');
    const [selectedExistingTiers, setSelectedExistingTiers] = useState('');
    const [tiers, setTiers] = useState([]);
    const [selectedExistingNamespaces, setSelectedExistingNamespaces] = useState([]);
    const [isLoadingNextButton, setIsLoadingNextButton] = useState(false);


    useEffect(() => {
        if (props.isOpen) {
            fetchData();
        }
    }, [props.isOpen]);

    const fetchData = async () => {
        try {
            const cloudspaceID = getCloudspaceID()
            const k8sResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespaces?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (k8sResponse && k8sResponse.data.statusCode !== 200) {
                toast.error("Failed to get namespaces", { position: "bottom-right" });
            } else {
                setNamespaces(k8sResponse.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get namespaces", { position: "bottom-right" });
        }
    }

    const saveOnboarding = async () => {
        try {
            const data = {
                projectID: selectedExistingPoject.id,
                tierID: selectedExistingTiers.id,
                namespaces: selectedExistingNamespaces
            }
            const k8sResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/onboard`, data, { withCredentials: true });
            if (k8sResponse && k8sResponse.data.statusCode !== 200) {
                toast.error("Failed to onboard namespaces", { position: "bottom-right" });
            } else {
                toast.success("Succeeded to onboard namespaces", { position: "bottom-right" });
            }
            handleCloseExisting();
        } catch (ex) {
            handleCloseExisting();
            toast.error("Failed to onboard namespaces", { position: "bottom-right" });
        }
    }

    const steps = getSteps();

    const handleCloseExisting = () => {
        fetchData();
        props.callbackSaveOnboardModal();
        clearData();
    };

    const handleClose = () => {
        props.callbackOpenOnboardModal();
        clearData();
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const clearData = () => {
        setActiveStep(0);
        setSelectedExistingPoject('');
        setSelectedExistingTiers('');
        setTiers([]);
        setSelectedExistingNamespaces([]);
        setIsLoadingNextButton(false);
    };

    const handleNext = () => {
        if (activeStep === 0) {
            if (!selectedExistingPoject) {
                toast.error("Please select a project", { position: "bottom-right" });
                return;
            }
        }
        if (activeStep === 1) {
            if (!selectedExistingTiers) {
                toast.error("Please select a tier", { position: "bottom-right" });
                return;
            }
        }
        if (activeStep === 2) {
            if (selectedExistingNamespaces.length === 0) {
                toast.error("Please select namespaces", { position: "bottom-right" });
                return;
            }
            saveOnboarding();
            handleCloseExisting();
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };


    function getSteps() {
        return ['Select Project', 'Select Tier', 'Select Namespaces'];
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
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
            case 1:
                return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h5" >Choose Tier:</Typography>
                    <br></br>
                    <Autocomplete
                        id="tiers"
                        key='tiers'
                        options={tiers}
                        defaultValue={setSelectedExistingTiers ? setSelectedExistingTiers : ''}
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
            case 2:
                return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h5" >Choose Namespace:</Typography>
                    <br></br>
                    <Autocomplete
                        multiple
                        id="namespace"
                        key='namespace'
                        options={namespaces}
                        getOptionLabel={(option) => option}
                        style={{ width: 800 }}
                        renderInput={(params) => <TextField {...params} label="Namespaces" variant="outlined" />}
                        onChange={async (e, value) => {
                            setSelectedExistingNamespaces(value)
                        }}
                        onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'clear') {
                                setSelectedExistingNamespaces([])
                            }
                        }}

                    />
                    <br></br>
                    <Typography variant="body2" >Please make sure that you have the required permission for the selected namesapces</Typography>
                </div>;
            default:
                return 'Unknown stepIndex';
        }
    }



    return (
        <Dialog disableBackdropClick={true} maxWidth='xl' fullWidth={true} open={props.isOpen} onClose={handleClose} >
            <DialogTitle id="form-dialog-title">
                Attach  Server(s)
                <IconButton style={{ float: 'right' }} aria-label="close" className={classes.closeButton} onClick={handleClose}>
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
                            <div >
                                <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
                            </div>
                        </div>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack}>Back </Button>
                <Button variant="contained" onClick={handleNext} disabled={isLoadingNextButton}>
                    {activeStep === steps.length - 1 ? 'Save' : 'Next'}{isLoadingNextButton && <CircularProgress color='primary' size={14} />}
                </Button>
            </DialogActions>
            <ToastContainer />
        </Dialog>
    )
}
export default OnboardNamespaceModal;
