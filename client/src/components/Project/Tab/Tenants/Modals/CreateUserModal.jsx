import React, { useState, useEffect, forwardRef, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../../../../shared/TabPanel/TabPanel.jsx';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import SetPasswrodModal from './SetPasswordModal.jsx'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';


const CreateUserModal = forwardRef((props, ref) => {

    const childRef = useRef()

    const [valueTab, setValueTab] = useState(0);
    const [username, setUsername] = useState(null)
    const [email, setEmail] = useState(null)
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)
    const [checkEnable, setCheckEnable] = useState(true);
    const [userID, setUserID] = useState(null);


    useEffect(() => {

    }, []);



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

    const handleChangeUsername = (e) => {
        setUsername(e.target.value);
    };

    const clearModal = () => {
        setFirstName(null)
        setEmail(null)
        setUsername(null)
        setLastName(null)
        setCheckEnable(true)
    }

    const handleCloseModal = () => {
        clearModal();
        props.callbackCloseCreateUserModal();
    };

    const checkIfUsernameExistInTenant = () => {
        for (const userObj of props?.tenantUsers) {
            if (userObj.username === username) {
                return true;
            }
        }
        return false;
    }

    const checkIfEmailUserExistInTenant = () => {
        for (const userObj of props?.tenantUsers) {
            if (userObj.email === email) {
                return true;
            }
        }
        return false;
    }

    const isEmailValidate = (email) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true
        }
        return false
    }

    const saveUserDetails = async () => {
        try {
            if (!username) {
                toast.error("Username field cannot be empty", { position: "bottom-right" });
                return;
            }
            if (checkIfUsernameExistInTenant()) {
                toast.error("Username already exists, please change username field", { position: "bottom-right" });
                return;
            }
            if (checkIfEmailUserExistInTenant()) {
                toast.error("User with this email already exists, please change email field", { position: "bottom-right" });
                return;
            }
            if (email) {
                if (!isEmailValidate(email)) {
                    toast.error("Email is not valid", { position: "bottom-right" });
                    return;
                }
            }
            const data = {
                tenantID: props.tenantDetails.tenantID,
                tierID: props.tier.id,
                username: username,
                firstName: firstName ? firstName : null,
                lastName: lastName ? lastName : null,
                email: email ? email : null,
                enabled: checkEnable
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("User created successfully", { position: "bottom-right" });
                setUserID(response.data.data.id);
                try {
                    childRef.current.resetUserPasswordFunc();
                } catch (ex) { }
                clearModal();
                setValueTab(0);
                props.callbackCreateUser(response.data.data);
                return;
            }
            toast.error("Failed to create user", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to create user", { position: "bottom-right" })
        }
    }



    const details = <div style={{ width: '50%' }}>
        <TextField required label='Useranme' margin="dense" fullWidth autoFocus value={username} onChange={handleChangeUsername} />
        <TextField type="email" label='Email' margin="dense" fullWidth autoFocus value={email} onChange={handleChangeEmail} />
        <TextField label='First Name' margin="dense" fullWidth autoFocus value={firstName} onChange={handleChangeFirstName} />
        <TextField label='Last Name' margin="dense" fullWidth autoFocus value={lastName} onChange={handleChangeLastName} />
        <br></br>
        <br></br>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span >
                User Enabled
            </span>
            <span style={{ marginLeft: 5 }}>
                <Switch
                    checked={checkEnable}
                    onChange={handleChangeEnable}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </span>
        </div>
    </div>


    return (
        <Dialog disableBackdropClick={true} maxWidth='lg' fullWidth open={props.isOpen} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Create User</DialogTitle>
            <DialogContent >
                <DialogContentText>
                    <TableContainer style={{ height: '700px' }} component={Paper}>
                        <AppBar style={{ backgroundColor: '#606060' }} position="static">
                            <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                                <Tab label="Details" />
                                <Tab label="Credentials" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={valueTab} index={0}>
                            {details}
                        </TabPanel>
                        <TabPanel value={valueTab} index={1}>
                            <SetPasswrodModal
                                tenantID={props?.tenantDetails?.tenantID}
                                tierID={props?.tier?.id}
                                userID={userID}
                                isUpdatePassword={false}
                                ref={childRef}
                            >
                            </SetPasswrodModal>
                        </TabPanel>
                    </TableContainer>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Close</Button>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={saveUserDetails} color="primary">Save</Button>
            </DialogActions>
            <ToastContainer />
        </Dialog>
    )
})
export default CreateUserModal;
