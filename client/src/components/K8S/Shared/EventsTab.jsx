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

const EventsTab = (props) => {

    useEffect(() => {
    }, [props.genericMetadata]);


    const classes = useStyles();


    const podsDetailsTab = props.genericMetadata && props.genericMetadata?.eventList?.events.length > 0 ? 
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Events:</div>
            <Divider style={{ marginBottom: 20 }}></Divider>

            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Message</TableCell>
                            <TableCell >Source</TableCell>
                            <TableCell >Sub-object</TableCell>
                            <TableCell >Count</TableCell>
                            <TableCell >First Seen</TableCell>
                            <TableCell >Last Seen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.genericMetadata.eventList.events.map((row) => (
                            <TableRow key={row.message}>
                                <TableCell component="th" scope="row">
                                    {row.message}
                                </TableCell>
                                <TableCell >{row.sourceComponent + ' ' + row.sourceHost}</TableCell>
                                <TableCell >{row.object ? row.object : '-'}</TableCell>
                                <TableCell >{row.count}</TableCell>
                                <TableCell >{row.firstSeen}</TableCell>
                                <TableCell >{row.lastSeen}</TableCell>
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
            {podsDetailsTab}
        </div>


    )
}
export default EventsTab;
