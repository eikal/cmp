import React, { useState } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../../shared/TabPanel/TabPanel.jsx';
import UsersTab from './Tabs/UsersTab.jsx';
import GroupsTab from './Tabs/GroupsTab.jsx';

const TabsRoles = (props) => {
    
    const [valueTab, setValueTab] = useState(0);

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };

    const callbackUpdateUsers = (users, role ,action)=>{
        props.callbackUpdateUsers(users, role,action)
    }

    const callbackUpdateGroups = (groups, role, action) => {
        props.callbackUpdateGroups(groups, role, action)
    }


    return (
        <div style={{ width: '95%', marginBottom: 30 }}>
            <TableContainer component={Paper}>
                <AppBar style={{ backgroundColor: '#606060' }} position="static">
                    <Tabs indicatorColor="primary" value={valueTab} onChange={handleChangeTab} aria-label="simple tabs example">
                        <Tab label="Users" />
                        <Tab label="Groups" />
                    </Tabs>
                </AppBar>
                <TabPanel value={valueTab} index={0}>
                    <div style={{display: 'flex'}}>
                        <UsersTab
                            selectedRole={props.selectedRole}
                            callbackUpdateUsers={callbackUpdateUsers}
                        ></UsersTab>
                    </div>
                </TabPanel>
                <TabPanel value={valueTab} index={1}>
                    <div style={{ display: 'flex' }}>
                        <GroupsTab
                            selectedRole={props.selectedRole}
                            callbackUpdateGroups={callbackUpdateGroups}
                        ></GroupsTab>
                    </div>
                </TabPanel>
                
            </TableContainer>
        </div>
    )
}
export default TabsRoles;