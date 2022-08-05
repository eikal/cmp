import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Select from '@material-ui/core/Select';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InputLabel from '@material-ui/core/InputLabel';
import MUIDataTable from "mui-datatables";
import Loader from '../shared/Loader';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import TabsTier from './TabsTier.jsx';
import { isBasicUser, getCloudspaceID } from '../../helpers/auth.js';
import { getLocalDateTime } from '../../helpers/date.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import '../shared/StatusIcon/style.css'
import 'react-toastify/dist/ReactToastify.css'


const Tier = (props) => {
	const history = useHistory();

	const [tiers, setTiers] = useState([]);
	const [projects, setProjects] = useState([]);
	const [tiersOptions, setTiersOptions] = useState([]);
	const [tierDetails, setTierDetails] = useState('');
	const [rowsSelected, setRowsSelected] = useState([0])
	const [columns, setColumns] = useState([]);

	const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openModalDeleteTier, setOpenModalDeleteTier] = useState(false);

	const [tierName, setTierName] = useState('');
	const [description, setDescription] = useState('');

	const [tierSelectedProject, setTierSelectedProject] = useState('');
	const [selectedTierID, setSlectedTierID] = useState('');
	const [isEditTier, setIsEditTier] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [filterListTierID, setFilterListTierID] = useState(props.history.location.state && props.history.location.state.tierID ? [props.history.location.state.tierID] : null)
	const [filterListTier, setFilterListTier] = useState(props.history.location.state && props.history.location.state.tier ? [props.history.location.state.tier] : null)
	const [filterListProject, setFilterListProject] = useState(props.history.location.state && props.history.location.state.project ? [props.history.location.state.project] : null)

	useEffect(() => {
		localStorage.setItem('tabIndex', 2);
		props.updateTabIndex();
		fetchData()
	}, [getCloudspaceID()]);


	const fetchData = async () => {
		try {
			const cloudspaceID = getCloudspaceID()
			if (!cloudspaceID) return;
			setIsLoading(true);
			const tiersRes = await getTiers(cloudspaceID);
			if (tiersRes && tiersRes.length !== 0) {
				setTierDetials(tiersRes);
			} else {
				setTierDetails('');
			}
			getTierOptions();
			setColumns(getColumns());
			setIsLoading(false)
		} catch (ex) {
			setIsLoading(false)
			toast.error("Failed to get tiers", { position: "bottom-right" });
		}
	}

	const getTiers = async (cloudspaceID) => {
		try {
			const tiersResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/tier?cloudspace=${cloudspaceID}`, { withCredentials: true });
			if (tiersResponse && tiersResponse.data.statusCode !== 200) {
				toast.error("Failed to get Tiers", { position: "bottom-right" });
				return;
			}
			setTiers(tiersResponse.data.data);
			return tiersResponse.data.data;
		} catch (ex) {
			toast.error("Failed to get Tiers", { position: "bottom-right" });
		}
	}

	const getTierOptions = async () => {
		try {
			const tiersOptions = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/facts/generic/bt_tier`, { withCredentials: true })
			if (tiersOptions && tiersOptions.data.statusCode !== 200) {
				toast.error("Failed to get tiers options", { position: "bottom-right" });
			}
			setTiersOptions(tiersOptions.data.data)
		} catch (ex) {
			toast.error("Failed to get tiers options", { position: "bottom-right" });
		}
	}

	const setTierDetials = async (tiers) => {
		try {
			let tierDetails;
			if (filterListTier) {
				for (let i = 0; i < tiers.length; i++) {
					if (filterListProject) {
						if (tiers[i].tier.name === filterListTier[0] && tiers[i].project.name === filterListProject[0]) {
							tierDetails = tiers[i];
						}
					} else {
						if (tiers[i].tier.name === filterListTier[0]) {
							tierDetails = tiers[i];
						}
					}
				}
			}
			if (filterListTierID) {
				for (let i = 0; i < tiers.length; i++) {

					if (tiers[i].tier._id === filterListTierID[0]) {
						tierDetails = tiers[i];
					}

				}
			}
			if (!tierDetails) {
				tierDetails = tiers.length > 0 ? tiers[0] : null;
			}
			setTierDetails(tierDetails);
		} catch (ex) {
			toast.error("Failed to set tier details", { position: "bottom-right" });
			return;
		}
	};

	const clickOpenModalNewTier = async () => {
		await getProjects();
		setOpenModal(true);
	}


	const fillDescription = (e) => {
		setDescription(e.target.value);
	}

	const handleCloseModal = () => {
		clearTierModal();
		setIsEditTier(false);
		setOpenModal(false);
	};

	const handleCloseModalDeleteTier = () => {
		clearTierModal();
		setOpenModalDeleteTier(false);
	};

	const clearTierModal = () => {
		setTierName('');
		setDescription('');
		setSlectedTierID('');
		setTierSelectedProject('');
	};

	const handleCloseHelpModal = () => {
		setIsOpenHelpModal(false);
	};

	const handleOpenHelpModal = (row) => {
		setIsOpenHelpModal(true)
	};

	const editTier = (row) => (e) => {
		setIsEditTier(true);
		setOpenModal(true);
		setTierName(row.tier.name);
		setDescription(row.tier.description);
		setSlectedTierID(row.tier._id)
		setTierSelectedProject({ name: row.project.name })

	};

	const deleteTier = (row) => async (e) => {
		setOpenModalDeleteTier(true);
		setTierName(row.tier.name);
		setDescription(row.tier.description);
		setSlectedTierID(row.tier._id)
		setTierSelectedProject({ id: row.project.id })
	};



	const handleProjectLinkClick = (val) => (e) => {
		if (!val) {
			history.push(`/projects`)
		} else {
			history.push(`/projects`, { project: val })
		}
	}

	const handleSaveModal = async () => {
		try {
			if (!tierName) {
				toast.error("Tier Name cannot be empty", { position: "bottom-right" });
				return;
			}
			if (!description) {
				toast.error("Description cannot be empty", { position: "bottom-right" });
				return;
			}
			if (!isEditTier) {
				if (!tierSelectedProject) {
					toast.error("Project cannot be empty", { position: "bottom-right" });
					return;
				}
				const newTierRes = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tier`, { name: tierName, description: description, projectID: tierSelectedProject.id }, { withCredentials: true })
				if (newTierRes && newTierRes.data.statusCode === 200) {
					toast.success("New Tier has been created", { position: "bottom-right" });
					const newTier = {
						tier: {
							_id: newTierRes.data.data._id,
							name: newTierRes.data.data.name,
							description: newTierRes.data.data.description,
							createdBy: newTierRes.data.data.createdBy,
							createdDate: newTierRes.data.data.createdDate
						},
						project: tierSelectedProject,
						servers: []

					}
					newTier.tier['projectName'] = tierSelectedProject.name;
					setTiers(tiers => [...tiers, newTier])

				} else {
					toast.error("Failed to create new tier", { position: "bottom-right" });
				}
			} else {
				const editProjectRes = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/tier/${selectedTierID}`, { name: tierName, description: description }, { withCredentials: true });
				if (editProjectRes && editProjectRes.data.statusCode === 200) {
					toast.success("Tier has been edited", { position: "bottom-right" });
					const existingTierIndex = tiers.findIndex((tier, index) => {
						if (tier.tier._id === selectedTierID)
							return true;
					});
					const newArrayOfTiers = tiers;
					editProjectRes.data.data['projectName'] = tierSelectedProject.name;
					newArrayOfTiers[existingTierIndex] = {
						project: tiers[existingTierIndex].project,
						tier: editProjectRes.data.data,
						servers: tiers[existingTierIndex].servers
					}
					setTiers(newArrayOfTiers);
				} else {
					toast.error("Failed to update Tier", { position: "bottom-right" });
				}
				setIsEditTier(false);
			}
			setOpenModal(false);
			clearTierModal();
		} catch (ex) {
			clearTierModal();
			setOpenModal(false);
		}

	};

	const getProjects = async () => {
		try {
			const cloudspaceID = getCloudspaceID()
			if (!cloudspaceID) return;
			const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
			if (projectsResponse && projectsResponse.data.statusCode !== 200) {
				toast.error("Failed to get Projects", { position: "bottom-right" });
				return;
			} else {
				const projects = [];
				for (const project of projectsResponse.data.data) {
					projects.push({ name: project.project.name, id: project.project._id });
				}
				setProjects(projects);
				return projects;
			}
		} catch (ex) {
			toast.error("Failed to get projects", { position: "bottom-right" });
		}
	};

	const handleSaveModalDeleteTier = async (e) => {
		try {
			const projectID = tierSelectedProject.id
			const isTierDeleted = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tier/${selectedTierID}`, { projectID: projectID }, { withCredentials: true });
			if (isTierDeleted && isTierDeleted.data.statusCode === 200) {
				toast.success("Tier has been deleted", { position: "bottom-right" });
				const existingTierIndex = tiers.findIndex((tier, index) => {
					if (tier.tier._id === selectedTierID)
						return true;
				});
				const newArrayOfTiers = tiers;
				newArrayOfTiers.splice(existingTierIndex, 1)
				setTiers(newArrayOfTiers);
			} else {
				toast.error("Failed to delete tier", { position: "bottom-right" });
			}
			clearTierModal();
			setOpenModalDeleteTier(false);
		} catch (ex) {
			clearTierModal();
			setOpenModalDeleteTier(false);
			toast.error("Failed to delete tier", { position: "bottom-right" });
		}
	};

	const editCreateModal = <Dialog disableBackdropClick={true} fullWidth open={openModal} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">{!isEditTier ? 'Select New Tier' : 'Edit Tier'}</DialogTitle>
		<DialogContent>
			<DialogContentText>
				{!isEditTier ? 'Select projects tier' : ''}
			</DialogContentText>

			<FormControl style={{ width: '100%' }} >
				<InputLabel id="select-tier-label">Select Tier</InputLabel>
				<Select
					labelId="select-tier-label"
					id="select-tier-label"
					value={tierName}
					onChange={(event, newValue) => {
						setTierName(event.target.value)
					}}
				>
					{tiersOptions.map((row, index) => (
						<MenuItem key={index} value={row.name}>{row.name}</MenuItem>
					))}
				</Select>
			</FormControl>
			<TextField
				value={description}
				required
				autoFocus
				margin="dense"
				id="description"
				label="Description"
				type="string"
				fullWidth
				onChange={fillDescription}
			/>
			{
				!isEditTier ? <Autocomplete
					id="combo-box-demo"
					options={projects}
					getOptionLabel={(option) => option.name}
					style={{ width: 300, marginTop: 20 }}
					onChange={(event, newValue) => {
						setTierSelectedProject({ id: newValue.id, name: newValue.name })
					}}
					renderInput={(params) => <TextField {...params} label="Select Project" variant="outlined" />}
				/> : false
			}
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Cancel</Button>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModal} color="primary">Save</Button>
		</DialogActions>
	</Dialog>

	const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteTier} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">Are you sure you want to delete this tier?</DialogTitle>
		<DialogContent>
			<DialogContentText>
				In a case of deletion releted tier will be deleted
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalDeleteTier} color="primary">No</Button>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteTier} color="primary">Yes</Button>
		</DialogActions>
	</Dialog>

	const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">Tiers</DialogTitle>
		<DialogContent>
			<DialogContentText>
				The Tiers page lists the tiers and the projects associated.
				Tiers can be one of the following: PROD, UAT, PPD, DR. Each tier may be associated with several servers.
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
		</DialogActions>
	</Dialog>

	const getColumns = (resetFilterType) => {
		let columnsArray = [];
		if (resetFilterType === 'ID') {
			columnsArray.push(
				{ name: "ID", options: { display: false, filterList: null } },
				{ name: "Tier", options: { filterList: filterListTier, display: true, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } },
				{ name: "Project", options: { filterList: filterListProject, display: true } }
			)

		}
		if (resetFilterType === 'Tier') {
			columnsArray = [];
			columnsArray.push(
				{ name: "ID", options: { display: false, filterList: filterListTierID } },
				{ name: "Tier", options: { filterList: null, display: true, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } },
				{ name: "Project", options: { filterList: filterListProject, display: true } }
			)
		}
		if (resetFilterType === 'Project') {
			columnsArray = [];
			columnsArray.push(
				{ name: "ID", options: { display: false, filterList: filterListTierID } },
				{ name: "Tier", options: { filterList: filterListTier, display: true, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } },
				{ name: "Project", options: { filterList: null, display: true } }
			)
		}
		if (columnsArray.length === 0) {
			columnsArray.push(
				{ name: "ID", options: { display: false, filterList: filterListTierID } },
				{ name: "Tier", options: { filterList: filterListTier, display: true, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } },
				{ name: "Project", options: { filterList: filterListProject, display: true } }
			)
		}
		columnsArray.push(
			{ name: "Project Type", options: { filter: true, sort: true, display: true } },
			{ name: "Description", options: { display: true } },
			{ name: "Created by", options: { display: true } },
			{
				name: "Created Date",
				label: "Created Date",
				options: {
					customBodyRender: value => {
						return getLocalDateTime(value);
					},
					sortCompare: (order) => {
						return (obj1, obj2) => {
							let val1 = moment(obj1.data).unix();
							let val2 = moment(obj2.data).unix();
							return (val1 - val2) * (order === "asc" ? 1 : -1);
						};
					}
				}
			},
			{ name: "Actions", options: { filter: false, sort: false, display: true } }
		)
		return columnsArray;
	}


	return (
		<Grid container wrap="nowrap">
			<Loader isLoading={isLoading}></Loader>
			<div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
				<div style={{ marginBottom: 8 }}>
					<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
						<Link style={{ cursor: 'pointer' }} color="inherit" onClick={handleProjectLinkClick(null)}>
							Projects
						</Link>
						{
							tierDetails && tierDetails.project.name &&
								<Link style={{ cursor: 'pointer' }} color="inherit" onClick={handleProjectLinkClick(tierDetails.project.name)}>Project - {tierDetails.project.name}</Link> 
						}
						{
							tierDetails && tierDetails.tier.name && <span>{tierDetails.tier.name}</span> 
						}
					</Breadcrumbs>
				</div>

				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<div style={{ display: 'flex', flexDirection: 'row' }}>
						<Typography style={{ fontWeight: 300 }} variant="h4"> Tiers</Typography>
						<Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
							<HelpIcon aria-controls="simple-menu"></HelpIcon>
						</Button>
					</div>
					<Button disabled={isBasicUser()} onClick={clickOpenModalNewTier} variant="contained" style={{ marginRight: 100 }} >
						Attach New Tier
					</Button>
				</div>

				{deleteModal}
				{editCreateModal}
				{helpModal}
				<div style={{ width: '95%', margin: '30px 0px' }}>
					<MUIDataTable
						title={"Tiers List"}
						data={
							tiers.map((row, i) => {
								return [
									row.tier._id,
									row.tier.name,
									row.project.name,
									row.project.solution,
									row.tier.description,
									row.tier.createdBy,
									row.tier.createdDate,
									<div>
										<Tooltip title={'Edit'}>
											<Button disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true" onClick={editTier(row)}>
												<EditIcon aria-controls="simple-menu" >
												</EditIcon>
											</Button>
										</Tooltip>
										<Tooltip title={'Remove'}>
											<Button disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true" onClick={deleteTier(row)}>
												<DeleteIcon aria-controls="simple-menu" >
												</DeleteIcon>
											</Button>
										</Tooltip>
									</div>
								]
							})
						}
						columns={columns}
						options={{
							searchOpen: true,
							filter: true,
							responsive: 'scrollMaxHeight',
							viewColumns: true,
							print: false,
							download: false,
							rowsPerPage: 10,
							rowsPerPageOptions: [50],
							selectableRows: 'single',
							rowsSelected: rowsSelected,
							selectableRowsOnClick: true,
							selectableRowsHideCheckboxes: true,
							selectToolbarPlacement: 'none',
							onViewColumnsChange: (changedColumn, action) => {
								for (const col of columns) {
									if (col.name === changedColumn) {
										if (action === 'add') {
											col.options.display = true;
										} else {
											col.options.display = false;
										}

									}
								}
								setColumns(columns)
							},
							onRowsSelect: (rowsSelectedInternal, allRows) => {
								if (filterListTierID) {
									//setFilterListTierID(null);
									setTierDetails(tiers[rowsSelectedInternal[0].dataIndex]);
									return;
								}
								if (filterListTier) {
									//setFilterListTier(null);
									if (filterListProject) {
										//setFilterListProject(null);
										setTierDetails(tiers[rowsSelectedInternal[0].dataIndex]);
										return;
									}
									setTierDetails(tiers[rowsSelectedInternal[0].dataIndex]);
									return;
								}

								setRowsSelected(allRows.map((row) => row.dataIndex));
								setTierDetails(tiers[rowsSelectedInternal[0].dataIndex])
							},
							onFilterChange: (changedCloumn, filterList, type, changedColumnIndex) => {
								if (filterListProject && changedCloumn === 'Project') {
									setFilterListProject(null)
									setColumns(getColumns('Project'));
								}
								if (filterListTier && changedCloumn === 'Tier') {
									setFilterListTier(null)
									setColumns(getColumns('Tier'));
								}
								if (filterListTierID && changedCloumn === 'ID') {
									setFilterListTierID(null)
									setColumns(getColumns('ID'));
								}
							}
						}}
					/>
					<ToastContainer />
				</div>
				<TabsTier tierDetails={tierDetails}></TabsTier>
			</div>
		</Grid>
	);
};

export default Tier;
