import React, { useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPannel from '../../../shared/TabPanel/TabPanel.jsx';
import TimelineIcon from '@material-ui/icons/Timeline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Alerts from '../../../Alerts/AlertsTable.jsx';
import 'react-toastify/dist/ReactToastify.css'


const AlertTab = (props) => {

    const [valueTab, setValueTab] = useState(0);

    const handleChangeTab = (event, newValue) => {
        setValueTab(newValue);
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }


    return (
        <div style={{ width: '100%', marginBottom: 30 }}>
            <Tabs indicatorColor="primary" value={valueTab} centered onChange={handleChangeTab} aria-label="simple tabs example">
                <Tab label="Open Alerts" icon={<ErrorOutlineIcon />} {...a11yProps(0)} />
                <Tab label="History" icon={<TimelineIcon />}{...a11yProps(1)} />
            </Tabs>
            <TabPannel value={valueTab} index={0}>
                <Alerts
                    nestedServers={props.nestedServers}
                    alertType={'firing'}>
                </Alerts>
            </TabPannel>
            <TabPannel value={valueTab} index={1}>
                <Alerts
                    nestedServers={props.nestedServers}
                    alertType={'resolved'}>
                </Alerts>
            </TabPannel>

        </div>
    )
}
export default AlertTab;
