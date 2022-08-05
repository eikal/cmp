import { getSshConnectionPrivateKey, execSshCommand } from '../../../shared/ssh-client.js';
import { PuppetStatus, STATUS_CHECK_STATUS } from '../config/config.js';
import { handleServer } from '../job/index.js';
import { getSshKeyByCloudspaceID } from '../../entities-api/helpers/configuration.js';
import BtProduct from '../../entities-api/models/facts/product.model.js';
import BtRole from '../../entities-api/models/facts/role.model.js';
import Server from '../../entities-api/models/server/server.model.js';
import StatusCheck from '../models/status-check.model.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import net from 'net';
import axios from 'axios';

export const getPingStatus = async (host) => {
    try {
        const pingResponse = await axios.get(`${process.env.PROMETHEUS_URL}/api/v1/query?query=node_network_up{instance="${host}:9100"}>0`);
        if (pingResponse?.status === 200 && pingResponse?.data?.data?.result.length > 0) {
            if (pingResponse.data.data.result[0]?.value[1] === '1') {
                console.log(`getPingStatus -- ${host} return successfully ping`);
                return {
                    output: null,
                    isAlive: true
                };
            } else {
                console.log(`getPingStatus -- ${host} failed to ping`);
                return {
                    output: `Ping request could not find host ${host}. Please check the name and try again.`,
                    isAlive: false
                };
            }
        }
        console.log(`getPingStatus -- ${host} failed to ping`);
        return {
            output: `Ping request could not find host ${host}. Please check the name and try again.`,
            isAlive: false
        };
    } catch (ex) {
        console.error(`getPingStatus -- ${host} failed to ping`);
        if (ex.code) {
            return {
                output: `Ping request could not find host ${host}. Please check the name and try again.`,
                isAlive: false
            };
        }
        const err = `getPingResponse -- Error while trying to get get ping response for host:${host}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getTelentConnectionStatus = async (host, port) => {
    return new Promise((resolve, reject) => {
        try {
            const client = net.connect(port, host);
            client.on('connect', function () {
                client.destroy();
                console.log(`getTelentConnectionStatus -- ${host} successfully to connect via telnet`);
                return resolve({
                    output: null,
                    connection: true
                });
            }).on('error', function (err) {
                client.destroy();
                console.log(`getTelentConnectionStatus -- ${host} failed to connect via telnet`);
                return resolve({
                    output: err.message,
                    connection: false
                });
            });
        } catch (ex) {
            const err = `getTelentConnectionStatus -- Error while trying to get telnet response for host:${host} on port:${port}, Error: ${JSON.stringify(ex)}`;
            console.error(err);
            return reject(err);
        }
    });
};

export const getServerFactValues = async (server) => {
    try {
        const product = await BtProduct.findById(server.bt_product);
        if (!product) {
            throw `getServerFactValues --- Server:${server.fullHostname}, bt_product not found:${server.bt_product}`;
        }
        const role = await BtRole.findById(server.bt_role);
        if (!role) {
            throw `getServerFactValues --- Server:${server.fullHostname}, bt_product not found:${server.bt_role}`;
        }
        return {
            bt_role: role.name,
            bt_product: product.name
        };
    } catch (ex) {
        const err = `getServerFactValues -- Error while trying to get bt facts from server:${server.fullHostname}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getPuppetStatusAndConfiguration = async (server, cloudspaceID) => {
    try {
        const agentStatus = await getPuppetStatusAgent(server, cloudspaceID);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getPuppetStatus -- Trying to get puppet status for server:${server} from foreman`);
        const serverResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${server}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            },
            timeout: 8000
        });
        if (serverResponse?.status === HttpCodes.OK) {
            const puppetObject = {};
            let puppetStatus = STATUS_CHECK_STATUS.RUNNING;
            if (serverResponse.data.global_status_label === PuppetStatus.ERROR) {
                puppetStatus = STATUS_CHECK_STATUS.STOPPED;
            }
            if (serverResponse.data.global_status_label === PuppetStatus.WARNING) {
                puppetStatus = STATUS_CHECK_STATUS.UNSTABLE;
            }
            puppetObject.status = {
                status: puppetStatus,
                message: serverResponse.data.global_status_label
            };
            puppetObject.configuration = {
                status: puppetStatus,
                message: serverResponse.data.configuration_status_label
            };
            puppetObject.agent = agentStatus;
            console.log(`getPuppetStatusAndConfiguration -- Puppet status:${JSON.stringify(puppetObject)} for server:${server}`);
            return puppetObject;
        }
        throw serverResponse.data.error;
    } catch (ex) {
        if (ex.message && ex.message.includes('timeout')) {
            return {
                status: { status: PuppetStatus.UNSTABLE, message: `Puppet instance: ${process.env.FOREMAN_URL} not responding` },
                configuration: { status: PuppetStatus.UNSTABLE, message: `Puppet instance: ${process.env.FOREMAN_URL} not responding` },
                agent: { status: PuppetStatus.UNSTABLE, message: `Puppet instance: ${process.env.FOREMAN_URL} not responding` }
            };
        }
        const err = `getPuppetStatusAndConfiguration -- Trying to get puppet status for server:${server} from foreman,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getPuppetStatusAgent = async (serverAddress, cloudspaceID) => {
    try {
        const sshKeyExist = await getSshKeyByCloudspaceID(cloudspaceID);
        const sshKeyObject = {
            username: sshKeyExist?.username || process.env.CMP_ROOT_USER,
            keyPath: sshKeyExist?.keyPath || process.env.CMP_ROOT_KEY,
            keyPass: sshKeyExist?.keyPass || null
        };
        const connection = await getSshConnectionPrivateKey(serverAddress, sshKeyObject.username, sshKeyObject.keyPath, sshKeyObject.keyPass);
        const { stdout, stderr } = await execSshCommand(connection, 'sudo cat /opt/puppetlabs/puppet/cache/state/agent_disabled.lock');
        if (stderr && stderr.toLowerCase().includes('no such file or directory')) {
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: null
            };
        }
        if (stdout.toString().length > 1) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: stdout.toString()
            };
        }
        return {
            status: STATUS_CHECK_STATUS.UNSTABLE,
            message: stdout.toString()
        };
    } catch (ex) {
        const err = `getPuppetStatusAgent -- Trying to get puppet agent status for server:${serverAddress},Error:${JSON.stringify(ex)}`;
        console.error(err);
        return {
            status: STATUS_CHECK_STATUS.UNSTABLE,
            message: ex
        };
    }
};

export const getMonitoringStatus = async (server, monitoringTargets) => {
    try {
        console.log(`getMonitoringStatus -- Trying to get monitoring status for server:${server}`);
        if (monitoringTargets.length === 1) {
            const promises = [checkServerMonitoring(server, monitoringTargets[0])];
            const monitoringResponse = await Promise.allSettled(promises);
            const monitorObject = {};
            if (monitoringResponse[0]?.value) {
                monitorObject.infrastructure = monitoringResponse[0].value;
            }
            return monitorObject;
        }
        const promises = [checkServerMonitoring(server, monitoringTargets[0]), checkServerMonitoring(server, monitoringTargets[1])];
        const monitoringResponse = await Promise.allSettled(promises);
        const monitorObject = {};
        if (monitoringResponse[0]?.value) {
            monitorObject.infrastructure = monitoringResponse[0].value;
        }
        if (monitoringResponse[1]?.value) {
            monitorObject.app = monitoringResponse[1].value;
        }
        return monitorObject;
    } catch (ex) {
        const err = `getMonitoringStatus -- Trying to get monitoring status for server:${server},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getElasticStatus = async (server, monitoringTargets) => {
    try {
        console.log(`getElasticStatus -- Trying to get elastic status for server:${server}`);
        const promises = [checkServerElastic(server, monitoringTargets[0]), checkServerElastic(server, monitoringTargets[1], true), checkArtemisStatus(server), checkApacheDsStatus(server)];
        const monitoringResponse = await Promise.allSettled(promises);
        const monitorObject = {};
        if (monitoringResponse[0]?.value) {
            monitorObject.app = monitoringResponse[0].value;
        }
        if (monitoringResponse[1]?.value) {
            monitorObject.cluster = monitoringResponse[1].value;
        }
        if (monitoringResponse[2]?.value) {
            monitorObject.artemis = monitoringResponse[2].value;
        }
        if (monitoringResponse[3]?.value) {
            monitorObject.apacheds = monitoringResponse[3].value;
        }
        return monitorObject;
    } catch (ex) {
        const err = `getElasticStatus -- Trying to get monitoring status for server:${server},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getCfrmStatus = async (server, cloudspaceID) => {
    try {
        console.log(`getCfrmStatus -- Trying to get cfrm status for server:${server.fullHostname}`);
        const promises = [checkServerCfrmStatusViaSSH(server.fullHostname, cloudspaceID), checkServerCfrmStatus(server.fullHostname)];
        const monitoringResponse = await Promise.allSettled(promises);
        const monitorObject = {};
        if (monitoringResponse[0]?.value) {
            monitorObject.service = monitoringResponse[0].value;
        }
        if (monitoringResponse[1]?.value) {
            monitorObject.app = monitoringResponse[1].value;
        }
        return monitorObject;
    } catch (ex) {
        const err = `getCfrmStatus -- Trying to get monitoring status for server:${server.fullHostname},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const checkNfsMountStatus = async (serverAddress, cloudspaceID) => {
    try {
        const sshKeyExist = await getSshKeyByCloudspaceID(cloudspaceID);
        const sshKeyObject = {
            username: sshKeyExist?.username || process.env.CMP_ROOT_USER,
            keyPath: sshKeyExist?.keyPath || process.env.CMP_ROOT_KEY,
            keyPass: sshKeyExist?.keyPass || null
        };
        const connection = await getSshConnectionPrivateKey(serverAddress, sshKeyObject.username, sshKeyObject.keyPath, sshKeyObject.keyPass);
        const { stdout, stderr } = await execSshCommand(connection, 'mount -l | grep nfs | grep /share/deployment');
        if (stderr) {
            throw stderr.toString();
        }
        if (stdout.toString().length > 1) {
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: null
            };
        }
        return {
            status: STATUS_CHECK_STATUS.STOPPED,
            message: stdout.toString()
        };
    } catch (ex) {
        if (ex.includes('authentication methods')) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: null
            };
        }
        const err = `checkNfsMountStatus --  Trying to get nfs mount status for server:${serverAddress},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const checkArtemisStatus = async (server) => {
    try {
        const artemisResponse = await axios.get(`http://${server}:8161`);
        if (artemisResponse?.status === HttpCodes.OK) {
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: null
            };
        }
        return {
            status: STATUS_CHECK_STATUS.UNSTABLE,
            message: null
        };
    } catch (ex) {
        if (ex?.response?.status) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: ex.response.statusText
            };
        }
        if (ex.code) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: `http://${server}:8161 Service is down , ${ex.code}`
            };
        }
        const err = `checkArtemisStatus -- Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const checkApacheDsStatus = async (server) => {
    return new Promise((resolve, reject) => {
        try {
            const client = net.connect(10389, server);
            client.on('connect', function () {
                client.destroy();
                return resolve({
                    status: STATUS_CHECK_STATUS.RUNNING,
                    message: null
                });
            }).on('error', function (err) {
                client.destroy();
                return resolve({
                    status: STATUS_CHECK_STATUS.STOPPED,
                    message: err
                });
            });
        } catch (ex) {
            const err = `checkApacheDsStatus -- Error while trying to get telnet response for host:${server} on port:10389, Error: ${JSON.stringify(ex)}`;
            console.error(err);
            return reject(err);
        }
    });
};

export const checkQueryExporter = async (serverAddress) => {
    try {
        const serverResponse = await axios.get(`http://${serverAddress}:9460/metrics`, {
            timeout: 8000,
            validateStatus: function (status) {
                return status >= 200 && status < 510; // default
            }
        });
        if (serverResponse?.status === HttpCodes.OK) {
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: null
            };
        } else {
            return {
                status: STATUS_CHECK_STATUS.UNSTABLE,
                message: serverResponse?.statusText
            };
        }
    } catch (ex) {
        if (ex?.response?.status) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: ex.response.statusText
            };
        }
        if (ex.code) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: `Query Exporter Service is down , ${ex.code}`
            };
        }
        const err = `checkQueryExporter --  Failed while trying to check server:${serverAddress} query exporter,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const calcualteGeneralStatus = (statuses) => {
    try {
        let generalStatus = STATUS_CHECK_STATUS.RUNNING;
        for (const status of statuses) {
            if (status === STATUS_CHECK_STATUS.UNSTABLE) {
                generalStatus = STATUS_CHECK_STATUS.UNSTABLE;
            }
            if (status === STATUS_CHECK_STATUS.STOPPED) {
                return STATUS_CHECK_STATUS.STOPPED;
            }
        }
        return generalStatus;
    } catch (ex) {
        const err = `calcualteGeneralStatus -- Error while trying to calcualte general error,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw ex;
    }
};

