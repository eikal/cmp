import React, { useState, useEffect } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Loader from '../../../shared/Loader';
import { getCloudspaceID } from '../../../../helpers/auth.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';

const SshKey = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [keyPath, setKeyPath] = useState('');
    const [keyPass, setKeyPass] = useState('');
    const [isKeyExist, setIsKeyExist] = useState(false);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [getCloudspaceID()]);

    const fetchData = async () => {
        getSshKey()
    };

    const clearInputs = () => {
        setUsername('');
        setKeyPath('');
        setKeyPass('');
    };

    const handleOnClickDeleteButton = () => {
        setIsOpenDeleteModal(true);
    };

    const handleCloseModalDeleteSshKey = () => {
        setIsOpenDeleteModal(false);
    };

    const getSshKey = async () => {
        try {
            const cloudspaceID = getCloudspaceID();
            const sshKeyResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/config/ssh-key/${cloudspaceID}`, { withCredentials: true });
            if (sshKeyResponse && sshKeyResponse.data.statusCode === 200) {
                if (!sshKeyResponse.data.data) {
                    setUsername('');
                    setKeyPath('');
                    setKeyPass('');
                    toast.info("No SSH key configured", { position: "bottom-right" });
                    return;
                }
                setUsername(sshKeyResponse.data.data.username);
                setKeyPath(sshKeyResponse.data.data.keyPath);
                setKeyPass(sshKeyResponse.data.data.keyPass || '');
                setIsKeyExist(true);
            } else {
                toast.error("Failed to get SSH key", { position: "bottom-right" });
            }
        } catch (ex) {
            toast.error("Failed to get SSH key", { position: "bottom-right" });
        }

    };

    const handleOnClickSaveButton = async () => {
        try {
            if (!keyPath.startsWith('/')) {
                toast.error("Key Path not valid", { position: "bottom-right" });
                return;
            }
            setIsLoading(true);
            const cloudspaceID = getCloudspaceID();
            const updatedObject = {
                cloudspaceID,
                username: username.trim(),
                keyPath: keyPath.trim(),
                keyPass: keyPass.trim()
            };
            const updatedResponse = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/config/ssh-key`, updatedObject, { withCredentials: true });
            if (updatedResponse && updatedResponse.data.statusCode === 200) {
                toast.success("SSH key updated successfully", { position: "bottom-right", autoClose: 3000 });
                setIsKeyExist(true);
                await testConnection();
            } else {
                toast.error("Failed to update SSH key", { position: "bottom-right" });
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to update SSH key", { position: "bottom-right" });
        }
    };

    const handleSaveModalDeleteSshKey = async () => {
        try {
            setIsLoading(true);
            const cloudspaceID = getCloudspaceID();
            const updatedResponse = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/entity/config/ssh-key/${cloudspaceID}`, { withCredentials: true });
            if (updatedResponse && updatedResponse.data.statusCode === 200) {
                toast.success("SSH key deleted successfully", { position: "bottom-right" });
                clearInputs();
                setIsKeyExist(false);
            } else {
                toast.error("Failed to delete SSH key", { position: "bottom-right" });
            }
            setIsLoading(false);
            setIsOpenDeleteModal(false);
        } catch (ex) {
            setIsLoading(false);
            setIsOpenDeleteModal(false);
            toast.error("Failed to delete SSH key", { position: "bottom-right" });
        }
    };

    const getServerDetails = async () => {
        try {
            const cloudspaceID = getCloudspaceID()
            if (!cloudspaceID) return;
            const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
            if (projectsResponse && projectsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Projects", { position: "bottom-right" });
            } else {
                for (const project of projectsResponse.data.data) {
                    if (project?.relations?.length > 0) {
                        for (const relation of project.relations) {
                            if (relation?.servers?.length > 0) {
                                return {
                                    address: relation.servers[0].fullHostname,
                                    id: relation.servers[0]._id
                                }
                            }
                        }
                    }
                }
                return null;
            }
        } catch (ex) {
            toast.error("Failed to get projects", { position: "bottom-right" });
        }
    };

    const testConnection = async () => {
        try {
            setIsLoading(true);
            const serverTest = await getServerDetails();
            if (!serverTest) {
                toast.info("At least one Server should be attached to Project", { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/ssh`,
                {
                    cloudspaceID: getCloudspaceID(),
                    server: serverTest,
                    command: 'genericAction',
                    params: 'whoami'
                },
                {
                    withCredentials: true
                }
            );
            if (response && response.data.statusCode === 200) {
                toast.success("Test connection successfully", { position: "bottom-right" });
            } else {
                toast.error("Test Connection failed", { position: "bottom-right" });
            }
            setIsLoading(false);

        } catch (ex) {
            if (ex?.response?.data?.message) {
                toast.error(`Test Connection failed ${ex?.response?.data?.message}`, { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            toast.error("Test Connection failed", { position: "bottom-right" });
        }
    };


    const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenDeleteModal} onClose={handleCloseModalDeleteSshKey} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Are you sure you want to delete SSH-Key?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                In a case of deletion you will not be able to ssh your servers
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalDeleteSshKey} color="primary">No</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteSshKey} color="primary">Yes</Button>
        </DialogActions>
    </Dialog>

    return (
        <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#545b64', fontWeight: 500, marginLeft: 15, marginBottom: 10 }}>* Please make sure username exists with the right permissions and the private key path exists on your VM</span>
            <div style={{ display: 'flex', flexDirection: 'column', width: '33%', marginLeft: 15 }}>
                <Tooltip title={'Example: cfrmcloud'}>
                    <TextField
                        value={username}
                        required
                        margin="dense"
                        id="username"
                        label="Username"
                        type="string"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Tooltip>
                <Tooltip title={'Example: /share/deployment/cfrm_cloud/key/cfrmcloud'}>
                    <TextField
                        value={keyPath}
                        required
                        margin="dense"
                        id="keyPath"
                        label="Private Key Path"
                        type="string"
                        onChange={(e) => setKeyPath(e.target.value)}
                    />
                </Tooltip>
                <Tooltip title={'Optional, Example: pa$$2000'}>
                    <TextField
                        value={keyPass}
                        margin="dense"
                        id="keyPass"
                        label="Private Key Password"
                        type="password"
                        onChange={(e) => setKeyPass(e.target.value)}
                    />
                </Tooltip>
            </div>
            <div style={{ marginLeft: 15, marginTop: 15 }}>
                <Button variant="contained" onClick={handleOnClickSaveButton}>
                    Save & Test
                </Button>
                <Button disabled={isKeyExist ? false : true} style={{ marginLeft: 10 }} variant="contained" onClick={handleOnClickDeleteButton}>
                    Delete
                </Button>
            </div>
            {deleteModal}
            <Loader isLoading={isLoading}></Loader>
            <ToastContainer />
        </div>
    );
};

export default SshKey;
