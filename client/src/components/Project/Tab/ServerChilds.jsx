import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { List, ListItem, Avatar, ListItemText } from '@material-ui/core';
import ExpandLess from "@material-ui/icons/ExpandLess";
import Typography from "@material-ui/core/Typography";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import DnsIcon from '@material-ui/icons/Dns';
import DirectionsIcon from '@material-ui/icons/Directions';
import ComputerIcon from '@material-ui/icons/Computer';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    divDetails: {
        color: '#545b64', fontWeight: 500
    }

}));

const ServerChilds = (props) => {

    const classes = useStyles();
    const history = useHistory();
    const [openServerExpend, setOpenServerExpend] = useState({})

    const handleClick = (param) => {
        setOpenServerExpend((prevState) => { return { ...prevState, [param]: !prevState[param] } })
    };

    const statusCheckSwitch = (statusCheck, isTextResponse = false) => {
        if (statusCheck === 'Running') {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(75, 210, 143)', fontWeight: 'bold' }}>Running</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} positive pulse></status-indicator></span>
            </span>

        }
        if (statusCheck === 'Unstable') {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(255, 170, 0)', fontWeight: 'bold' }}>Unstable</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} intermediary pulse></status-indicator></span>
            </span>
        }
        if (statusCheck === 'Stopped') {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold' }}>Stopped</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} negative pulse></status-indicator></span>
            </span>
        }
        else {
            if (isTextResponse) return <span>
                <span style={{ color: 'rgb(0, 0, 0)', fontWeight: 'bold' }}>Pending</span>
                <span><status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} inprogress pulse></status-indicator></span>
            </span>
        }
    }


    const serversDetails = props.nestedServers ? <div>
        {
            props.nestedServers.map((nestedObj, key) => {
                return (
                    <div key={nestedObj.hostgroup}>
                        <ListItem button onClick={() => handleClick(nestedObj.hostgroup)} divider={key < props.nestedServers.length - 1}>
                            <ListItemText primary={<Typography type="body2" style={{ fontWeight: 'bold' }}>{nestedObj.hostgroup}</Typography>} />
                            {openServerExpend[nestedObj.hostgroup] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openServerExpend[nestedObj.hostgroup]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {nestedObj.servers.map((server, index) => (
                                    <Card className={classes.root} variant="outlined">
                                        <CardContent>
                                            <ListItem key={index}>
                                                <Avatar>{server.name.includes('vl') ? <DnsIcon /> : <ComputerIcon />}</Avatar>
                                                <div>
                                                    <ListItemText style={{ marginLeft: 15 }}
                                                        primary={server.name}
                                                    />
                                                    <div style={{ marginLeft: 15 }}>
                                                        <div>IP Address: {server.ip_address}</div>
                                                        <div>
                                                            Server ID:
                                                            <span>
                                                                <Link onClick={() => history.push(`/servers`, { project: props.selectedProjectDetails.project.name, server: server.id, type: 'id' })}
                                                                    style={{ cursor: 'pointer' }}> {server.id}
                                                                </Link>
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span>Status:</span> {statusCheckSwitch(server?.statusCheck?.generalStatus, true)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListItem>
                                        </CardContent>
                                    </Card>
                                ))}
                            </List>
                        </Collapse>
                    </div>
                )
            })
        }
    </div> : null

    const goToServerLink = props.nestedServers && props.nestedServers.length > 0 ? <div>
        <div style={{ marginLeft: 10, marginBottom: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap',fontSize: 18,fontWeight:500}}>
                <DirectionsIcon />
                <span style={{ marginLeft: 5 }}>
                    <Link onClick={() => history.push(`/servers`, { project: props.selectedProjectDetails.project.name, type: 'projectName' })}
                        style={{ cursor: 'pointer' }}> Go To Servers
                    </Link>
                </span>
            </div>
        </div>
    </div> : null


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {goToServerLink}
            {serversDetails}
        </div>
    )
}
export default ServerChilds;
