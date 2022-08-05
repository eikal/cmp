import React, { useState } from 'react';
import axios from 'axios';
import Header from '../../../shared/Header';
import SideBar from '../../../shared/SideBar';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Tooltip from '@material-ui/core/Tooltip';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'


const Encryption = () => {

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const [encryptValue, setEncrypt] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [valueAction, setValue] = useState('encrypt');
    const [open, setOpen] = useState(true);


    const handleChangeRadio = (event) => {
        setValue(event.target.value);
        setOutput('');

    };

    const handleOnChangeTxtArea = (type) => (e) => {
        setEncrypt(e.target.value);
    };

    const handleOnChangeOutputTxtArea = (e) => {
        setOutput(e.target.value)
    }

    const handleSubmit = async () => {

        setLoading(true)
        if (valueAction === 'encrypt') {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/store-hiera/encrypt`, { value: encryptValue }, { withCredentials: true });
                setLoading(false)
                if (response.data.statusCode === 200) {
                    toast.success("Success to encrypt key", { position: "bottom-right" });
                    setOutput(response.data.data);
                } else {
                    setLoading(false)
                    toast.error("Failed to encrypt key", { position: "bottom-right" });
                }
            } catch (ex) {
                setLoading(false)
                toast.error("Failed to encrypt key", { position: "bottom-right" });
            }
        } else {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/store-hiera/decrypt`, { key: encryptValue });
                setLoading(false)
                if (response.data.statusCode === 200) {
                    toast.success("Success to decrypt key", { position: "bottom-right" });
                    setOutput(response.data.data);
                } else {
                    setLoading(false)
                    toast.error("Failed to decrypt key", { position: "bottom-right" });
                }
            } catch (ex) {
                setLoading(false)
                if (ex.response.status) {
                    toast.error("Key not found", { position: "bottom-right" });
                } else {
                    toast.error("Failed to decrypt key", { position: "bottom-right" });
                }
            }
        }
    };

    return (

        <Grid container wrap="nowrap">
            <Header open={open} handleDrawerOpen={handleDrawerOpen} title="Toolbox" />
            <SideBar open={open} handleDrawerClose={handleDrawerClose} />
            <div style={{ width: '100%' }}>

                <div style={{ display: 'flex' }}>
                    <Tooltip title="Toolbox oprations">
                        <Typography style={{ fontWeight: 300 }} variant="h5">Encryption/Decryption</Typography>
                    </Tooltip>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%', marginTop: "50px" }}>
                    <Card style={{ width: '50%', height: '100%', background: '#F7F7F7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CardContent>
                            <div
                                style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%', padding: 0, margin: 0 }}>
                                <div>
                                    <TextareaAutosize
                                        onChange={handleOnChangeTxtArea(valueAction)}
                                        rowsMax={5}
                                        rows={5}
                                        style={{ width: '100%', height: '75%' }}
                                        aria-label="maximum height"
                                        placeholder={valueAction === 'encrypt' ? 'Value to encrypt' : 'Key to decrypt'}
                                    />
                                    <TextareaAutosize
                                        onChange={handleOnChangeOutputTxtArea}
                                        value={output}
                                        rowsMax={5}
                                        rows={5}
                                        style={{ width: '100%', height: '75%' }}
                                        aria-label="maximum height"
                                        placeholder="Output"

                                    />
                                    <br></br>
                                    <RadioGroup style={{ display: 'flex', flexDirection: 'row' }} aria-label="action" name="action" value={valueAction} onChange={handleChangeRadio}>
                                        <FormControlLabel value="encrypt" control={<Radio color="default" />} label="Encrypt" />
                                        <FormControlLabel value="decrypt" control={<Radio color="default" />} label="Decrypt" />
                                    </RadioGroup>
                                    <br></br>
                                    <Button style={{ backgroundColor: "#0070b9" }} disabled={loading} onClick={handleSubmit} type="button" fullWidth variant="contained" color="primary">
                                        {loading && <CircularProgress color='secondary' size={14} />}
                                        {!loading && valueAction === 'encrypt' ? 'Encrypt' : 'Decrypt'}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <ToastContainer />
                </div>
            </div>
        </Grid>
    );
};

export default Encryption;
