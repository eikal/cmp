import React, { useState, useEffect } from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Divider,
    colors
} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import StorageIcon from '@material-ui/icons/Storage';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AppsIcon from '@material-ui/icons/Apps';
import { red } from '@material-ui/core/colors';
import { RadialChart } from 'react-vis';


const CardTotal = (props) => {
    return (
        <div>
            <Card
                key={props.entity}
                style={{ height: '400px', width: '400px' }}
                {...props}
            >
                <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div>
                            <Grid
                                container
                                spacing={3}
                                sx={{ justifyContent: 'space-between' }}
                            >
                                <Grid item>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="h6"
                                    >
                                        Total {props.entity}
                                    </Typography>
                                    <Typography
                                        color="textPrimary"
                                        variant="h3"
                                    >
                                        {props.entitynumber}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </div>
                        <div>
                            <Grid item>
                                <ListItemIcon >{props.icon}</ListItemIcon>

                            </Grid>

                        </div>
                    </div>
                    <br></br>
                    <Divider></Divider>
                    {
                        props.radialarray && props.entitynumber > 0 ?
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <div>
                                    {
                                        <RadialChart
                                            colorType="literal"
                                            animation={"gentle"}
                                            innerRadius={68}
                                            radius={75}
                                            color={d => d.color}
                                            data={props?.radialarray}
                                            width={200}
                                            height={200} />
                                    }
                                </div>
                                <div style={{ width: '100%' }}>
                                    {props.radialarray.map((radial) => (

                                        <div key={radial.label} style={{ marginBottom: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ color: radial.color, fontWeight: 'bold' }}>{radial.label}</span><span >{radial.angle}</span>
                                        </div>

                                    ))}


                                </div>

                            </div> : null
                    }
                </CardContent>
            </Card>
        </div>

    );
};

export default CardTotal;