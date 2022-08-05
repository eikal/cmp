import React from 'react';
import { useHistory } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import DirectionsIcon from '@material-ui/icons/Directions';
import { List, ListItem, Avatar, ListItemText } from '@material-ui/core';

const TierChilds = (props) => {

    const history = useHistory();

    const tierDetails = props.selectedProjectDetails && props.selectedProjectDetails.relations &&

        <List>
            {props.selectedProjectDetails.relations.map((relation, i) => (
                relation.tier ? <ListItem style={{ paddingLeft: 0 }}
                    divider={i < props.selectedProjectDetails.relations.length - 1}
                    key={relation.id}
                >
                    <Avatar variant="square" >{relation.tier.name.split('')[0].toUpperCase() + relation.tier.name.split('')[1].toUpperCase()}</Avatar>
                    <div>
                        <ListItemText style={{ marginLeft: 15 }}
                            primary={`Tier Name: ${relation.tier.name}`}
                            secondary={`${relation.tier.description}`}
                        />
                        <div style={{ marginLeft: 15 }}>
                            <div>
                                Tier ID:
                                <span>
                                    <Link onClick={() => history.push(`/tiers`, { tierID: relation.tier._id })}
                                        style={{ cursor: 'pointer' }}> {relation.tier._id}
                                    </Link>
                                </span>
                            </div>
                            {
                                relation.servers.length > 0 ? <div>
                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', fontSize: 18, fontWeight: 500 }}>
                                            <DirectionsIcon />
                                            <span style={{ marginLeft: 5, marginTop: 5 }}>
                                                <Link onClick={() => history.push(`/servers`,
                                                    {
                                                        project: props.selectedProjectDetails.project.name,
                                                        tier: relation.tier.name,
                                                        type: 'tierName'
                                                    }
                                                )}
                                                    style={{ cursor: 'pointer' }}> Go To Servers
                                                </Link>
                                            </span>
                                        </div>
                                    </div>
                                </div> : null
                            }

                        </div>
                    </div>
                </ListItem> : null
            ))}
        </List>

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {tierDetails}
        </div>
    )
}
export default TierChilds;
