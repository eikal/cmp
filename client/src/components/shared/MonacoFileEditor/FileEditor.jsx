import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Typography from "@material-ui/core/Typography";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Editor, { useMonaco } from "@monaco-editor/react";
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import { prepareContent, setMonacoTheme, getLanguage } from './Helper.js';
import { lightReadOnly, lightEdit, darkReadOnly } from './Themes.js';
import Loader from '../Loader';
import { isBasicUser, getCloudspaceID } from '../../../helpers/auth.js';
import { executeAction } from '../../../services/action.service.js';
import axios from 'axios';

const FileEditor = (props) => {
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null)
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [theme, setTheme] = useState('lightReadOnly')
    const monaco = useMonaco();

    useEffect(() => {
        setIsLoading(true);
        setContent([]);
        setFileType(props.file.fileName.split('.').pop());
        setFile(props.file);
        catFile(props.file, props.file.fileName.split('.').pop(), props.serverDetails?.fullHostname);
    }, [props.serverDetails]);

    useEffect(() => {
        if (monaco?.editor) {
            monaco.editor.defineTheme("lightReadOnly", lightReadOnly)
            monaco.editor.defineTheme("lightEdit", lightEdit)
            monaco.editor.defineTheme("darkReadOnly", darkReadOnly)
        }
    }, [monaco]);

    const catFile = async (file, fileType, server) => {
        try {
            const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/ssh`,
                {
                    cloudspaceID: getCloudspaceID(),
                    server: { id: props.serverDetails?._id, address: props.serverDetails?.fullHostname },
                    command: '',
                    params: 'sudo cat ' + file.path + file.fileName
                },
                { withCredentials: true });
            if (jobsResponse && jobsResponse.data.statusCode === 200 && !jobsResponse.data.data?.stderr) {
                const currentData = {
                    output: prepareContent(jobsResponse.data.data?.stdout, fileType),
                    fileName: file.fileName,
                    path: file.path,
                    status: jobsResponse.data.data?.status,
                    error: jobsResponse.data.data?.stderr
                };
                setContent(currentData);
                setMonacoTheme(monaco, false, theme);
            } else {
                const failedData = { error: `Cannot fetch data for this file, please check if file exist.`, fileName: file.fileName, path: file.path, status: jobsResponse.data.data?.status };
                setContent(failedData)
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            const failedData = { error: `Failed to fetch data for file: ${file.path}, please check if file exist and valid.`, fileName: file.fileName, path: file.path };
            setContent(failedData)
        }
    }

    const updateFile = async () => {
        try {
            setIsLoading(true);
            // 1. validate
            try {
                prepareContent(content.output, fileType);
            } catch (e) {
                setIsLoading(false);
                handleCloseConfirmationModal();
                toast.error(`Failed to update file ${props.file.fileName}. Make sure syntax is valid`, { position: "bottom-right" });
                return;
            }
            // 2. encode the content and check if its not too big to persist
            const encodedData = btoa(content.output);
            const size = (new Blob([encodedData])).size;//byte size
            if (size / 1024 > 129) {
                setIsLoading(false);
                cancelEdit();
                handleCloseConfirmationModal();
                toast.error("Failed to save changes, file size is too large", { position: "bottom-right" });
                return;
            }
            // 3. update the file
            const updateResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/updateFile`,
                {
                    cloudspaceID: getCloudspaceID(),
                    hostname: props.serverDetails?.fullHostname,
                    fileName: props.file.fileName,
                    filePath: props.file.path,
                    encodedData: encodedData
                },
                { withCredentials: true });
            // 4. update the UI
            if (updateResponse && updateResponse.data.statusCode === 200) {
                removeDraft();
                handleCloseConfirmationModal();
                setMonacoTheme(monaco, false, theme);
                toast.success("File is edited succesfully. Restart server if needed.", { position: "bottom-right" });
                setIsLoading(false);
                // register action job
                const server = [{ id: props.serverDetails?._id, address: props.serverDetails?.fullHostname }];
                executeAction(server, "updateFile", `Updated file`, `echo File ${props.file.path + props.file.fileName} has been updated`, false);
            } else {
                setIsLoading(false);
                handleCloseConfirmationModal();
                toast.error("Failed to update file " + props.file.fileName, { position: "bottom-right" });
            }
        } catch (ex) {
            setIsLoading(false);
            handleCloseConfirmationModal();
            toast.error(`Failed to update file ${props.file.fileName}.`, { position: "bottom-right" });
        }
    }

    const cancelEdit = () => {
        setContent({
            ...content,
            draft: null,
            output: file.originalContent
        });
        removeDraft();
    };

    const changeContent = (newValue) => {
        setContent({
            ...content,
            output: newValue,
            draft: newValue,
            path: file.path,
            fileName: file.fileName
        });
    };

    const removeDraft = () => {
        delete file.draft;
        delete file.originalContent;
        delete content.draft;
        setFile(file);
        setMonacoTheme(monaco, false, theme);
    };

    const openEditMode = () => {
        let item = { ...file };
        item.originalContent = content.output;
        item.draft = content.output;
        setFile(item);
        changeContent(content.output);
        setMonacoTheme(monaco, true, theme);
    };

    const verifyUpdate = () => {
        setOpenConfirmationModal(true);
    };

    const handleCloseConfirmationModal = () => {
        setOpenConfirmationModal(false);
    };

    const confirmationModal =
        <Dialog disableBackdropClick={false} fullWidth open={openConfirmationModal} onClose={handleCloseConfirmationModal} aria-labelledby="form-dialog-title">
            <Loader isLoading={isLoading}></Loader>
            <DialogTitle id="form-dialog-title">Are you sure you want to save this file?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <span>Make sure to restart the server if needed</span>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseConfirmationModal} color="primary">No</Button>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={updateFile} color="primary">Yes</Button>
            </DialogActions>
        </Dialog>

    return (
        <div style={{ marginTop: '-20px' }}>
            <Loader isLoading={isLoading}></Loader>
            {confirmationModal}
            {!content?.error && content?.fileName ? <div className="wrapper" >
                {file?.draft ?
                    <div>
                        <Button
                            style={{ color: 'rgb(0, 112, 185)', marginRight: 5 }}
                            variant="outlined"
                            onClick={cancelEdit}
                            startIcon={<ClearIcon />}
                            color="primary" >Cancel</Button>
                        <Button
                            style={{ color: 'rgb(0, 112, 185)' }}
                            variant="outlined"
                            onClick={verifyUpdate}
                            startIcon={<SaveIcon />}
                            color="primary" >Save</Button>
                    </div> : <Button disabled={isBasicUser()}
                        style={{ color: 'rgb(0, 112, 185)', marginRight: 5 }}
                        variant="outlined"
                        onClick={openEditMode}
                        startIcon={<EditIcon />}
                        color="primary" >Edit</Button>}
            </div> :
                <Typography component={'span'} variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {content?.error}
                </Typography>}
            <div style={{ display: 'flex', marginTop: '20px' }} className="contentModal">
                {content?.output ?
                    <div id="contentModal" style={{ width: '80%', overflowY: 'auto' }}>
                        {!content.error ?
                            <Editor className="monacoEditor" width="80%"
                                theme={theme}
                                language={getLanguage(fileType)}
                                value={content?.output}
                                options={{
                                    readOnly: !file?.draft,
                                    fontSize: '12',
                                    fontFamily: 'monospace',
                                    scrollBeyondLastLine: false,
                                    minimap: { enabled: props.minimap }
                                }}
                                loading={false}
                                onChange={(value, viewUpdate) => {
                                    if (file?.draft) {
                                        changeContent(value)
                                    }
                                }} />
                            :
                            <Typography component={'span'} variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                {content.error}
                            </Typography>
                        }
                    </div>
                    : null
                }
            </div>
        </div>)
}
export default FileEditor;
