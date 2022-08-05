import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import { getLocalDateTime } from '../../../helpers/date.js';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    divDetails: {
        color: '#545b64', fontWeight: 500
    }
}));

const DetailsTab = (props) => {
    const classes = useStyles();

    const projectDetails = props.selectedProjectDetails ?
        <div>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Project Details:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>
            <div>
                <span className={classes.divDetails}>Project Name:</span>
                <div >{props.selectedProjectDetails.project.name}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Project ID:</span>
                <div >{props.selectedProjectDetails.project._id}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Project Description:</span>
                <div >{props.selectedProjectDetails.project.description}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Project Solution Type:</span>
                <div >{props.selectedProjectDetails.project.solution}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Created Date:</span>
                <div >{getLocalDateTime(props.selectedProjectDetails.project.createdDate)}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Created By:</span>
                <div >{props.selectedProjectDetails.project.createdBy}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Domain:</span>
                <div >{props.selectedProjectDetails.project.domain}</div>
            </div>
        </div> : null

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {projectDetails}
        </div>
    )
}
export default DetailsTab;
