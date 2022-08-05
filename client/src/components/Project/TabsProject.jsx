import React, { useState, useEffect } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../shared/TabPanel/TabPanel.jsx';
import Details from './Tab/Details.jsx';
import TierChilds from './Tab/TierChilds.jsx'
import Alerts from './Tab/Alerts/Alerts.jsx';
import ServerChilds from './Tab/ServerChilds.jsx';
import Tree from './Tab/Tree.jsx';
import Tenants from './Tab/Tenants/Tenants.jsx';
import StoryBook from './Tab/StoryBook/StoryBook.jsx'

const TabsProject = (props) => {
    const [valueTab, setValueTab] = useState(0);
    const [nestedServers, setNestedServers] = useState([]);
    const [projectChart, setProjectChart] = useState({})

    useEffect(() => {
        if (props.selectedProjectDetails) {
            const hostgroupsObj = {};
            for (const relation of props.selectedProjectDetails.relations) {
                for (const server of relation.servers) {
                    if (!hostgroupsObj[server.hostgroup]) {
                        hostgroupsObj[server.hostgroup] = [];
                    } 
                    hostgroupsObj[server.hostgroup].push({
                        name: server.fullHostname,
                        host: server.hostname,
                        id: server._id,
                        statusCheck: server.statusCheck,
                        ip_address: server.ip_address,
                        tierName: relation.tier.name
                    })
                    
                }
            }
            const hostgroupArray = [];
            for (const hostgroup in hostgroupsObj) {
                hostgroupArray.push({ hostgroup: hostgroup, tierName: hostgroupsObj[hostgroup][0].tierName, servers: hostgroupsObj[hostgroup] })
            }
            setNestedServers(hostgroupArray);
            buildTreeProject(hostgroupArray)
            
        }
    }, [props.selectedProjectDetails]);


    
    const buildTreeProject = (hostgroupArray) => {
        let treeObject = {};
        treeObject["name"] = props.selectedProjectDetails.project.name;
        treeObject["children"] = [];
        let tiers = new Set()
        for (const hostgroup of hostgroupArray) {
            for (const server of hostgroup.servers) {
                tiers.add(server.tierName)
            }
        }
        tiers = [...tiers];
        for (const tier of tiers) {
            let tiersObject = { name: tier, children: [] }
            
            for (const hostgroup of hostgroupArray) {
                const serverArray = []
                for (const server of hostgroup.servers) {
                    if (server.tierName === tier) {
                        serverArray.push({ name: server.host })
                    }
                }
                if (serverArray.length > 0) {
                    tiersObject.children.push({ name: hostgroup.hostgroup, children: serverArray });
                }
            }
            treeObject.children.push(tiersObject)
        }
        setProjectChart(treeObject)
    }

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };


    return (
        props.selectedProjectDetails ? <div style={{ width: '95%', marginBottom: 30 }}>
            <TableContainer component={Paper}>
                <AppBar style={{ backgroundColor: '#606060' }} position="static">
                    <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                        <Tab label="Details" />
                        <Tab label="Tiers" />
                        <Tab label="Servers" />
                        <Tab label="Architecture" />
                        <Tab label="Alerts" />
                        <Tab label="StoryBook" />
                        {
                            ['Legacy (SP)', 'CFRM-IQ (WLS)'].includes(props?.selectedProjectDetails?.project?.solution) && <Tab label="Tenants" />
                        }
                    </Tabs>
                </AppBar>
                <TabPanel value={valueTab} index={0}>
                    <Details selectedProjectDetails={props.selectedProjectDetails}></Details>
                </TabPanel>
                <TabPanel value={valueTab} index={1}>
                    <TierChilds selectedProjectDetails={props.selectedProjectDetails}></TierChilds>
                </TabPanel>
                <TabPanel value={valueTab} index={2}>
                    <ServerChilds
                        selectedProjectDetails={props.selectedProjectDetails}
                        nestedServers={nestedServers}
                    >
                    </ServerChilds>
                </TabPanel>
                <TabPanel value={valueTab} index={3}>
                    <Tree
                        selectedProjectDetails={props.selectedProjectDetails}
                        projectChart={projectChart}
                    >
                    </Tree>
                </TabPanel>
                <TabPanel value={valueTab} index={4}>
                    <Alerts
                        selectedProjectDetails={props.selectedProjectDetails}
                        nestedServers={nestedServers}
                    ></Alerts>
                </TabPanel>
                <TabPanel value={valueTab} index={5}>
                    <StoryBook selectedProjectDetails={props.selectedProjectDetails}></StoryBook>
                </TabPanel>
                {
                    ['Legacy (SP)', 'CFRM-IQ (WLS)'].includes(props?.selectedProjectDetails?.project?.solution) &&
                    <TabPanel value={valueTab} index={6}>
                        <Tenants selectedProjectDetails={props.selectedProjectDetails}></Tenants>
                    </TabPanel>
                }
            </TableContainer>
        </div>:null
    )
}
export default TabsProject;