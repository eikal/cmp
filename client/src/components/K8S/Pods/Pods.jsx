import React, { useState, useEffect, useRef } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import MUIDataTable from "mui-datatables";
import TabsPods from './TabsPods.jsx'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
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

const Pods = (props) => {
    const [pods, setPods] = useState([]);
    const [rowsSelected, setRowsSelected] = useState(null)
    const [columns, setColumns] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const [podMetadata, setPodMetadata] = useState('');
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
            await getPods();
            setColumns(getColumns());
            setIsHideTabPannel(true)
            setRowsSelected(null);
            setIsLoading(false);
        } catch (ex) {
            setIsLoading(false)
            toast.error("Failed to get Pods", { position: "bottom-right" });
        }
    };

    const getPods = async () => {
        try {
            const namespace = props.namespace ? props.namespace : 'All Namespaces'
            const podsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/pods?namespace=${namespace}&cloudspace=${props.cloudspace}`, { withCredentials: true });
            if (podsResponse && podsResponse.data.statusCode !== 200) {
                toast.error("Failed to get Pods", { position: "bottom-right" });
                return;
            }
            setPods(podsResponse.data.data);
        } catch (ex) {
            toast.error("Failed to get Pods", { position: "bottom-right" });
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getPodMetadata = async (pod) => {
        try {
            const podResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/pods-metadata?namespace=${pod.namespace}&pod=${pod.name}`, { withCredentials: true });
            if (podResponse && podResponse.data.statusCode !== 200) {
                toast.error("Failed to get Pods", { position: "bottom-right" });
                return;
            }
            setPodMetadata(podResponse.data.data);
        } catch (ex) {
            setIsLoading(false);
            toast.error("Failed to get Pods", { position: "bottom-right" });
        }
    };


    const statusCheckSwitch = (statusCheck) => {
        if (statusCheck === 'Running') {
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Running'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} positive pulse></status-indicator>
                </Tooltip>
            </div>
        }
        if (statusCheck === 'Failed') {
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Failed'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} negative pulse></status-indicator>
                </Tooltip>
            </div>
        }
        if (statusCheck === 'Pending') {
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Pending'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} intermediary pulse></status-indicator>
                </Tooltip>
            </div>
        }
        if (statusCheck === 'Succeeded') {
            return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Tooltip title={'Succeeded'}>
                    <status-indicator style={{ height: 15, width: 15, marginLeft: 10 }} active pulse></status-indicator>
                </Tooltip>
            </div>
        }
    };

    const parseContainerStatus = (status) => {
        if (status?.running) {
            return 'Running'
        }
        if (status?.waiting?.reason) {
            return status.waiting.reason
        }
        if (status?.terminated) {
            return 'Terminated';
        }
        if (status) {
            if (typeof status === 'string') {
                return status;
            } else {
                return Object.keys(status)[0];
            }
        }
        else {
            return 'NA'
        }
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
        <MenuItem disabled key={'Logs'} onClick={() => { }}>Logs</MenuItem>
        <MenuItem disabled key={'Exec'} onClick={() => { }}>Exec</MenuItem>
        <MenuItem disabled key={'Edit'} onClick={() => { }}>Edit</MenuItem>
    </Menu>

    const getColumns = () => {
        return [
            "Name",
            "Namespace",
            { name: "Node", options: { display: false } },
            { name: "Health", options: { display: false } },
            { name: "Pod Status", options: { filter: false, sort: false } },
            "Container Status",
            { name: "Restarts", options: { filter: false } },
            "Created"
        ];
    }


    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Pods List"}
                        data={
                            pods.map((row, i) => {
                                return [
                                    row?.name || 'NA',
                                    row?.namespace || 'NA',
                                    row?.node || 'NA',
                                    row?.status || 'NA',
                                    row?.status ? statusCheckSwitch(row?.status) : 'NA',
                                    row?.containerStatus ? parseContainerStatus(row?.containerStatus) : 'NA',
                                    'NA',
                                    'NA',
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
                                    await getPodMetadata(pods[rowsSelected[0].dataIndex]);
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
                <TabsPods
                    isHideTabPannel={isHideTabPannel}
                    podMetadata={podMetadata}
                ></TabsPods>
            }

        </div>
    );
};

export default Pods;
