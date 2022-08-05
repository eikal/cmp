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

import { Pie } from 'react-chartjs-2';

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
                <Pie
                    options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                            legend: {
                                position: props.legendPosition || 'top',
                                align: props.legendAlign || 'end',
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
                            tooltip: {
                                enabled:props.enabledToolip
                            },
                            title: {
                                display: props.isTitleExist || true,
                                position: props.titlePosition || 'top',
                                text: props.titleText ,
                                align: props.titleAlign || 'start',
                                color: 'rgba(0, 0, 0, 0.87)',
                                font: {
                                    family: `"Roboto", "Helvetica", "Arial", sans- serif`,
                                    size: props.titleFontSize || 14,
                                    color: 'rgba(0, 0, 0, 0.87)',
                                    lineHeight: 0.5
                                }
                            },
                        }
                    }} data={props.data} />
            </div>
        </Paper>
    );
};

export default LineChart;
