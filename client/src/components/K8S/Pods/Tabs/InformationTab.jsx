import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const InformationTab = (props) => {

    useEffect(() => {
    }, [props.podMetadata]);


    const classes = useStyles();


    const podsDetailsTab = props.podMetadata ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Resource Information:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <div>
                <span className={classes.divDetails}>Node:</span>
                <div >{props.podMetadata.nodeName}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Node Status:</span>
                <div >{props.podMetadata.podPhase}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>IP:</span>
                <div >{props.podMetadata.podIP}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>QoS Class:</span>
                <div >{props.podMetadata.qosClass}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Restarts:</span>
                <div >{props.podMetadata.restartCount}</div>
            </div>
        </div> : null


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {podsDetailsTab}
        </div>
    )
}
export default InformationTab;