export const validateStatus = (monitoringResponse = null, cfrmStatus = null, elasticStatus = null) => {
    try {
        const statuses = [];
        if (monitoringResponse?.infrastructure?.status) statuses.push(monitoringResponse.infrastructure.status);
        if (monitoringResponse?.app?.status) statuses.push(monitoringResponse.app.status);
        if (cfrmStatus?.app?.status) statuses.push(cfrmStatus.app.status);
        if (cfrmStatus?.service?.status) statuses.push(cfrmStatus.service.status);
        if (elasticStatus?.app?.status) statuses.push(elasticStatus.app.status);
        if (elasticStatus?.cluster?.status) statuses.push(elasticStatus.cluster.status);
        if (elasticStatus?.apacheds?.status) statuses.push(elasticStatus.apacheds.status);
        if (elasticStatus?.artemis?.status) statuses.push(elasticStatus.artemis.status);
        return statuses;
    } catch (ex) {
        const err = `validateStatus -- Error while trying to validate status,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw ex;
    }
};

export const executeStatusCheckByServer = async (serverID) => {
    try {
        const serverObject = await Server.findById(serverID);
        if (!serverObject) {
            throw `serverID :${serverID} not found`;
        }
        await handleServer(serverObject);
    } catch (ex) {
        console.error(ex);
    }
};

const checkServerMonitoring = async (server, monitoringURL) => {
    try {
        console.log(`checkServerMonitoring -- Trying to get monitoring status for server:${server}, on Monitoring:${monitoringURL}`);
        const serverResponse = await axios.get(monitoringURL, {
            timeout: 8000,
            validateStatus: function (status) {
                return status >= 200 && status < 510; // default
            }
        });
        if (serverResponse?.status === HttpCodes.OK) {
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: null
            };
        } else {
            return {
                status: STATUS_CHECK_STATUS.UNSTABLE,
                message: 'Monitor Service is not registered'
            };
        }
    } catch (ex) {
        if (ex.code) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: `${monitoringURL} Service is down , ${ex.code}`
            };
        }
        const err = `checkServerMonitoring -- Trying to get monitoring status for server:${server}, on Monitoring:${monitoringURL},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const checkServerElastic = async (server, monitoringURL, isCluster = false) => {
    try {
        console.log(`checkServerElastic -- Trying to get elastic status for server:${server}, on Monitoring:${monitoringURL}`);
        const serverResponse = await axios.get(monitoringURL, {
            timeout: 8000,
            validateStatus: function (status) {
                return status >= 200 && status < 510; // default
            }
        });
        if (serverResponse?.status === HttpCodes.OK) {
            if (isCluster) {
                if (serverResponse.data.toString().includes('green')) {
                    return {
                        status: STATUS_CHECK_STATUS.RUNNING,
                        message: null
                    };
                }
                if (serverResponse.data.toString().includes('yellow')) {
                    return {
                        status: STATUS_CHECK_STATUS.UNSTABLE,
                        message: null
                    };
                }
                return {
                    status: STATUS_CHECK_STATUS.STOPPED,
                    message: null
                };
            }
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: null
            };
        } else {
            return {
                status: STATUS_CHECK_STATUS.UNSTABLE,
                message: 'Monitor Service is not registered'
            };
        }
    } catch (ex) {
        if (ex.code) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: `${monitoringURL} Service is down , ${ex.code}`
            };
        }
        const err = `checkServerElastic -- Trying to get elastic status for server:${server}, on Monitoring:${monitoringURL},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const checkServerCfrmStatusViaSSH = async (serverAddress, cloudspaceID) => {
    try {
        const sshKeyExist = await getSshKeyByCloudspaceID(cloudspaceID);
        const sshKeyObject = {
            username: sshKeyExist?.username || process.env.CMP_ROOT_USER,
            keyPath: sshKeyExist?.keyPath || process.env.CMP_ROOT_KEY,
            keyPass: sshKeyExist?.keyPass || null
        };
        const connection = await getSshConnectionPrivateKey(serverAddress, sshKeyObject.username, sshKeyObject.keyPath, sshKeyObject.keyPass);
        const { stdout, stderr } = await execSshCommand(connection, '/opt/ic/_manager.sh status');
        if (stderr) {
            throw stderr.toString();
        }
        console.log(`checkServerCfrmStatusViaSSH -- ${serverAddress} cfrm service output:${stdout.toString()}`);
        if (stdout.toString().includes('running')) {
            return {
                status: STATUS_CHECK_STATUS.RUNNING,
                message: 'CFRM Service is up and running'
            };
        }
        if (stdout.toString().includes('down')) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: 'CFRM Investigation Center is down'
            };
        }
        return {
            status: STATUS_CHECK_STATUS.UNSTABLE,
            message: stdout.toString()
        };
    } catch (ex) {
        if (ex.includes('authentication methods')) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: null
            };
        }
        const err = `checkServerCfrmStatusViaSSH --  Trying to get cfrm status for server:${serverAddress},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const checkServerCfrmStatus = async (server) => {
    try {
        console.log(`checkServerCfrmStatus -- Trying to get cfrm ui status for server:${server}`);
        const cfrmResponse = await axios.get(`${process.env.PROMETHEUS_URL}/api/v1/query?query=probe_http_status_code{job="cfrm_http_probe", instance="https://${server}:7780/InvestigationCenter"}`);
        if (cfrmResponse?.status === 200 && cfrmResponse?.data?.data?.result.length > 0) {
            if (cfrmResponse.data.data.result[0]?.value[1] === '0') {
                return {
                    status: STATUS_CHECK_STATUS.STOPPED,
                    message: 'CFRM UI is down'
                };
            }
            if (cfrmResponse.data.data.result[0]?.value[1] === '200' || cfrmResponse.data.data.result[0]?.value[1] === '401') {
                return {
                    status: STATUS_CHECK_STATUS.RUNNING,
                    message: 'CFRM UI is up'
                };
            } else {
                return {
                    status: STATUS_CHECK_STATUS.UNSTABLE,
                    message: `CFRM UI is unstable, Status-Code:${cfrmResponse.data.data.result[0]?.value[1]}`
                };
            }
        }
        return {
            status: STATUS_CHECK_STATUS.UNSTABLE,
            message: 'Monitor Service is not registered'
        };
    } catch (ex) {
        if (ex?.response?.status) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: ex.response.statusText
            };
        }
        if (ex.code) {
            return {
                status: STATUS_CHECK_STATUS.STOPPED,
                message: `${process.env.PROMETHEUS_URL} Service is down , ${ex.code}`
            };
        }
        const err = `checkServerCfrmStatus -- Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getStatusCheckCountByEachDay = async (serverIDs, days, type) => {
    try {
        const result = [];
        for (let i = 0; i < days; i++) {
            const fromDate = new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
            const ToDate = new Date(Date.now() - ((i - 1) * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
            const statusCheckCounts = await StatusCheck.find(
                {
                    serverID: { $in: serverIDs },
                    createdDate: { $gte: new Date(fromDate), $lt: new Date(ToDate) },
                    generalStatus: type
                }
            ).countDocuments();
            result.push({
                date: {
                    day: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).getDate(),
                    month: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).getMonth() + 1
                },
                count: statusCheckCounts
            });
        }
        return result;
    } catch (ex) {
        const err = `getStatusCheckCountByEachDay -- Failed to get all statusCheck count by type:${type} from db,Error:${ex}`;
        console.error(err);
        throw err;
    }
};
