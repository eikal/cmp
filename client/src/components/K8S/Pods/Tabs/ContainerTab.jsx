import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {  ListItem, ListItemText } from '@material-ui/core';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ExpandLess from "@material-ui/icons/ExpandLess";
import Typography from "@material-ui/core/Typography";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";


const useStyles = makeStyles((theme) => ({
    divDetails: {
        color: '#606060', fontWeight: 500
    }
}));

const ContainerTab = (props) => {

    const [openContainerExpend, setOpenContainerExpend] = useState({})
    const classes = useStyles();

    useEffect(() => {
    }, [props.podMetadata]);


    const handleClick = (param) => {
        setOpenContainerExpend((prevState) => { return { ...prevState, [param]: !prevState[param] } })
    };


    const containers = props.podMetadata?.containers && props.podMetadata?.containers.length > 0 ? <div>
        {
            props.podMetadata?.containers.map((nestedObj, key) => {
                return (
                    <div key={nestedObj.hostgroup}>
                        <ListItem button onClick={() => handleClick(nestedObj.name)} divider={key < props.podMetadata?.containers.length - 1}>
                            <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>{nestedObj.name}</Typography>} />
                            {openContainerExpend[nestedObj.name] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openContainerExpend[nestedObj.name]} timeout="auto" unmountOnExit>

                            <Card className={classes.root} variant="outlined">
                                <CardContent>
                                    <div>
                                        <span className={classes.divDetails}>Image:</span>
                                        <Typography variant="body1" >{nestedObj.image}</Typography>
                                        
                                    </div>
                                    <br></br>
                                    <span className={classes.divDetails}>Arguments:</span>
                                    {nestedObj && nestedObj.env.map((elm, index) => (
                                        <div>
                                            <Typography variant="body1" >{elm.name}:{elm.value}</Typography>

                                        </div>
                                    ))
                                    }
                                </CardContent>
                            </Card>

                        </Collapse>
                    </div>
                )
            })
        }
    </div> : <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        There is nothing to display here , No resources found
    </div>


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {containers}
        </div>


    )
}
export default ContainerTab;
