import React, { useState, useEffect, useRef } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import MUIDataTable from "mui-datatables";
import TabsDeployments from './TabsDeployments.jsx'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { timeSince } from '../../../helpers/date.js';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import Loader from '../../shared/Loader'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const Deployments = (props) => {
    const [deployments, setDeployments] = useState([]);
    const [rowsSelected, setRowsSelected] = useState(null)
    const [columns, setColumns] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const [deploymentMetadata, setDeploymentMetadata] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isHideTabPannel, setIsHideTabPannel] = useState(true);
    const [clickOnRowMetaData, setClickOnRowMetaData] = useState(0);

    const prevCloudspace = usePrevious(props.cloudspace);

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MuiTableCell: {
                    body: {
                        "&:nth-child(2)": {
                            fontWeight: 'bold'
                        }
                    }
                },
                MUIDataTableToolbar: {
                    actions: {
                        display: 'flex',
                        flexDirection: 'row-reverse'
                    }
                },
            }
        });


    useEffect(() => {
        fetchData()
    }, [props.namespace]);

    useEffect(() => {
        if (!prevCloudspace) {
            return;
        }
        if (prevCloudspace !== props.cloudspace) {
            fetchData()
        }
    }, [props.cloudspace]);


    const fetchData = async () => {
        try {
            setIsLoading(true);
            await getDeployments();
            setColumns(getColumns());
            setIsHideTabPannel(true)
            setRowsSelected(null);
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false)
            toast.error("Failed to get Deployments", { position: "bottom-right" });
        }
    };

    const getDeployments = async () => {
        try {
            const namespace = props.namespace ? props.namespace : 'All Namespaces'
            const deploymentsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/deployments?namespace=${namespace}&cloudspace=${props.cloudspace}`, { withCredentials: true });
            if (deploymentsResponse && deploymentsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Deployments", { position: "bottom-right" });
                return;
            }
            setDeployments(deploymentsResponse.data.data);
        } catch (ex) {
            toast.error("Failed to get Deployments", { position: "bottom-right" });
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getDeploymentMetadata = async (deployment) => {
        try {
            const deploymentResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/deployments-metadata?namespace=${deployment.namespace}&deployment=${deployment.name}`, { withCredentials: true });
            if (deploymentResponse && deploymentResponse.data.statusCode !== 200) {
                toast.error("Failed to get deployments", { position: "bottom-right" });
                return;
            }
            setDeploymentMetadata(deploymentResponse.data.data);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get deployments", { position: "bottom-right" });
        }
    };

    const buildPodsStatus = (pods) => {
        return `${pods.running}/${pods.desired}`;
    }


    const actionsMenu = <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={(handleClose)}

        PaperProps={{
            style: {
                marginLeft: 225
            }
        }}
    >
        <MenuItem disabled key={'Scale'} onClick={() => { }}>Scale</MenuItem>
        <MenuItem disabled key={'Edit'} onClick={() => { }}>Edit</MenuItem>
        <MenuItem disabled key={'Delete'} onClick={() => { }}>Delete</MenuItem>
    </Menu>

    const getColumns = () => {
        return [
            "Name",
            "Namespace",
            "Pods",
            "Created"
        ];
    }


    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Deployments List"}
                        data={
                            deployments.map((row, i) => {
                                return [
                                    row.name,
                                    row.namespace,
                                    buildPodsStatus(row.pods),
                                    timeSince(new Date(row.created)) + ' ago'
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
                            rowsPerPage: 250,
                            rowsPerPageOptions: [50],
                            rowsSelected: rowsSelected,
                            selectableRowsOnClick: true,
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
                            onFilterChange: (changedColumn, filterList, type, changeColumn) => {
                                setIsHideTabPannel(true);
                                setRowsSelected([]);
                            },
                            onSearchChange: (searchText) => {
                                setIsHideTabPannel(true);
                                setRowsSelected([]);
                            },
                            onCellClick: (celdata, cellMeta) => {
                                setRowsSelected([cellMeta.dataIndex]);
                                const metaSum = clickOnRowMetaData + 1
                                setClickOnRowMetaData(metaSum);

                            },
                            onRowsSelect: async (rowsSelected, allRows) => {
                                if (rowsSelected.length === 1 && clickOnRowMetaData + 1 === 2) {
                                    setIsLoading(true)
                                    await getDeploymentMetadata(deployments[rowsSelected[0].dataIndex]);
                                    setIsLoading(false)
                                    setIsHideTabPannel(false);
                                    setClickOnRowMetaData(0);
                                    return;
                                }
                                if (allRows.length === 0) {
                                    setRowsSelected([])
                                    setIsHideTabPannel(true);
                                    return;
                                }
                                if (allRows.length >= 1) {
                                    setIsHideTabPannel(false);
                                    setRowsSelected(allRows.map((row) => row.dataIndex))
                                    return;
                                }
                                setRowsSelected(allRows.map((row) => row.dataIndex));

                            },
                            customToolbar: () => {
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Tooltip title={'Refresh'} >
                                            <IconButton onClick={fetchData}>
                                                <RefreshIcon aria-controls="simple-menu"  >
                                                </RefreshIcon>
                                            </IconButton>
                                        </Tooltip>
                                        {
                                            rowsSelected?.length === 1 ?
                                                <div>
                                                    <Tooltip title={'Actions'} >
                                                        <IconButton onClick={handleClick}>
                                                            <MoreVertIcon aria-controls="simple-menu"  >
                                                            </MoreVertIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                </div> : null
                                        }
                                    </div>
                                );
                            }
                        }}
                    />
                </MuiThemeProvider>
                <ToastContainer />
                {actionsMenu}
                <Loader isLoading={isLoading}></Loader>
            </div>
            {
                <TabsDeployments
                    isHideTabPannel={isHideTabPannel}
                    deploymentMetadata={deploymentMetadata}
                ></TabsDeployments>
            }

        </div>
    );
};

export default Deployments;
