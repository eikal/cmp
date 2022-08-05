import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";
import { ToastContainer, toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center'
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 600,
        height: 390,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

const HostsTab = (props) => {

    const classes = useStyles();
    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    useEffect(() => {
        if (props?.availableHosts) {
            setLeft(props.availableHosts)
        }
    }, [props.availableHosts]);

    function not(a, b) {
        return a.filter((value) => b.indexOf(value) === -1);
    }

    function intersection(a, b) {
        return a.filter((value) => b.indexOf(value) !== -1);
    }

    function union(a, b) {
        return [...a, ...not(b, a)];
    }

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = async () => {
        manageHosts('delete');
    };

    const handleCheckedLeft = async () => {
        manageHosts('add');
    };

    const manageHosts = async (action) => {
        try {
            if (action === 'add') {
                setLeft(left.concat(rightChecked));
                setRight(not(right, rightChecked));
                setChecked(not(checked, rightChecked));
                props.callbackSelectedHosts(not(right, rightChecked))
            } else {
                setRight([...new Set([...right, ...leftChecked])]);
                setLeft(not(left, leftChecked));
                setChecked(not(checked, leftChecked));
                props.callbackSelectedHosts(union(leftChecked, right))
            }
        } catch (ex) {
            toast.error("Failed to update hosts", { position: "bottom-right" })
        }
    }

    const customList = (title, items) => (
        <Card>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between' }}>
                <div>
                    <CardHeader
                        avatar={
                            <Checkbox
                                onClick={handleToggleAll(items.filter(({ name: id1 }) => !props.currentAllServers.some(({ name: id2 }) => id2 === id1)))}
                                color="primary"
                                checked={numberOfChecked(items) === items.length && items.length !== 0}
                                indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                                disabled={items.length === 0}
                                inputProps={{ 'aria-label': 'all items selected' }}
                            />
                        }
                        title={<Typography type="body2" style={{ fontSize: 15, fontWeight: 500 }}>{title}</Typography>}
                        subheader={`${numberOfChecked(items)}/${items.length} selected`}
                    />
                </div>
            </div>

            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value}-label`;
                    const serverExist = right.concat(props.currentAllServers).find((server) => server.name === value.name);
                    if (serverExist && title === 'Available hosts') {
                        return (
                            <Tooltip title={'Server allready attached'} placement="left-end">
                                <div>
                                    <ListItem disabled={((left.filter((elm) => elm === value)).length > 0)}
                                        key={value} role="listitem" button >
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={false}
                                                tabIndex={-1}
                                                disabled
                                                color="primary"
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            id={labelId}
                                            disableTypography
                                            primary={
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography type="body2" style={{ fontSize: 15 }}>{value.name}</Typography>
                                                </div>
                                            }
                                        />
                                    </ListItem>
                                </div>
                            </Tooltip>
                        )
                    }
                    return (
                        <ListItem
                            key={value} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={(checked.filter((elm) => elm === value)).length > 0}
                                    tabIndex={-1}
                                    color="primary"
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                disableTypography
                                primary={
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography type="body2" style={{ fontSize: 15 }}>{value.name}</Typography>
                                    </div>
                                }
                            />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card >
    );


    return (
        <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            className={classes.root}>
            <Grid item>{customList('Available hosts', left)}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        size="medium"
                        className={classes.button}
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        variant="outlined"
                        size="medium"
                        className={classes.button}
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                </Grid>
            </Grid>
            <Grid item>{customList('Hosts to attach', right)}</Grid>
            <ToastContainer />
        </Grid>
    )
}
export default HostsTab;
