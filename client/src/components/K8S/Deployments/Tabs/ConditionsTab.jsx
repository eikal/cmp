import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';



const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650,
    },
}));

const ConditionsTab = (props) => {

    useEffect(() => {
    }, [props.deploymentMetadata]);


    const classes = useStyles();


    const deploymentsDetailsTab = props.deploymentMetadata && props.deploymentMetadata?.conditions?.length > 0 ? 
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Conditions:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell >Type</TableCell>
                            <TableCell >Status</TableCell>
                            <TableCell >Last probe time</TableCell>
                            <TableCell >Last transition time</TableCell>
                            <TableCell >Reason</TableCell>
                            <TableCell >Message</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.deploymentMetadata.conditions.map((row) => (
                            <TableRow key={row.type}>
                                <TableCell component="th" scope="row">
                                    {row.type}
                                </TableCell>
                                <TableCell >{row.status}</TableCell>
                                <TableCell >{row.lastProbeTime}</TableCell>
                                <TableCell >{row.lastTransitionTime}</TableCell>
                                <TableCell >{row.reason}</TableCell>
                                <TableCell>{row.message}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div> : <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            There is nothing to display here , No resources found
        </div>


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {deploymentsDetailsTab}
        </div>


    )
}
export default ConditionsTab;
