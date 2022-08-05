import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';



const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const PodsStatusTab = (props) => {

    useEffect(() => {
    }, [props.deploymentMetadata]);


    const classes = useStyles();


    const deploymentsDetailsTab = props.deploymentMetadata ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Pods:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <div>
                <span className={classes.divDetails}>Running: {props.deploymentMetadata?.pods?.running}</span>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Succeeded: {props.deploymentMetadata?.pods?.succeeded}</span>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Failed: {props.deploymentMetadata?.pods?.failed}</span>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Pending: {props.deploymentMetadata?.pods?.pending}</span>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Current: {props.deploymentMetadata?.pods?.current}</span>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Desired: {props.deploymentMetadata?.pods?.desired}</span>
            </div>
        </div> : null


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {deploymentsDetailsTab}
        </div>
    )
}
export default PodsStatusTab;
