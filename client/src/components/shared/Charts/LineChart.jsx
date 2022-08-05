import React from "react";
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ArcElement
} from 'chart.js';

import { Line } from 'react-chartjs-2';

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Title,
    Tooltip,
    Legend
);
const useStyles = makeStyles((theme) => ({
    root: {
        padding: '20px 20px 20px 20px',
    },
}));

const LineChart = (props) => {

    const classes = useStyles();

    return (

        <Paper className={classes.root} elevation={5} >
            <div style={{ height: props.height || 400, width: '100%' }}>
                <Line
                    options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                            y: {
                                ticks: {
                                    beginAtZero: true,
                                    precision: 0,
                                    // Include a dollar sign in the ticks
                                    callback: function (value, index, ticks) {
                                        if (props.isPercentageMode) {
                                            return value + '%';
                                        } else {
                                            return value;
                                        }
                                    },
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (tooltipItem, data) {
                                        if (props.isPercentageMode) {
                                            return tooltipItem.dataset.label + ': ' + tooltipItem.formattedValue + '%';
                                        } else {
                                            return tooltipItem.dataset.label + ': ' + tooltipItem.formattedValue;
                                        }
                                    },
                                    footer: function () {
                                        if (props.isPercentageMode) {
                                            return props.tooltipFooterText || null;
                                        } else {
                                            return null;
                                        }
                                    }
                                }
                            },
                            legend: {
                                display: true,
                                position: props.legendPosition || 'top',
                                align: props.legendalign || 'end',
                                labels: {
                                    boxWidth: 30,
                                    font: {
                                        family: `"Roboto", "Helvetica", "Arial", sans- serif`,
                                        size: props.labelFontSize || 14,
                                        color: 'rgba(0, 0, 0, 0.87)',
                                        lineHeight: 0.5
                                    }
                                }
                            },
                            title: {
                                display: props.isTitleExist || true,
                                position: props.titlePosition || 'top',
                                text: props.titleText,
                                align: props.titleAlign || 'start',
                                color: 'rgba(0, 0, 0, 0.87)',
                                font: {
                                    family: `"Roboto", "Helvetica", "Arial", sans- serif`,
                                    size: props.titleFontSize || 14,
                                    color: 'rgba(0, 0, 0, 0.87)',
                                    lineHeight: 0.5
                                }
                            }
                        }
                    }}
                    data={props.data}


                />
            </div>
        </Paper>
    );
};

export default LineChart;
