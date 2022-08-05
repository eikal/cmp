import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import StorageIcon from '@material-ui/icons/Storage';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import { titleCase } from '../../helpers/helpers.js'
import LineChart from '../shared/Charts/LineChart.jsx'
import DoughnutChart from '../shared/Charts/DoughnutChart.jsx';
import TableChart from '../shared/Charts/TableChart.jsx'
import { getCloudspaceID } from '../../helpers/auth.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import '../shared/StatusIcon/style.css'
import 'react-toastify/dist/ReactToastify.css'

const AlertDashboard = forwardRef((props, ref) => {

    const [alertsOvertime, setAlertsOvertime] = useState(null);
    const [alertsCurrent, setAlertsCurrent] = useState(null);
    const [topAlerts, setTopAlerts] = useState(null);
    const [topServerAlerts, setTopServerAlerts] = useState(null);

    useImperativeHandle(ref, () => ({
        changeAlertDaysDashboard(days) {
            fetchData(days);
        }
    }));

    useEffect(() => {
        fetchData(props.alertDaysDashboard)
    }, [getCloudspaceID()]);


    const fetchData = async (days) => {
        try {
            const cloudspaceID = getCloudspaceID();
            if (!cloudspaceID) return;
            const alertsResponse = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/alerts/analytics?days=${days}&cloudspace=${cloudspaceID}`, { withCredentials: true })
            if (alertsResponse && alertsResponse.data.statusCode !== 200) {
                toast.error("Failed to dashboard data", { position: "bottom-right" });
                return;
            }
            const chartData = buildAlertOvertimeChart(alertsResponse.data.data.overtime, days);
            const currentAlerts = setAlertsCurrentPieChart(alertsResponse.data.data.currentAlerts);
            const topAlertsRes = setTopAlertsTable(alertsResponse.data.data.topHits[0]);
            const topServerAlertsRes = setTopAlertsTable(alertsResponse.data.data.topHits[1]);
            setAlertsOvertime(chartData);
            setAlertsCurrent(currentAlerts);
            setTopAlerts(topAlertsRes);
            setTopServerAlerts(topServerAlertsRes);
        } catch (ex) {
            toast.error("Failed to dashboard data", { position: "bottom-right" });
        }
    }

    const buildAlertOvertimeChart = (dataObject, days) => {
        const data = {}
        const dates = [...Array(Number(days))].map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return `${d.getDate()}/${d.getMonth() + 1}`
        })
        data.labels = dates.reverse();
        const datasets = [];
        datasets.push({
            label: 'Firing',
            data: (dataObject[0].map((data) => data.count)).reverse(),
            fill: false,
            backgroundColor: "rgb(207, 0, 0)",
            borderColor: "rgb(207, 0, 0)",
            tension: 0.3
        })
        datasets.push({
            label: 'Pending',
            data: (dataObject[1].map((data) => data.count)).reverse(),
            fill: false,
            backgroundColor: "rgb(153 153 153)",
            borderDash: [5],
            borderColor: "rgb(153 153 153)",
            tension: 0.3
        })
        datasets.push({
            label: 'Total',
            data: (dataObject[2].map((data) => data.count)).reverse(),
            fill: false,
            backgroundColor: "rgb(0, 112, 185)",
            borderColor: "rgb(0, 112, 185)",
            tension: 0.3
        })
        data.datasets = datasets;
        return data;
    }

    const setAlertsCurrentPieChart = (dataObject) => {
        const data = {};
        const labels = [];
        const datasets = [];
        const dataResult = [];
        for (const alertObject of dataObject) {
            labels.push(titleCase(alertObject.type));
            dataResult.push(alertObject.count)
        }
        let customLabels = labels.map((label, index) => `${label}: ${dataResult[index]}`)
        datasets.push({

            label: '',
            data: dataResult,
            backgroundColor: [
                'rgb(207, 0, 0)',
                'rgb(153 153 153)',
                'rgb(0, 112, 185)',

            ],
            borderColor: [
                'rgb(207, 0, 0)',
                'rgb(153 153 153)',
                'rgb(0, 112, 185)',

            ],
            borderWidth: 1,
        })
        data.labels = customLabels;
        data.datasets = datasets;
        return data;
    }

    const setTopAlertsTable = (topAlerts) => {
        const alerts = []
        for (const alert of topAlerts) {
            alerts.push({
                name: alert._id.name,
                count: alert.count
            })
        }
        return alerts;
    }

    return (
        <div>
            <div className="charts-selector">
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', placeContent: 'space-between' }}>
                    {
                        alertsOvertime &&
                        <div style={{ width: '80%' }}>
                            <LineChart
                                data={alertsOvertime}
                                height={300}
                                titleText={`Alert overtime`}
                            >
                            </LineChart>
                        </div>

                    }
                    {
                        alertsCurrent &&
                        <div style={{ width: '18%' }}>
                            <DoughnutChart
                                data={alertsCurrent}
                                height={300}
                                legendAlign={'center'}
                                titleText={'Alerts Overview'}
                                enabledToolip={false}
                            >

                            </DoughnutChart>
                        </div>
                    }
                </div>
                <br></br>
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', placeContent: 'space-between' }}>
                    {
                        topAlerts &&
                        <div style={{ width: '49%' }}>
                            <TableChart
                                title={'Top 5 Alerts Hits'}
                                icon={<NotificationsNoneIcon style={{ fontSize: 20 }} />}
                                rows={topAlerts}
                            >
                            </TableChart>
                        </div>
                    }
                    {
                        topServerAlerts &&
                        <div style={{ width: '49%' }}>
                            <TableChart
                                title={'Top 5 Server Hits'}
                                icon={<StorageIcon style={{ fontSize: 20 }} />}
                                rows={topServerAlerts}
                            >
                            </TableChart>
                        </div>
                    }
                </div>
            </div>
            <ToastContainer />
        </div>

    );
});

export default AlertDashboard;
