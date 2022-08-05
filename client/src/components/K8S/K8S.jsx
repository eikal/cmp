import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import HelpIcon from '@material-ui/icons/Help';
import OnboardNamespaceModal from './Modals/OnboardNamespaceModal.jsx';
import TabsK8S from './TabsK8S.jsx';
import Loader from '../shared/Loader';
import { isBasicUser, getCloudspaceID } from '../../helpers/auth.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import '../shared/StatusIcon/style.css'
import 'react-toastify/dist/ReactToastify.css'



const K8S = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
    const [isOpenOnboardModal, setIsOpenOnboardModal] = useState(false);
    const [projects, setProjects] = useState([]);
    const [namespaces, setNamespaces] = useState([]);
    const [selectedNamespace, setSelectedNamespace] = useState(null);
    const [selectedCloudspace, setSelectedCloudspace] = useState(getCloudspaceID());


    useEffect(() => {
        const cloudspaceID = getCloudspaceID()
        setSelectedCloudspace(cloudspaceID);
        fetchData();
    }, [getCloudspaceID()]);

    const fetchData = async () => {
        const cloudspaceID = getCloudspaceID()
        if (!cloudspaceID) return;
        setSelectedNamespace('All Namespaces');
        setIsLoading(true);
        getProjects(cloudspaceID);
        await getOnboardNamespace(cloudspaceID);
        setIsLoading(false);
    }

    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    };

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    };

    const callbackSaveOnboardModal = async () => {
        const cloudspaceID = getCloudspaceID();
        if (!cloudspaceID) return;
        setIsLoading(true);
        setIsOpenOnboardModal(false);
        await getOnboardNamespace(cloudspaceID);
        setIsLoading(false);
    };

    const callbackOpenOnboardModal = async () => {
        setIsOpenOnboardModal(false);
    };


    const handleOpenOnBoardNamespace = () => {
        if (projects.length === 0) {
            toast.info('No projects found, At least one project should be exist')
            return;
        }
        setIsOpenOnboardModal(true);
    };



    const getProjects = async (cloudspaceID) => {
        try {
            const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (projectsResponse && projectsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Projects", { position: "bottom-right" });
                return;
            } else {
                const projects = [];
                for (const project of projectsResponse.data.data) {
                    if (project.relations.length === 0) {
                        continue;
                    }
                    const tiers = [];
                    if (project.relations) {
                        for (const tier of project.relations) {
                            if (tier.tier) {
                                tiers.push({ name: tier.tier.name, id: tier.tier._id })
                            }
                        }
                    }
                    projects.push({ name: project.project.name, id: project.project._id, tiers: tiers });
                }
                setProjects(projects);
                return projects;
            }
        } catch (ex) {
            toast.error("Failed to get projects", { position: "bottom-right" });
        }
    };

    const getOnboardNamespace = async (cloudspaceID) => {
        try {
            const namespacesResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/onboard?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (namespacesResponse && namespacesResponse.data.statusCode !== 200) {
                toast.error("Failed to get Namespaces", { position: "bottom-right" });
                return;
            } else {
                setNamespaces(namespacesResponse.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get Namespaces", { position: "bottom-right" });
        }
    };

    const onChangeNamespace = (e) => {
        setSelectedNamespace(e.target.innerText);
    }



    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">K8S</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Kubernetes, also known as K8s, is an open-source system for automating deployment, scaling, and management of containerized applications.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>

    return (

        <Grid container wrap="nowrap">
            <Loader isLoading={isLoading}></Loader>
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography style={{ fontWeight: 300 }} variant="h4">K8S</Typography>

                        <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                            <HelpIcon aria-controls="simple-menu"></HelpIcon>
                        </Button>
                    </div>
                    <Button disabled={isBasicUser()} onClick={handleOpenOnBoardNamespace} variant="contained" style={{ marginRight: 100 }} >
                        Onboard K8S Namespace
                    </Button>
                </div>
                <div>
                    <OnboardNamespaceModal
                        isOpen={isOpenOnboardModal}
                        projects={projects}
                        callbackOpenOnboardModal={callbackOpenOnboardModal}
                        callbackSaveOnboardModal={callbackSaveOnboardModal}
                    >
                    </OnboardNamespaceModal>
                    {helpModal}
                </div>
                <div style={{ marginTop: 30, width: '95%' }}>
                    <Card style={{}}>
                        <CardContent>
                            <Autocomplete
                                id="combo-box-namespace"
                                defaultValue={'All Namespaces'}
                                value={selectedNamespace}
                                options={namespaces}
                                style={{ width: 200 }}
                                renderInput={(params) => <TextField {...params} label="Namespace" variant="outlined" />}
                                onChange={onChangeNamespace}
                            />
                            <br></br>
                            <TabsK8S
                                namespace={selectedNamespace}
                                cloudspace={selectedCloudspace}
                            ></TabsK8S>
                        </CardContent>
                    </Card>

                </div>
                <br></br>
                <br></br>
            </div>
            <ToastContainer />
        </Grid>
    );
};

export default K8S;
