import React, { useState, useEffect, useRef } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from "@material-ui/core/Typography";
import MUIDataTable from "mui-datatables";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Editor, { DiffEditor, useMonaco } from "@monaco-editor/react";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import FindInPage from '@material-ui/icons/FindInPage';
import Tooltip from '@material-ui/core/Tooltip';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import '../../shared/Style/fullPageModal.css';
import Loader from '../../shared/Loader';
import { prepareContent, setMonacoTheme, getLanguage, isMyBackup } from '../../shared/MonacoFileEditor/Helper.js';
import { lightReadOnly, lightEdit, darkReadOnly } from '../../shared/MonacoFileEditor/Themes.js';
import { isBasicUser, getCloudspaceID } from '../../../helpers/auth.js';
import { executeAction } from '../../../services/action.service.js';
import axios from 'axios';
import JSZip from 'jszip';

const FilesModal = (props) => {

    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [rowsSelected, setRowsSelected] = useState([0])
    const [clickOnRowMetaData, setClickOnRowMetaData] = useState(0);
    const [isDownloadButton, setIsDownloadButton] = useState(false);
    const [isEditButton, setIsEditButton] = useState(false);
    const [theme, setTheme] = useState('lightReadOnly')
    const [fileType, setFileType] = useState('txt')
    const [searchIcon, setSearchIcon] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [openDraftAlertModal, setOpenDraftAlertModal] = useState(false);
    const [openFileModal, setOpenFileModal] = useState(false);
    const [searchPressed, setSearchPressed] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState("");
    const editorRef = useRef(null);
    const monaco = useMonaco();

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MUIDataTableToolbar: {
                    filterPaper: {
                        minWidth: "450px"
                    }
                }
            }
        });

    useEffect(() => {
        if (monaco?.editor) {
            monaco.editor.defineTheme("lightReadOnly", lightReadOnly)
            monaco.editor.defineTheme("lightEdit", lightEdit)
            monaco.editor.defineTheme("darkReadOnly", darkReadOnly)
        }
    }, [monaco]);

    useEffect(() => {
        setMonacoTheme(monaco, files[rowsSelected]?.draft, theme);
    }, [theme]);

    useEffect(() => {
        if (props.files.length > 0) {
            fetchData();
        }
    }, [props.files]);

    useEffect(() => {
        if (files && files.length > 0 && !isDownloadButton) {
            showFile(files[0]);
            getBackupListForFile(files[0])
            setIsDownloadButton(true);
            setIsEditButton(files[0].fileName.indexOf('_bkp_') < 0);
        }
    }, [files]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setOpenFileModal(true);
            setContent([]);
            const filesArray = props.files;
            const fileArray = await getFiles(filesArray, props.serverID, props.hostname);
            setFiles(fileArray);
            if (fileArray.length === 0) {
                setContent({ output: "There is no file to display" });
                setIsLoading(false);
            }
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to fetch files", { position: "bottom-right" });
        }
    }
    const getFiles = async (filesArray, serverID, hostname) => {
        try {
            const server = { id: serverID, address: hostname };
            const fileArray = [];
            let file = {};
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/getFile`,
                    {
                        cloudspaceID: getCloudspaceID(),
                        server: server,
                        files: filesArray
                    },
                    { withCredentials: true });
                if (response && response.data.statusCode === 200) {
                    const fileRows = response.data.data;
                    for (let fileSelected of fileRows) {
                        const arrRow = fileSelected.split(" ");
                        const fileSelectedFullData = arrRow[arrRow.length - 1];
                        const fileNameArray = fileSelectedFullData.split('/');
                        const fileName = fileNameArray[fileNameArray.length - 1];
                        let path = [...fileNameArray];
                        path.pop();
                        path = path.join('/');
                        path = path + '/';
                        if (fileName.includes('_bkp_')) {
                            continue;
                        }
                        file = { fileName: fileName, path: path, backups: [] };
                        fileArray.push(file);
                    }
                    return fileArray;
                }
            } catch (ex) {
                return null;
            }
        } catch (ex) {
            toast.error("Failed to execute sudo ls -1 " + ", with files include: ", { position: "bottom-right" });
        }
    }

    const getBackup = async (backupFile) => {
        try {
            setIsLoading(true);
            const server = { id: props.serverID, address: props.hostname };
            const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/ssh`,
                {
                    cloudspaceID: getCloudspaceID(),
                    server: server,
                    command: '',
                    params: `sudo cat ${backupFile.fileName}`
                },
                { withCredentials: true });
            if (jobsResponse && jobsResponse.data.statusCode === 200 && !jobsResponse.data.data?.stderr) {
                const currentData = {
                    output: prepareContent(jobsResponse.data.data?.stdout, backupFile.fileName.split('.').pop()),
                    fileName: backupFile.fileName,
                    path: backupFile.path,
                    status: jobsResponse.data.data?.status,
                };
                setMonacoTheme(monaco, files[rowsSelected]?.draft, theme);
                setSelectedBackup(currentData)
            } else {
                setSelectedBackup('')
                toast.error("Cannot fetch backup for this file", { position: "bottom-right" });
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            setSelectedBackup('')
            toast.error("Cannot fetch backup for this file", { position: "bottom-right" });
        }
    }

    const showFile = async (row) => {
        try {
            setSelectedBackup("")
            const server = { id: props.serverID, address: props.hostname };
            if (row === 'notViewableFile') {
                setContent({ output: "Cannot display this file type" });
            } else {
                setIsLoading(true);
                if (row.draft) {
                    const currentData = { output: prepareContent(row.draft, row.fileName.split('.').pop()), draft: row.draft, fileName: row.fileName, path: row.path };
                    setContent(currentData);
                } else {
                    setFileType(row.fileName.split('.').pop());
                    const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/ssh`,
                        {
                            cloudspaceID: getCloudspaceID(),
                            server: server,
                            command: '',
                            params: 'sudo cat ' + row.path + row.fileName
                        },
                        { withCredentials: true });
                    if (jobsResponse && jobsResponse.data.statusCode === 200 && !jobsResponse.data.data?.stderr) {
                        const currentData = {
                            output: prepareContent(jobsResponse.data.data?.stdout, row.fileName.split('.').pop()),
                            fileName: row.fileName,
                            path: row.path,
                            status: jobsResponse.data.data?.status,
                            error: jobsResponse.data.data?.stderr
                        };
                        setContent(currentData);
                    } else {
                        const failedData = { error: `Cannot fetch data for this file, please check if file exist.`, fileName: row.fileName, path: row.path, status: jobsResponse.data.data?.status, error: jobsResponse.data.data?.stderr };
                        setContent(failedData)
                    }
                }
                if (editorRef.current) {
                    setMonacoTheme(monaco, files[rowsSelected]?.draft, theme);
                    if (props.isScroll) {
                        editorRef.current.revealLine(10000000000);
                    }
                } else {
                    // first loading onmount editor
                    setTimeout(() => {
                        setMonacoTheme(monaco, false, theme);
                    }, 1000);
                }
            }
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false);
            setIsEditButton(false);
            const failedData = { error: `Cannot fetch data for this file, please check if file exist and valid.`, fileName: row.fileName, path: row.path };
            setContent(failedData)
        }
    }

    const getBackupListForFile = async (row) => {
        try {
            const server = { id: props.serverID, address: props.hostname };
            const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/ssh`,
                {
                    cloudspaceID: getCloudspaceID(),
                    server: server,
                    command: '',
                    params: 'sudo find ' + row.path + ' -name ' + row.fileName + '._bkp_*'
                },
                { withCredentials: true });
            if (jobsResponse && jobsResponse.data.statusCode === 200 && !jobsResponse.data.data?.stderr) {
                if(jobsResponse.data.data.stdout === ''){
                    return;
                }
                const newFiles = [...files]
                const fileIndex = newFiles.findIndex((file) => `${file.path}${file.fileName}` === `${row.path}${row.fileName}`)
                const backupsArray = jobsResponse.data.data.stdout.split('\n');
                const newBackups = [];
                for (const backup of backupsArray) {
                    newBackups.push({ fileName: backup, path: row.path })
                }
                newFiles[fileIndex].backups = newBackups;
                setFiles(newFiles);
            }
           
        } catch (ex) {
            
        }
    }

    const downloadFile = async (e) => {
        try {
            if (rowsSelected.length > 10) {
                toast.info("Download files limit to 10 files, Please select again ", { position: "bottom-right" });
                return;
            }
            setIsLoading(true);
            const server = { id: props.serverID, address: props.hostname };
            var zip = new JSZip();
            const fileArray = [];
            for (const file of rowsSelected) {
                fileArray.push({ file: files[file].path + files[file].fileName })
                const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/ssh`,
                    {
                        cloudspaceID: getCloudspaceID(),
                        server: server,
                        command: '',
                        params: 'sudo cat ' + files[file].path + files[file].fileName
                    },
                    { withCredentials: true });
                if (jobsResponse && jobsResponse.data.statusCode === 200) {
                    zip.file(files[file].fileName, jobsResponse.data.data?.stdout);
                } else {
                    toast.error("Failed to download files job", { position: "bottom-right" });
                    return;
                }
            }
            var content = await zip.generateAsync({ type: "blob" })
            // download
            var csvURL = window.URL.createObjectURL(content);
            const tempLink = document.createElement('a');
            tempLink.href = csvURL;
            tempLink.setAttribute('download', 'cmp-' + server.address + '.zip');
            tempLink.click();
            setIsLoading(false);
        }
        catch (ex) {
            setIsLoading(false);
            toast.error("Failed to download files job", { position: "bottom-right" });
        }
    }

    const onHandleClickSearchMonacoIcon = () => {
        if (searchPressed) {
            editorRef.current.trigger('', 'closeFindWidget')
            setSearchPressed(false)
        } else {
            editorRef.current.trigger('', 'actions.find')
            setSearchPressed(true)
        }
    }

    const updateFile = async () => {
        try {
            setIsLoading(true);
            const orgFileName = files[rowsSelected].fileName;
            // 1. check if there is any change
            if (content.output === files[rowsSelected].originalContent) {
                setIsLoading(false);
                handleCloseConfirmationModal();
                toast.info("No change was found to update in file", { position: "bottom-right" });
                return;
            }
            // 2. validate
            try {
                prepareContent(content.output, fileType);
            } catch (e) {
                setIsLoading(false);
                handleCloseConfirmationModal();
                toast.error(`Failed to update file ${props.file.fileName}. Make sure syntax is valid`, { position: "bottom-right" });
                return;
            }
            // 3. encode the content and check if its not too big to persist
            const encodedData = btoa(content.output);
            const size = (new Blob([encodedData])).size;//byte size
            if (size / 1024 > 129) {
                setIsLoading(false);
                cancelEdit();
                handleCloseConfirmationModal();
                toast.error("Failed to save changes, file size is too large", { position: "bottom-right" });
                return;
            }
            // 4. update the file
            const updateResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/updateFile`,
                {
                    cloudspaceID: getCloudspaceID(),
                    hostname: props.hostname,
                    fileName: orgFileName,
                    filePath: files[rowsSelected].path,
                    encodedData: encodedData
                },
                { withCredentials: true });
            // 5. update the UI
            if (updateResponse && updateResponse.data.statusCode === 200) {
                removeDraft();
                handleCloseConfirmationModal();
                toast.success("File is edited succesfully. Restart server if needed.", { position: "bottom-right" });
                // 6. register action job
                const server = [{ id: props.serverID, address: props.hostname }];
                executeAction(server, "updateFile", `Updated file`, `echo File ${files[rowsSelected].path + orgFileName} has been updated`, false);
                // 7. for diffEditor, update backups at UI    
                const newBackup = updateResponse.data.data?.newBackup;
                const deletedBackup = updateResponse.data.data?.deletedBackup;
                const items = [...files];
                const currentFile = { ...items[rowsSelected] };
                const currentFileBackups = currentFile.backups;
                if (deletedBackup) {
                    currentFileBackups.splice(2, 1)
                    currentFile.backups = currentFileBackups
                }
                currentFile.backups.unshift({ fileName: newBackup, path: files[rowsSelected].path })
                items[rowsSelected] = currentFile;
                setFiles(items);
                cancelCompare();
                setIsLoading(false);
            } else {
                setIsLoading(false);
                handleCloseConfirmationModal();
                toast.error("Failed to update file " + files[rowsSelected].fileName, { position: "bottom-right" });
            }
        } catch (ex) {
            setIsLoading(false);
            handleCloseConfirmationModal();
            toast.error(`Failed to update file ${files[rowsSelected].fileName}. ${ex}`, { position: "bottom-right" });
        }
    }

    const handleEditorDidMount = (lineCount) => (editor, monaco) => {
        editorRef.current = editor;
        if (props.isScroll && lineCount) {
            editorRef.current.revealLine(10000000000);
        }
        // onChange
        if (selectedBackup) {
            const modifiedEditor = editor.getModifiedEditor();
            modifiedEditor.onDidChangeModelContent((_) => {
                if (files[rowsSelected]?.draft) {
                    changeContent(modifiedEditor.getValue())
                }
            });
        }
    }

    const cancelEdit = () => {
        setContent({
            ...content,
            draft: null,
            output: files[rowsSelected].originalContent
        });
        removeDraft();
        setMonacoTheme(monaco, false, theme)
    };

    const cancelCompare = () => {
        setSelectedBackup('')
        setMonacoTheme(monaco, files[rowsSelected]?.draft, theme);
    };

    const changeContent = (newValue) => {
        setContent({
            ...content,
            output: newValue,
            draft: newValue,
            path: files[rowsSelected].path,
            fileName: files[rowsSelected].fileName
        });
    };

    const removeDraft = () => {
        delete files[rowsSelected].draft;
        delete files[rowsSelected].originalContent;
        delete content.draft;
        setFiles(files);
        setMonacoTheme(monaco, false, theme);
    };

    const keepDraft = () => {
        if (files[rowsSelected]?.draft) {
            let items = [...files];
            let item = { ...items[rowsSelected] };
            item.draft = content.draft;
            items[rowsSelected] = item;
            setFiles(items);
        }
    };

    const openEditMode = () => {
        let item = { ...files[rowsSelected] };
        item.originalContent = content.output;
        item.draft = content.output;
        files[rowsSelected] = item;
        changeContent(content.output);
        setMonacoTheme(monaco, true, theme);
    };

    const verifyUpdate = () => {
        setOpenConfirmationModal(true);
    };

    const verifyDraftDiscard = () => {
        setOpenDraftAlertModal(true);
    };

    /**
     * cancel only the confirmation draft alert modal
     */
    const handleCancelDraftModal = () => {
        setOpenDraftAlertModal(false);
    };

    /**
     * cancel both the confirmation draft alert modal and fileModal
     */
    const handleCancelDraft = () => {
        cancelEdit();
        setOpenDraftAlertModal(false);
        props.closeModal();
    };

    const handleCloseConfirmationModal = () => {
        setOpenConfirmationModal(false);
    };

    const copyToClipboard = (data) => () => {
        navigator.clipboard.writeText(data);
        toast.info("Copied to Clipboard", { position: "bottom-right" });
    }

    const handleCloseModal = () => {
        let isDraft = false;
        for (const file of files) {
            if (file.draft) {
                isDraft = true;
                break;
            }
        }
        if (isDraft) {
            verifyDraftDiscard()
        } else {
            props.closeModal();
        }
    };

    const getExtenstionFile = (fileNameObject) => {
        const arrayOfFileName = fileNameObject.fileName.split(".");
        const extension = arrayOfFileName.pop();
        return `.${extension}`;
    }

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

    const draftAlertModal =
        <Dialog disableBackdropClick={false} fullWidth open={openDraftAlertModal} onClose={handleCancelDraftModal} aria-labelledby="form-dialog-title">
            <Loader isLoading={isLoading}></Loader>
            <DialogTitle id="form-dialog-title">All drafts will be discard</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <span>Are you sure?</span>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCancelDraftModal} color="primary">No</Button>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCancelDraft} color="primary">Yes</Button>
            </DialogActions>
        </Dialog>
    return (
        <div>
            {confirmationModal}
            {draftAlertModal}
            <Dialog disableBackdropClick={false} maxWidth={'xxl'} fullWidth open={openFileModal} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
                <div className="wrapper">
                    <DialogTitle className="header" id="form-dialog-title">{props.modalName} at {props.hostname} </DialogTitle>
                </div>
                <Loader isLoading={isLoading}></Loader>
                <div className="wrapper">
                    <DialogTitle className="title" style={{ color: 'rgb(0, 0, 0, 0.6)' }} >
                        {!selectedBackup ? <span style={{ marginRight: '1em' }}> {content?.path}{content?.fileName} {content?.draft ? ' | Edit Mode' : null}</span> : null}
                        {files[rowsSelected]?.backups?.length > 0 ?
                            <span style={{ width: '53%', display: 'inline-flex' }}>
                                <FormControl style={{ marginRight: '1em', width: 450 }} >
                                    <Select
                                        value={selectedBackup.fileName ? selectedBackup.fileName : 'Compare with backup'}
                                        displayEmpty
                                        onChange={(event, newValue) => {
                                            setSelectedBackup({ fileName: event.target.value.fileName, path: event.target.value.path, output: "" })
                                            getBackup(event.target.value)
                                        }}
                                        renderValue={(val) => val}
                                    >
                                        {files[rowsSelected].backups.map((row, index) => (
                                            <MenuItem key={index} value={row}>{row.fileName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {selectedBackup ? <span><IconButton size="small" aria-controls="simple-menu" aria-haspopup="true"
                                    onClick={cancelCompare}>
                                    <ClearIcon aria-controls="simple-menu" >
                                    </ClearIcon>
                                </IconButton></span> : null}
                            </span> : null}
                        {selectedBackup ? <span>{content?.path}{content?.fileName} {content?.draft ? ' | Edit Mode' : null}</span> : null}
                    </DialogTitle>
                    <div className="contentActions">
                        {isEditButton && files.length > 0 ?
                            <div style={{ display: 'flex' }}>
                                <IconButton aria-controls="simple-menu" aria-haspopup="true"
                                    onClick={() => onHandleClickSearchMonacoIcon()}>
                                    <FindInPage aria-controls="simple-menu" />
                                </IconButton>
                                {files[rowsSelected]?.draft ?
                                    <div>
                                        <IconButton aria-controls="simple-menu" aria-haspopup="true"
                                            onClick={cancelEdit}>
                                            <ClearIcon aria-controls="simple-menu" >
                                            </ClearIcon>
                                        </IconButton>
                                    </div> :
                                    <IconButton aria-controls="simple-menu" aria-haspopup="true" disabled={isBasicUser()}
                                        onClick={openEditMode}>
                                        <EditIcon aria-controls="simple-menu" />
                                    </IconButton>}
                            </div> : null}
                    </div>
                </div>
                <DialogContent style={{ display: 'flex' }} className="contentModal">
                    {content?.output ?
                        <div id="contentModal" style={{ width: '80%' }} >
                            {!content.error ?
                                <div>
                                    {!selectedBackup ?
                                        <Editor width="80%"
                                            className="monacoEditorModal"
                                            theme={theme}
                                            onMount={handleEditorDidMount(content?.output?.length)}
                                            language={getLanguage(fileType)}
                                            value={content?.output}
                                            options={{
                                                readOnly: files[rowsSelected]?.draft == null,
                                                fontSize: '12',
                                                fontFamily: 'monospace',
                                                scrollBeyondLastLine: false
                                            }}
                                            onChange={(value, viewUpdate) => {
                                                if (files[rowsSelected]?.draft) {
                                                    changeContent(value)
                                                }
                                            }}
                                            loading={false}
                                        />
                                        :
                                        <DiffEditor
                                            modified={content?.output}
                                            original={selectedBackup?.output}
                                            className="monacoEditorModal"
                                            theme={theme}
                                            onMount={handleEditorDidMount(content?.output?.length)}
                                            language={getLanguage(fileType)}
                                            options={{
                                                readOnly: files[rowsSelected]?.draft == null,
                                                fontSize: '12',
                                                fontFamily: 'monospace',
                                                scrollBeyondLastLine: false,
                                            }}
                                        />}
                                </div>
                                :
                                <Typography component={'span'} variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                    {content.error}
                                </Typography>
                            }
                        </div>
                        : <div id="contentModal" style={{ width: '80%' }} />
                    }

                    <div style={{ position: 'sticky', top: '0', width: '20%', overflowY: 'auto' }} id="filesModal">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable title={"File List"} style={{ boxShadow: 'none' }}
                                data={
                                    files && Array.isArray(files) && files.map((row, i) => {
                                        return [
                                            row,
                                            getExtenstionFile(row)
                                        ]
                                    })
                                }
                                columns={[
                                    {
                                        name: "File name",
                                        label: "File name",
                                        options: {
                                            filter: false,
                                            customBodyRender: value => {
                                                return <div>
                                                    <Tooltip title={value?.draft ? '' : 'Click To Reload'} >
                                                        <span>{value?.fileName}
                                                            <Tooltip title={'Edit mode'} >
                                                                <span style={{ float: 'right' }}>{value?.draft ?
                                                                    <EditIcon aria-controls="simple-menu" /> : null}</span>
                                                            </Tooltip>
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            }
                                        }
                                    },
                                    {
                                        name: "Extenstion",
                                        label: "Extenstion",
                                        options: {
                                            display: false
                                        }
                                    }
                                ]}
                                options={{
                                    searchOpen: true,
                                    search: searchIcon,
                                    onSearchClose: () => {
                                        setSearchIcon(true)
                                    },
                                    onSearchOpen: () => {
                                        setSearchIcon(false)
                                    },
                                    customSort: (data, colIndex, order, meta) => {
                                        if (order === 'asc') {
                                            return data.sort((a, b) => a.data[colIndex].fileName.localeCompare(b.data[colIndex].fileName))
                                        } else {
                                            return data.sort((a, b) => b.data[colIndex].fileName.localeCompare(a.data[colIndex].fileName))
                                        }
                                    },
                                    customSearch: (searchQuery, currentRow) => {
                                        let isFound = false;
                                        currentRow.forEach(col => {
                                            if (col.fileName && col.fileName.toString().indexOf(searchQuery) >= 0) {
                                                isFound = true;
                                            }
                                        });
                                        return isFound;
                                    },
                                    viewColumns: false,
                                    print: false,
                                    download: isDownloadButton,
                                    filter: true,
                                    rowsPerPage: 10,
                                    rowsPerPageOptions: [50],
                                    elevation: 0,
                                    rowsSelected: rowsSelected,
                                    selectableRowsOnClick: true,
                                    selectToolbarPlacement: 'none',
                                    onCellClick: (celdata, cellMeta) => {
                                        const metaSum = clickOnRowMetaData + 1
                                        setClickOnRowMetaData(metaSum);
                                        setRowsSelected([cellMeta.dataIndex]);
                                        keepDraft();
                                    },
                                    onRowSelectionChange: (rowsSelected, allRows) => {
                                        if (rowsSelected.length === 1 && clickOnRowMetaData + 1 === 2) {
                                            setIsDownloadButton(true);
                                            setIsEditButton(files[rowsSelected[0].dataIndex].fileName.indexOf('_bkp_') < 0);
                                            setClickOnRowMetaData(0);
                                            setFileType(files[rowsSelected[0].dataIndex].fileName.split('.').pop());
                                            showFile(files[rowsSelected[0].dataIndex])
                                            getBackupListForFile(files[rowsSelected[0].dataIndex])
                                            return;
                                        }
                                        if (allRows.length === 0) {
                                            setIsDownloadButton(false);
                                            setIsEditButton(false);
                                            setRowsSelected([])
                                            return;
                                        }
                                        if (allRows.length > 1) {
                                            setIsDownloadButton(true);
                                            setIsEditButton(false);
                                            setRowsSelected(allRows.map((row) => row.dataIndex))
                                            return;
                                        }
                                        setRowsSelected(allRows.map((row) => row.dataIndex));
                                        setIsDownloadButton(true);
                                        setIsEditButton(files[rowsSelected[0].dataIndex].fileName.indexOf('_bkp_') < 0);
                                    },
                                    onDownload: () => {
                                        downloadFile();
                                        return false;
                                    },
                                    textLabels: {
                                        toolbar: {
                                            downloadCsv: "Download Selected Files"
                                        }
                                    }
                                }
                                }
                            />
                        </MuiThemeProvider>
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', width: '77%', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                                <IconButton onClick={() => setTheme(setMonacoTheme(monaco, files[rowsSelected]?.draft, theme, true))}
                                    aria-label="change theme" >
                                    <WbIncandescentIcon style={{ fontSize: 30 }} />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div>
                            {files[rowsSelected]?.draft ?
                                <div style={{ display: 'flex', flexDirection: 'row-reverse', marginBottom: '.6em' }}>
                                    <Button
                                        style={{
                                            color: 'rgb(0, 112, 185)',
                                        }}
                                        variant="outlined"
                                        onClick={cancelEdit}
                                        startIcon={<ClearIcon />}
                                        color="primary" >
                                        Cancel
                                    </Button>
                                    <Button
                                        style={{
                                            color: 'rgb(0, 112, 185)',
                                            marginRight: 5,
                                        }}
                                        variant="outlined"
                                        onClick={verifyUpdate}
                                        startIcon={<SaveIcon />}
                                        color="primary" >
                                        Update
                                    </Button>
                                </div>
                                : null}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={copyToClipboard(content?.output)} color="primary">Copy</Button>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Close</Button>
                </DialogActions>
            </Dialog >
        </div>)
}
export default FilesModal;