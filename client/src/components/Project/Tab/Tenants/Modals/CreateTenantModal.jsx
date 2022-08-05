import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import MoonLoader from "react-spinners/MoonLoader";
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import ReplayIcon from '@material-ui/icons/Replay';
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';


const CreateTenantModal = (props) => {

    const [name, setName] = useState(null);
    const [description, setDescription] = useState(null)
    const [checkEnable, setCheckEnable] = useState(true);
    const [results, setResults] = useState([]);
    const [stateLoaders, setStateLoaders] = useState(false);


    useEffect(() => {
    }, []);

    const handleChangeEnable = (event) => {
        setCheckEnable(event.target.checked);
    };

    const handleChangeName = (e) => {
        setName(e.target.value);
    };

    const handleChangeDescription = (e) => {
        setDescription(e.target.value);
    };

    const clearModal = () => {
        setName(null);
        setDescription(null);
        setCheckEnable(true);
        setResults([]);
        setStateLoaders(false);
    };

    const handleCloseModal = () => {
        clearModal();
        props.callbackCloseCreateTenantModal();
    };

    const isValidParams = (name, description) => {
        if (!name) {
            toast.error("Name field cannot be empty", { position: "bottom-right" });
            return false;
        }
        if (!description) {
            toast.error("Description field cannot be empty", { position: "bottom-right" });
            return false;
        }
        const format = /[&\/\\#,+()$~%.'":*?<>{}]/g;
        if (format.test(name)) {
            toast.error("Name field cannot contains special characters", { position: "bottom-right" });
            return false;
        }
        const removeSpacesName = name.replace(/\s/g, '');
        const removeSpacielChars = removeSpacesName.replace(/[^a-zA-Z0-9]/g, '');
        const foundTenant = props.tenants.find((tenant) => tenant.tenantID === removeSpacielChars)
        if (foundTenant) {
            toast.error("Tenant Name already exists, please change name value", { position: "bottom-right" });
            return false;
        }
        return true;
    }

    const saveTenantDetails = async () => {
        try {
            const isValid = isValidParams(name, description);
            if (!isValid) {
                return;
            }
            setStateLoaders(true);
            if (props.solutionType === 'wls') {
                const isTenantOnKeycloakCreated = await createTenantOnSource('keycloak');
                if (!isTenantOnKeycloakCreated || !results[0].isCreated) {
                    setStateLoaders(false);
                    return;
                }
                const isTenantOnWlsCloakCreated = await createTenantOnSource('wls');
                if (!isTenantOnWlsCloakCreated || !results[1].isCreated || !results[2].isCreated) {
                    setStateLoaders(false);
                    return;
                }
                const isTenantOnIcCloakCreated = await createTenantOnSource('ic');
                if (!isTenantOnIcCloakCreated || !results[3].isCreated || !results[4].isCreated) {
                    setStateLoaders(false);
                    return;
                }
            } else {
                const isTenantOnIcCloakCreated = await createTenantOnSource('ic');
                if (!isTenantOnIcCloakCreated || !results[0].isCreated || !results[1].isCreated || !results[2].isCreated) {
                    setStateLoaders(false);
                    return;
                }
            }

            setStateLoaders(false);
        } catch (ex) {
            setStateLoaders(false);
            toast.error("Failed to create tenant", { position: "bottom-right" })
        }
    }

    const retrySource = (source) => async (e) => {
        try {
            setStateLoaders(true);
            const newArray = results;
            if (source === 'wls') {
                newArray.pop();
                newArray.pop();
                newArray.pop();
                newArray.pop();
                setResults(newArray);
                await createTenantOnSource('wls');
                await createTenantOnSource('ic');
            }
            if (source === 'ic') {
                newArray.pop();
                newArray.pop();
                if (props.solutionType === 'legacy') {
                    newArray.pop();
                }
                setResults(newArray);
                await createTenantOnSource('ic');
            } else {
                newArray.pop();
                newArray.pop();
                newArray.pop();
                newArray.pop();
                newArray.pop();
                setResults(newArray);
                await createTenantOnSource('keycloak');
                await createTenantOnSource('wls');
                await createTenantOnSource('ic');
            }
            setStateLoaders(false);
        } catch (ex) {
            toast.error("Failed to retry action", { position: "bottom-right" })
        }
    }


    const createTenantOnSource = async (source) => {
        try {
            const data = {
                tierID: props.tier.id,
                name: name,
                description: description,
                status: checkEnable,
                source: source,
                solutionType: props.solutionType
            }
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tenant/create`, data, { withCredentials: true, timeout: 60 * 5000 });
            if (response.data.statusCode === 200) {
                const newArray = results;
                for (const res of response.data.data) {
                    newArray.push(res)
                }
                setResults(newArray);
                return true;
            } else {
                setStateLoaders(false);
                return false;
            }
        } catch (ex) {
            setStateLoaders(false);
            return false;
        }
    }



    const wlsDetails = <div>
        <div style={{ width: '50%' }}>
            <TextField required label='Name' margin="dense" fullWidth disabled={results && results.length > 0} autoFocus value={name} onChange={handleChangeName} />
            <TextField required label='Description' margin="dense" fullWidth disabled={results && results.length > 0} autoFocus value={description} onChange={handleChangeDescription} />
            <br></br>
            <br></br>
            <Tooltip title={'You can choose to create a tenant on active mode or inactive mode'}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <span >
                        Active
                    </span>
                    <span style={{ marginLeft: 5 }}>
                        <Switch
                            disabled={results && results.length > 0}
                            checked={true}
                            // onChange={handleChangeEnable}
                            color="primary"
                            name="checkedB"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </span>
                </div>
            </Tooltip>
        </div>
        <br></br>
        <br></br>
        {
            stateLoaders || (results && results.length > 0) ?
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>Keycloak Creating Relam</div>
                        {
                            results && Array.isArray(results) && results.length > 0 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[0].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[0].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('keycloak')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[0].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div>
                                :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[0]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>WLS Creating Tenant</div>
                        {
                            results && Array.isArray(results) && results.length > 1 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[1].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[1].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('wls')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[1].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div>
                                :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[1]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>WLS Updating Properties</div>
                        {
                            results && Array.isArray(results) && results.length > 2 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[2].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[2].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('wls')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[2].message}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[2]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>IC Creating Tenant</div>
                        {
                            results && Array.isArray(results) && results.length > 3 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[3].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[3].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('ic')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[3].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div>
                                :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[3]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>IC Updating Properties</div>
                        {
                            results && Array.isArray(results) && results.length >= 4 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[4].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {

                                            !results[4].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('ic')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[4].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div> :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[4]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                </div>
                : null

        }

    </div>

    const legacyDetails = <div>
        <div style={{ width: '50%' }}>
            <TextField required label='Name' margin="dense" fullWidth disabled={results && results.length > 0} autoFocus value={name} onChange={handleChangeName} />
            <TextField required label='Description' margin="dense" fullWidth disabled={results && results.length > 0} autoFocus value={description} onChange={handleChangeDescription} />
            <br></br>
            <br></br>
            <Tooltip title={'You can choose to create a tenant on active mode or inactive mode'}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <span >
                        Active
                    </span>
                    <span style={{ marginLeft: 5 }}>
                        <Switch
                            disabled={results && results.length > 0}
                            checked={true}
                            // onChange={handleChangeEnable}
                            color="primary"
                            name="checkedB"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </span>
                </div>
            </Tooltip>
        </div>
        <br></br>
        <br></br>
        {
            stateLoaders || (results && results.length > 0) ?
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>IC Creating Tenant</div>
                        {
                            results && Array.isArray(results) && results.length > 0 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[0].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[0].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('ic')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[0].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div>
                                :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[0]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>IC Activate Tenant</div>
                        {
                            results && Array.isArray(results) && results.length > 1 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[1].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[1].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('ic')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[1].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div>
                                :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[1]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '20%' }}>IC Updating Properties</div>
                        {
                            results && Array.isArray(results) && results.length >= 3 ?
                                <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {
                                            results[2].isCreated ?
                                                <div style={{ color: 'rgb(75, 210, 143)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon ></CheckIcon></div>
                                                :
                                                <div style={{ color: 'rgb(255, 77, 77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClearIcon></ClearIcon></div>
                                        }
                                        {
                                            !results[2].isCreated &&
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <div >
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={retrySource('ic')}>
                                                        <ReplayIcon aria-controls="simple-menu" >
                                                        </ReplayIcon>
                                                    </Button>
                                                </div>
                                                <div style={{ marignLeft: 15, fontSize: 'smaller' }} >
                                                    {results[2].message}
                                                </div>
                                            </div>

                                        }
                                    </div>
                                </div> :
                                <MoonLoader color={'rgb(0, 112, 185)'} loading={stateLoaders && !results?.[2]?.isCreated} css={{ "margin-left": '10px' }} size={20} />
                        }
                    </div>
                </div>
                : null

        }

    </div>



    return (
        <Dialog disableBackdropClick={true} maxWidth='lg' fullWidth open={props.isOpen} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Create Tenant</DialogTitle>
            <DialogContent >
                <DialogContentText>
                    {
                        props.solutionType === 'wls' ? wlsDetails : legacyDetails
                    }

                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} disabled={stateLoaders} onClick={handleCloseModal} color="primary">Close</Button>
                {
                    results.length === 0 ?
                        <div>
                            <Button style={{ color: 'rgb(0, 112, 185)' }} disabled={results.length > 0 || stateLoaders ? true : false} onClick={saveTenantDetails} color="primary">Save</Button>
                        </div>
                        : null
                }

            </DialogActions>
            <ToastContainer />
        </Dialog>
    )
}
export default CreateTenantModal;
