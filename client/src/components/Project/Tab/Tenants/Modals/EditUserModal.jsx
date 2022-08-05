import React, { useState, useEffect, forwardRef, useRef } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../../../../shared/TabPanel/TabPanel.jsx';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Loader from '../../../../shared/Loader';
import SetPasswrodModal from './SetPasswordModal.jsx'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';


const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 300,
        height: 330,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

const EditUserModal = forwardRef((props, ref) => {

    const childRef = useRef()

    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(false);
    const [valueTab, setValueTab] = useState(0);

    //Details
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [checkEnable, setCheckEnable] = useState(true);


    //Groups
    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    useEffect(() => {
        if (props.userDetails && props.isOpen) {
            fetchData();
        }
    }, [props.isOpen]);

    const fetchData = () => {
        if (props.solutionType === 'wls') {
            if (props.userDetails.name) {
                setFirstName(props.userDetails.name.split(' ')[0])
                setLastName(props.userDetails.name.split(' ')[1])
            } else {
                setFirstName('')
                setLastName('')
            }
            if (props.userDetails.email) {
                setEmail(props.userDetails.email)
            } else {
                setEmail('')
            }
            setCheckEnable(props.userDetails.enabled);
            getGroups();
        } else {
            setValueTab(1)
        }
    }

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };

    const handleChangeEnable = (event) => {
        setCheckEnable(event.target.checked);
    };

    const handleChangeFirstName = (e) => {
        setFirstName(e.target.value);
    };

    const handleChangeLastName = (e) => {
        setLastName(e.target.value);
    };

    const handleChangeEmail = (e) => {
        setEmail(e.target.value);
    };


    function not(a, b) {
        return a.filter((value) => b.indexOf(value) === -1);
    }

    function intersection(a, b) {
        return a.filter((value) => b.indexOf(value) !== -1);
    }

    function union(a, b) {
        return [...a, ...not(b, a)];
    }

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = async () => {
        try {
            await manageGroupsOfUser('delete');
            setRight(right.concat(leftChecked));
            setLeft(not(left, leftChecked));
            setChecked(not(checked, leftChecked));
        } catch (ex) {
            toast.error('Failed to update user groups', { position: "bottom-right" });
        }
    };

    const handleCheckedLeft = async () => {
        try {
            await manageGroupsOfUser('add');
            setLeft(left.concat(rightChecked));
            setRight(not(right, rightChecked));
            setChecked(not(checked, rightChecked));
        } catch (ex) {
            toast.error('Failed to update user groups', { position: "bottom-right" });
        }
    };

    const handleCloseModal = () => {
        clearModal();
        props.callbackCloseEditUserModal();
    };

    const clearModal = () => {
        setValueTab(0);
        setEmail('');
        setFirstName('');
        setLastName('');
        setCheckEnable(true);
        setChecked([]);
        setLeft([]);
        setRight([]);
    }

    const saveUserDetails = async () => {
        try {
            const data = {
                userID: props.userDetails.id,
                tenantID: props.tenantDetails.tenantID,
                tierID: props.tier.id,
                firstName: firstName,
                lastName: lastName,
                email: email,
                enabled: checkEnable,
                solutionType: props.solutionType
            }
            const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user/details`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("User details updated successfully", { position: "bottom-right" });
                props.callbackUpdateUserDetails(data)
                return;
            }
            toast.error("Failed to update user details", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to update user details", { position: "bottom-right" })
        }
    }

    const manageGroupsOfUser = async (action) => {
        try {
            const groupIDs = action === 'add' ? rightChecked.map((group) => group.id) : leftChecked.map((group) => group.id)
            const data = {
                userID: props.userDetails.id,
                groupIDs: groupIDs,
                tenantID: props.tenantDetails.tenantID,
                tierID: props.tier.id,
                action: action
            }

            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user/group`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("User groups updated successfully", { position: "bottom-right" });
                return;
            }
            toast.error("Failed to update user groups", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to update user groups", { position: "bottom-right" })
        }
    }

    const getGroups = async () => {
        try {
            setIsLoading(true);
            const data = {
                userID: props.userDetails.id,
                tenantID: props.tenantDetails.tenantID,
                tierID: props.tier.id,
            }

            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user/groups`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                setRight(response.data.data[0])
                setLeft(response.data.data[1])
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            toast.error("Failed to get user groups", { position: "bottom-right" });
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get user groups", { position: "bottom-right" })
        }
    }

    const customList = (title, items) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        color="primary"
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value.id}-label`;

                    return (
                        <ListItem disabled={((left.filter((elm) => elm.id === value.id)).length > 0) && title === 'Available Groups'}
                            key={value.id} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={(checked.filter((elm) => elm.id === value.id)).length > 0}
                                    tabIndex={-1}
                                    color="primary"
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={`${value.name}`} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );



    const details = <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                ID
            </span>
            <span style={{ width: '50%' }}>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus disabled value={props?.userDetails?.id} />
            </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                Created at
            </span>
            <span style={{ width: '50%' }}>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus disabled value={props?.userDetails?.createdTimestamp ? new Date(props?.userDetails?.createdTimestamp).toISOString() : null} />
            </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                Username
            </span>
            <span style={{ width: '50%' }}>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus disabled value={props?.userDetails?.username} />
            </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                Email
            </span>
            <span style={{ width: '50%' }}>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus value={email} onChange={handleChangeEmail} />
            </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                First name
            </span>
            <span style={{ width: '50%' }}>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus
                    value={firstName} onChange={handleChangeFirstName} />
            </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                Last name
            </span>
            <span style={{ width: '50%' }}>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus
                    value={lastName} onChange={handleChangeLastName} />
            </span>
        </div>
        <br></br>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ width: '10%' }}>
                User Enabled
            </span>
            <span style={{ width: '50%' }}>
                <Switch
                    checked={checkEnable}
                    onChange={handleChangeEnable}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </span>
        </div>
        <br></br>
        <Button variant="contained" style={{ color: 'black' }} onClick={saveUserDetails} >Save</Button>
    </div>

    const groupsTab = <div >
        <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            className={classes.root}
        >
            <Grid item>{customList('User Group Membership', left)}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        size="medium"
                        className={classes.button}
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        variant="outlined"
                        size="medium"
                        className={classes.button}
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                </Grid>
            </Grid>
            <Grid item>{customList('Available Groups', right)}</Grid>
        </Grid>
    </div>



    return (
        <Dialog disableBackdropClick={true} maxWidth='lg' fullWidth open={props.isOpen} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Edit User</DialogTitle>
            <DialogContent style={{ height: '800px' }}>
                <DialogContentText>
                    <TableContainer style={{ height: '700px' }} component={Paper}>
                        <AppBar style={{ backgroundColor: '#606060' }} position="static">
                            <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                                <Tab label="Details" disabled={props.solutionType === 'legacy'} />
                                <Tab label="Credentials" />
                                <Tab label="Groups" disabled={props.solutionType === 'legacy'} />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={valueTab} index={0}>
                            {details}
                        </TabPanel>
                        <TabPanel value={valueTab} index={1}>
                            <SetPasswrodModal
                                tenantID={props?.tenantDetails?.tenantID}
                                tierID={props?.tier?.id}
                                userID={props?.userDetails?.id || props?.userDetails?.username}
                                isUpdatePassword={true}
                                solutionType={props.solutionType}
                                ref={childRef}
                            >
                            </SetPasswrodModal>
                        </TabPanel>
                        <TabPanel
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 100
                            }}
                            value={valueTab}
                            index={2}>
                            {groupsTab}
                            <Loader isLoading={isLoading}></Loader>
                        </TabPanel>
                    </TableContainer>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Close</Button>
            </DialogActions>
            <ToastContainer />
        </Dialog>



    )
})
export default EditUserModal;
