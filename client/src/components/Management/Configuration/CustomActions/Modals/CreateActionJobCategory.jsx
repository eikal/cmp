import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { capitalizeStr } from '../../../../../helpers/helpers.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';


const CreateActionJobCategoryModal = (props) => {

    const [name, setName] = useState('');
    const [bt_role, setBtRole] = useState([]);
    const [description, setDescription] = useState('');
    const [btRoleOptions, setBtRoleOptions] = useState([])

    useEffect(() => {
        if(props.isOpenActionJobCategoryModal){
            fetchData();
        }    
    }, [props.isOpenActionJobCategoryModal]);

    const fetchData = () => {
        getBtRoles();
    };

    const clearState = () => {
        setName('');
        setBtRole([]);
        setDescription('');
    }

    const handleCloseActionJobCategoryModal = () => {
        props.callbackCloseActionJobCategoryModal();
        clearState();
    };

    const handleSaveActionJobCategoryModal = () => {
        if (!name) {
            toast.error('Name is required', { position: "bottom-right" })
            return;
        }
        if (name.length > 30) {
            toast.error('Name is too long', { position: "bottom-right" })
            return;
        }
        if (bt_role.length === 0) {
            toast.error('BT Role is required', { position: "bottom-right" })
            return;
        }
        const newActionJobCategoryObj = {
            name: capitalizeStr(name).trim(),
            bt_role: bt_role,
            description: description ? capitalizeStr(description).trim() : null
        }
        props.callbackSaveActionJobCategoryModal(newActionJobCategoryObj);
        clearState();
    };

    const getBtRoles = async () => {
        try {
            const btRolesResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/facts/generic/bt_role`, { withCredentials: true });
            if (btRolesResponse && btRolesResponse.data.statusCode !== 200) {
                return;
            } else {
                const btRoleArray = [];
                for (const btRoleObject of btRolesResponse.data.data) {
                    btRoleArray.push(btRoleObject.name);
                }
                setBtRoleOptions(btRoleArray);
            }
        } catch (ex) {
            return;
        }
    }

    const handleChangeBtRoles = (e, chips, reason) => {
        const results = chips.map(element => element.trim());
        setBtRole(results);
    };


    return (
        <div>
            <Dialog disableBackdropClick={true} fullWidth open={props.isOpenActionJobCategoryModal} onClose={handleCloseActionJobCategoryModal} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create New Action Job Category</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Tooltip title={'Example: ELK'}>
                            <TextField
                                value={name}
                                required
                                margin="dense"
                                id="name"
                                label="Name"
                                type="string"
                                fullWidth
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Tooltip>
                        <Tooltip title={'Example: This Category describes ELK operation actions'}>
                            <TextField
                                value={description}
                                required
                                margin="dense"
                                id="description"
                                label="Description"
                                type="string"
                                fullWidth
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Tooltip>
                        <Tooltip title={'BT Role related'}>
                            <Autocomplete
                                multiple
                                freeSolo
                                id="tags-outlined"
                                options={btRoleOptions ? btRoleOptions : []}
                                size="medium"
                                onChange={handleChangeBtRoles}
                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        size="medium"
                                        variant="standard"
                                        label="BT Roles"
                                    />
                                )}
                            />
                        </Tooltip>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseActionJobCategoryModal} color="primary">Cancel</Button>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveActionJobCategoryModal} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
            <ToastContainer />
        </div>
    )


}
export default CreateActionJobCategoryModal;
