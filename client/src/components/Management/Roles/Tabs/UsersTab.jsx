import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import ClearIcon from '@material-ui/icons/Clear';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from "@material-ui/core/Typography";
import Loader from '../../../shared/Loader';
import { titleCase } from '../../../../helpers/helpers.js';
import { getCloudspaceID } from '../../../../helpers/auth.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center'
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 600,
        height: 430,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

const UsersTab = (props) => {

    const classes = useStyles();

    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);
    const [findAvailableUser, setFindAvailableUser] = useState('');
    const [userinformation, setUserinformation] = useState('');
    const [isOpenUserModal, setIsOpenUserModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (props?.selectedRole?.users) {
            setLeft(props.selectedRole.users)
        }
        setRight([])
        setFindAvailableUser('');
    }, [props.selectedRole]);

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
        manageUsers('delete');
    };

    const handleCheckedLeft = async () => {
        manageUsers('add');
    };

    const handleFindAvailableUsers = (e) => {
        setFindAvailableUser(e.target.value);
    }

    const handleClearSearch = () => {
        setFindAvailableUser('');
        setRight([]);
    }

    const handleCloseUserModal = () => {
        setUserinformation('');
        setIsOpenUserModal(false);
    }

    const manageUsers = async (action) => {
        try {
            const users = action === 'add' ? rightChecked.map((user) => user) : leftChecked.map((user) => user)
            const data = {
                cloudspaceID: getCloudspaceID(),
                users: users,
                groups: [],
                role: props.selectedRole.name,
                action: action
            }

            const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/auth/role`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                if (action === 'add') {
                    setLeft([...new Set([...left,...rightChecked])]);
                    setRight(not(right, rightChecked));
                    setChecked(not(checked, rightChecked));
                    props.callbackUpdateUsers([...new Set([...left,...rightChecked])], props.selectedRole.name, action)
                } else {
                    setRight([...new Set([...right, ...leftChecked])]);
                    setLeft(not(left, leftChecked));
                    setChecked(not(checked, leftChecked));
                    props.callbackUpdateUsers(not(left, leftChecked), props.selectedRole.name, action)
                }

                toast.success("Users updated successfully", { position: "bottom-right" });
                return;
            }
            toast.error("Failed to update users", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to update users", { position: "bottom-right" })
        }
    }


    const clickFindAvailableUsers = async () => {
        try {
            setIsLoading(true);
            if (!findAvailableUser || findAvailableUser.length < 3) {
                toast.error("User should have at least 3 characters", { position: "bottom-right" });
                setIsLoading(false);
                return;
            }
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/auth/role/available-users?username=${findAvailableUser}`, { withCredentials: true })
            if (response.data.statusCode === 200) {
                if (response.data.data.length === 0) {
                    toast.info("No results found", { position: "bottom-right" });
                    setIsLoading(false);
                    return;
                }
                setRight(response.data.data);
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            toast.error("Failed to get users", { position: "bottom-right" });
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get users", { position: "bottom-right" })
        }
    }

    const getUsernameMetaData = (username) => async (e) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/auth/role/user?username=${username}`, { withCredentials: true })
            if (response.data.statusCode === 200) {
                setUserinformation(response.data.data);
                setIsOpenUserModal(true)
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            toast.error("Failed to get user information", { position: "bottom-right" });
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get user information", { position: "bottom-right" })
        }
    }



    const userModal = <Dialog disableBackdropClick={true} maxWidth='lg' fullWidth open={isOpenUserModal} onClose={handleCloseUserModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">User information</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: "50%" }}>
                        {
                            userinformation ?
                                Object.keys(userinformation).map(key =>
                                    <div>
                                        {
                                            Array.isArray(userinformation[key]) ? <Typography type="body2" style={{ fontSize: 15, fontWeight: 500 }}>{key}:</Typography> : null
                                        }
                                        {
                                            Array.isArray(userinformation[key]) ?
                                                userinformation[key].map((item, i) => {
                                                    return <li style={{ marginLeft: 15 }} key={i}>{item}</li>
                                                })
                                                :
                                                <Typography type="body2" style={{ fontSize: 15, fontWeight: 500 }}>{key} : {userinformation[key]}</Typography>
                                        }
                                    </div>
                                ) : null
                        }
                    </div>
                    <div style={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
                        <Avatar style={{ width: 300, height: 300 }}>

                        </Avatar>
                    </div>
                </div>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseUserModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>


    const customList = (title, items) => (
        <Card>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between' }}>
                <div>
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
                        title={<Typography type="body2" style={{ fontSize: 15, fontWeight: 500 }}>{title}</Typography>}
                        subheader={`${numberOfChecked(items)}/${items.length} selected`}

                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                    {
                        title.includes('Available') ?
                            <TextField
                                onChange={handleFindAvailableUsers}
                                value={findAvailableUser}
                                label="Search User"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        clickFindAvailableUsers()
                                        e.preventDefault();
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment>
                                            <Tooltip title={'Search User'}>
                                                <IconButton disabled={!findAvailableUser} onClick={clickFindAvailableUsers}>
                                                    <SearchIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={'Clear Search'}>
                                                <IconButton onClick={handleClearSearch}>
                                                    <ClearIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            /> :
                            null
                    }
                </div>
            </div>

            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value}-label`;

                    return (
                        <ListItem disabled={((left.filter((elm) => elm === value)).length > 0) && title === 'Available Users'}
                            key={value} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={(checked.filter((elm) => elm === value)).length > 0}
                                    tabIndex={-1}
                                    color="primary"
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                disableTypography
                                primary={
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><Typography type="body2" style={{ fontSize: 15 }}>{value}</Typography></div>
                                        <div>
                                            <Tooltip title={'User information'}>
                                                <IconButton onClick={getUsernameMetaData(value)}>
                                                    <HelpIcon style={{ fontSize: 15 }} ></HelpIcon>
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                }
                            />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );


    return (
        <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            className={classes.root}
        >
            <Grid item>{customList(props?.selectedRole?.role ? titleCase(props?.selectedRole?.role) + ' Users' : 'Users', left)}</Grid>
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
            <Grid item>{customList('Available Users', right, true)}</Grid>
            <Loader isLoading={isLoading}></Loader>
            {userModal}
            <ToastContainer />
        </Grid>

    )
}
export default UsersTab;
