import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { Divider } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const MetadataTab = (props) => {

    useEffect(() => {
    }, [props.genericMetadata]);


    const classes = useStyles();


    const detailsTab = props.genericMetadata ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Metadata:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <div>
                <span className={classes.divDetails}>Name:</span>
                <div >{props.genericMetadata.objectMeta.name}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Namespace:</span>
                <div >{props.genericMetadata.objectMeta.namespace}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Created:</span>
                <div >{props.genericMetadata.objectMeta.creationTimestamp}</div>
            </div>
            <br></br>
            <div>
                <span className={classes.divDetails}>Uid:</span>
                <div >{props.genericMetadata.objectMeta.uid}</div>
            </div>
            <br></br>
            <span className={classes.divDetails}>Labels:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.genericMetadata.objectMeta.labels?
                    Object.keys(props.genericMetadata.objectMeta.labels).map(key =>
                        <Chip label={`${key}:${props.genericMetadata.objectMeta.labels[key]}`}/>
                    ):null
                }
            </div>
            <br></br>
            <span className={classes.divDetails}>Annotations:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.genericMetadata.objectMeta.annotations?
                    Object.keys(props.genericMetadata.objectMeta.annotations).map(key =>
                        <Chip key={key} label={`${key}:${props.genericMetadata.objectMeta.annotations[key]}`}/>
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
export default MetadataTab;
