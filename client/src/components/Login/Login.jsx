import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useCookies, Cookies } from 'react-cookie'
import { Context as AuthContext } from '../../providers/auth';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/logos/Bottomline-Logo.png';
import axios from 'axios'

function Copyright() {
	return (
		<div>
			<Typography variant="body2" color="textSecondary" align="center">
				Developed and Maintained by CFRM Cloud DevOps Team
			</Typography>
			<Typography variant="body2" color="textSecondary" align="center">
				{'Copyright © '}
				<Link color="inherit" href="https://www.bottomline.com">
					Bottomline Technologies
				</Link>
			</Typography>
		</div>
	);
}

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const Login = () => {
	const [cookies, setCookie] = useCookies(['x-access-token']);
	const { setUser } = useContext(AuthContext);
	const [username, setusername] = useState('');
	const [password, setPassword] = useState('');
	const history = useHistory();
	const [loading, setLoading] = useState(false);


	useEffect(() => {
		// Update the document title using the browser API
		if (cookies['x-access-token']) {
			history.push('./dashboard')
		}
	}, []);


	const handleChange = (type) => (e) => {
		if (type === 'username') {
			setusername(e.target.value);
		} else if (type === 'password') {
			setPassword(e.target.value);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	};

	const handleSubmit = async (e) => {
		try {
			if (!username) {
				toast.error("Username is required", { position: "bottom-right" });
				return;
			}
			if (!password) {
				toast.error("Password is required", { position: "bottom-right" });
				return;
			}
			setLoading(true);
			const instance = axios.create();
			instance.defaults.timeout = 1000 * 60;
			const response = await instance.post(`${process.env.REACT_APP_API_ENDPOINT}/auth/login`, { username: username.trim(), password: password.trim() }, { timeout: 1000 * 60 })
			if (response.data.statusCode === 200) {
				setCookie('x-access-token', response.data.data.token, { path: '/', expires: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)) });
				localStorage.setItem('username', response.data.data.username);
				localStorage.setItem('role', response.data.data.role);
				await getConfig();
				history.push('/dashboard', { from: 'login' });
				setLoading(false)
			} else {
				setLoading(false)
				toast.error("Username/Password incorrect", { position: "bottom-right" });
			}
		} catch (ex) {
			setLoading(false)
			if (ex.response && ex.response.data && ex.response.data.message) {
				toast.error(ex.response.data.message, { position: "bottom-right" });
			} else {
				toast.error("Username/Password incorrect", { position: "bottom-right" });
			}

		}
	};

	const getConfig = async () => {
		const configResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/config`, { withCredentials: true });
		if (configResponse.data.statusCode === 200) {
			localStorage.setItem('datacenter', configResponse.data.data.DATA_CENTER);
		}
	}



	const classes = useStyles();
	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>

				<img src={logo} alt="Logo" loading='lazy' style={{ width: "300px" }} />


				<span style={{ fontStyle: "normal", fontWeight: 100, fontSize: "20px", color: "#333333" }}>CFRM Cloud Management Platform</span>

				<div className={classes.form}>
					<TextField variant="outlined" margin="normal" required fullWidth id="username" label="Username"
						name="username" autoComplete="username" autoFocus onChange={handleChange('username')} onKeyDown={handleKeyDown}
					/>

					<TextField variant="outlined" margin="normal" required fullWidth name="password" label="Password"
						type="password" id="password" autoComplete="current-password" onChange={handleChange('password')} onKeyDown={handleKeyDown}
					/>
					<Button style={{ backgroundColor: "#0070b9" }} disabled={loading} type="submit" fullWidth variant="contained" color="primary" className={classes.submit} onClick={handleSubmit}>
						Sign In
						{loading && <CircularProgress color='secondary' size={14} />}
					</Button>
					<ToastContainer />
				</div>
			</div>
			<Copyright />
			<Box mt={8}></Box>
		</Container>
	);
};

export default Login;


