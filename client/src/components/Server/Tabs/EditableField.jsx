import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import Autocomplete from '@material-ui/lab/Autocomplete';
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import { isBasicUser } from '../../../helpers/auth.js';
import { toast } from 'react-toastify';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

const EditableField = (props) => {

    const [isEditMode, setIsEditMode] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [options, setOptions] = useState([]);
    const [tempValue, setTempValue] = useState([]);
    const [value, setValue] = useState([]);
    const [open, setOpen] = useState(false);
    const loading = open && options.length === 0;

    useEffect(() => {
        setValue(props.value);
        setIsEditMode(false);
    }, [props.value]);

    const useStyles = makeStyles((theme) => ({
        container: {
            display: "flex",
            flexWrap: "wrap",
            padding: 50
        },
        textField: {
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit,
            width: 300,
            color: "black",
            fontSize: 30,
            opacity: 1,
            borderBottom: 0,
            "&:before": {
                borderBottom: 0
            }
        },
        disabled: {
            color: "black",
            borderBottom: 0,
            "&:before": {
                borderBottom: 0
            }
        },
        btnIcons: {
            marginLeft: 10
        }
    }));
    const classes = useStyles();

    const update = async (field) => {
        try {
            const updateHost = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/` + props.putApi,
                { 'field': props.field, 'value': tempValue },
                { withCredentials: true }
            );
            if (updateHost.data.statusCode === 200) {
                setValue(updateHost.data.data);
                toast.success(props.label + " has been updated", { position: "bottom-right" });
            } else {
                toast.error("Failed to update " + props.label, { position: "bottom-right" });
            }
            setIsEditMode(false);
            setIsChanged(false);
            props.callbackUpdateField();
        } catch (ex) {
            setIsEditMode(false);
            setIsChanged(false);
            toast.error("Failed to update " + props.label, { position: "bottom-right" });
        }
    }

    const fetchOptions = async () => {
        try {
            if (options.length === 0) {
                const optionsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/` + props.optionsApi, { withCredentials: true });
                if (optionsResponse && optionsResponse.data.statusCode !== 200) {
                    toast.error("Failed to get options", { position: "bottom-right" });
                } else {
                    setOptions(optionsResponse.data.data);
                }
            }
        } catch (ex) {
            toast.error("Failed to get options", { position: "bottom-right" });
        }
    };

    const clear = () => {
        setIsEditMode(false);
        setIsChanged(false);
    };

    const openEditMode = () => {
        fetchOptions(props.api);
        setIsEditMode(true);
    };

    return (
        <div>
            {props.type === "TextField" ?
                //TODO
                <TextField />
                :
                props.type === "autoComplete" ?
                    <div>
                        {isEditMode ?
                            <div><Autocomplete
                                disableClearable
                                options={options}
                                onOpen={() => {
                                    setOpen(true);
                                }}
                                onClose={() => {
                                    setOpen(false);
                                }}
                                loading={loading}
                                getOptionLabel={(option) => option ? option.name : "waiting..."}
                                style={{ width: '80%', display: 'inline-flex', margin: '0 8px 0 0' }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={value}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                                onChange={(event, newValue) => {
                                    setTempValue(newValue?.name);
                                    setIsEditMode(true);
                                    setIsChanged(true);
                                }}/>
                                <IconButton aria-controls="simple-menu" aria-haspopup="true"
                                    onClick={clear}>
                                    <ClearIcon aria-controls="simple-menu" >
                                    </ClearIcon>
                                </IconButton>
                                {isChanged ? <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={update}>
                                    <SaveIcon aria-controls="simple-menu" >
                                    </SaveIcon>
                                </IconButton> : null}
                            </div> : <div>
                                <TextField label={value} variant="outlined" style={{ width: '80%', margin: '0 8px 0 0' }} disabled="true" className={classes.textField} />
                                <IconButton disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true"
                                    onClick={openEditMode}>
                                    <EditIcon aria-controls="simple-menu" >
                                    </EditIcon>
                                </IconButton></div>}
                    </div>
                    : null
            }
        </div>
    );
}

export default EditableField;
