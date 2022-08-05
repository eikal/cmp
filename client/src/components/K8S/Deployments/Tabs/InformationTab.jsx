import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';



const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const InformationTab = (props) => {

    useEffect(() => {
    }, [props.deploymentMetadata]);


    const classes = useStyles();


    const deploymentsDetailsTab = props.deploymentMetadata ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Resource Information:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <div>
                <span className={classes.divDetails}>Strategy:</span>
                <div >{props.deploymentMetadata.strategy}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Min ready seconds:</span>
                <div >{props.deploymentMetadata.minReadySeconds}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Revision history limit:</span>
                <div >{props.deploymentMetadata.revisionHistoryLimit}</div>
            </div>
            <br></br>
            <span className={classes.divDetails}>Selector:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.deploymentMetadata.selector ?
                        Object.keys(props.deploymentMetadata.selector).map(key =>
                            <Chip label={`${key}:${props.deploymentMetadata.selector[key]}`} />
                        ) : null
                }
            </div>
        </div> : null


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {deploymentsDetailsTab}
        </div>
    )
}
export default InformationTab;
