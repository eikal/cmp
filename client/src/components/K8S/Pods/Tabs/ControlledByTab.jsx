import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { Divider } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const ControlledByTab = (props) => {

    useEffect(() => {
    }, [props.podMetadata]);


    const classes = useStyles();


    const podsDetailsTab = props.podMetadata ?
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Controlled By:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <div>
                <span className={classes.divDetails}>Name:</span>
                <div >{props.podMetadata.controller.objectMeta.name}</div>
            </div>
            <br></br>
            <span className={classes.divDetails}>Labels:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    Object.keys(props.podMetadata.controller.objectMeta.labels).map(key =>
                        <Chip
                            label={`${key}:${props.podMetadata.controller.objectMeta.labels[key]}`}
                        />
                    )
                }
            </div>
            <span className={classes.divDetails}>Images:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {
                    props.podMetadata.controller.containerImages.map(key =>
                        <Chip
                            label={`${key}`}
                        />
                    )
                }
            </div>
        </div> : null



    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {podsDetailsTab}
        </div>


    )
}
export default ControlledByTab;
