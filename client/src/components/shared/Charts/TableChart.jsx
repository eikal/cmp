import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const StyledTableCell = withStyles((theme) => ({

    body: {
        fontSize: 12,
        fontWeight: 400
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {

    },
}))(TableRow);


const useStyles = makeStyles({
    table: {
        minWidth: 700,
    },
    container: {
        maxHeight: 350,
    },
});

const TableChart = (props) => {

    const classes = useStyles();

    return (

        <TableContainer style={{ height: '100%' }} className={classes.container} elevation={5} component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>
                            <div style={{ display: 'flex', flexDirection: 'row', }}>
                                <div>
                                    {props.title}
                                </div>
                                <div style={{ marginLeft: 10 }}>
                                    {props.icon}
                                </div>
                            </div>
                        </StyledTableCell>
                        <StyledTableCell ></StyledTableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.rows && props.rows.map((row) => (
                        <StyledTableRow key={row.name}>
                            <StyledTableCell component="th" scope="row">
                                {row.name}
                            </StyledTableCell>
                            <StyledTableCell a>{row.count}</StyledTableCell>

                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TableChart;
