import React, { useRef } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CallMadeIcon from '@material-ui/icons/CallMade';
import HelpIcon from '@material-ui/icons/Help';
import SimpleModal from '../../../shared/Modals/SimpleModal.jsx';
import { getLocalDateTime } from '../../../../helpers/date.js';
import statusCheckText from './text.json';


const StatusTab = (props) => {

    const childRef = useRef()

    const buildStatus = (statusObj) => {
        if (!statusObj) {
            return
        }
        if (statusObj.status === 'Running') {
            return <div style={{ color: 'rgb(75, 210, 143)', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Running
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <CheckCircleIcon></CheckCircleIcon>
                </div>
            </div>

        }
        if (statusObj.status === 'Stopped') {
            return <div style={{ color: 'rgb(255, 77, 77)', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Stopped
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <CheckCircleIcon></CheckCircleIcon>
                </div>

            </div>
        } else {
            return <div style={{ color: '#fa0', fontWeight: 'bold', display: 'flex', flexDirection: 'row', marginLeft: 5 }}>
                Unstable
                <div style={{ display: 'block', margin: 'auto', marginLeft: 5 }}>
                    <CheckCircleIcon></CheckCircleIcon>
                </div>

            </div>
        }
    }

    const clickPuppetIcon = () => {
        props.callbackChangePuppetReportTab();
    }

    const onClickHelpButton = (key) => (e) => {
        const text = statusCheckText[key].text.replace('<server>', props.serverDetails.fullHostname)
        childRef.current.handleOpenSimpleModal(statusCheckText[key].title, text);
    }

    const serverStateTab = props.serverDetails && props.serverDetails.statusCheck ?
        <div>
            <div>
                <div style={{ display: 'flex', placeContent: 'flex-end' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 13 }}>Last Check: </div>
                    <span style={{ marginLeft: 3, fontSize: 13 }}>{getLocalDateTime(props.serverDetails.statusCheck?.createdDate)}</span>
                </div>
                <br></br>
                <SimpleModal ref={childRef} size='md'></SimpleModal>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>System</TableCell>
                                <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>Status</TableCell>
                                <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key={'system'}>
                                <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                    System
                                    <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('system')}>
                                        <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                    </IconButton>
                                </TableCell>
                                <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.system)}</TableCell>
                                <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.system?.message}</TableCell>
                            </TableRow>
                            <TableRow key={'network'}>
                                <TableCell style={{ fontWeight: 'inherit', width: '25%' }} >
                                    Network
                                    <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('network')}>
                                        <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                    </IconButton>
                                </TableCell>
                                <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.network)}</TableCell>
                                <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.network?.message}</TableCell>
                            </TableRow>
                            <TableRow key={'infrastructureMonitoring'}>
                                <TableCell style={{ fontWeight: 'inherit', width: '25%' }} >
                                    Monitor Service
                                    <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('infrastructureMonitoring')}>
                                        <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                    </IconButton>
                                </TableCell>
                                <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.monitoring.infrastructure)}</TableCell>
                                <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.monitoring?.infrastructure?.message}</TableCell>
                            </TableRow>
                            {
                                props.serverDetails.statusCheck.nfsMount ?
                                    <TableRow key={'nfsMount'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }} >
                                            NFS Mount
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('nfsMount')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.nfsMount)}</TableCell>
                                        <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.nfsMount?.message}</TableCell>
                                    </TableRow>
                                    : null
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

                <br></br>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>Puppet
                                    <Tooltip title={'Puppet Reports'} >
                                        <IconButton style={{ marginLeft: 5 }} onClick={clickPuppetIcon}>
                                            <CallMadeIcon color="primary" style={{ fontSize: 14 }} aria-controls="simple-menu"></CallMadeIcon>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key={'puppetStatus'}>
                                <TableCell style={{ fontWeight: 'inherit', width: '25%' }} >
                                    Puppet Status
                                    <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('puppetStatus')}>
                                        <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                    </IconButton>
                                </TableCell>
                                <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.puppet.status)}</TableCell>
                                <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.puppet?.status?.message}</TableCell>
                            </TableRow>
                            <TableRow key={'puppetConfig'}>
                                <TableCell style={{ fontWeight: 'inherit', width: '25%' }}  >
                                    Puppet Configuration
                                    <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('puppetConfig')}>
                                        <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                    </IconButton>
                                </TableCell>
                                <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.puppet.configuration)}</TableCell>
                                <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.puppet?.configuration?.message}</TableCell>
                            </TableRow>
                            <TableRow key={'puppetAgent'}>
                                <TableCell style={{ fontWeight: 'inherit', width: '25%' }}  >
                                    Puppet Agent
                                    <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('puppetAgent')}>
                                        <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                    </IconButton>
                                </TableCell>
                                <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.puppet?.agent)}</TableCell>
                                <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.puppet?.agent?.message}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <br></br>
                {
                    props.serverDetails.statusCheck.cfrm ?
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>CFRM</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    <TableRow key={'appMonitoringCfrm'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            Monitor Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('appMonitoringCfrm')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck.monitoring.app)}</TableCell>
                                        <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.monitoring?.app?.message}</TableCell>
                                    </TableRow>
                                    <TableRow key={'cfrmServiceSsh'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            CFRM Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('cfrmServiceSsh')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.cfrm.service)}</TableCell>
                                        <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.cfrm?.service?.message}</TableCell>
                                    </TableRow>
                                    <TableRow key={'cfrmUI'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            CFRM UI
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('cfrmUI')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }} >{buildStatus(props.serverDetails.statusCheck.cfrm.app)}</TableCell>
                                        <TableCell style={{ width: '25%' }}>{props.serverDetails.statusCheck?.cfrm?.app?.message}</TableCell>
                                    </TableRow>
                                </TableBody>

                            </Table>
                        </TableContainer>

                        : null
                }
                {
                    props.serverDetails.statusCheck.elk && props.serverDetails.statusCheck.cfrm ?
                        <br></br> : null
                }
                {
                    props.serverDetails.statusCheck.elk ?
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>Elastic</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow key={'appElkService'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            ELK Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('appElkService')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck.elk.app)}</TableCell>
                                        <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.elk?.app?.message}</TableCell>
                                    </TableRow>
                                    <TableRow key={'clusterElkService'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            ELK Cluster Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('clusterElkService')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck.elk.cluster)}</TableCell>
                                        <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.elk?.cluster?.message}</TableCell>
                                    </TableRow>
                                    <TableRow key={'artemisElkService'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            Artemis Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('artemisElkService')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck.elk.artemis)}</TableCell>
                                        <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.elk?.artemis?.message}</TableCell>
                                    </TableRow>
                                    <TableRow key={'apachedsElkService'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            ApacheDS Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('apachedsElkService')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck.elk.apacheds)}</TableCell>
                                        <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.elk?.apacheds?.message}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        : null
                }

                {
                    props.serverDetails.statusCheck.db ?
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: '700', fontSize: '15px' }}>DB</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow key={'dbService'}>
                                        <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                            DB Service
                                            <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('dbService')}>
                                                <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck.db?.network)}</TableCell>
                                        <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.db?.network?.message}</TableCell>
                                    </TableRow>
                                    {props.serverDetails.statusCheck?.db?.exporter &&
                                        <TableRow key={'dbExporter'}>
                                            <TableCell style={{ fontWeight: 'inherit', width: '25%' }}>
                                                DB Query Exporter
                                                <IconButton style={{ marginLeft: 5 }} onClick={onClickHelpButton('dbExporter')}>
                                                    <HelpIcon style={{ fontSize: 18 }} aria-controls="simple-menu"></HelpIcon>
                                                </IconButton>
                                            </TableCell>
                                            <TableCell style={{ width: '25%' }}  >{buildStatus(props.serverDetails.statusCheck?.db?.exporter)}</TableCell>
                                            <TableCell style={{ width: '25%' }} >{props.serverDetails.statusCheck?.db?.exporter?.message}</TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        : null
                }
            </div>
        </div> : null

    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            {serverStateTab}
        </div>
    )
}
export default StatusTab;
