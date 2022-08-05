import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { Divider } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const ReplicaSetTab = (props) => {

    useEffect(() => {
    }, [props.deploymentMetadata]);



    const classes = useStyles();


    const detailsTab = props.deploymentMetadata?.replicaset?.objectMeta ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}> New Replica Set:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <div>
                <span className={classes.divDetails}>Name:</span>
                <div >{props.deploymentMetadata.replicaset.objectMeta.name}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Namespace:</span>
                <div >{props.deploymentMetadata.replicaset.objectMeta.namespace}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Created:</span>
                <div >{props.deploymentMetadata.replicaset.objectMeta.creationTimestamp}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Pods:</span>
                <div >{props.deploymentMetadata.replicaset?.podInfo?.running}/{props.deploymentMetadata.replicaset?.podInfo?.desired}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Uid:</span>
                <div >{props.deploymentMetadata.replicaset.objectMeta.uid}</div>
            </div>
            <br></br>
            <span className={classes.divDetails}>Labels:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.deploymentMetadata.replicaset.objectMeta.labels ?
                        Object.keys(props.deploymentMetadata.replicaset.objectMeta.labels).map(key =>
                            <Chip label={`${key}:${props.deploymentMetadata.replicaset.objectMeta.labels[key]}`} />
                        ) : null
                }
            </div>
            <br></br>
            <span className={classes.divDetails}>Images:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.deploymentMetadata.replicaset.containerImages?
                    props.deploymentMetadata.replicaset.containerImages.map(key =>
                        <Chip
                            label={`${key}`}
                        />
                    ): null
                }
            </div>
            <br></br>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.deploymentMetadata.replicaset.initContainerImages?
                    props.deploymentMetadata.replicaset.initContainerImages.map(key =>
                        <Chip
                            label={`${key}`}
                        />
                    ):null
                }
            </div>
        </div> : null

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {detailsTab}
        </div>


    )
}
export default ReplicaSetTab;
