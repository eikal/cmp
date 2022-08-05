import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import PuffLoader from "react-spinners/PuffLoader";
import ClockLoader from "react-spinners/ClockLoader";
import StopIcon from '@material-ui/icons/Stop';
import IconButton from '@material-ui/core/IconButton';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import Tooltip from '@material-ui/core/Tooltip';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import Editor, { useMonaco } from "@monaco-editor/react";
import stripAnsi from 'strip-ansi';
import Loader from '../../shared/Loader';
import CustomActionModal from '../Modals/CustomActionModal.jsx';
import PuppetFactsModal from '../Modals/PuppetFactsModal.jsx';
import { getLocalDateTime } from '../../../helpers/date.js';
import { isBasicUser, getCloudspaceID } from '../../../helpers/auth.js';
import { setMonacoTheme } from '../../shared/MonacoFileEditor/Helper.js';
import { lightReadOnly, darkReadOnly } from '../../shared/MonacoFileEditor/Themes.js';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: '6px 16px',
    },
    secondaryTail: {
        backgroundColor: theme.palette.secondary.main,
    },
}));

const JobsTab = forwardRef((props, ref) => {
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingComponentTab, setIsLoadingComponentTab] = useState(true);
    const [isLoadingJob, setIsLoadingJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [currentJobServer, setCurrentJobServer] = useState(null);
    const [isShowMoreOpen, setIsShowMoreOpen] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(null);
    const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
    const [isCustomActionExecuted, setIsCustomActionExecuted] = useState(false);
    const [genericModalName, setGenericModalName] = useState(null);
    const [content, setcontent] = useState(null);
    const [isPauseLogs, setIsPauseLogs] = useState(false);
    const [pauseLogs, setPauseLogs] = useState(null);
    const [theme, setTheme] = useState('lightReadOnly')
    const editorRef = useRef(null);
    const monaco = useMonaco();

    useEffect(() => {
        getJobsByServer(props.serverDetails._id);
        fetchData();
    }, [props.serverDetails]);

    useEffect(() => { // clean up hook for destory all timers
        return () => {
            const interval_id = setInterval(() => { }, 1);
            for (let i = 0; i < interval_id; i++) {
                window.clearInterval(i);
            }
        };
    }, []);

    useEffect(() => {
        if (monaco?.editor) {
            monaco.editor.defineTheme("lightReadOnly", lightReadOnly)
            monaco.editor.defineTheme("darkReadOnly", darkReadOnly)
        }
    }, [monaco]);

    useImperativeHandle(ref, () => ({
        handleOpenJobModalFunc: async (action, actionLabelName) => {
            try {
                setGenericModalName(actionLabelName);
                if (action === 'fileView') {
                    setIsLoading(true);
                    setIsLoadingJob(true);
                    setIsGenericModalOpen(true);
                    setIsCustomActionExecuted(true);
                    setTimeout(async () => {
                        setIsLoading(false);
                        const currentJobs = await getJobsByServer(props.serverDetails._id)
                        setcontent(currentJobs[0]);
                        setIsLoadingJob(false);
                        clearInterval();
                    }, 3000);
                }
            } catch (ex) {
                setIsLoadingJob(false);
            }
        }
    }));

    const fetchData = () => {
        if (props.serverDetails._id !== currentJobServer && currentJobServer) {
            const interval_id = setInterval(() => { }, 1);
            for (let i = 0; i < interval_id; i++) {
                window.clearInterval(i);
            }
        }

        const intervalM = setInterval(async () => {
            getJobsByServer(props.serverDetails._id);
        }, 3000);
    }

    const handleCloseJobModal = () => {
        setIsShowMoreOpen(false);
        setShowMoreDetails(null);
        setIsGenericModalOpen(false);
        setIsCustomActionExecuted(false);
        setcontent(null);
        setIsPauseLogs(false);
        setPauseLogs(null);
        fetchData();
    };

    const handleCloseGenericModal = () => {
        setIsGenericModalOpen(false);
        setIsCustomActionExecuted(false);
        setcontent(null);
        fetchData();
    };

    const openShowMoreModal = (jobDetails) => (e) => {
        setIsLoadingJob(true);
        if (jobDetails.jobType === 'fileView') {
            setGenericModalName(jobDetails.jobLabelName);
            setIsGenericModalOpen(true);
            if (jobDetails.jobType === 'fileView') {
                setIsCustomActionExecuted(true);
            }
            jobDetails.hostname = props.serverDetails.fullHostname;
            setcontent(jobDetails)
            clearInterval();
        } else {
            setIsShowMoreOpen(true);
            setShowMoreDetails(jobDetails)
            setTimeout(() => {
                scrolingDownShowMoreModal();
                if (!(['sshCommand', 'syslog', 'icLogs', 'icCatelinaOut', 'puppetUpdate', 'queryExporterLogs'].includes(jobDetails.jobType))) {
                    clearInterval();
                }
            }, 100);
        }
        setIsLoadingJob(false);
    };

    const getJobsByServer = async (serverID) => {
        setCurrentJobServer(serverID);
        const jobsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/action-job/jobs?serverID=${serverID}`, { withCredentials: true });
        if (jobsResponse && jobsResponse.data.statusCode !== 200) {
            return;
        }
        setJobs(jobsResponse.data.data);
        setIsLoadingComponentTab(false);
        scrolingDownShowMoreModal(true)
        return jobsResponse.data.data;
    };

    const retryJob = (job) => async (e) => {
        try {
            const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/job/retry`, {
                cloudspaceID: getCloudspaceID(),
                serverID: job.serverID,
                jobID: job._id,
                params: job.jobCommand
            }, { withCredentials: true });
            if (jobsResponse && jobsResponse.data.statusCode !== 200) {
                toast.error("Failed to retry job", { position: "bottom-right" });
                return;
            } else {
                toast.success("Job has been retried", { position: "bottom-right" });
            }
        } catch (ex) {
            toast.error("Failed to retry job", { position: "bottom-right" });
        }
    };

    const killJob = (job) => async (e) => {
        try {
            const jobsResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/job/kill`, {
                jobID: job._id,
            }, { withCredentials: true });
            if (jobsResponse && jobsResponse.data.statusCode !== 200) {
                toast.error("Failed to Kill job", { position: "bottom-right" });
                return;
            } else {
                toast.success("Job has been killed", { position: "bottom-right" });
            }
        } catch (ex) {
            toast.error("Failed to kill job", { position: "bottom-right" });
        }
    };


    const copyToClipboard = (data) => () => {
        navigator.clipboard.writeText(data.output);
        toast.info("Copied to Clipboard", { position: "bottom-right" });
    }

    const scrolingDownShowMoreModal = (inLiveMode = false) => {
        if (inLiveMode) {
            if (document.querySelector(".overflow-guard") &&
                document.getElementById('playButtonShowMoreModal') &&
                document.getElementById('playButtonShowMoreModal').disabled &&
                document.getElementById('showMoreJobModalStatus') &&
                document.getElementById('showMoreJobModalStatus').innerText.includes('In Progress')
            ) {
                setTimeout(() => {
                    document.querySelector(".overflow-guard").scroll({
                        top: 1000000000000000000,
                        left: 0,
                        behavior: 'auto',
                    });
                }, 100);
            }

        } else {
            if (document.querySelector(".overflow-guard") &&
                document.getElementById('playButtonShowMoreModal') &&
                document.getElementById('playButtonShowMoreModal').disabled
            ) {
                setTimeout(() => {
                    document.querySelector(".overflow-guard").scroll({
                        top: 1000000000000000000,
                        left: 0,
                        behavior: 'auto',
                    });
                }, 100);
            }
        }
    }

    const handlePauseLogs = () => {
        setIsPauseLogs(true);
        setPauseLogs(jobs.filter((job) => job._id === showMoreDetails._id)[0])
    }

    const handleContinueLogs = () => {
        setIsPauseLogs(false);
        setPauseLogs(null);
    }

    const clearInterval = () => {
        const interval_id = setInterval(() => { }, 1);
        for (let i = 0; i < interval_id; i++) {
            window.clearInterval(i);
        }
    }

    const handleEditorDidMount = (lineCount) => (editor, monaco) => {
        if (props.isScroll && lineCount) {
            editorRef.current = editor;
            editorRef.current.revealLine(lineCount);
        }
    }

    const genericModal =
        <div>
            {isGenericModalOpen && !isCustomActionExecuted && genericModalName === 'Puppet Facts' &&
                <PuppetFactsModal content={content} jobs={jobs} serverID={props.serverDetails._id} hostname={props.serverDetails.fullHostname}
                    closeModal={handleCloseGenericModal} />
            }
            {isGenericModalOpen && isCustomActionExecuted &&
                <CustomActionModal content={content} jobs={jobs} serverID={props.serverDetails._id} hostname={props.serverDetails.fullHostname}
                    closeModal={handleCloseGenericModal} />
            }
        </div>

    const showMoreJobModal = <Dialog disableBackdropClick={true} maxWidth={'xl'} fullWidth open={isShowMoreOpen} onClose={handleCloseJobModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
            {showMoreDetails && <div style={{ display: 'flex', flexDirection: 'row', placeContent: 'space-between' }}>
                <div>{showMoreDetails.jobLabelName} at {props?.serverDetails?.fullHostname}</div>
                <div style={{ fontSize: 15 }} id="showMoreJobModalStatus">Status: {jobs.filter((job) => job._id === showMoreDetails._id)[0].status}</div>
            </div>}
        </DialogTitle>

        <DialogContent id="showMoreJobModalID" >
            <DialogContentText>
                {
                    isLoadingJob &&
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
                        <CircularProgress color='primary' size={60} />
                    </div>
                }
                {showMoreDetails && !isLoadingJob ?
                    <div >
                        {
                            jobs.filter((job) => job._id === showMoreDetails._id)[0].jobType.includes('ssh') ? <div>
                                <span style={{ fontWeight: 'bold' }}>Command: {jobs.filter((job) => job._id === showMoreDetails._id)[0].jobCommand}</span>
                            </div> : null
                        }
                        Logs:
                        <div className="contentModal" style={{ width: '100%', overflowY: 'auto' }}>
                            <div className="monacoEditorOutput" style={{ whiteSpace: 'pre-line', marginBottom: '8em' }}>
                                {
                                    isPauseLogs ?
                                        <Editor
                                            width="80%"
                                            theme={theme}
                                            value={pauseLogs.output ? stripAnsi(pauseLogs.output) : ''}
                                            options={{ readOnly: true, fontSize: '12', fontFamily: 'monospace', scrollBeyondLastLine: false }}
                                            onMount={handleEditorDidMount(pauseLogs?.output?.split(/\r\n|\r|\n/).length)}
                                            loading={false}
                                        />
                                        :
                                        <Editor
                                            width="80%"
                                            theme={theme}
                                            value={jobs.filter((job) => job._id === showMoreDetails._id)[0].output ? stripAnsi(jobs.filter((job) => job._id === showMoreDetails._id)[0].output) : ''}
                                            options={{ readOnly: true, fontSize: '12', fontFamily: 'monospace', scrollBeyondLastLine: false }}
                                            nMount={handleEditorDidMount(jobs.filter((job) => job._id === showMoreDetails._id)[0]?.output?.split(/\r\n|\r|\n/).length)}
                                            loading={false}
                                        />
                                }
                            </div>

                            {showMoreDetails && !isLoadingJob && jobs.filter((job) => job._id === showMoreDetails._id)[0].error ?
                                <div className="monacoEditorErr" style={{ whiteSpace: 'pre-line' }}>
                                    {jobs.filter((job) => job._id === showMoreDetails._id)[0].status === 'Killed' ? 'Message:' : 'Error:'}
                                    {
                                        isPauseLogs ?
                                            <Editor
                                                width="80%"
                                                theme={theme}
                                                value={pauseLogs.error ? stripAnsi(pauseLogs.error) : ''}
                                                options={{ readOnly: true, fontSize: '12', fontFamily: 'monospace', scrollBeyondLastLine: false }}
                                                onMount={handleEditorDidMount(pauseLogs?.output?.split(/\r\n|\r|\n/).length)}
                                                loading={false}
                                            />
                                            :
                                            <Editor
                                                width="80%"
                                                theme={theme}
                                                value={jobs.filter((job) => job._id === showMoreDetails._id)[0].error ? stripAnsi(jobs.filter((job) => job._id === showMoreDetails._id)[0].error) : ''}
                                                options={{ readOnly: true, fontSize: '12', fontFamily: 'monospace', scrollBeyondLastLine: false }}
                                                onMount={handleEditorDidMount(jobs.filter((job) => job._id === showMoreDetails._id)[0]?.output?.split(/\r\n|\r|\n/).length)}
                                                loading={false}
                                            />
                                    }
                                </div>
                                : null}
                        </div>
                    </div> : null
                }
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <div style={{ display: 'flex', flex: 'auto' }}>
                <Tooltip title={'Start'}>
                    <IconButton id={"playButtonShowMoreModal"}
                        style={{
                            display: showMoreDetails && jobs.filter((job) => job._id === showMoreDetails._id)[0].status !== "In Progress" ? 'none' : null,
                            color: isPauseLogs ? 'rgb(75, 210, 143)' : null
                        }}
                        disabled={
                            !isPauseLogs ||
                            (showMoreDetails && jobs.filter((job) => job._id === showMoreDetails._id)[0].status !== "In Progress")
                        }
                        onClick={handleContinueLogs}
                        aria-label="close"
                    >
                        <PlayArrowIcon style={{ fontSize: 40 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={'Pause'}>
                    <IconButton id={"pauseButtonShowMoreModal"}
                        style={{
                            display: showMoreDetails && jobs.filter((job) => job._id === showMoreDetails._id)[0].status !== "In Progress" ? 'none' : null,
                            color: !isPauseLogs ? 'rgb(255, 77, 77)' : null
                        }}
                        disabled={
                            isPauseLogs ||
                            (showMoreDetails && jobs.filter((job) => job._id === showMoreDetails._id)[0].status !== "In Progress")
                        } onClick={handlePauseLogs}
                        aria-label="close"
                    >
                        <PauseIcon style={{ fontSize: 40 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                    <IconButton onClick={() => setTheme(setMonacoTheme(monaco, false, theme, true))}
                        aria-label="change theme" >
                        <WbIncandescentIcon style={{ fontSize: 30 }} />
                    </IconButton>
                </Tooltip>
            </div>

            {
                jobs && jobs.length > 0 && showMoreDetails && jobs.filter((job) => job._id === showMoreDetails._id)[0].output ?
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={copyToClipboard(jobs.filter((job) => job._id === showMoreDetails._id)[0])} color="primary">Copy</Button>
                    : null
            }
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseJobModal} color="primary">Close</Button>
        </DialogActions>
    </Dialog>

    const jobModal = props.serverDetails ?
        <div>
            {
                !isLoadingComponentTab ?
                    <div style={{ width: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <PuffLoader color={'rgb(0, 112, 185)'} loading={true} css={{ "margin-right": '7px' }} size={20} />
                    </div> : null
            }
            <Timeline align="alternate">
                {
                    jobs && Array.isArray(jobs) && jobs.length > 0 ? jobs.map((job, i) => (
                        <TimelineItem>
                            <TimelineSeparator>
                                {
                                    job.status === "Killed" && // Killed
                                    <TimelineDot style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
                                        <Tooltip title={'Aborted'}>
                                            <LaptopMacIcon />
                                        </Tooltip>
                                    </TimelineDot>
                                }
                                {
                                    job.status === "Completed With Errors" && job.output && job.error && // COMPLETED WITH ERRORS
                                    <TimelineDot style={{ backgroundColor: 'rgb(255, 170, 0)' }}>
                                        <Tooltip title={'Completed with errors'}>
                                            <LaptopMacIcon />
                                        </Tooltip>
                                    </TimelineDot>
                                }
                                {
                                    job.status === "Failed" && //ERROR
                                    <TimelineDot style={{ backgroundColor: 'rgb(255, 77, 77)' }}>
                                        <Tooltip title={'Errors'}>
                                            <LaptopMacIcon />
                                        </Tooltip>
                                    </TimelineDot>
                                }
                                {
                                    job.status === 'Completed' && // COMPLETED
                                    <TimelineDot style={{ backgroundColor: 'rgb(75, 210, 143)' }}>
                                        <Tooltip title={'Completed'}>
                                            <LaptopMacIcon />
                                        </Tooltip>
                                    </TimelineDot>
                                }
                                {
                                    job.status === 'In Progress' && //IN PROGRESS
                                    <TimelineDot>
                                        <CircularProgress size={'1.5rem'} />
                                    </TimelineDot>
                                }
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <Paper elevation={3} className={classes.paper}>
                                    {
                                        job.status === 'In Progress' &&
                                        <Tooltip title={'Abort'}>
                                            <IconButton disabled={isBasicUser()} style={{ float: 'right', color: !isBasicUser() && 'rgb(255, 77, 77)' }} aria-label="close" onClick={killJob(job)}>
                                                <StopIcon />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    {
                                        job.jobType !== 'updateFile' &&
                                        <Tooltip title={'Retry Action'}>
                                            <IconButton disabled={job.status === 'In Progress' || isBasicUser()} style={{ float: 'right' }} aria-label="close" onClick={retryJob(job)}>
                                                <RotateLeftIcon />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    <Typography variant="h6" component="h1">
                                        {job.jobLabelName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Executed By: {job.createdBy}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {getLocalDateTime(job.createdDate)}
                                    </Typography>

                                    <br></br>
                                    {
                                        job.jobType.includes('ssh') ? <div>
                                            <span style={{ fontWeight: 'bold' }}>Command:</span>
                                            <div>
                                                {job.jobCommand}
                                            </div>
                                        </div> : null
                                    }
                                    {
                                        job.output && job.output.length > 0 && <div>
                                            <div>
                                                {job.jobType !== 'fileView' && <span style={{ fontWeight: 'bold' }}>Log:</span>}
                                            </div>
                                            {
                                                <div>
                                                    {
                                                        job.jobType !== 'fileView' &&
                                                        <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                                            {job.output.length <= 300 ? stripAnsi(job.output) : stripAnsi(job.output.slice(-300))}
                                                        </Typography>
                                                    }
                                                    <Button color="primary" onClick={openShowMoreModal(job)}>
                                                        Show More...
                                                    </Button>
                                                </div>
                                            }
                                        </div>
                                    }
                                    {
                                        job.error ? <div>
                                            <div>
                                                <span style={{ fontWeight: 'bold' }}>{job.status === "Killed" ? 'Message:' : 'Error message:'}</span>
                                            </div>
                                            <p style={{ overflowWrap: 'break-word', whiteSpace: 'break-spaces' }}>
                                                {stripAnsi(job.error.slice(0, 300))}
                                            </p>
                                        </div> : null
                                    }
                                    {
                                        job.status === 'In Progress' ?
                                            <Typography>JOB Is Running...</Typography>
                                            :
                                            null
                                    }
                                    {
                                        job.isTimedOut ?
                                            <Typography style={{ fontWeight: 'bold' }} variant="body2" color="textSecondary">
                                                * Action limited for 60 min. Timed out..
                                            </Typography> : null
                                    }
                                </Paper>
                            </TimelineContent>
                        </TimelineItem>
                    )) :
                        !isLoadingComponentTab ?
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Typography>No Jobs Found</Typography>
                            </div>
                            : null
                }
                <div style={{ width: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ClockLoader color={'rgb(0, 112, 185)'} loading={isLoadingComponentTab} css={{ "margin-right": '7px' }} size={50} />
                </div>
            </Timeline>
        </div> : null


    return (
        <div style={{ width: '100%', maxHeight: '800px' }}>
            {jobModal}
            {showMoreJobModal}
            {genericModal}
            <Loader isLoading={isLoading}></Loader>
            <ToastContainer />
        </div>
    )
})
export default JobsTab;
