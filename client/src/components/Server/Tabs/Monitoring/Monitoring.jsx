import React, { useState, useEffect } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Typography from "@material-ui/core/Typography";
import RefreshIcon from '@material-ui/icons/Refresh';
import { Divider, Card, CardContent } from '@material-ui/core';
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, LineSeries, VerticalBarSeries, LabelSeries } from 'react-vis';
import './style/react-vis-style.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Loader from '../../../shared/Loader';
import ProgressBarComponent from '../../../shared/ProgressBar/ProgressBar.jsx'
import axios from 'axios';


const MonitoringTab = (props) => {

    const [currentMonitorServer, setCurrentMonitorServer] = useState(null)
    const [monitorPeriod, setMonitorPeriod] = useState(1);

    const [cpuDataCurrent, setCpuDataCurrent] = useState(0);
    const [cpuDataCount, setCpuDataCount] = useState(null);

    const [memoryDataUsage, setMemoryDataUsage] = useState(0);
    const [memoryDataUsageTotal, setMemoryDataUsageTotal] = useState(null);
    const [memoryDataTotal, setMemoryDataTotal] = useState(null);

    const [diskDataUsage, setDiskDataUsage] = useState(null);

    const [networkReciveData, SetNetworkReciveData] = useState([]);
    const [networkTransmitData, SetNetworkTransmitData] = useState([]);

    const [cpuDataUtilization, setCpuDataUtilization] = useState([]);
    const [memoryDataUtilization, setMemoryDataUtilization] = useState([]);
    const [diskDataUtilization, setDiskDataUtilization] = useState([]);

    useEffect(() => {
        fetchData();
    }, [props.serverDetails]);

    useEffect(() => { // clean up hook for destory all timers
        return () => {
            const interval_id = setInterval(() => { }, 1);
            for (let i = 0; i < interval_id; i++) {
                window.clearInterval(i);
            }
        };
    }, []);


    const fetchData = () => {
        if (props.serverDetails.fullHostname !== currentMonitorServer && currentMonitorServer) {
            const interval_id = setInterval(() => { }, 1);
            for (let i = 0; i < interval_id; i++) {
                window.clearInterval(i);
            }
        }
        if (props.serverDetails) {
            setCurrentMonitorServer(props.serverDetails.fullHostname)
            getCpUutilization();
            getMemoryUtilization();
            getDiskUtilization();
            getCpuCurrent();
            getMemoryDataUsage();
            getDiskDataUsage();
            getNetworkDataUsage();

            const intervalM = setInterval(async () => {
                getCpuCurrent();
                getNetworkDataUsage();
            }, 5000);

        }
    }

    const bytesToSize = (bytes) => {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    const getCpuCurrent = async () => {
        const cpuData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/cpu/current`, {
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (cpuData.data.statusCode === 200 && Array.isArray(cpuData.data.data.current) && cpuData.data.data.current.length > 0) {
            setCpuDataCurrent(parseInt(cpuData.data.data.current[1]))
            setCpuDataCount(cpuData.data.data.count)
        } else {
            setCpuDataCurrent(0)
            setCpuDataCount(null)
        }
    }

    const getMemoryDataUsage = async () => {
        const memoryData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/memory/usage`, {
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (memoryData.data.statusCode === 200 && Array.isArray(memoryData.data.data.usage) && memoryData.data.data.usage.length > 0) {
            const usage = Math.round((parseFloat(memoryData.data.data.usage[1]) * 100));
            const usageTotal = bytesToSize(memoryData.data.data.totalUsage[1]);
            const total = bytesToSize(memoryData.data.data.total[1]);
            setMemoryDataUsage(usage);
            setMemoryDataUsageTotal(usageTotal)
            setMemoryDataTotal(total)
        } else {
            setMemoryDataUsage(0);
            setMemoryDataUsageTotal(null)
            setMemoryDataTotal(null)
        }
    }

    const getDiskDataUsage = async () => {
        const diskData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/disk/usage`, {
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (diskData.data.statusCode === 200 && Array.isArray(diskData.data.data.usage) && diskData.data.data.usage.length > 0) {
            const diskArray = [];
            for (let i = 0; i < diskData.data.data.usage.length; i++) {
                if ((Number(parseFloat(diskData.data.data.usage[i].value).toFixed(2)) === 0)) {
                    continue;
                }
                diskArray.push({
                    mountpoint: diskData.data.data.usage[i].mountpoint,
                    precent: Number(parseFloat(diskData.data.data.usage[i].value).toFixed(2)),
                    value: bytesToSize(diskData.data.data.totalUsage[i].value)
                })
            }
            setDiskDataUsage(diskArray.sort((a, b) => b.precent - a.precent));
        } else {
            setDiskDataUsage(null);
        }
    }

    const getNetworkDataUsage = async () => {
        const networkData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/network/usage`, {
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (networkData.data.statusCode === 200 && Array.isArray(networkData.data.data.recieve)) {
            let networkRecive = Number(networkData.data.data.recieve[1]);
            if (networkData.data.data.recieve.length > 0) {
                networkRecive = Number(networkData.data.data.recieve[1].substring(0, 4))
            }
            let networkTransmit = Number(networkData.data.data.transmit[1]);
            if (networkData.data.data.transmit.length > 0) {
                networkTransmit = Number(networkData.data.data.transmit[1].substring(0, 4))
            }
            if (networkData.data.data.recieve.length === 0 && networkData.data.data.transmit.length === 0) {
                SetNetworkReciveData([{ x: 'Network', y: 0 }])
                SetNetworkTransmitData([{ x: 'Network', y: 0 }])
                return;
            }
            SetNetworkReciveData([{ x: 'Network', y: networkRecive }])
            SetNetworkTransmitData([{ x: 'Network', y: networkTransmit }])
        } else {
            SetNetworkReciveData([{ x: 'Network', y: 0 }])
            SetNetworkTransmitData([{ x: 'Network', y: 0 }])
        }
    }

    const getCpUutilization = async (period = null) => {
        const time = checkTimestemp(period)
        const cpuData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/cpu/utilization`, {
            "type": "utilization",
            "period": period ? period : monitorPeriod,
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (cpuData.data.statusCode === 200 && Array.isArray(cpuData.data.data) && cpuData.data.data.length > 0) {
            const data = []
            let index = 1
            for (const elm of cpuData.data.data) {
                data.push({ x: elm[0] + time * index, y: parseInt(elm[1]) })
                index++;
            }
            setCpuDataUtilization(data)
        } else {
            setCpuDataUtilization([{ x: null, y: null }])
        }
    }

    const getMemoryUtilization = async (period = null) => {
        const time = checkTimestemp(period)
        const memoryData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/memory/utilization`, {
            "type": "utilization",
            "period": period ? period : monitorPeriod,
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (memoryData.data.statusCode === 200 && Array.isArray(memoryData.data.data) && memoryData.data.data.length > 0) {
            const data = []
            let index = 1
            for (const elm of memoryData.data.data) {
                data.push({ x: elm[0] + time * index, y: elm[1].substring(0, 7) })
                index++;
            }
            setMemoryDataUtilization(data)
        } else {
            setMemoryDataUtilization([{ x: null, y: null }])
        }
    }

    const getDiskUtilization = async (period = null) => {
        const time = checkTimestemp(period)
        const diskData = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/monitoring/disk/utilization`, {
            "type": "utilization",
            "period": period ? period : monitorPeriod,
            "server": props.serverDetails.fullHostname
        }, { withCredentials: true });
        if (diskData.data.statusCode === 200 && Array.isArray(diskData.data.data) && diskData.data.data.length > 0) {
            const data = []
            let index = 1
            for (const elm of diskData.data.data) {
                data.push({ x: elm[0] + time * index, y: elm[1].substring(0, 7) })
                index++;
            }
            setDiskDataUtilization(data)
        } else {
            setDiskDataUtilization([{ x: null, y: null }])
        }
    }

    const checkTimestemp = (period) => {
        if (!period) {
            return 12500;
        }
        if (period === 1) {
            return 12500;
        }
        if (period === 12) {
            return 150000;
        }
        return 300000
    }

    const changeMonitorPeriod = (period) => (event) => {
        setMonitorPeriod(period)
        getCpUutilization(period);
        getMemoryUtilization(period);
        getDiskUtilization(period);
    }

    const refreshMonitoring = (event) => {
        getCpUutilization(monitorPeriod);
        getMemoryUtilization(monitorPeriod);
        getDiskUtilization(monitorPeriod);
    }

    const serverMonitoringTab = props.serverDetails ?
        <div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold' }}>
                    {props.serverDetails.fullHostname}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', placeContent: 'flex-end' }}>
                    <div> <IconButton color={monitorPeriod === 1 ? 'primary' : 'default'} style={{ fontSize: 20 }} onClick={changeMonitorPeriod(1)}>1h</IconButton></div>
                    <div> <IconButton color={monitorPeriod === 12 ? 'primary' : 'default'} style={{ fontSize: 20 }} onClick={changeMonitorPeriod(12)} >12h</IconButton></div>
                    <div> <IconButton color={monitorPeriod === 24 ? 'primary' : 'default'} style={{ fontSize: 20 }} onClick={changeMonitorPeriod(24)}>1d</IconButton></div>
                    <div> <IconButton color={'inherit'} style={{ fontSize: 20 }} onClick={refreshMonitoring}><RefreshIcon></RefreshIcon></IconButton></div>
                </div>
            </div>
            <Divider></Divider>
            <br></br>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', placeContent: 'space-around' }}>
                <Card>
                    <CardContent>
                        <Typography>CPU Live</Typography>
                        <Divider />
                        <br></br>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                            <CircularProgressbar value={cpuDataCurrent} text={`${cpuDataCurrent}%`} />
                            <br></br>
                            <br></br>
                            {
                                cpuDataCount ?
                                    <div style={{ display: 'flex', justifyContent: 'center' }}><Typography variant={'subtitle1'}>{cpuDataCount} total CPUs</Typography></div>
                                    :
                                    <div style={{ display: 'flex', justifyContent: 'center' }}><Typography variant={'subtitle1'}>{cpuDataCount} Not available</Typography></div>
                            }
                        </div>

                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography>Memory Usage</Typography>
                        <Divider />
                        <br></br>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                            <CircularProgressbar value={memoryDataUsage} text={`${memoryDataUsage}%`} />
                            <br></br>
                            <br></br>
                            {
                                memoryDataUsageTotal ?
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}><Typography variant={'subtitle1'}>{memoryDataUsageTotal} / {memoryDataTotal}</Typography></div>
                                    :
                                    <div style={{ display: 'flex', justifyContent: 'center' }}><Typography variant={'subtitle1'}>Not available</Typography></div>
                            }
                        </div>
                    </CardContent>
                </Card>



                <Card style={{ width: 800 }}>
                    <CardContent>
                        <Typography>Disk Usage :</Typography>
                        <Divider />
                        <br></br>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            {diskDataUsage && diskDataUsage.map((item, idx) => (
                                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                    <span style={{ width: '20%' }}>{item.mountpoint}</span>
                                    <div style={{ width: '70%' }}>
                                        <ProgressBarComponent key={idx} completed={item.precent} />
                                    </div>
                                    <span style={{ width: '10%', marginLeft: 15 }}>{item.value}</span>

                                </div>
                            ))}
                        </div>

                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography>Network Live</Typography>
                        <Divider />
                        <br></br>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            {
                                networkReciveData.length > 0 && networkTransmitData.length > 0 ?
                                    <div>
                                        <div>
                                            <XYPlot margin={{ bottom: 70 }} xType="ordinal" stroke="#3e98c7" width={450} height={350}>
                                                <VerticalGridLines />
                                                <HorizontalGridLines />
                                                <XAxis tickLabelAngle={-45} />
                                                <YAxis />
                                                <VerticalBarSeries color={'#3e98c7'} data={networkReciveData} />
                                                <VerticalBarSeries data={networkTransmitData} />
                                            </XYPlot>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}><Typography variant={'subtitle1'}>Receive: {networkReciveData[0].y} KB/S </Typography></div>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}><Typography variant={'subtitle1'}>Transmit: {networkTransmitData[0].y} KB/S </Typography></div>
                                        </div>
                                    </div>
                                    :
                                    <XYPlot margin={{ bottom: 70 }} xType="ordinal" stroke="#3e98c7" width={450} height={350}>
                                        <VerticalGridLines />
                                        <HorizontalGridLines />
                                        <XAxis tickLabelAngle={-45} />
                                        <YAxis />
                                        <VerticalBarSeries data={[{ x: 'Network', y: 0 }]} />
                                        <VerticalBarSeries data={[{ x: 'Network', y: 0 }]} />
                                    </XYPlot>
                            }
                        </div>
                    </CardContent>
                </Card>


            </div>
            <br></br>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', placeContent: 'space-around' }}>
                <Card>
                    <CardContent>
                        <Typography>CPU Utilization</Typography>
                        <Divider />
                        <br></br>
                        {
                            cpuDataUtilization.length > 0 ?
                                <XYPlot xType="time" margin={{ left: 100 }} width={500} height={400} stroke="#3e98c7">
                                    <HorizontalGridLines />
                                    <VerticalGridLines />
                                    <XAxis title="Time" />
                                    <YAxis title="CPU%" />
                                    <LineSeries
                                        data={cpuDataUtilization}
                                    />
                                </XYPlot> :
                                <XYPlot xType="time" margin={{ left: 100 }} width={500} height={400}>
                                    <HorizontalGridLines />
                                    <VerticalGridLines />
                                    <XAxis title="Time" />
                                    <YAxis title="CPU%" />
                                    <LineSeries
                                        data={[{ x: 1, y: 1 }]}
                                    />
                                </XYPlot>
                        }
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography>Memory Utilization</Typography>
                        <Divider />
                        <br></br>
                        {
                            memoryDataUtilization.length > 0 ?
                                <XYPlot xType="time" margin={{ left: 100 }} width={500} height={400} stroke="#3e98c7">
                                    <HorizontalGridLines />
                                    <VerticalGridLines />
                                    <XAxis title="Time" />
                                    <YAxis title="Memory%" />
                                    <LineSeries
                                        data={memoryDataUtilization}
                                    />
                                </XYPlot> :
                                <XYPlot xType="time" margin={{ left: 100 }} width={500} height={400}>
                                    <HorizontalGridLines />
                                    <VerticalGridLines />
                                    <XAxis title="Time" />
                                    <YAxis title="Memory%" />
                                    <LineSeries
                                        data={[{ x: 1, y: 1 }]}
                                    />
                                </XYPlot>
                        }
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography>Disk Utilization</Typography>
                        <Divider />
                        <br></br>
                        {
                            diskDataUtilization.length > 0 ?
                                <XYPlot xType="time" margin={{ left: 100 }} width={500} height={400} stroke="#3e98c7">
                                    <HorizontalGridLines />
                                    <VerticalGridLines />
                                    <XAxis title="Time" />
                                    <YAxis title="Disk%" />
                                    <LineSeries
                                        data={diskDataUtilization}
                                    />
                                </XYPlot> :
                                <XYPlot xType="time" margin={{ left: 100 }} width={500} height={400}>
                                    <HorizontalGridLines />
                                    <VerticalGridLines />
                                    <XAxis title="Time" />
                                    <YAxis title="Disk%" />
                                    <LineSeries
                                        data={[{ x: 1, y: 1 }]}
                                    />
                                </XYPlot>
                        }
                    </CardContent>
                </Card>

            </div>

        </div> : null


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {serverMonitoringTab}
        </div>
    )
}
export default MonitoringTab;
