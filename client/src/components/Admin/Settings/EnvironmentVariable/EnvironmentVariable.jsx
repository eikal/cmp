import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { InputAdornment, IconButton } from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';

const EnvironmentVariable = (props) => {
    const [data, setData] = useState({})

    useEffect(() => {
        fetchData()
    }, []);

    const handleClickShowPasswordConfirm = (key) => (e) => {
        setData(prevState => ({
            ...prevState,
            [key]: {
                value: data[key].value,
                display: !data[key].display,
                isPassword: data[key].isPassword
            }
        }));
    }

    const fetchData = async () => {
        try {
            const environmentVariablesResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/config`, { withCredentials: true });
            if (environmentVariablesResponse && environmentVariablesResponse.data.statusCode !== 200) {
                toast.error("Failed to get data", { position: "bottom-right" });
            } else {
                const newData = {}
                for (let key in environmentVariablesResponse.data.data) {
                    newData[key] = {
                        value: environmentVariablesResponse.data.data[key],
                        display: isDisplayField(key),
                        isPassword: !isDisplayField(key)
                    };
                }
                setData(newData);
            }
        } catch (ex) {
            toast.error("Failed to get data", { position: "bottom-right" });
        }
    }

    const isDisplayField = (key) => {
        if (key.toLocaleLowerCase().includes('pass')) {
            return false;
        }
        if (key.toLocaleLowerCase().includes('key')) {
            return false;
        }
        if (key.toLocaleLowerCase().includes('secret')) {
            return false;
        } else {
            return true;
        }
    }

    return (
        <div style={{ marginLeft: 20 }}>
            <ToastContainer />
            {
                Object.keys(data).map(key =>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
                        <span style={{ color: '#545b64', fontWeight: 500, width: '20%' }}>{key}</span>
                        <span style={{ marginLeft: 30, width: '30%' }}>
                            {
                                data[key].isPassword ?
                                    <TextField
                                        style={{ width: '100%' }}
                                        disabled
                                        defaultValue={data[key].value}
                                        type={data[key].display === true ? "text" : "password"}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPasswordConfirm(key)}
                                                    >
                                                        {data[key].display === true ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    /> :
                                    <TextField
                                        style={{ width: '100%' }}
                                        disabled
                                        defaultValue={data[key].value}
                                        type={"text"}
                                    />
                            }

                        </span>
                    </div>
                )
            }
        </div >
    );
};

export default EnvironmentVariable;
