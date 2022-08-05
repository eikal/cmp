import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import { List, ListItem, Avatar, ListItemText, Divider } from '@material-ui/core';
import { getLocalDateTime } from '../../../helpers/date.js';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060'
    }
}));

const DetailsTab = (props) => {

    useEffect(() => {
        setIsInvestigationCenterInEditMode(false);
        setInvestigationCenterURL(false)
    }, [props.serverDetails]);

    const history = useHistory();
    const classes = useStyles();
    const [isInvestigationCenterInEditMode, setIsInvestigationCenterInEditMode] = useState(false);
    const [investigationCenterURL, setInvestigationCenterURL] = useState('');

    const statusCheckSwitch = (statusCheck, isTextResponse = false) => {
        if (statusCheck === 'Running') {
            if (isTextResponse) return <span style={{ color: 'rgb(75, 210, 143)', fontWeight: 'bold' }}>Running</span>;
            return <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} positive pulse></status-indicator>
        }
        if (statusCheck === 'Unstable') {
            if (isTextResponse) return <span style={{ color: 'rgb(255, 170, 0)', fontWeight: 'bold' }}>Unstable</span>;
            return <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} intermediary pulse></status-indicator>
        }
        if (statusCheck === 'Stopped') {
            if (isTextResponse) return <span style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold' }}>Stopped</span>
            return <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} negative pulse></status-indicator>
        }
        else {
            if (isTextResponse) return <span style={{ color: 'rgb(0, 0, 0)', fontWeight: 'bold' }}>Pending</span>
            return <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} inprogress pulse></status-indicator>
        }
    }


    const handleChangeIcURL = (e) => {
        setInvestigationCenterURL(e.target.value);
    };

    const handleSaveIcUrl = async () => {
        try {
            const updateIcUrl = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/server/${props.serverDetails._id}`,
                { investigationCenterURL: investigationCenterURL },
                { withCredentials: true }
            );
            if (updateIcUrl.data.statusCode === 200) {
                toast.success("Investigation URL has been updated", { position: "bottom-right" });
                setInvestigationCenterURL('');
                setIsInvestigationCenterInEditMode(false);
                props.updateServerDetails(updateIcUrl.data.data);
            } else {
                toast.error("Failed to update Investigation URL", { position: "bottom-right" });
            }
        } catch (ex) {
            toast.error("Failed to update Investigation URL", { position: "bottom-right" });
        }
    }

    const serverDetailsTab = props.serverDetails ?
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '50%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Server Details:</div>
                <Divider style={{ marginBottom: 20 }}></Divider>
                <div>
                    <span className={classes.divDetails}>Server:</span>
                    <div >{props.serverDetails.fullHostname}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Server ID:</span>
                    <div >{props.serverDetails._id}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>IP Address:</span>
                    <div >{props.serverDetails.ip_address}</div>
                </div>
                <br></br>
                {
                    props.serverDetails.investigationCenterURL || ['cfrm', 'app', 'standalone', 'frontend', 'backend'].includes(props.serverDetails.bt_role) ?
                        <div>
                            <div>
                                <span className={classes.divDetails}>
                                    {
                                        isInvestigationCenterInEditMode ?
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                Investigation Center:
                                                <IconButton size="small" aria-controls="simple-menu" aria-haspopup="true" onClick={handleSaveIcUrl}>
                                                    <SaveIcon aria-controls="simple-menu" >
                                                    </SaveIcon>
                                                </IconButton>
                                                <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={() => setIsInvestigationCenterInEditMode(false)}>
                                                    <ClearIcon aria-controls="simple-menu" >
                                                    </ClearIcon>
                                                </IconButton>
                                            </div>

                                            :
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                Investigation Center:
                                                <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={() => setIsInvestigationCenterInEditMode(!isInvestigationCenterInEditMode)}>
                                                    <EditIcon aria-controls="simple-menu" >
                                                    </EditIcon>
                                                </IconButton>
                                            </div>

                                    }
                                </span>
                                <div>
                                    {
                                        isInvestigationCenterInEditMode ?
                                            <TextField
                                                style={{ width: '60%' }}
                                                value={investigationCenterURL || props.serverDetails.investigationCenterURL || `https://${props.serverDetails.fullHostname}:7780/InvestigationCenter`}
                                                onChange={handleChangeIcURL}
                                            >
                                            </TextField>
                                            :
                                            props.serverDetails.investigationCenterURL ?
                                                <Link target="_blank" rel="noopener noreferrer" href={props.serverDetails.investigationCenterURL}>
                                                    {props.serverDetails.investigationCenterURL}
                                                </Link>
                                                :
                                                <Link target="_blank" rel="noopener noreferrer" href={`https://${props.serverDetails.fullHostname}:7780/InvestigationCenter`}>
                                                    {`https://${props.serverDetails.fullHostname}:7780/InvestigationCenter`}
                                                </Link>

                                    }
                                </div>
                            </div>
                            <br></br>
                        </div>
                        : null
                }
                <div>
                    <span className={classes.divDetails}>Alias:</span>
                    <div >{props.serverDetails.alias}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Created Date:</span>
                    <div >{getLocalDateTime(props.serverDetails.createdDate)}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Created By:</span>
                    <div >{props.serverDetails.createdBy}</div>
                </div>
                <br></br>
                <div>
                    <span className={classes.divDetails}>Status:</span>
                    <div >{statusCheckSwitch(props?.serverDetails?.statusCheck?.generalStatus, true)}</div>
                </div>
            </div>

            <div style={{ width: '50%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Related:</div>
                <Divider style={{ marginBottom: 20 }}></Divider>
                <List >
                    <ListItem style={{ paddingLeft: 0 }} key={props.serverDetails.projectID}>
                        <Avatar>{props.serverDetails.projectName.split('')[0].toUpperCase() + props.serverDetails.projectName.split('')[1].toUpperCase()}</Avatar>
                        <div>
                            <ListItemText style={{ marginLeft: 15 }}
                                primary={`Project Name: ${props.serverDetails.projectName}`}
                            />
                            <div style={{ marginLeft: 15 }}>
                                <div>Project ID:
                                    <span>
                                        <Link onClick={() => history.push(`/projects`, { projectID: props.serverDetails.projectID })}
                                            style={{ cursor: 'pointer' }}> {props.serverDetails.projectID}
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ListItem>
                    <ListItem style={{ paddingLeft: 0 }} key={props.serverDetails.tierID}>
                        <Avatar variant="square">{props.serverDetails.tierName.split('')[0].toUpperCase() + props.serverDetails.tierName.split('')[1].toUpperCase()}</Avatar>
                        <div >
                            <ListItemText style={{ marginLeft: 15 }}
                                primary={`Tier Name: ${props.serverDetails.tierName}`}
                            />
                            <div style={{ marginLeft: 15 }}>
                                <div> Tier ID:
                                    <span>
                                        <Link onClick={() => history.push(`/tiers`, { tierID: props.serverDetails.tierID })}
                                            style={{ cursor: 'pointer' }}> {props.serverDetails.tierID}
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ListItem>
                </List >
            </div>
            <ToastContainer></ToastContainer>
        </div> : null

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {serverDetailsTab}
        </div>
    )
}
export default DetailsTab;
