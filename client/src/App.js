import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider, RouteProvider } from './providers';
import { useCookies } from 'react-cookie';
import Login from './components/Login';
import Tier from './components/Tier';
import Toolbox from './components/Management/Toolbox';
import PrivateRoute from './components/shared/Routes/PrivateRoute';
import AdminRoute from './components/shared/Routes/AdminRoute';
import SuperAdminRoute from './components/shared/Routes/SuperAdminRoute';
import Encryption from './components/Management/Toolbox/Encryption';
import { CookiesProvider } from 'react-cookie';
import Dashboard from './components/Dashboard';
import Project from './components/Project';
import Cloudspace from './components/Admin/Cloudspace';
import Settings from './components/Admin/Settings';
import K8S from './components/K8S';
import Alerts from './components/Alerts/Alerts';
import Server from './components/Server';
import Workers from './components/Management/Workers';
import Roles from './components/Management/Roles';
import Configuration from './components/Management/Configuration';
import Cloudshell from './components/Server/Tabs/Cloudshell/Cloudshell';
import { useIdleTimer } from 'react-idle-timer';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Header from './components/shared/Header';
import SideBar from './components/shared/SideBar';


const App = () => {

	const childRef = useRef()
	const [clickIdleModal, setClickIdleModal] = useState(false);
	const [openSidebar, setOpen] = useState(true);
	const [cookies, setCookie, removeCookie] = useCookies(['x-access-token']);


	const handleLogutIdle = async (isCookieExpired = false) => {
		removeCookie('x-access-token');
		await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/auth/logout`, {});
		localStorage.removeItem('username');
		localStorage.removeItem('role');
		localStorage.removeItem('tabIndex');
		localStorage.removeItem('cloudspace');
		if (isCookieExpired) {
			setClickIdleModal(true);
			setTimeout(() => {
				window.location.reload();
			}, 5000)
		} else {
			window.location.reload();
		}
	};

	axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
		if (err?.response?.status === 401 || err?.response?.data?.statusCode === 401) {
			handleLogutIdle(true);
		} else {
			return Promise.reject(err);
		}
	});


	const handleOnIdle = (event) => {
		if (window.location.pathname !== '/') {
			handleLogutIdle()
		}
	};

	const { getLastActiveTime } = useIdleTimer({
		timeout: 1000 * 60 * 60, //after 1 hour
		onIdle: handleOnIdle,
		debounce: 500
	});

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const updateTabIndex = () => {
		childRef.current.updateTabIndex();
	};

	const idleModal = <Dialog maxWidth='lg' disableBackdropClick={true} fullWidth open={clickIdleModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">Your Session is About to Expire!</DialogTitle>
		<DialogContent>
			<DialogContentText>
				<span >Your session is about to expire.</span>
				<br></br>
				<span >In 5 Seconds you will be logout, Please sign in again.</span>
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			{/* <Button style={{ color: 'rgb(0, 112, 185)' }} variant="contained" onClick={handleLogutIdle} >Logout</Button> */}
		</DialogActions>
	</Dialog>

	const LoginContainer = () => (
		<div style={{ marginTop: 200 }} >
			<Route exact path="/" component={Login} />
			<Route exact path="/" render={() => <Redirect to="/" />} />
		</div>
	);

	const DefaultContainer = () => (
		<div style={{ display: 'flex', marginTop: '100px', marginLeft: '50px' }}>
			<Header open={openSidebar} handleDrawerOpen={handleDrawerOpen} />
			<SideBar open={openSidebar} ref={childRef} handleDrawerClose={handleDrawerClose} />
			<PrivateRoute exact updateTabIndex={updateTabIndex} path="/dashboard" component={Dashboard} />
			<PrivateRoute exact updateTabIndex={updateTabIndex} path="/projects" component={Project} />
			<PrivateRoute exact updateTabIndex={updateTabIndex} path="/tiers" component={Tier} />
			<PrivateRoute exact updateTabIndex={updateTabIndex} path="/servers" component={Server} />
			<PrivateRoute exact path="/kubernetes" component={K8S} />
			<PrivateRoute exact path="/alerting" component={Alerts} />
			<AdminRoute exact path="/configuration" component={Configuration} />
			<AdminRoute exact path="/roles" component={Roles} />
			<AdminRoute exact path="/toolbox" component={Toolbox} />
			<AdminRoute exact path="/toolbox/encryption" component={Encryption} />
			<SuperAdminRoute exact path="/settings" component={Settings} />
			<SuperAdminRoute exact path="/cloudspaces" component={Cloudspace} />
			<SuperAdminRoute exact path="/workers" component={Workers} />
		</div>
	);

	const TerminalContainer = () => (
		<div>
			<PrivateRoute exact path="/cloudshell-terminal/:hostname" component={Cloudshell} />
		</div>
	);

	return (
		<div >
			<AuthProvider>
				<CookiesProvider>
					<RouteProvider>
						<Router>
							<Switch>
								<Route exact path="/cloudshell-terminal/:hostname" component={TerminalContainer} />
								<Route exact path="/" component={LoginContainer} />
								<Route component={DefaultContainer} />
							</Switch>
						</Router>
					</RouteProvider>
				</CookiesProvider>
			</AuthProvider>
			{idleModal}
		</div>
	);
};

export default App;
