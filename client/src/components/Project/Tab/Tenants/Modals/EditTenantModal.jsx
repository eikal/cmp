import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';


const EditTenantModal = (props) => {

    const [name, setName] = useState(null);
    const [checkEnable, setCheckEnable] = useState(false);


    useEffect(() => {
        if (props.tenantDetails) {
            fetchData();
        }
    }, [props.tenantDetails]);

    const fetchData = () => {
        if (props?.tenantDetails?.displayName) {
            setName(props?.tenantDetails?.displayName)
        }
        if (props?.tenantDetails?.status) {
            if (props?.tenantDetails?.status === 'ACTIVE') {
                setCheckEnable(true);
            } else {
                setCheckEnable(false)
            }
        }
    }

    const handleChangeEnable = (event) => {
        setCheckEnable(event.target.checked);
    };

    const handleChangeName = (e) => {
        setName(e.target.value);
    };

    const clearModal = () => {
        setCheckEnable(false)
        setName(null);
    }

    const handleCloseModal = (e) => {
        fetchData();
        props.callbackCloseEditTenantModal();
    }


    const isValidParams = (name) => {
        if (!name) {
            toast.error("Name field cannot be empty", { position: "bottom-right" });
            return false;
        }
        const format = /[&\/\\#,+()$~%.'":*?<>{}]/g;
        if (format.test(name)) {
            toast.error("Name field cannot contains special characters", { position: "bottom-right" });
            return false;
        }
        return true;
    }

    const saveTenantDetails = async () => {
        try {
            props.callbackCloseEditTenantModal();
            const isValid = isValidParams(name);
            if (!isValid) {
                return;
            }
            const data = {
                tenantID: props.tenantDetails.tenantID,
                description: props.tenantDetails.description,
                tierID: props.tier.id,
                solutionType: props.solutionType,
                displayName: name,
                status: checkEnable
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/edit`, data, { withCredentials: true })
            if (response.data.statusCode === 200) {
                toast.success("Tenant edited successfully", { position: "bottom-right" });
                props.callbackSaveEditTenantModal(name, checkEnable);
                return;
            } else {
                toast.error("Failed to edit tenant", { position: "bottom-right" })
            }
        } catch (ex) {
            toast.error("Failed to edit tenant", { position: "bottom-right" })
        }
    }


    const details = <div>
        <div style={{ width: '50%' }}>
            <TextField required label='Name' margin="dense" fullWidth autoFocus value={name} onChange={handleChangeName} />
            <br></br>
            <br></br>
            <Tooltip title={'You can choose edit a tenant on active mode or inactive mode'}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <span >
                        Active
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
            </Tooltip>
        </div>
    </div>





    return (
        <Dialog disableBackdropClick={true} maxWidth='lg' fullWidth open={props.isOpen} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Edit Tenant</DialogTitle>
            <DialogContent >
                <DialogContentText>
                    {details}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Close</Button>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={saveTenantDetails} color="primary">Save</Button>
            </DialogActions>
            <ToastContainer />
        </Dialog>
    )
}
export default EditTenantModal;
