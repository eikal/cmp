import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import { io } from 'socket.io-client';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from "@material-ui/core/Typography";
import AppBar from '@material-ui/core/AppBar';
import RefreshIcon from '@material-ui/icons/Refresh';
import MenuIcon from '@material-ui/icons/Menu';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { getCloudspaceID, isBasicUser } from '../../../../helpers/auth.js';
import CloudshellTerminal from './CloudshellTerminal';
import { ToastContainer, toast } from 'react-toastify';
import { useIdleTimer } from 'react-idle-timer';
import Loader from '../../../shared/Loader';

const Cloudshell = (props) => {
    const history = useHistory();
    const [socket, setSocket] = useState(null);
    const hostnameURLParam = useParams()?.hostname;
    const hostname = props?.serverDetails?.fullHostname || hostnameURLParam;
    const FullScreenTheme = React.lazy(() => import('./themes/fullScreenTheme'));
    const CloudShellTheme = React.lazy(() => import('./themes/cloudShellTheme'));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isBasicUser()) {
            history.goBack();
            return;
        }
        sshToServer();
    }, [hostname]);

    useEffect(() => {
        const tempSocket = socket;
        return () => {
            if (tempSocket)
                tempSocket.disconnect();
        };
    }, [socket]);


    const onIdle = () => {
        socket.disconnect();
    };

    const idleTimer = useIdleTimer({
        onIdle,
        timeout: 1000 * 60 * 30, //after 30 min
        events: ['keydown'],
        debounce: 0
    })

    const sshToServer = async () => {
        try {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
            const cloudspaceID = getCloudspaceID()
            if (!cloudspaceID) return;
            const newSocket = io(`${process.env.REACT_APP_API_ENDPOINT}/`,
                {
                    path: '/cloudshell/socket.io',
                    query: {
                        host: hostname,
                        port: 22,
                        cloudspaceID: cloudspaceID,
                        username: localStorage.getItem('username')
                    }
                }
            );
            setSocket(newSocket);
            document.onload = CloudshellTerminal(newSocket);
        } catch (ex) {
            toast.error("Failed to ssh trough Cloudshell", { position: "bottom-right" });
        }
    }

    const reloadSession = async () => {
        try {
            socket.disconnect();
            sshToServer();
        } catch (ex) {
            toast.error("Failed to ssh trough Cloudshell", { position: "bottom-right" });
        }
    }

    const Cloudshell = hostname &&
        <div className="cloudshell-container">
            <Loader isLoading={isLoading}></Loader>
            <div className="box">
                <div id="terminal-container" className="terminal"></div>
                <AppBar position={window.location.pathname.includes('/cloudshell-terminal/') ? "fixed" : "static"} color="primary" className="appBar">
                    <Toolbar>
                        <Typography id="footer" className="termianl-title" variant="h6" noWrap />
                        <div id="status"></div>
                        <div className="dropup" id="menu">
                            <MenuIcon />
                            <div id="dropupContent" className="dropup-content">
                                <a href={() => false} id="logBtn"><i className="fas fa-clipboard fa-fw"></i> Start Log</a>
                                <a href={() => false} id="downloadLogBtn"><i className="fas fa-download fa-fw"></i> Download Log</a>
                            </div>
                        </div>
                        <Link target="_blank" rel="noopener noreferrer" to={`/cloudshell-terminal/${hostname}`} color="inherit" >
                            <IconButton aria-controls="simple-menu" aria-haspopup="true" edge="end" to color='inherit'>
                                <SettingsOverscanIcon style={{ color: 'white' }} />
                            </IconButton>
                        </Link>
                        <IconButton onClick={reloadSession} aria-controls="simple-menu" aria-haspopup="true" edge="end" to color="inherit">
                            <RefreshIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </div>
        </div>

    return (
        <div>
            <React.Suspense fallback={<></>}>
                <CloudShellTheme />
                {(window.location.pathname.includes('/cloudshell-terminal/')) && <FullScreenTheme />}
            </React.Suspense>
            <ToastContainer></ToastContainer>
            {Cloudshell}
        </div>
    )
}
export default Cloudshell;
