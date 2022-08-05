import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import MUIDataTable from "mui-datatables";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import TabsProject from './TabsProject.jsx';
import Loader from '../shared/Loader';
import { getLocalDateTime } from '../../helpers/date.js';
import { isBasicUser, getCloudspaceID } from '../../helpers/auth.js';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import '../shared/StatusIcon/style.css'
import 'react-toastify/dist/ReactToastify.css'



const Project = (props) => {

	const [projects, setProjects] = useState([]);
	const [tiersOptions, setTiersOptions] = useState([]);
	const [rowsSelected, setRowsSelected] = useState([0])
	const [columns, setColumns] = useState([]);

	const [openModal, setOpenModal] = useState(false);
	const [openModalTier, setOpenModalTier] = useState(false);
	const [openModalDeleteProject, setOpenModalDeleteProject] = useState(false);
	const [isOpenHelpModal, setIsOpenHelpModal] = useState(false);

	const [projectName, setProjectName] = useState('');
	const [isImportActions, setIsImportActions] = useState(true);
	const [tierName, setTierName] = useState('');
	const [solutionName, setSolutionName] = useState('');
	const [description, setDescription] = useState('');
	const [tierDescription, setTierDescription] = useState('');

	const [selectedProjectID, setSlectedProjectID] = useState('');
	const [selectedProjectDetails, setSlectedProjectDetails] = useState('');

	const [isEditProject, setIsEditProject] = useState(false);

	const [isLoading, setIsLoading] = useState(false);

	const [filterListProject, setFilterListProject] = useState(props.history.location.state && props.history.location.state.project ? [props.history.location.state.project] : null);
	const [filterListProjectID, setFilterListProjectID] = useState(props.history.location.state && props.history.location.state.projectID ? [props.history.location.state.projectID] : null);

	const solutions = ['Legacy (SP)', 'CFRM-IQ (WLS)', 'General'];

	useEffect(() => {
		localStorage.setItem('tabIndex', 1);
		props.updateTabIndex();
		handleProjects();
		getTiersOptions();
		setColumns(getColumns());
	}, [getCloudspaceID()]);


	const handleProjects = async () => {
		try {
			setIsLoading(true);
			const projectRes = await getProjects();
			if (projectRes && projectRes.length > 0) {
				setProjectDetails(projectRes);
			} else {
				setSlectedProjectDetails('')
			}
			setIsLoading(false);
		} catch (ex) {
			setIsLoading(false);
			toast.error("Failed to get projects", { position: "bottom-right" });
		}

	};

	const getProjects = async () => {
		try {
			const cloudspaceID = getCloudspaceID()
			if (!cloudspaceID) return;
			const projectsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/project?cloudspace=${cloudspaceID}`, { withCredentials: true });
			if (projectsResponse && projectsResponse.data.statusCode !== 200) {
				toast.error("Failed to get Projects", { position: "bottom-right" });
			} else {
				setProjects(projectsResponse.data.data);
				return projectsResponse.data.data;
			}
		} catch (ex) {
			toast.error("Failed to get projects", { position: "bottom-right" });
		}
	};


	const getTiersOptions = async () => {
		try {
			const tiersOptions = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/entity/facts/generic/bt_tier`, { withCredentials: true })
			if (tiersOptions && tiersOptions.data.statusCode !== 200) {
				toast.error("Failed to get tiers options", { position: "bottom-right" });
			}
			setTiersOptions(tiersOptions.data.data)
		} catch (ex) {
			toast.error("Failed to get tiers options", { position: "bottom-right" });
		}
	};

	const setProjectDetails = (projects) => {
		try {
			let projectDetails;
			if (filterListProject) {
				for (let i = 0; i < projects.length; i++) {
					if (projects[i].project.name === filterListProject[0]) {
						projectDetails = projects[i];
					}
				}
			}
			if (filterListProjectID) {
				for (let i = 0; i < projects.length; i++) {
					if (projects[i].project._id === filterListProjectID[0]) {
						projectDetails = projects[i];
					}
				}
			}
			if (!projectDetails) {
				projectDetails = projects.length > 0 ? projects[0] : null;
			}
			setSlectedProjectDetails(projectDetails);
		} catch (ex) {
			toast.error("Failed to set Project details ", { position: "bottom-right" });
		}
	}

	const handleChangeisImportActions = (event) => {
		setIsImportActions(event.target.checked);
	};

	const handleCloseModal = () => {
		clearProjectModal();
		setOpenModal(false);
		setOpenModalTier(false);
		setIsEditProject(false);
	};

	const handleCloseModalTier = () => {
		clearProjectModal();
		setOpenModal(false);
		setOpenModalTier(false);
		setIsEditProject(false);
	};

	const handleCloseModalDeleteProject = () => {
		clearProjectModal();
		setOpenModalDeleteProject(false);
	};

	const handleCloseHelpModal = () => {
		setIsOpenHelpModal(false);
	};

	const fillProjectName = (e) => {
		setProjectName(e.target.value);
	};

	const fillDescription = (e) => {
		setDescription(e.target.value);
	};

	const fillTierDescription = (e) => {
		setTierDescription(e.target.value);
	};

	const clickOpenModalNewProject = () => {
		setOpenModal(true);
	};

	const clearProjectModal = () => {
		setProjectName('');
		setDescription('');
		setSlectedProjectID('');
		setTierName('');
		setTierDescription('');
		setSolutionName('')
	};

	const editProject = (row) => (e) => {
		setIsEditProject(true);
		setOpenModal(true);
		setProjectName(row.name);
		setDescription(row.description);
		setSolutionName(row.solution);
		setSlectedProjectID(row._id)

	};

	const deleteProject = (row) => async (e) => {
		setOpenModalDeleteProject(true);
		setProjectName(row.name);
		setDescription(row.description);
		setSolutionName(row.solution);
		setSlectedProjectID(row._id)
	};

	const handleOpenHelpModal = (row) => {
		setIsOpenHelpModal(true)
	};

	const handleNextModal = (e) => {
		setOpenModal(false);
		setOpenModalTier(true)
	};

	const handleBackModal = (e) => {
		setOpenModal(true);
		setOpenModalTier(false)
	};

	const validateCreateEditProject = () => {
		if (!projectName) {
			toast.error("Project Name cannot be empty", { position: "bottom-right" });
			return false;
		}
		if (projectName.length < 2) {
			toast.error("Project Name cannot be less than 2 characters", { position: "bottom-right" });
			return false;
		}
		if (projectName.length > 30) {
			toast.error("Project Name too long", { position: "bottom-right" });
			return false;
		}
		if (selectedProjectDetails?.project?.name.toLowerCase() !== projectName.toLowerCase()) {
			const projectsNames = projects.map((project) => project.project.name.toLowerCase());
			if (projectsNames.includes(projectName.toLowerCase())) {
				toast.error("Project name already exist, Please choose different name", { position: "bottom-right" });
				return false;
			}
		}
		if (!description) {
			toast.error("Description cannot be empty", { position: "bottom-right" });
			return false;
		}
		if (!solutionName) {
			toast.error("Please choose solution", { position: "bottom-right" });
			return false;
		}
		if (!isEditProject) {
			if (!tierName) {
				toast.error("Tier Name cannot be empty", { position: "bottom-right" });
				return false;
			}
			if (!tierDescription) {
				toast.error("Tier Description cannot be empty", { position: "bottom-right" });
				return false;
			}
		}
		return true;
	}

	const handleSaveModal = async () => {
		try {
			const isInputsValid = validateCreateEditProject();
			if (!isInputsValid) return;
			if (!isEditProject) {
				const newProjectRes = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/project`,
					{
						name: projectName.replace(/\s+/g, ' ').trim(),
						description: description,
						solution: solutionName,
						cloudspaceID: getCloudspaceID()
					},
					{ withCredentials: true }
				);
				if (newProjectRes && newProjectRes.data.statusCode === 200) {
					toast.success("New project has been created", { position: "bottom-right" });
					const newProject = {
						project: {
							_id: newProjectRes.data.data._id,
							name: newProjectRes.data.data.name,
							description: newProjectRes.data.data.description,
							solution: newProjectRes.data.data.solution,
							createdBy: newProjectRes.data.data.createdBy,
							createdDate: newProjectRes.data.data.createdDate,
						},
						relations: []
					}

					const newTierRes = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/entity/tier`, { name: tierName, description: tierDescription, projectID: newProjectRes.data.data._id }, { withCredentials: true })
					if (newTierRes && newTierRes.data.statusCode === 200) {
						toast.success("New Tier has been created", { position: "bottom-right" });
						newProject.project.tierIDs = [newTierRes.data.data._id]
					} else {
						toast.error("Failed to create new tier", { position: "bottom-right" });
					}
					setOpenModalTier(false);
					newProject.relations.push({ tier: newTierRes.data.data, servers: [] });
					setProjects(projects => [...projects, newProject])
					setSlectedProjectDetails(newProject);
					if (isImportActions) {
						createDefaultActionsForProject(newProjectRes.data.data._id);
					}

				} else {
					toast.error("Failed to create new project", { position: "bottom-right" });
				}
			} else {
				const editProjectRes = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/entity/project/${selectedProjectID}`,
					{
						name: projectName.replace(/\s+/g, ' ').trim(),
						description: description,
						solution: solutionName
					},
					{ withCredentials: true }
				);
				if (editProjectRes && editProjectRes.data.statusCode === 200) {
					toast.success("Project has been edited", { position: "bottom-right" });
					const existingProjectIndex = projects.findIndex((project, index) => {
						if (project.project._id === selectedProjectID)
							return true;
					});
					const newArrayOfProjects = projects;
					const editedProject = {
						project: editProjectRes.data.data,
						relations: projects[existingProjectIndex].relations
					}
					newArrayOfProjects[existingProjectIndex] = editedProject;
					setProjects(newArrayOfProjects);
					setSlectedProjectDetails(editedProject)
				} else {
					toast.error("Failed to update project", { position: "bottom-right" });
				}
				setIsEditProject(false);
			}
			setOpenModal(false);
			clearProjectModal();
		} catch (ex) {
			clearProjectModal();
			setOpenModal(false);
			setOpenModalTier(false);
		}

	};

	const handleSaveModalDeleteProject = async (e) => {
		try {
			const isProjectDeleted = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/entity/project/${selectedProjectID}`, { withCredentials: true });
			if (isProjectDeleted && isProjectDeleted.data.statusCode === 200) {
				toast.success("Project has been deleted", { position: "bottom-right" });
				const existingProjectIndex = projects.findIndex((project, index) => {
					if (project.project._id === selectedProjectID)
						return true;
				});
				const newArrayOfProjects = projects;
				newArrayOfProjects.splice(existingProjectIndex, 1)
				setProjects(newArrayOfProjects);
				setSlectedProjectDetails(newArrayOfProjects[0]);
			} else {
				toast.error("Failed to delete project", { position: "bottom-right" });
			}
			clearProjectModal();
			setOpenModalDeleteProject(false);
		} catch (ex) {
			clearProjectModal();
			setOpenModalDeleteProject(false);
			toast.error("Failed to delete project", { position: "bottom-right" });
		}
	};

	const createDefaultActionsForProject = async (projectID) => {
		try {
			const dataObj = { projectID: projectID };
			const actionJobResponse = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/config/create-default-actions`, dataObj, { withCredentials: true });
			if (actionJobResponse && actionJobResponse.data.statusCode !== 200) {
				toast.error("Failed to create default action jobs", { position: "bottom-right" });
			}
		} catch (ex) {
			toast.error("Failed to create default action jobs", { position: "bottom-right" });
		}

	};

	const deleteModal = <Dialog disableBackdropClick={true} fullWidth open={openModalDeleteProject} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">Are you sure you want to delete this project?</DialogTitle>
		<DialogContent>
			<DialogContentText>
				In a case of deletion releted project will be deleted
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModalDeleteProject} color="primary">No</Button>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModalDeleteProject} color="primary">Yes</Button>
		</DialogActions>
	</Dialog>

	const editCreateModal = <Dialog disableBackdropClick={true} fullWidth open={openModal} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">{!isEditProject ? 'Step 1 : Create New Project' : 'Edit Project'}</DialogTitle>
		<DialogContent>
			<DialogContentText>
				{!isEditProject ? 'Create a new project' : 'Edit a project'}
			</DialogContentText>
			<TextField
				value={projectName}
				required
				autoFocus
				margin="dense"
				id="ProjectName"
				label="Project Name"
				type="string"
				fullWidth
				color='rgb(0, 112, 185)'
				onChange={fillProjectName}
			/>
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
			<FormControl style={{ width: '100%' }} >
				<InputLabel id="input-product-label">Select Solution Type</InputLabel>
				<Select
					labelId="select-product-label"
					id="select-product-label"
					value={solutionName}
					onChange={(event, newValue) => {
						setSolutionName(event.target.value)
					}}
				>
					{solutions.map((row, index) => (
						<MenuItem key={index} value={row}>{row}</MenuItem>
					))}
				</Select>
			</FormControl>
			{
				!isEditProject && <div style={{ marginTop: 10 }}>
					<FormControlLabel
						control={<Checkbox checked={isImportActions} onChange={handleChangeisImportActions} name="isImportActions" color="primary" />}
						label="Import Default-Actions"
					/>
				</div>
			}

		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseModal} color="primary">Cancel</Button>
			{
				!isEditProject ?
					<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleNextModal} color="primary">Next</Button> :
					<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModal} color="primary">Save</Button>

			}
		</DialogActions>
	</Dialog>

	const createFirstTier = <Dialog disableBackdropClick={true} fullWidth open={openModalTier} onClose={handleCloseModalTier} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">Step 2: Attach Tier</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Attach a tier for project {projectName}
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
					{tiersOptions.map((row) => (
						<MenuItem key={row.name} value={row.name}>{row.name}</MenuItem>
					))}
				</Select>
			</FormControl>
			<TextField
				value={tierDescription}
				required
				autoFocus
				margin="dense"
				id="description"
				label="Description"
				type="string"
				fullWidth
				onChange={fillTierDescription}
			/>
		</DialogContent>
		<DialogActions>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleBackModal} color="primary">Back</Button>
			<Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveModal} color="primary">Save</Button>
		</DialogActions>
	</Dialog>

	const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
		<DialogTitle id="form-dialog-title">Projects</DialogTitle>
		<DialogContent>
			<DialogContentText>
				The Projects page lists all the public/private cloud projects.
				When attaching a new project, you are required to select a tier.
				A project may be associated with several tiers.
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
				{ name: "Project", options: { filterList: filterListProject, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } }
			)
		}
		if (resetFilterType === 'Project') {
			columnsArray = [];
			columnsArray.push(
				{ name: "ID", options: { display: false, filterList: filterListProjectID } },
				{ name: "Project", options: { filterList: null, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } }
			)
		}
		if (columnsArray.length === 0) {
			columnsArray.push(
				{ name: "ID", options: { display: false, filterList: filterListProjectID } },
				{ name: "Project", options: { filterList: filterListProject, customBodyRender: value => <span style={{ fontWeight: 'bold' }}>{value}</span> } }
			)
		}
		columnsArray.push(
			"Solution",
			"Description",
			"Created by",
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
			{ name: "Actions", options: { filter: false, sort: false } }
		)
		return columnsArray;
	}


	return (

		<Grid container wrap="nowrap">
			<Loader isLoading={isLoading}></Loader>
			<div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
				<div style={{ marginBottom: 8 }}>
					<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
						<Link style={{ cursor: 'pointer' }} color="inherit">
							Projects
						</Link>
						{
							selectedProjectDetails?.project && <span>{selectedProjectDetails?.project?.name}</span>
						}
					</Breadcrumbs>
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<div style={{ display: 'flex', flexDirection: 'row' }}>
						<Typography style={{ fontWeight: 300 }} variant="h4">Projects</Typography>
						<Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
							<HelpIcon aria-controls="simple-menu"></HelpIcon>
						</Button>
					</div>
					<Button disabled={isBasicUser()} onClick={clickOpenModalNewProject} variant="contained" style={{ marginRight: 100 }} >
						Create New Project
					</Button>
				</div>
				<div>
					{editCreateModal}
					{createFirstTier}
					{deleteModal}
					{helpModal}
				</div>

				<div style={{ width: '95%', margin: '30px 0px' }}>
					<MUIDataTable
						title={"Project List"}
						data={
							projects.map((row, i) => {
								return [
									row.project._id,
									row.project.name,
									row.project.solution,
									row.project.description,
									row.project.createdBy,
									row.project.createdDate,
									<div>
										<Tooltip title={'Edit'}>
											<Button disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true" onClick={editProject(row.project)}>
												<EditIcon aria-controls="simple-menu" >
												</EditIcon>
											</Button>
										</Tooltip>
										<Tooltip title={'Remove'}>
											<Button disabled={isBasicUser()} aria-controls="simple-menu" aria-haspopup="true" onClick={deleteProject(row.project)}>
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
							onRowsSelect: (rowsSelected, allRows) => {
								if (filterListProjectID) {
									//setFilterListProjectID(null);
									setSlectedProjectDetails(projects[rowsSelected[0].dataIndex])
									return;
								}
								if (filterListProject) {
									//setFilterListProject(null);
									setSlectedProjectDetails(projects[rowsSelected[0].dataIndex])
									return;
								}
								setRowsSelected(allRows.map((row) => row.dataIndex));
								setSlectedProjectDetails(projects[rowsSelected[0].dataIndex])
							},
							onFilterChange: (changedCloumn, filterList, type, changedColumnIndex) => {
								if (filterListProject && changedCloumn === 'Project') {
									setFilterListProject(null)
									setColumns(getColumns('Project'));
								}
								if (filterListProjectID && changedCloumn === 'ID') {
									setFilterListProjectID(null)
									setColumns(getColumns('ID'));
								}
							}
						}}
					/>
				</div>
				<TabsProject selectedProjectDetails={selectedProjectDetails}></TabsProject>
			</div>
			<ToastContainer />
		</Grid>
	);
};

export default Project;
