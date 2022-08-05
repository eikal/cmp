import React, { useState, useEffect } from 'react';
import Button from "@material-ui/core/Button";
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import GridLoader from "react-spinners/GridLoader";
import AddIcon from '@material-ui/icons/Add';
import RateReviewIcon from '@material-ui/icons/RateReview';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Badge from '@material-ui/core/Badge';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Loader from '../../../shared/Loader';
import { titleCase, isEmailValidate } from '../../../../helpers/helpers.js';
import { getLocalDateTime } from '../../../../helpers/date.js';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './style.css'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';



const StoryBookChart = (props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [storyBooks, setStoryBooks] = useState([]);
    const [currentProject, setCurrentProject] = useState(null)

    const [newComment, setNewComment] = useState('');
    const [isLoadingComponent, setIsLoadingComponent] = useState(false);

    const [isEditStorybook, setIsEditStorybook] = useState(false)
    const [selectedStoryBook, setSelectedStoryBook] = useState('')
    const [editComment, setEditComment] = useState('')

    const [openEmailModal, setOpenEmailModal] = useState(false);
    const [email, setEmail] = useState(null)

    const [openDeleteModal, setOpenDeleteModal] = useState(false);


    useEffect(() => {
        if (props.selectedProjectDetails.project._id !== currentProject) {
            const interval_id = setInterval(() => { }, 1);
            for (let i = 0; i < interval_id; i++) {
                window.clearInterval(i);
            }
        }
        if (props.selectedProjectDetails) {
            setCurrentProject(props.selectedProjectDetails.project._id)
        }

        fetchData();
        const intervalM = setInterval(async () => {
            fetchData();
        }, 15000);
    }, [props.selectedProjectDetails]);

    useEffect(() => { // clean up hook for destory all timers
        return () => {
            const interval_id = setInterval(() => { }, 1);
            for (let i = 0; i < interval_id; i++) {
                window.clearInterval(i);
            }
        };
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/story-book?projectID=${props.selectedProjectDetails.project._id}`, { withCredentials: true });
            if (res && res.data.statusCode !== 200) {
                toast.error("Failed to get story-books", { position: "bottom-right" });
            } else {
                setStoryBooks(res.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get story-books", { position: "bottom-right" });
        }
    }

    const handleCreateNewCommentChange = (e) => {
        setNewComment(e.target.value)
    }

    const handleEditCommentChange = (e) => {
        setEditComment(e.target.value)
    }

    const clearNewComment = (e) => {
        setNewComment('')
    }

    const editStoryBook = (storybook, index) => async (e) => {
        setIsEditStorybook(true);
        setSelectedStoryBook(storybook);
        setEditComment(storybook.comment)
    }

    const handleSaveEditStoryBook = (storybook, index) => async (e) => {
        saveEditStoryBook(storybook, index)
    }

    const handleDeleteStoryBook = (storybook, index) => async (e) => {
        storybook.index = index;
        setSelectedStoryBook(storybook);
        setOpenDeleteModal(true);
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setSelectedStoryBook('');
    }

    const sendStoryBook = (storybook, index) => async (e) => {
        setOpenEmailModal(true);
        storybook.index = index;
        setSelectedStoryBook(storybook);
    }

    const handleCloseEmailModal = (e) => {
        setOpenEmailModal(false)
    }

    const cancelEditStoryBook = (storybook, index) => async (e) => {
        setIsEditStorybook(false);
        setSelectedStoryBook('');
        setEditComment('')
    }

    const handleChangeEmail = (e) => {
        setEmail(e.target.value);
    };




    const createNewStoryBook = async () => {
        try {
            setIsLoadingComponent(true)
            await new Promise(resolve => setTimeout(resolve, 1000));
            const payload = {
                comment: newComment,
                projectID: props.selectedProjectDetails.project._id
            }
            const res = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/story-book`, payload, { withCredentials: true });
            if (res && res.data.statusCode !== 200) {
                toast.error("Failed create new story-book", { position: "bottom-right" });
            } else {
                const newArray = [res.data.data];
                setStoryBooks([...newArray, ...storyBooks]);
                clearNewComment();
            }
            setIsLoadingComponent(false)

        } catch (ex) {
            setIsLoadingComponent(false)
            toast.error("Failed create new story-book", { position: "bottom-right" });
        }
    }

    const deleteStoryBook = async () => {
        try {
            const res = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/entity/story-book/${selectedStoryBook._id}`, { withCredentials: true });
            if (res && res.data.statusCode !== 200) {
                toast.error("Failed delete story-book", { position: "bottom-right" });
            } else {
                const newArrayOfStorybook = [...storyBooks];
                newArrayOfStorybook.splice(selectedStoryBook.index, 1)
                setStoryBooks(newArrayOfStorybook);
            }
            handleCloseDeleteModal()
        } catch (ex) {
            handleCloseDeleteModal()
            toast.error("Failed to delete story-book", { position: "bottom-right" });
        }
    }


    const saveEditStoryBook = async (storybook, index) => {
        try {
            const payload = {
                comment: editComment || storybook.comment,
            }
            if (storybook.isEmailSent) payload.isEmailSent = true;
            const res = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/story-book/${storybook._id}`, payload, { withCredentials: true });
            if (res && res.data.statusCode !== 200) {
                toast.error("Failed update story-book", { position: "bottom-right" });
            } else {
                const newArrayOfStorybook = [...storyBooks];
                newArrayOfStorybook[index].comment = payload.comment;
                if (payload.isEmailSent) newArrayOfStorybook[index].isEmailSent = true;
                setStoryBooks(newArrayOfStorybook);
            }
            setIsEditStorybook(false);
            setSelectedStoryBook('');
            setEditComment('')
        } catch (ex) {
            setIsEditStorybook(false);
            setSelectedStoryBook('');
            setEditComment('')
            toast.error("Failed to update story-book", { position: "bottom-right" });
        }
    }


    const validateEmailRecivers = (emailRecivers) => {
        const arrayOfRecivers = emailRecivers.split(',')
        for (const reciver of arrayOfRecivers) {
            if (!isEmailValidate(reciver.trim())) {
                return false
            }
        }
        return true
    }

    const handleSendEmailModal = async () => {
        try {
            if (!email) {
                toast.error("Email cannot be empty", { position: "bottom-right" });
                return;
            }
            if (!validateEmailRecivers(email)) {
                toast.error("Email is not valid", { position: "bottom-right" });
                return;
            }
            setOpenEmailModal(false);
            setIsLoading(true);
            const payload = {
                to: email,
                subject: `Storybook Notification - Project: ${props.selectedProjectDetails.project.name}  DC:${localStorage.getItem('datacenter').toUpperCase()}`,
                body: selectedStoryBook.comment
            }
            const res = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/config/mail`, payload, { withCredentials: true });
            if (res && res.data.statusCode !== 200) {
                toast.error("Failed to send Email", { position: "bottom-right" });
            } else {
                toast.success("Email send successfully", { position: "bottom-right" });
                selectedStoryBook.isEmailSent = true;
                saveEditStoryBook(selectedStoryBook, selectedStoryBook.index)
            }
            setEmail('')
            setSelectedStoryBook('');
            setIsLoading(false);
        } catch (ex) {
            setEmail('')
            setSelectedStoryBook('');
            setOpenEmailModal(false);
            setIsLoading(false);
            toast.error("Failed to send Email", { position: "bottom-right" });
        }
    }

    const countLines = (text) => {
        return text ? (text.match(/^[ \t]*$/gm) || []).length : 0;
    }

    const emailModal = <Dialog disableBackdropClick={true} fullWidth open={openEmailModal} onClose={handleCloseEmailModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Storybook Email Notification</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Send Storybook via Email
            </DialogContentText>
            <TextField type="email" label='User1@example.com,User2@example.com' margin="dense" fullWidth autoFocus value={email} onChange={handleChangeEmail} />
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseEmailModal} color="primary">Close</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSendEmailModal} color="primary">Send</Button>
        </DialogActions>
    </Dialog>

    const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openDeleteModal} onClose={handleCloseDeleteModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Delete Storybook</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete Storybook?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={deleteStoryBook} color="primary">Yes</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseDeleteModal} color="primary">No</Button>
        </DialogActions>
    </Dialog>



    return (
        <div style={{ width: '100%', backgroundColor: '#E0E0E0' }}>
            <VerticalTimeline>
                <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date=""
                    iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                    icon={<AddIcon />}
                >
                    <div>
                        <div>
                            {
                                isLoadingComponent ?
                                    <div style={{ width: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <GridLoader color={'rgb(0, 112, 185)'} loading={true} css={{ "margin-right": '7px' }} size={20} />
                                    </div> :
                                    <TextField
                                        style={{ width: '100%' }}
                                        id="outlined-multiline-static"
                                        label="Add Storybook..."
                                        multiline
                                        rows={4}
                                        value={newComment}
                                        variant="outlined"
                                        type="submit"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                createNewStoryBook();
                                                clearNewComment();
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={handleCreateNewCommentChange}
                                    />
                            }
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                            <Button
                                style={{
                                    color: 'rgb(0, 112, 185)',
                                    marginTop: 10,
                                    backgroundColor: !newComment ? '#fff' : '#dfdfdf'
                                }}
                                disabled={!newComment ? true : false}
                                variant="outlined"
                                onClick={clearNewComment}
                                startIcon={<ClearIcon />}
                                color="primary" >
                                Clear
                            </Button>
                            <Button
                                style={{
                                    color: 'rgb(0, 112, 185)',
                                    marginTop: 10,
                                    marginRight: 5,
                                    backgroundColor: !newComment ? '#fff' : '#dfdfdf'
                                }}
                                disabled={!newComment ? true : false}
                                variant="outlined"
                                onClick={createNewStoryBook}
                                startIcon={<SaveIcon />}
                                color="primary" >
                                Add
                            </Button>
                        </div>
                    </div>
                </VerticalTimelineElement>
                {
                    storyBooks && Array.isArray(storyBooks) && storyBooks.length > 0 && storyBooks.map((storybook, i) => (
                        <VerticalTimelineElement
                            className="vertical-timeline-element--work"
                            date={getLocalDateTime(storybook.createdDate)}
                            iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                            icon={<RateReviewIcon />}
                        >
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 className="vertical-timeline-element-title">{titleCase(storybook.createdBy)}</h3>
                                </div>
                                {
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {
                                            isEditStorybook && selectedStoryBook._id === storybook._id ?
                                                localStorage.getItem('username') === storybook.createdBy &&
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    <Tooltip title={'Save'} onClick={handleSaveEditStoryBook(storybook, i)} >
                                                        <IconButton >
                                                            <SaveIcon style={{ fontSize: 20 }} aria-controls="simple-menu"  >
                                                            </SaveIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={'Cancel'} onClick={cancelEditStoryBook(storybook, i)} >
                                                        <IconButton >
                                                            <ClearIcon style={{ fontSize: 20 }} aria-controls="simple-menu"  >
                                                            </ClearIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                                :
                                                localStorage.getItem('username') === storybook.createdBy &&
                                                <Tooltip title={'Edit'} onClick={editStoryBook(storybook, i)} >
                                                    <IconButton >
                                                        <EditIcon style={{ fontSize: 20 }} aria-controls="simple-menu"  >
                                                        </EditIcon>
                                                    </IconButton>
                                                </Tooltip>
                                        }
                                        {
                                            !isEditStorybook &&
                                            localStorage.getItem('username') === storybook.createdBy && <div>
                                                <Tooltip title={'Delete'} >
                                                    <IconButton onClick={handleDeleteStoryBook(storybook, i)} >
                                                        <DeleteIcon style={{ fontSize: 20 }} aria-controls="simple-menu"  >
                                                        </DeleteIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        }
                                        {
                                            !isEditStorybook && <Tooltip title={'Send Storybook notification'} >
                                                <IconButton onClick={sendStoryBook(storybook, i)} >
                                                    {
                                                        storybook.isEmailSent ?
                                                            <Badge color="primary" variant="dot">
                                                                <EmailIcon style={{ fontSize: 20 }} aria-controls="simple-menu"  >
                                                                </EmailIcon>
                                                            </Badge>

                                                            :
                                                            <EmailIcon style={{ fontSize: 20 }} aria-controls="simple-menu"  >
                                                            </EmailIcon>
                                                    }

                                                </IconButton>
                                            </Tooltip>
                                        }

                                    </div>
                                }
                            </div>
                            {
                                selectedStoryBook._id === storybook._id && isEditStorybook ?
                                    <div>
                                        <br></br>
                                        <TextField
                                            style={{ width: '100%' }}
                                            id="outlined-multiline-static"
                                            label="Edit Storybook..."
                                            multiline
                                            rows={4}
                                            value={editComment}
                                            variant="outlined"
                                            type="submit"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    saveEditStoryBook(storybook, i)
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={handleEditCommentChange}
                                        />
                                    </div>
                                    :
                                    storybook.comment.length > 1200 || countLines(storybook.comment) > 20 ?
                                        <p style={{ overflowY: 'scroll', position: 'relative', height: 500, overflowWrap: 'break-word', whiteSpace: 'break-spaces' }}>
                                            {storybook.comment}
                                        </p>
                                        :
                                        <p style={{ overflowWrap: 'break-word', whiteSpace: 'break-spaces' }}>
                                            {storybook.comment}
                                        </p>
                            }

                        </VerticalTimelineElement>
                    ))
                }
            </VerticalTimeline>
            <Loader isLoading={isLoading}></Loader>
            {emailModal}
            {deleteModal}
            <ToastContainer />
        </div>
    )
}
export default StoryBookChart;
