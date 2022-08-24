import React, { useContext, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useCookies, Cookies } from 'react-cookie'
import clsx from 'clsx';
import { useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import DashboardIcon from '@material-ui/icons/Dashboard';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import PollIcon from '@material-ui/icons/Poll';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import WorkIcon from '@material-ui/icons/Work';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import Collapse from '@material-ui/core/Collapse';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CloudIcon from '@material-ui/icons/Cloud';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import BuildIcon from '@material-ui/icons/Build';
import sideBarStyles from './sideBarStyles';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import StorageIcon from '@material-ui/icons/Storage';
import SettingsIcon from '@material-ui/icons/Settings';
import TuneIcon from '@material-ui/icons/Tune';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import WebIcon from '@material-ui/icons/Web';
import { isAdminUser, isSuperAdminUser } from '../../../helpers/auth.js';
import logo from '../../../assets/logos/Inspector-Logo';
import Loader from '../Loader';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { Context as RouteContext } from '../../../providers/route';



const SideBar = forwardRef((props, ref) => {
	const history = useHistory();
	const [cookies, setCookie, removeCookie] = useCookies(['x-access-token']);
	const { open, handleDrawerClose } = props;
	const { setPath } = useContext(RouteContext);
	const [openCloudExpend, setOpenExpendCloud] = useState(true);
	const [openAdminExpend, setOpenExpendAdmin] = useState(true);
	const [openSuperAdminExpend, setOpenExpendSuperAdmin] = useState(true);
	const [selectedIndex, setSelectedIndex] = useState(localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') : '0');
	const [cloudspace, setCloudspace] = useState([])
	const [isLoading, setIsLoading] = useState(false)

	const classes = sideBarStyles();
	const theme = useTheme();

	useEffect(() => {
		if (cookies['x-access-token']) {
			setSelectedIndex(localStorage.getItem('tabIndex'))
			fetchData();
		}
	}, []);

	useImperativeHandle(ref, () => ({
		updateTabIndex() {
			setSelectedIndex(localStorage.getItem('tabIndex'))
		}
	}));


	const fetchData = async () => {
		try {
			const firstCloudspace = await fetchCloudspace();
			if (!firstCloudspace) {
				return;
			}
			if (!localStorage.getItem('cloudspace')) {
				localStorage.setItem('cloudspace', JSON.stringify(firstCloudspace))
				await changeCloudSpace(firstCloudspace.id);
			}
		} catch (ex) {
			history.push('/');
		}

	}

	const fetchCloudspace = async () => {
		try {
			setIsLoading(true);
			const cloudspaceRes = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/cloudspace`, { withCredentials: true });
			if (cloudspaceRes && cloudspaceRes.data.statusCode === 200) {
				if (cloudspaceRes.data.data.length === 0) {
					setIsLoading(false);
					return;
				}
				const cloudspaces = cloudspaceRes.data.data.map(cloudspace => ({ name: cloudspace.name, id: cloudspace._id }))
				const sortedCloudspaces = cloudspaces.sort((a, b) => a.name.localeCompare(b.name))
				setCloudspace(sortedCloudspaces);
				setIsLoading(false);
				return {
					name: sortedCloudspaces[0].name, id: sortedCloudspaces[0].id
				};
			}
			setIsLoading(false);
			toast.error("Failed to get all cloudspaces", { position: "bottom-right" });
		} catch (ex) {
			setIsLoading(false);
			toast.error("Failed to get all cloudspaces", { position: "bottom-right" });
		}
	}

	const changeCloudSpace = async (cloudspaceID) => {
		try {
			setIsLoading(true);
			const cloudspaceResponse = await axios.get(
				`${process.env.REACT_APP_API_ENDPOINT}/auth/role/cloudspace?cloudspaceID=${cloudspaceID}&username=${localStorage.getItem('username')}`,
				{ withCredentials: true }
			);
			if (cloudspaceResponse.data.statusCode === 200) {
				localStorage.setItem('role', cloudspaceResponse.data.data.roles);
				setCookie('x-access-token', cloudspaceResponse.data.data.token, { path: '/', expires: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)) });
				setIsLoading(false);
				return;
			}
			setIsLoading(false);
			toast.error("Failed to change cloudspace", { position: "bottom-right" });
		} catch (ex) {
			setIsLoading(false);
			toast.error("Failed to change cloudspace", { position: "bottom-right" });
		}
	}

	const handleClick = (text, index) => () => {
		localStorage.setItem('tabIndex', index);
		setSelectedIndex(index.toString())
		history.push(`/${text}`);
		setPath(text);
	};

	const handleClickExpend = (e) => {
		setOpenExpendCloud(!openCloudExpend);
	};
	const handleClickExpendAdmin = (e) => {
		setOpenExpendAdmin(!openAdminExpend);
	};
	const handleClickExpendSuperAdmin = (e) => {
		setOpenExpendSuperAdmin(!openSuperAdminExpend);
	};

	const onChangeCloudspace = async (e, value) => {
		if (!value) {
			return;
		}
		await changeCloudSpace(value.id)
		localStorage.setItem('cloudspace', JSON.stringify(value));
		history.push(history.location.pathname)
	}


	return (
		<Drawer
			variant="permanent"
			className={clsx(classes.drawer, {
				[classes.drawerOpen]: open,
				[classes.drawerClose]: !open,
			})}
			classes={{
				paper: clsx({
					[classes.drawerOpen]: open,
					[classes.drawerClose]: !open,
				}),
			}}
		>
			<Grid container alignItems="center" justify="flex-end" className={classes.toolbar}>
				<IconButton onClick={handleDrawerClose}>{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
			</Grid>
			<img src={logo} alt="Logo" style={{ width: open ? "200px" : '270px', marginTop: open ? '0px' : '10px' }} />
			<br></br>
			{
				open && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
					<Autocomplete
						id="combo-box-demo"
						defaultValue={localStorage.getItem('cloudspace') && localStorage.getItem('cloudspace') !== 'null' ?
							JSON.parse(localStorage.getItem('cloudspace')).name
							: ''
						}
						options={cloudspace}
						getOptionLabel={(option) => option.name || ""}
						style={{ width: 235 }}
						renderInput={(params) =>
							<TextField
								{...params}
								label={localStorage.getItem('cloudspace') && localStorage.getItem('cloudspace') !== 'null' ?
									JSON.parse(localStorage.getItem('cloudspace')).name
									: "CloudSpace"
								}
								variant="outlined"
							/>}
						onChange={onChangeCloudspace}
					/>
				</div>
			}
			<Loader isLoading={isLoading}></Loader>
			<Divider />
			<List>

				<ListItem button key={'Cloud'} onClick={handleClickExpend}>
					<ListItemIcon><CloudIcon /></ListItemIcon>
					<ListItemText primary={`BT Cloud  ${localStorage.getItem('datacenter') ? '- ' + localStorage.getItem('datacenter').toUpperCase() : ''}`} />
					{openCloudExpend ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={openCloudExpend} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '0' : selectedIndex === '0'} button key={'Dashboard'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('dashboard', 0)}>
							<ListItemIcon><PollIcon /></ListItemIcon>
							<ListItemText primary={'Dashbaord'} />
						</ListItem>
						<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '1' : selectedIndex === '1'} button key={'Projects'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('projects', 1)}>
							<ListItemIcon><AccountTreeIcon /></ListItemIcon>
							<ListItemText primary={'Projects'} />
						</ListItem>
						<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '2' : selectedIndex === '2'} button key={'Tiers'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('tiers', 2)}>
							<ListItemIcon><DashboardIcon /></ListItemIcon>
							<ListItemText primary={'Tiers'} />
						</ListItem>
						<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '3' : selectedIndex === '3'} button key={'Servers'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('servers', 3)}>
							<ListItemIcon><StorageIcon /></ListItemIcon>
							<ListItemText primary={'Servers'} />
						</ListItem>
						<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '4' : selectedIndex === '4'} button key={'Alerts'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('alerting', 4)}>
							<ListItemIcon><NotificationsNoneIcon /></ListItemIcon>
							<ListItemText primary={'Alerts'} />
						</ListItem>
						<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '5' : selectedIndex === '5'} button key={'K8S'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('kubernetes', 5)}>
							<ListItemIcon><WebIcon /></ListItemIcon>
							<ListItemText primary={'K8S'} />
						</ListItem>
					</List>
				</Collapse>
				{
					(isSuperAdminUser() || isAdminUser()) &&
					<div>
						<ListItem button key={'Management'} onClick={handleClickExpendAdmin}>
							<ListItemIcon><SettingsIcon /></ListItemIcon>
							<ListItemText primary={'Management'} />
							{openAdminExpend ? <ExpandLess /> : <ExpandMore />}
						</ListItem>
						<Collapse in={openAdminExpend} timeout="auto" unmountOnExit>
							<List component="div" disablePadding>
								<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '6' : selectedIndex === '6'} button key={'Configuration'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('configuration', 6)}>
									<ListItemIcon><TuneIcon /></ListItemIcon>
									<ListItemText primary={'Configuration'} />
								</ListItem>
								<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '7' : selectedIndex === '7'} button key={'Roles'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('roles', 7)}>
									<ListItemIcon><AccountCircleIcon /></ListItemIcon>
									<ListItemText primary={'Roles'} />
								</ListItem>
								<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '8' : selectedIndex === '8'} button key={'Toolbox'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('toolbox', 8)}>
									<ListItemIcon><BuildIcon /></ListItemIcon>
									<ListItemText primary={'Toolbox'} />
								</ListItem>
							</List>
						</Collapse>
					</div>
				}
				{
					isSuperAdminUser() &&
					<div>
						<ListItem button key={'SuperAmin'} onClick={handleClickExpendSuperAdmin}>
							<ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
							<ListItemText primary={'Admin'} />
							{openSuperAdminExpend ? <ExpandLess /> : <ExpandMore />}
						</ListItem>
						<Collapse in={openSuperAdminExpend} timeout="auto" unmountOnExit>
							<List component="div" disablePadding>
								<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '9' : selectedIndex === '9'} button key={'Cloudspaces'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('cloudspaces', 9)}>
									<ListItemIcon><CloudCircleIcon /></ListItemIcon>
									<ListItemText primary={'CloudSpaces'} />
								</ListItem>
								<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '10' : selectedIndex === '10'} button key={'Settings'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('settings', 10)}>
									<ListItemIcon><PermDataSettingIcon /></ListItemIcon>
									<ListItemText primary={'Settings'} />
								</ListItem>
								<ListItem selected={localStorage.getItem('tabIndex') ? localStorage.getItem('tabIndex') === '11' : selectedIndex === '11'} button key={'Workers'} style={{ paddingLeft: theme.spacing(4) }} onClick={handleClick('workers', 11)}>
									<ListItemIcon><WorkIcon /></ListItemIcon>
									<ListItemText primary={'Workers'} />
								</ListItem>
							</List>
						</Collapse>
					</div>
				}
			</List>
			<ToastContainer />
		</Drawer>

	);
});

export default SideBar;
