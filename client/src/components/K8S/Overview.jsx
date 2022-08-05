import React, { useState, useEffect, useRef } from 'react';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import FiberSmartRecordIcon from '@material-ui/icons/FiberSmartRecord';
import CardStatus from './Dashboard-Cards/Card-Status.jsx';
import WorkIcon from '@material-ui/icons/Work';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PermMediaIcon from '@material-ui/icons/PermMedia';
import HorizontalSplitIcon from '@material-ui/icons/HorizontalSplit';
import DnsIcon from '@material-ui/icons/Dns';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import Loader from '../shared/Loader'
import { getCloudspaceID } from '../../helpers/auth.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import '../shared/StatusIcon/style.css'
import 'react-toastify/dist/ReactToastify.css'

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const Dashboard = (props) => {

    useEffect(() => {
        if (props.namespace) {
            fetchData(props.namespace)
        }
    }, [props.namespace]);

    useEffect(() => {
        if (!prevCloudspace) {
            return;
        }
        if (prevCloudspace !== props.cloudspace) {
            fetchData()
        }
    }, [props.cloudspace]);

    const [namespaceStats, setNamespaceStats] = useState(null)
    const [isLoading, setIsLoading] = useState(false);

    const prevCloudspace = usePrevious(props.cloudspace);

    const fetchData = async (namespace) => {
        setIsLoading(true)
        if (!namespaceStats) {
            setNamespaceStats(null);
        }
        await getStats(namespace);
        setIsLoading(false)
    }

    const getStats = async (namespace) => {
        try {
            const namespaceName = namespace ? namespace : 'All Namespaces'
            const namespacesResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/k8s/namespace/dashboard?namespace=${namespaceName}&cloudspace=${props.cloudspace}`, { withCredentials: true });
            if (namespacesResponse && namespacesResponse.data.statusCode !== 200) {
                toast.error("Failed to get namespace statistics", { position: "bottom-right" });
                return;
            } else {
                for (const elm of namespacesResponse.data.data) {
                    const radialarray = [];
                    if (elm.statsType === 'Namespace') {
                        for (const status in elm.status) {
                            let label = 'Running';
                            let color = '#3e98c7'
                            if (status === 'inactive') {
                                label = 'Inactive';
                                color = '#ff4d4d'
                            }


                            radialarray.push({ angle: elm.status[status], label: label, color: color })
                        }
                        elm['radialarray'] = radialarray;
                    }
                    else {
                        for (const status in elm.status) {
                            let label = 'Running';
                            let color = '#3e98c7'
                            if (status === 'pending') {
                                label = 'Pending';
                                color = '#fa0'
                            }
                            if (status === 'failed') {
                                label = 'Failed';
                                color = '#ff4d4d'
                            }
                            if (status === 'succeeded') {
                                label = 'Succeeded';
                                color = '#4bd28f'
                            }

                            radialarray.push({ angle: elm.status[status], label: label, color: color })
                        }
                        elm['radialarray'] = radialarray;
                    }

                }
                setNamespaceStats(namespacesResponse.data.data);
            }
        } catch (ex) {
            toast.error("Failed to get namespace statistics", { position: "bottom-right" });
        }
    }


    return (

        <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ display: "flex", flexDirection: "column", width: '100%' }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[0]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[0]?.total}
                        status={namespaceStats && namespaceStats[0].status}
                        radialarray={namespaceStats && namespaceStats[0].radialarray}
                        icon={<BookmarksIcon style={{ fontSize: 30 }}></BookmarksIcon>}>
                    </CardStatus>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[1]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[1]?.total}
                        status={namespaceStats && namespaceStats[1].status}
                        radialarray={namespaceStats && namespaceStats[1].radialarray}
                        icon={<FiberSmartRecordIcon style={{ fontSize: 30 }}></FiberSmartRecordIcon>}>
                    </CardStatus>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[2]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[2]?.total}
                        radialarray={namespaceStats && namespaceStats[2].radialarray}
                        icon={<WorkIcon style={{ fontSize: 30 }}></WorkIcon>}>
                    </CardStatus>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[3]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[3]?.total}
                        radialarray={namespaceStats && namespaceStats[3].radialarray}
                        icon={<FileCopyIcon style={{ fontSize: 30 }}></FileCopyIcon>}>
                    </CardStatus>
                </div>
                <br></br>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <CardStatus entity={namespaceStats && namespaceStats[4]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[4]?.total}
                        radialarray={namespaceStats && namespaceStats[4].radialarray}
                        icon={<PermMediaIcon style={{ fontSize: 30 }}></PermMediaIcon>}>
                    </CardStatus>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[5]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[5]?.total}
                        radialarray={namespaceStats && namespaceStats[5].radialarray}
                        icon={<HorizontalSplitIcon style={{ fontSize: 30 }}></HorizontalSplitIcon>}>
                    </CardStatus>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[6]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[6]?.total}
                        radialarray={namespaceStats && namespaceStats[6].radialarray}
                        icon={<DnsIcon style={{ fontSize: 30 }}></DnsIcon>}>
                    </CardStatus>
                    <CardStatus
                        entity={namespaceStats && namespaceStats[7]?.statsType}
                        entitynumber={namespaceStats && namespaceStats[7]?.total}
                        radialarray={namespaceStats && namespaceStats[7].radialarray}
                        icon={<ConfirmationNumberIcon style={{ fontSize: 30 }}></ConfirmationNumberIcon>}>
                    </CardStatus>
                </div>
            </div>
            <Loader isLoading={isLoading}></Loader>
            <ToastContainer />
        </div>


    );
};

export default Dashboard;
