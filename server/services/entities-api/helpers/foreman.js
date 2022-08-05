import axios from 'axios';
import HttpCodes from '../../../shared/http-status-codes.js';
import { getTierReleations } from '../helpers/queries.js';

export const handleExistingServer = async (server, tierID, createdBy, token, isUpdate = false) => {
    try {
        const serverFactsObj = await getFactsByServer(server);
        if (isUpdate) {
            serverFactsObj.dataCenter = process.env.DATA_CENTER;
            return serverFactsObj;
        }
        serverFactsObj.dataCenter = process.env.DATA_CENTER;
        serverFactsObj.tierID = tierID;
        serverFactsObj.createdBy = createdBy;
        serverFactsObj['x-access-token'] = token;
        const isServerCreated = await axios.post('http://localhost:3003/server', serverFactsObj);
        isServerCreated.data.data.statusCheck = null;
        const relation = await getTierReleations(tierID);
        isServerCreated.data.data.tierName = relation.tier._doc.name;
        isServerCreated.data.data.projectID = relation.project.id;
        isServerCreated.data.data.projectName = relation.project.name;
        return isServerCreated.data.data;
    } catch (ex) {
        const err = `handleExistingServer -- Error while trying create new server,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const getFactsByServer = async (server) => {
    try {
        const serverObj = {};
        const factsResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${server.id}/facts?per_page=1000`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            }
        });
        if (factsResponse?.status === HttpCodes.OK) {
            const data = factsResponse.data.results[server.name];
            serverObj.hostname = server.name.split('.')[0];
            serverObj.alias = data.bt_alias ? data.bt_alias : 'NA';
            serverObj.bt_lob = data.bt_lob ? data.bt_lob : 'NA';
            serverObj.bt_role = data?.bt_role ? data.bt_role : 'NA';
            serverObj.bt_customer = data?.bt_customer ? data.bt_customer : 'NA';
            serverObj.bt_tier = data?.bt_tier ? data.bt_tier : 'NA';
            serverObj.bt_env = data?.bt_env ? data.bt_env : 'NA';
            serverObj.bt_infra_cluster = 'NA';
            serverObj.ip_address = data?.ipaddress ? data?.ipaddress : 'NA';
            serverObj.bt_infra_network = data?.network ? data?.network : 'NA';
            serverObj.bt_product = data?.bt_product ? data?.bt_product : 'NA';
            serverObj.cpu = data?.processorcount ? data?.processorcount : 'NA';
            serverObj.additional_disk = [];
            serverObj.memory = data?.memorysize_mb ? data?.memorysize_mb.split('.')[0] : 'NA';
        } else {
            throw factsResponse;
        }
        const hostDetailsResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${server.id}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            }
        });
        if (hostDetailsResponse?.status === HttpCodes.OK) {
            const dataDetails = hostDetailsResponse.data;
            serverObj.environment = dataDetails?.environment_name ? dataDetails.environment_name : 'NA';
            serverObj.os_version = dataDetails?.operatingsystem_name ? dataDetails.operatingsystem_name : 'NA';
            serverObj.hostgroup = dataDetails?.hostgroup_name ? dataDetails.hostgroup_name : 'NA';
            serverObj.firewall_group = 'NA';
        } else {
            throw hostDetailsResponse;
        }
        return serverObj;
    } catch (ex) {
        const err = `getFactsByServer -- Error while trying get facts for server,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};
