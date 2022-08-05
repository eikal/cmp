import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { capitalizeStr } from '../../../../../helpers/helpers.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'



const CreateActionJobModal = (props) => {

    const useStyles = makeStyles((theme) => ({
        formControlChip: {
            width: '100%',
            marginTop: 5
        },
        chips: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        chip: {
            margin: 2,
        }
    }));

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 48 * 4.5 + 8,
                width: 250,
            },
        },
    };

    const classes = useStyles();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [actionType, setActionType] = useState('sshCommand');
    const [actionValue, setActionValue] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (props.selectedActionJob) {
            initEditActionJobsValues()
        } else {
            clearState()
        }
    }, [props.selectedActionJob]);

    const clearState = () => {
        setName('');
        setActionType('sshCommand');
        setDescription('');
        setActionValue([]);
        setIsActive(true);
        setRoles([]);
    }

    const initEditActionJobsValues = () => {
        setName(props.selectedActionJob.displayName);
        setActionType(props.selectedActionJob.type);
        setDescription(props.selectedActionJob.description);
        setActionValue(props.selectedActionJob.value);
        setIsActive(props.selectedActionJob.isActive || false);
        setRoles(props.selectedActionJob.roles);
    };

    const handleChangeRoles = (e, chips, reason) => {
        setRoles(chips);
    };

    const handleChangeActionType = (event) => {
        if (event.target.value === 'fileView') {
            setActionValue([]);
            setActionType(event.target.value);
            return;
        }
        setActionType(event.target.value);
        setActionValue('');
    };

    const handleCloseActionJobModal = () => {
        props.callbackCloseActionJobModal();
        clearState();
    };

    const handleChangeValues = (e, chips, reason) => {
        if (reason === 'create-option' && !isPathValid(e.target.value)) {
            toast.error('Path is not valid , Path should be as example: /opt/cfrm/logs', { position: "bottom-right" })
            return;
        }
        const results = chips.map(element => element.trim());
        setActionValue(results);
    };

    const handleChangeIsActive = (event) => {
        setIsActive(event.target.checked);
    };

    const isPathValid = (path) => {
        if (/^(?!.*\*).*/.test(path)) {
            return true
        }
        return false
    }

    const handleSaveActionJobModal = () => {
        if (!name) {
            toast.error('Name is required', { position: "bottom-right" })
            return;
        };
        if (name.length > 30) {
            toast.error('Name is too long', { position: "bottom-right" })
            return;
        };
        if (!actionValue || (actionValue && Array.isArray(actionValue) && actionValue.length === 0)) {
            toast.error('Action Value is required', { position: "bottom-right" })
            return;
        }
        if (roles.length === 0) {
            toast.error('Role is required', { position: "bottom-right" })
            return;
        }
        if (!props.selectedActionJob) {
            const newActionJobObj = {
                name: capitalizeStr(name).trim(),
                description: description ? capitalizeStr(description).trim() : null,
                type: actionType,
                value: Array.isArray(actionValue) ? actionValue : [actionValue],
                isActive: isActive,
                roles: roles
            }
            props.callbackSaveActionJobModal(newActionJobObj);
        } else {
            const updatedActionJobObj = {
                actionID: props.selectedActionJob.id || props.selectedActionJob._id,
                name: capitalizeStr(name).trim(),
                description: description ? capitalizeStr(description).trim() : null,
                type: actionType,
                value: Array.isArray(actionValue) ? actionValue : [actionValue],
                isActive: isActive,
                roles: roles
            }
            props.callbackUpdatedActionJobModal(updatedActionJobObj);
        }

        clearState();
    };

    return (
        <div>
            <Dialog maxWidth='md' disableBackdropClick={true} fullWidth open={props.isOpenActionJobModal} onClose={handleCloseActionJobModal} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{!props.selectedActionJob ? 'Create New Action Job' : 'Edit Action Job'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Tooltip title={'Example: ELK Stop'}>
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
                        <Tooltip title={'Example: This Action stop ELK service'}>
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

                        <div style={{ marginTop: 25 }}>
                            <FormControl component="fieldset">
                                <FormLabel required component="legend">Action Type</FormLabel>
                                <RadioGroup style={{ display: 'flex', flexDirection: 'row' }} aria-label="actionType" name="actionType" value={actionType} onChange={handleChangeActionType}>
                                    <FormControlLabel value="sshCommand" control={<Radio color="primary" />} label="SSH Command" />
                                    <FormControlLabel value="fileView" control={<Radio color="primary" />} label="File/Directory View" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        {
                            actionType === 'sshCommand' && <div>
                                <Tooltip title={'Example: systemctl stop elasticsearch'}>
                                    <TextField
                                        value={actionValue}
                                        required
                                        margin="dense"
                                        id="actionValue"
                                        label="Action Value"
                                        type="string"
                                        fullWidth
                                        onChange={(e) => setActionValue(e.target.value)}
                                    />
                                </Tooltip>
                            </div>
                        }
                        {
                            actionType === 'fileView' && <div style={{ marginTop: 25 }}>
                                <FormControl style={{ width: '100%' }} component="fieldset">
                                    <Tooltip title={'Please press enter after insert a value'}>
                                        <Autocomplete
                                            multiple
                                            freeSolo
                                            id="tags-outlined"
                                            options={[]}
                                            size="medium"
                                            value={actionValue}
                                            onChange={handleChangeValues}
                                            renderInput={(params) => (
                                                <TextField
                                                    required
                                                    {...params}
                                                    size="medium"
                                                    variant="standard"
                                                    label="Action Values"
                                                />
                                            )}
                                        />
                                    </Tooltip>
                                </FormControl>
                            </div>
                        }
                        <Tooltip title={'Select User Roles'}>
                            <Autocomplete
                                multiple
                                freeSolo
                                id="tags-outlined"
                                options={['basic', 'advanced', 'admin']}
                                defaultValue={props?.selectedActionJob?.roles || []}
                                size="medium"
                                onChange={handleChangeRoles}
                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        size="medium"
                                        variant="standard"
                                        label="Select Roles"
                                    />
                                )}
                            />
                        </Tooltip>
                        <div style={{ marginTop: 10 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox checked={isActive} onChange={handleChangeIsActive} name="isActive" color="primary"
                                    />}
                                label="Active"
                            />
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseActionJobModal} color="primary">Cancel</Button>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveActionJobModal} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
            <ToastContainer />
        </div >
    )


}
export default CreateActionJobModal;
