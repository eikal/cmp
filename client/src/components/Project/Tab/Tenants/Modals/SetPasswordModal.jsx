import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { InputAdornment, IconButton } from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { includeSpacielChars } from '../../../../../helpers/helpers.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';



const SetPasswordModal = forwardRef((props, ref) => {

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);
    const [isTemporary, setIsTemporary] = useState(true)
    const handleClickShowPassword = () => setShowNewPassword(!showNewPassword);
    const handleMouseDownPassword = () => setShowNewPassword(!showNewPassword);
    const handleClickShowPasswordConfirm = () => setShowNewPasswordConfirm(!showNewPasswordConfirm);
    const handleMouseDownPasswordConfirm = () => setShowNewPasswordConfirm(!showNewPasswordConfirm);


    useEffect(() => {
    }, []);


    useImperativeHandle(ref, () => ({
        resetUserPasswordFunc() {
            resetUserPassword();
        }
    }));

    const setNewPasswordHandler = (event) => {
        setNewPassword(event.target.value);
    };

    const setNewPasswordConfirmHandler = (event) => {
        setNewPasswordConfirm(event.target.value);
    };
    const handleChangeTemporary = (event) => {
        setIsTemporary(event.target.checked);
    };


    const clearModal = () => {
        setNewPassword('');
        setNewPasswordConfirm('');
        setShowNewPassword(false);
        setShowNewPasswordConfirm(false);
    }


    const resetUserPassword = async () => {
        try {
            if (newPassword !== newPasswordConfirm) {
                toast.error("Password does not match. Please re-enter a new password again", { position: "bottom-right" });
                return;
            }
            if (includeSpacielChars(newPassword)) {
                toast.error("Password can not include spaciel characters", { position: "bottom-right" });
                return;
            }
            const data = {
                userID: props.userID,
                tenantID: props.tenantID,
                tierID: props.tierID,
                password: newPassword,
                isTemporary: isTemporary,
                solutionType: props.solutionType
            }

            const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/user/password`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("User password updated successfully", { position: "bottom-right" });
                return;
            }
            toast.error("Failed to update user password", { position: "bottom-right" });
        } catch (ex) {
            toast.error("Failed to update user password", { position: "bottom-right" })
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ width: '20%' }}>
                    Password
                </span>
                <span style={{ width: '50%' }}>
                    <TextField
                        label=''
                        variant="outlined"
                        type={showNewPassword ? "text" : "password"}
                        onChange={setNewPasswordHandler}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </span>
            </div>
            <br></br>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ width: '20%' }}>
                    Password Confirmation
                </span>
                <span style={{ width: '50%' }}>
                    <TextField
                        label=''
                        variant="outlined"
                        type={showNewPasswordConfirm ? "text" : "password"}
                        onChange={setNewPasswordConfirmHandler}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPasswordConfirm}
                                        onMouseDown={handleMouseDownPasswordConfirm}
                                    >
                                        {showNewPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </span>
            </div>
            <br></br>
            {
                props.solutionType === 'wls' &&
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Tooltip title={'If enabled, the user must change the password on next login'}>
                        <span >
                            Temporary
                        </span>
                    </Tooltip>
                    <span style={{ marginLeft: 5 }}>
                        <Switch
                            checked={isTemporary}
                            onChange={handleChangeTemporary}
                            color="primary"
                            name="checkedB"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </span>
                </div>

            }
            <br></br>
            {
                props.isUpdatePassword ?
                    <Button variant="contained" style={{ color: 'black' }} onClick={resetUserPassword} >Reset</Button>
                    : null
            }
            <ToastContainer />
        </div >
    )
})
export default SetPasswordModal;
