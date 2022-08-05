import {
    getPingStatus,
    getTelentConnectionStatus,
    getServerFactValues,
    getPuppetStatusAndConfiguration,
    getMonitoringStatus,
    getCfrmStatus,
    checkNfsMountStatus,
    getElasticStatus,
    calcualteGeneralStatus,
    checkQueryExporter,
    validateStatus
} from '../helpers/helpers.js';
import { getServerParentsDetails } from '../../entities-api/helpers/queries.js';
import { STATUS_CHECK_STATUS } from '../config/config.js';
import Server from '../../entities-api/models/server/server.model.js';
import StatusCheck from '../models/status-check.model.js';

/**
 * This method called according to cronjob config time.
 * This method execute status-check to each server.
 */
export const startSync = async () => {
    try {
        console.log(`startSync -- Start execute status-check for all servers, Date:${new Date().toLocaleString()}`);
        const servers = await Server.find({});
        for (const server of servers) {
            handleServer(server._doc);
        }
        console.log(`startSync -- Finish execute status-check for all servers ,Date:${new Date().toLocaleString()}`);
    } catch (ex) {
        const err = `startSync -- Failed to start sync,Error:${ex}`;
        console.error(err);
    }
};

/**
 * This method execute status check
 * @param {Object} serverObject
 *
 */
export const handleServer = async (serverObject) => {
    try {
        console.log(`handleServer -- trying to create new StatusCheck for server:${serverObject.fullHostname} ${new Date()}`);
        const serverRelation = await getServerParentsDetails(serverObject.fullHostname);
        let statuses = [];
        const pingResponse = await getPingStatus(serverObject.fullHostname);
        const telnetResponse = await getTelentConnectionStatus(serverObject.fullHostname, 22);
        const puppetResponse = await getPuppetStatusAndConfiguration(serverObject.fullHostname, serverRelation.cloudspace.id);
        const { bt_role, bt_product } = await getServerFactValues(serverObject);
        let monitoringResponse, cfrmStatus, elasticStatus, nfsMount, dbStatus;
        if ((bt_role.includes('standalone')) && (bt_product.includes('cfrm'))) {
            const monitoringTargets = [`http://${serverObject.fullHostname}:9100/metrics`, `http://${serverObject.fullHostname}:9779`];
            const elasticTargets = [`http://${serverObject.fullHostname}:9200/_prometheus/metrics`, `http://${serverObject.fullHostname}:9200/_cat/health?pretty`];
            monitoringResponse = await getMonitoringStatus(serverObject.fullHostname, monitoringTargets);
            elasticStatus = await getElasticStatus(serverObject.fullHostname, elasticTargets);
            cfrmStatus = await getCfrmStatus(serverObject, serverRelation.cloudspace.id);
            const validatedStatuses = validateStatus(monitoringResponse, cfrmStatus, elasticStatus);
            statuses = [...statuses, ...validatedStatuses];
        }
        if (['app', 'frontend', 'backend'].includes(bt_role) && (bt_product.includes('cfrm'))) {
            const monitoringTargets = [`http://${serverObject.fullHostname}:9100/metrics`, `http://${serverObject.fullHostname}:9779`];
            monitoringResponse = await getMonitoringStatus(serverObject.fullHostname, monitoringTargets);
            cfrmStatus = await getCfrmStatus(serverObject, serverRelation.cloudspace.id);
            const validatedStatuses = validateStatus(monitoringResponse, cfrmStatus);
            statuses = [...statuses, ...validatedStatuses];
        }
        if ((bt_role.includes('elastic')) && (bt_product.includes('cfrm'))) {
            const elasticTargets = [`http://${serverObject.fullHostname}:9200/_prometheus/metrics`, `http://${serverObject.fullHostname}:9200/_cat/health?pretty`];
            const monitoringTargets = [`http://${serverObject.fullHostname}:9100/metrics`];
            elasticStatus = await getElasticStatus(serverObject.fullHostname, elasticTargets);
            monitoringResponse = await getMonitoringStatus(serverObject.fullHostname, monitoringTargets);
            const validatedStatuses = validateStatus(monitoringResponse, null, elasticStatus);
            statuses = [...statuses, ...validatedStatuses];
        }
        if (!monitoringResponse) {
            const monitoringTargets = [`http://${serverObject.fullHostname}:9100/metrics`];
            monitoringResponse = await getMonitoringStatus(serverObject.fullHostname, monitoringTargets);
            if (monitoringResponse?.infrastructure?.status) statuses.push(monitoringResponse.infrastructure.status);
        }

        if ((bt_role.includes('oradb')) && (bt_product.includes('cfrm'))) { // db
            dbStatus = {};
            const dbNetwork = await getTelentConnectionStatus(serverObject.fullHostname, 22);
            dbStatus.network = {
                status: dbNetwork?.connection ? STATUS_CHECK_STATUS.RUNNING : STATUS_CHECK_STATUS.STOPPED,
                message: dbNetwork?.output || null
            };
            statuses.push(dbStatus.network.status);
            if (bt_product.includes('cfrmcloud')) {
                const dbExporter = await checkQueryExporter(serverObject.fullHostname);
                dbStatus.exporter = {
                    status: dbExporter?.status,
                    message: dbExporter?.message
                };
                statuses.push(dbStatus.exporter.status);
            }
        }

        if ((['app', 'standalone', 'elastic', 'frontend', 'backend', 'cfrm'].includes(bt_role)) && (bt_product.includes('cfrm'))) { // mount to nfs
            nfsMount = await checkNfsMountStatus(serverObject.fullHostname, serverRelation.cloudspace.id);
            if (nfsMount?.status) statuses.push(nfsMount?.status);
            statuses.push(nfsMount.status);
        }

        const statusCheckObj = {
            serverID: serverObject._id,
            createdDate: new Date(),
            system: {
                status: pingResponse?.isAlive ? STATUS_CHECK_STATUS.RUNNING : STATUS_CHECK_STATUS.STOPPED,
                message: pingResponse?.output || null
            },
            network: {
                status: telnetResponse?.connection ? STATUS_CHECK_STATUS.RUNNING : STATUS_CHECK_STATUS.STOPPED,
                message: telnetResponse?.output || null
            },
            puppet: puppetResponse,
            monitoring: monitoringResponse
        };

        if (cfrmStatus) {
            statusCheckObj.cfrm = cfrmStatus;
        }
        if (elasticStatus) {
            statusCheckObj.elk = elasticStatus;
        }
        if (nfsMount) {
            statusCheckObj.nfsMount = nfsMount;
        }
        if (dbStatus) {
            statusCheckObj.db = dbStatus;
        }
        statuses.push(statusCheckObj.system.status);
        statuses.push(statusCheckObj.network.status);

        if (puppetResponse) {
            statuses.push(puppetResponse.status.status);
            statuses.push(puppetResponse.configuration.status);
            statuses.push(puppetResponse.agent.status);
        }
        const generalStatus = calcualteGeneralStatus(statuses);
        statusCheckObj.generalStatus = generalStatus;

        const statusCheck = new StatusCheck(statusCheckObj);
        const isStatusCheckDocCreated = await statusCheck.save(statusCheck);
        if (isStatusCheckDocCreated?._doc) {
            console.log(`handleServer -- Succeeded to create new StatusCheck for server:${serverObject.fullHostname} ${new Date()}`);
            return statusCheckObj;
        }
        throw `create new StatusCheck for server:${serverObject.fullHostname}`;
    } catch (ex) {
        const err = `handleServer -- to create status-check for server:${serverObject.fullHostname},Error:${ex}`;
        console.error(err);
    }
};
