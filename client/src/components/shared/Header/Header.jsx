import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import clsx from 'clsx';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import headerStyles from './headerStyles';
import FilterDramaIcon from '@material-ui/icons/FilterDrama';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import MenuList from '@material-ui/core/MenuList';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { Avatar } from '@material-ui/core';
import Typography from "@material-ui/core/Typography";
import Loader from '../../shared/Loader';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const Header = (props) => {
	const { open, handleDrawerOpen } = props;
	const history = useHistory();
	const [isLoading, setIsLoading] = useState(false);
	const [cookies, setCookie, removeCookie] = useCookies(['x-access-token']);
	const classes = headerStyles();
	const anchorRef = useRef(null);
	const [openAvatar, setOpenAvatar] = useState(false);
	const [clickAboutModal, setClickAboutModal] = useState(false);
	const [aboutDetails, setAboutDetails] = useState(null);
	const [userinformation, setUserinformation] = useState('');
	const [isOpenUserModal, setIsOpenUserModal] = useState(false);

	const username = localStorage.getItem('username');

	const handleToggle = () => {
		setOpenAvatar((prevOpen) => !prevOpen);
	};

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return;
		}
		setOpenAvatar(false);
	};

	function handleListKeyDown(event) {
		if (event.key === 'Tab') {
			event.preventDefault();
			setOpenAvatar(false);
		}
	}

	const prevOpen = useRef(open);
	useEffect(() => {
		if (prevOpen.current === true && open === false) {
			anchorRef.current.focus();
		}
		prevOpen.current = open;
	}, [open]);

	const onClickLogout = async () => {
		try {
			removeCookie('x-access-token');
			localStorage.removeItem('tabIndex')
			const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/auth/logout`, {});
			if (response.data.statusCode === 200) {
				toast.info("You logged out", { position: "bottom-right" });
				localStorage.removeItem('username');
				localStorage.removeItem('role');
				localStorage.removeItem('cloudspace');
				history.push('/');
			} else {
				toast.error("Logged out failed", { position: "bottom-right" });
			}

		} catch (ex) {
			toast.error("Logged out failed", { position: "bottom-right" });
		}
	}

	const onClickAbout = async () => {
		try {
			setIsLoading(true)
			const aboutResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/config/about`, { withCredentials: true });
			if (aboutResponse.data.statusCode === 200) {
				if (aboutResponse.data.data && aboutResponse.data.data.buildNumber) {
					setAboutDetails({
						buildNumber: aboutResponse.data.data.buildNumber,
						environment: aboutResponse.data.data.environment,
						date: aboutResponse.data.data.date
					})
				}
			}
			setIsLoading(false)
			setClickAboutModal(true);
		} catch (ex) {
			setIsLoading(false)
			setClickAboutModal(true);
		}

	}

	const handleCloseAboutModal = () => {
		setClickAboutModal(false);
	}

	const handleCloseUserModal = () => {
		setUserinformation('');
		setIsOpenUserModal(false);
	}

	const onClickUserInfo = () => {
		getUsernameMetaData(username);
	}

	const getUsernameMetaData = async (username) => {
		try {
			setIsLoading(true);
			const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/auth/role/user?username=${username}`, { withCredentials: true })
			if (response.data.statusCode === 200) {
				setUserinformation(response.data.data);
				setIsOpenUserModal(true)
				setIsLoading(false);
				return;
			}
			setIsLoading(false);
			toast.error("Failed to get user information", { position: "bottom-right" });
		} catch (ex) {
			setIsLoading(false);
			toast.error("Failed to get user information", { position: "bottom-right" })
		}
	}


	const aboutModal = <Dialog maxWidth='md' disableBackdropClick={true} fullWidth open={clickAboutModal} onClose={handleCloseAboutModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">About</DialogTitle>
		<DialogContent>
			<DialogContentText>
				<span style={{ fontWeight: 'bold' }}>Build Number :</span> {aboutDetails && aboutDetails.buildNumber ? aboutDetails.buildNumber : 'Not available'}
				<br></br>
				<span style={{ fontWeight: 'bold' }}>Environment :</span> {aboutDetails && aboutDetails.environment ? aboutDetails.environment : 'Not available'}
				<br></br>
				<span style={{ fontWeight: 'bold' }}>Build date :</span> {aboutDetails && aboutDetails.date ? aboutDetails.date : 'Not available'}
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseAboutModal} color="primary">Close</Button>
		</DialogActions>
	</Dialog>

	const userModal = <Dialog disableBackdropClick={true} maxWidth='lg' fullWidth open={isOpenUserModal} onClose={handleCloseUserModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">User information</DialogTitle>
		<DialogContent>
			<DialogContentText>
				<div style={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
					<div style={{ width: "50%" }}>
						{
							userinformation ?
								Object.keys(userinformation).map(key =>
									<div>
										{
											Array.isArray(userinformation[key]) ? <Typography type="body2" style={{ fontSize: 15, fontWeight: 500 }}>{key}:</Typography> : null
										}
										{
											Array.isArray(userinformation[key]) ?
												userinformation[key].map((item, i) => {
													return <li style={{ marginLeft: 15 }} key={i}>{item}</li>
												})
												:
												<Typography type="body2" style={{ fontSize: 15, fontWeight: 500 }}>{key} : {userinformation[key]}</Typography>
										}
									</div>
								) : null
						}
					</div>
					<div style={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
						<Avatar style={{ width: 300, height: 300 }}>

						</Avatar>
					</div>
				</div>
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseUserModal} color="primary">Ok</Button>
		</DialogActions>
	</Dialog>

	return (
		<AppBar
			position="fixed"
			style={{ backgroundColor: "#0070b9" }}
			className={clsx(classes.appBar, {
				[classes.appBarShift]: open,
			})}
		>
			<Toolbar >
				<IconButton
					color="inherit"
					aria-label="open drawer"
					onClick={handleDrawerOpen}
					edge="start"
					className={clsx(classes.menuButton, {
						[classes.hide]: open,
					})}
				>
					<MenuIcon />
				</IconButton>
				<FilterDramaIcon />
				<Loader isLoading={isLoading}></Loader>
				<div style={{ fontFamily: "'Roboto', 'Helvetica', 'Arial, sans-serif", fontWeight: 1, fontSize: 20, marginLeft: 9 }}>BT Cloud Management Platform</div>

				<div style={{ marginLeft: 'auto' }}>
					<IconButton
						ref={anchorRef}
						aria-controls={openAvatar ? 'menu-list-grow' : undefined}
						aria-haspopup="true"
						onClick={handleToggle}
					>
						<Avatar  >{username && username.split('')[0].toUpperCase() + username.split('')[1].toUpperCase()}</Avatar>
					</IconButton >
					<Popper open={openAvatar} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
						{({ TransitionProps, placement }) => (
							<Grow
								{...TransitionProps}
								style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
							>
								<Paper>
									<ClickAwayListener onClickAway={handleClose}>
										<MenuList autoFocusItem={openAvatar} id="menu-list-grow" onKeyDown={handleListKeyDown}>
											<MenuItem onClick={onClickLogout}>Logout</MenuItem>
											<MenuItem onClick={onClickAbout}>About</MenuItem>
											<MenuItem onClick={onClickUserInfo}>User Info</MenuItem>
										</MenuList>
									</ClickAwayListener>
								</Paper>
							</Grow>
						)}
					</Popper>
				</div>
				{aboutModal}
				{userModal}
			</Toolbar>
			<ToastContainer />
		</AppBar>
	);
};

export default Header;
