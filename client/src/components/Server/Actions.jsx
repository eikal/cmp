import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ReplayIcon from '@material-ui/icons/Replay';
import UpdateIcon from '@material-ui/icons/Update';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import StopIcon from '@material-ui/icons/Stop';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CodeIcon from '@material-ui/icons/Code';
import CategoryIcon from '@material-ui/icons/Category';
import InfoIcon from '@material-ui/icons/Info';
import SettingsIcon from '@material-ui/icons/Settings';
import DescriptionIcon from '@material-ui/icons/Description';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import ComputerIcon from '@material-ui/icons/Computer';
import ShareIcon from '@material-ui/icons/Share';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import DnsIcon from '@material-ui/icons/Dns';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { PUPPET_FACTS } from '../../config/actions/default-path.js';
import { isBasicUser } from '../../helpers/auth.js';


const Actions = (props) => {

    const useStyles = makeStyles((theme) => ({
        nested: {
            paddingLeft: theme.spacing(4),
        },
        childNested: {
            paddingLeft: theme.spacing(8),
        }
    }));

    const [openSystemExpend, setOpenSystemExpend] = useState(false);
    const [openPuppetExpend, setOpenPuppetExpend] = useState(false);
    const [openCustomActionsExpend, setOpenCustomActionsExpend] = useState(false);
    const [openCustomActionsRelation, setOpenCustomActionsRelation] = useState({})
    const [openCommandsExpend, setOpenCommandsExpend] = useState(false);
    const [isSshCommandOpenModal, setIsSshCommandOpenModal] = useState(false);
    const [isPuppetEnableDisableOpenModal, setIsPuppetEnableDisableOpenModal] = useState(false);
    const [puppetActionObject, setPuppetActionObject] = useState(null);
    const [sshCommand, setSshCommand] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [headerConfirmationModal, setHeaderConfirmationModal] = useState(false);
    const [contentConfirmationModal, setContentConfirmationModal] = useState(false);
    const [action, setAction] = useState(null);
    const classes = useStyles();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const fillPuppetMessageReason = (e) => {
        const message = e.target.value;
        const puppetObj = puppetActionObject;
        puppetObj.message = message;
        setPuppetActionObject(puppetObj);
    }

    const handleClose = () => {
        setAnchorEl(false);
        setOpenSystemExpend(false);
        setOpenCommandsExpend(false);
        setOpenPuppetExpend(false);
        setOpenCustomActionsExpend(false);
        setOpenCustomActionsRelation({});

    };

    const handleClickSystemExpend = (e) => {
        setOpenSystemExpend(!openSystemExpend);
        if (!openSystemExpend) {
            setOpenCommandsExpend(false);
            setOpenCustomActionsExpend(false);
            setOpenCustomActionsRelation({});
        }
    };


    const handleClickPuppetExpend = (e) => {
        setOpenPuppetExpend(!openPuppetExpend)
    }

    const handleExecutePuppetAction = (e) => {
        let command = `sudo puppet agent --${puppetActionObject.action} "${puppetActionObject.message}. disabled by ${localStorage.getItem('username')} on ${new Date().toLocaleString()}"`
        if (puppetActionObject.action === 'enable') {
            command = 'sudo puppet agent --enable'
        }
        props.executeAction(puppetActionObject.command, puppetActionObject.labelCommand, command, false);
        setIsPuppetEnableDisableOpenModal(false);
        handleClose();
        setPuppetActionObject(null)
    }


    const handleClickCustomActionsExpend = (e) => {
        setOpenCustomActionsExpend(!openCustomActionsExpend);
        if (!openCustomActionsExpend) {
            setOpenSystemExpend(false);
            setOpenCommandsExpend(false);
            setOpenPuppetExpend(false);


        }
    };

    const handleClickCustomActionsRealtionExpend = (customAction) => (e) => {
        if (openCustomActionsRelation.name === customAction.name) {
            setOpenCustomActionsRelation({})
        } else {
            setOpenCustomActionsRelation({
                name: customAction.name,
                index: null
            })
        }
    };

    const handleClickCustomActionsRealtionCategoryExpend = (actionCategory) => (e) => {
        if (openCustomActionsRelation.index === actionCategory.name) {
            const name = openCustomActionsRelation.name;
            setOpenCustomActionsRelation({
                name: name,
                index: null
            });
        } else {
            const name = openCustomActionsRelation.name;
            const index = actionCategory.name;
            setOpenCustomActionsRelation({
                name: name,
                index: index
            })
        }
    }

    const isProjectEqual = (projectName) => {
        if (!projectName) {
            return true;
        }
        if (props.selectedServers.length === 0) {
            return true;
        }
        const projects = props.selectedServers.map((server) => server.projectName)
        let uniqueProjects = [...new Set(projects)];
        if (uniqueProjects.length === 1) {
            if (props.selectedServers.length > 1) {
                if (projectName === uniqueProjects[0]) {
                    return true;
                }
            }
            if (projectName === uniqueProjects[0]) {
                return false;
            }
            return true;
        }
        if (uniqueProjects.length > 1) {
            if (uniqueProjects.includes(projectName)) {
                return false;
            }
        }
        return true;
    }

    const isProjectEqualToServerProjects = (projectName) => {
        const projects = props.selectedServers.map((server) => server?.projectName)
        let uniqueProjects = [...new Set(projects)];
        if (uniqueProjects.length === 1) {
            if (projectName === uniqueProjects[0]) {
                return true;
            }
            return false
        }
        if (uniqueProjects.includes(projectName)) {
            return true;
        }
        return false;
    }

    const isBtRoleEqual = (category) => {
        if (props.selectedServers.length === 0) {
            return true;
        }
        const btRoles = props.selectedServers.map((server) => server.bt_role)
        let uniqueRoles = [...new Set(btRoles)];
        if (uniqueRoles.length === 1) {
            for (const role of category.bt_role) {
                if (role === uniqueRoles[0]) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    const handleClickCommandsExpend = (e) => {
        setOpenCommandsExpend(!openCommandsExpend);
        if (!openCommandsExpend) {
            setOpenSystemExpend(false);
            setOpenPuppetExpend(false);
            setOpenCustomActionsExpend(false);
            setOpenCustomActionsRelation({});
        }
    };

    const handleClickAction = (job, jobLabelName, params = null, isShowOutput = false) => async (e) => {
        handleClose();
        props.executeAction(job, jobLabelName, params, isShowOutput);
    };

    const handleConfirmationAction = () => {
        handleClose();
        props.executeAction(action[0], action[1], null, false);
        setOpenConfirmationModal(false);
    };

    const handleConfirmation = (job, header, contentText) => async (e) => {
        handleClose();
        setOpenConfirmationModal(true);
        setHeaderConfirmationModal(header);
        setContentConfirmationModal(contentText);
        setAction(job);
    };

    const handleCloseConfirmationModal = () => {
        setOpenConfirmationModal(false);
    };

    const openSshCommandModal = () => {
        handleClose();
        setIsSshCommandOpenModal(true);
    };

    const handleCloseSshCommandModal = () => {
        handleClose();
        setIsSshCommandOpenModal(false);
        setSshCommand(null);
    };

    const handleCloseEnableDisableModal = () => {
        handleClose();
        setPuppetActionObject(null);
        setIsPuppetEnableDisableOpenModal(false);
    }

    const handleExecuteSshCommandModal = () => {
        setIsSshCommandOpenModal(false);
        handleClose();
        props.executeAction('sshCommand', 'SSH Command', sshCommand, false);
        setSshCommand(null);
    };

    const onClickCustomAction = (action) => (e) => {
        if (action.type === 'sshCommand') {
            props.executeAction(action.name, action.displayName, action.value[0], false);
        }
        else {
            props.executeAction('fileView', action.displayName, action.value.toString(), true);
        }
        handleClose();
    }

    const fillSshCommand = (e) => {
        setSshCommand(e.target.value);
    };

    const handleClickPuppetDisableEnable = (action) => (e) => {
        if (action === 'disable') {
            setPuppetActionObject({
                action: "disable",
                message: null,
                command: 'puppetDisable',
                labelCommand: 'Puppet Disable'
            });
        } else {
            setPuppetActionObject({
                action: "enable",
                message: null,
                command: 'puppetEnable',
                labelCommand: 'Puppet Enable'
            });
        }
        setAnchorEl(false);
        setIsPuppetEnableDisableOpenModal(true);
    };

    const validateActionRoles = (roles) => {
        if (localStorage.getItem('role') === 'superAdmin') {
            return false;
        }
        if (roles.includes(localStorage.getItem('role'))) {
            return false;
        }
        return true;
    }

    const confirmationModal =
        <Dialog disableBackdropClick={false} fullWidth open={openConfirmationModal} onClose={handleCloseConfirmationModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Are you sure you want to {headerConfirmationModal}?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <span>Are you sure you want to {headerConfirmationModal} {contentConfirmationModal} on servers:</span>
                    <DialogContentText style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <List>
                            {props.selectedServers.map((value) => {
                                return (
                                    value?.fullHostname && <ListItem key={value.fullHostname}>
                                        <ListItemText primary={
                                            <b>{value ? value.fullHostname : null}</b>} />
                                    </ListItem>
                                );
                            })}
                            <ListItem />
                        </List>
                    </DialogContentText>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseConfirmationModal} color="primary">No</Button>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleConfirmationAction} color="primary">Yes</Button>
            </DialogActions>
        </Dialog >

    const sshCommandModal = <Dialog disableBackdropClick={true} fullWidth open={isSshCommandOpenModal} onClose={handleCloseSshCommandModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">SSH Command</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Enter your ssh command to execute on targets servers
            </DialogContentText>
            <TextField
                value={sshCommand}
                required
                autoFocus
                margin="dense"
                id="sshCommand"
                label="Command"
                type="string"
                fullWidth
                color='rgb(0, 112, 185)'
                onChange={fillSshCommand}
            />
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseSshCommandModal} color="primary">Cancel</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleExecuteSshCommandModal} color="primary">Execute</Button>
        </DialogActions>
    </Dialog>

    const enableDisablePuppetModal = <Dialog disableBackdropClick={true} fullWidth open={isPuppetEnableDisableOpenModal} onClose={handleCloseEnableDisableModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{puppetActionObject?.labelCommand}</DialogTitle>
        <DialogContent>
            {
                puppetActionObject?.action === 'enable' &&
                <div>
                    <DialogContentText>
                        Are you sure you want to Enable puppet agent?
                    </DialogContentText>
                </div>
            }
            {
                puppetActionObject?.action === 'disable' &&
                <div>
                    <DialogContentText>
                        Enter your message reason
                    </DialogContentText>
                    <TextField
                        value={puppetActionObject?.message}
                        required
                        autoFocus
                        margin="dense"
                        id="puppetReason"
                        label="Message"
                        type="string"
                        fullWidth
                        color='rgb(0, 112, 185)'
                        onChange={fillPuppetMessageReason}
                    />
                </div>
            }

        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseEnableDisableModal} color="primary">Cancel</Button>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleExecutePuppetAction} color="primary">Execute</Button>
        </DialogActions>
    </Dialog>

    return (
        <div>
            {confirmationModal}
            <Button disabled={props.disableActionsButtom} variant="contained" aria-controls="simple-menu"
                endIcon={<ExpandMore />} aria-haspopup="true" style={{ marginRight: 10 }} onClick={handleClick}>
                Actions
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        width: 400,
                        marginTop: 80,
                        maxHeight: '85%',
                        position: 'sticky'
                    }
                }}
            >
                <ListItem button key={'system'} onClick={handleClickSystemExpend}>
                    <ListItemText primary={"System"} />
                    {openSystemExpend ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openSystemExpend === true ? true : false} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem disabled={isBasicUser()} button key={'restartMachine'} onClick={handleConfirmation(['restartMachine', 'Restart Machine'], 'restart', 'machine')}>
                            <ListItemIcon><ReplayIcon /></ListItemIcon>
                            <ListItemText primary={'Restart Machine'} />
                        </ListItem>
                        <ListItem button key={'syslog'} onClick={handleClickAction('syslog', 'Syslog', null, true)}>
                            <ListItemIcon><DescriptionIcon /></ListItemIcon>
                            <ListItemText primary={'Syslog'} />
                        </ListItem>
                        <ListItem button key={'puppet'} onClick={handleClickPuppetExpend}>
                            <ListItemIcon><ShareIcon /></ListItemIcon>
                            <ListItemText primary={"Puppet"} />
                            {openPuppetExpend ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
                        </ListItem>
                        <Collapse in={openPuppetExpend} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem disabled={isBasicUser()} button key={'puppetUpdate'} onClick={handleClickAction('puppetUpdate', 'Puppet Update')} className={classes.nested}>
                                    <ListItemIcon><UpdateIcon /></ListItemIcon>
                                    <ListItemText primary={'Update'} />
                                </ListItem>
                                <ListItem button key={'puppetStatus'} onClick={handleClickAction('puppetStatus', 'Puppet Status', null, true)} className={classes.nested}>
                                    <ListItemIcon><InfoIcon /></ListItemIcon>
                                    <ListItemText primary={'Status'} />
                                </ListItem>
                                {enableDisablePuppetModal}
                                <ListItem disabled={isBasicUser()} button key={'puppetDisable'} onClick={handleClickPuppetDisableEnable('disable')} className={classes.nested}>
                                    <ListItemIcon><NotInterestedIcon /></ListItemIcon>
                                    <ListItemText primary={'Disable'} />
                                </ListItem>
                                <ListItem disabled={isBasicUser()} button key={'puppetEnable'} onClick={handleClickPuppetDisableEnable('enable')} className={classes.nested}>
                                    <ListItemIcon><PlayCircleOutlineIcon /></ListItemIcon>
                                    <ListItemText primary={'Enable'} />
                                </ListItem>
                                <ListItem button key={'puppetFacts'} onClick={() => {
                                    props.executeAction('fileView', 'Puppet Facts', PUPPET_FACTS.toString(), true)
                                    handleClose();
                                }} className={classes.nested}>
                                    <ListItemIcon><DescriptionIcon /></ListItemIcon>
                                    <ListItemText primary={'Facts'} />
                                </ListItem>
                            </List>
                        </Collapse>
                    </List>
                </Collapse>

                <ListItem button key={'commands'} onClick={handleClickCommandsExpend}>
                    <ListItemText primary={"Commands"} />
                    {openCommandsExpend ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openCommandsExpend} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem disabled={isBasicUser()} button key={'sshCommand'} onClick={openSshCommandModal}>
                            <ListItemIcon><DnsIcon /></ListItemIcon>
                            <ListItemText primary={'SSH command'} />
                        </ListItem>
                        <ListItem disabled button key={'rdp'} onClick={() => { }}>
                            <ListItemIcon><ComputerIcon /></ListItemIcon>
                            <ListItemText primary={'RDP'} />
                        </ListItem>
                    </List>
                </Collapse>
                {sshCommandModal}
                <ListItem button key={'customActions'} onClick={handleClickCustomActionsExpend}>
                    <ListItemText primary={"Custom Actions"} />
                    {openCustomActionsExpend ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openCustomActionsExpend === true ? true : false} timeout="auto" unmountOnExit>
                    {
                        props.customActions && props.customActions.map((customAction) => (
                            isProjectEqualToServerProjects(customAction?.name) &&
                            <List component="div" disablePadding>
                                <ListItem disabled={props.selectedServers.length > 1 ? !isProjectEqual(customAction?.name) : isProjectEqual(customAction?.name)} button key={customAction.name} onClick={handleClickCustomActionsRealtionExpend(customAction)}>
                                    <ListItemIcon><AccountTreeIcon /></ListItemIcon>
                                    <ListItemText primary={customAction?.name} />
                                    {openCustomActionsRelation?.name === customAction?.name ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
                                </ListItem>
                                <Collapse in={openCustomActionsRelation?.name === customAction?.name} timeout="auto" unmountOnExit>
                                    {
                                        customAction.customActions && customAction.customActions.map((customActionCategory) => (
                                            <List component="div" disablePadding>
                                                <ListItem disabled={isBtRoleEqual(customActionCategory) || !customActionCategory.isActive} button key={customActionCategory.name} className={classes.nested} onClick={handleClickCustomActionsRealtionCategoryExpend(customActionCategory)}>
                                                    <ListItemIcon><CategoryIcon /></ListItemIcon>
                                                    <ListItemText primary={customActionCategory?.displayName} />
                                                    {openCustomActionsRelation?.index === customActionCategory?.name ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
                                                </ListItem>
                                                <Collapse in={openCustomActionsRelation?.index === customActionCategory?.name} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding>
                                                        {
                                                            customActionCategory.actions && customActionCategory.actions.map((action) => (
                                                                <ListItem disabled={!action.isActive || validateActionRoles(action.roles)} button key={action.name} className={classes.childNested} onClick={onClickCustomAction(action)}>
                                                                    <ListItemIcon><CodeIcon /></ListItemIcon>
                                                                    <ListItemText primary={action.displayName} />
                                                                </ListItem>
                                                            ))
                                                        }

                                                    </List>
                                                </Collapse>
                                            </List>
                                        ))
                                    }
                                </Collapse>
                            </List>
                        ))
                    }
                </Collapse>
            </Menu>
        </div>
    );
};

export default Actions;
