import axios from 'axios';
import joi from 'joi';
import { Hostname } from '../../models/facts/index.js';
import { handleExistingServer } from '../../helpers/foreman.js';
import HttpCodes from '../../../../shared/http-status-codes.js';

const getHostgroups = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getHostgroups -- User:${req.user} Trying to get hostgroups from foreman`);
        const hostgroupsResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hostgroups?per_page=1000`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            }
        });
        if (hostgroupsResponse?.status === HttpCodes.OK && hostgroupsResponse?.data?.total > 0) {
            const hostGroupArray = hostgroupsResponse.data.results.map((hostgroup) => { return { name: hostgroup.name, id: hostgroup.id, type: 'hostgroup' }; });
            return res.status(HttpCodes.OK).send({ data: hostGroupArray, statusCode: HttpCodes.OK, message: null });
        }
        throw hostgroupsResponse;
    } catch (ex) {
        console.error(`getHostgroups -- User:${req.user} Error while trying to get hostgroups,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get hostgroups' });
    }
};

const getHostnames = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getHostnames -- User:${req.user} Trying to get hostnames from foreman`);
        const hostnamesResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts?per_page=100&search=name+~${req.params.query ? req.params.query : '*'}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            }
        });
        if (hostnamesResponse?.status === HttpCodes.OK && hostnamesResponse?.data?.subtotal != null) {
            // filter out irrelevant hosts
            const hostnamesPrefix = await Hostname.find({});
            const hostNameArray = hostnamesResponse.data.results.reduce(function (result, hostname) {
                for (const hostnamePrefix of hostnamesPrefix) {
                    if (hostname.name.includes(hostnamePrefix._doc.name)) {
                        return result.concat({
                            name: hostname.name,
                            id: hostname.id,
                            type: 'host'
                        });
                    }
                }
                return result;
            }, []);
            return res.status(HttpCodes.OK).send({ data: hostNameArray, statusCode: HttpCodes.OK, message: null });
        }
        throw hostnamesResponse;
    } catch (ex) {
        console.error(`getHostnames -- User:${req.user} Error while trying to get hostnames, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get hostnames' });
    }
};

const getEnvironments = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getEnvironments -- User:${req.user} Trying to get environments from foreman`);
        const envResponse = await axios.get(`${process.env.FOREMAN_URL}/api/environments?per_page=1000`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            },
            timeout: 8000
        });
        if (envResponse?.status === HttpCodes.OK && envResponse?.data?.total > 0) {
            const envArray = envResponse.data.results.map((environmet) => { return { name: environmet.name, id: environmet.id }; });
            return res.status(HttpCodes.OK).send({ data: envArray, statusCode: HttpCodes.OK, message: null });
        }
        throw envResponse;
    } catch (ex) {
        console.error(`getEnvironments -- User:${req.user} Error while trying to get environments, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get hostgroups' });
    }
};

const getHostsByHostgroupID = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getHostsByHostgroupID -- User:${req.user} Trying to get hosts by hostgroupID:${req.params.id} from foreman`);
        const hostgroupsResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hostgroups/${req.params.id}/hosts?per_page=1000`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            }
        });
        if (hostgroupsResponse?.status === HttpCodes.OK) {
            if (hostgroupsResponse?.data?.total === 0) {
                return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
            }
            const hostGroupArray = hostgroupsResponse.data.results.map((host) => { return { name: host.name, id: host.id, hostgroup: host.hostgroup_name }; });
            return res.status(HttpCodes.OK).send({ data: hostGroupArray, statusCode: HttpCodes.OK, message: null });
        }
        throw hostgroupsResponse;
    } catch (ex) {
        console.error(`getHostsByHostgroupID -- User:${req.user} Error while trying to get hosts by hostgroupID:${req.body.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get hostgroups' });
    }
};

const getReportsByHostname = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getReportsByHostname -- User:${req.user} Trying to get reports by hostname:${req.params.hostname} from foreman`);
        const schema = joi.object().keys({
            hostname: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getReportsByHostname -- User:${req.user} Validation error while trying to get reports by hostname:${req.params.hostname}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const reportsResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${req.params.hostname}/config_reports?per_page=1000`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            },
            timeout: 8000
        });
        if (reportsResponse?.status === HttpCodes.OK) {
            if (reportsResponse?.data?.total === 0) {
                return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
            }
            const reportArray = reportsResponse.data.results.map((report) => {
                return {
                    created_at: report?.created_at,
                    id: report?.id,
                    hostgroup: report?.hostgroup_name,
                    Applied: report?.status?.applied,
                    Restarted: report?.status?.restarted,
                    Failed: report?.status?.failed,
                    Restart_Failures: report?.status?.failed_restarts
                };
            });
            return res.status(HttpCodes.OK).send({ data: reportArray, statusCode: HttpCodes.OK, message: null });
        }
        throw reportsResponse;
    } catch (ex) {
        console.error(`getReportsByHostname -- User:${req.user} Error while trying to get reports by hostname:${req.params.hostname},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get reports' });
    }
};

const getHostByHostname = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getHostByHostname -- User:${req.user} Trying to get host by hostname:${req.params.hostname} from foreman`);
        const schema = joi.object().keys({
            hostname: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getHostByHostname -- User:${req.user} Validation error while trying to get host by hostname:${req.params.hostname}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const hostResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${req.params.hostname}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            }
        });
        if (hostResponse?.status === HttpCodes.OK) {
            if (hostResponse?.data?.total === 0) {
                return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
            }
            const hostData = {
                name: hostResponse?.data?.name,
                ip: hostResponse?.data?.ip,
                environment_name: hostResponse?.data?.environment_name,
                hostgroup_name: hostResponse?.data?.hostgroup_name,
                uptime_seconds: hostResponse?.data?.uptime_seconds,
                operatingsystem_name: hostResponse?.data?.operatingsystem_name
            };
            return res.status(HttpCodes.OK).send({ data: hostData, statusCode: HttpCodes.OK, message: null });
        }
        throw hostResponse;
    } catch (ex) {
        console.error(`getHostByHostname -- User:${req.user} Error while trying to get host by hostname:${req.params.hostname},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get host' });
    }
};

const updateHostType = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`updateHostType -- User:${req.user} Trying to update host: ${req.params.hostname}, on type:${req.body.field} with value:${req.body.value}`);
        const paramsSchema = joi.object().keys({
            hostname: joi.string().required()
        });
        const paramsResult = paramsSchema.validate(req.params);
        if (paramsResult.error) {
            console.error(`updateHostType -- User:${req.user} Validation failed to update host:${req.params.hostname}, on type:${req.body.field} with value:${req.body.field}, Error:${paramsResult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: paramsResult.error });
        }
        const bodySchema = joi.object().keys({
            field: joi.string().required(),
            value: joi.string().required()
        });
        const bodyRresult = bodySchema.validate(req.body);
        if (bodyRresult.error) {
            console.error(`updateHostType -- User:${req.user} Validation failed to update host:${req.params.hostname}, on type:${req.body.field} with value:${req.body.field}, Error:${bodyRresult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: bodyRresult.error });
        }
        const host = { [req.body.field]: req.body.value };
        const resUpdate = await axios.put(`${process.env.FOREMAN_URL}/api/hosts/${req.params.hostname}`, host,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
                },
                timeout: 8000
            }
        );
        if (resUpdate?.status === HttpCodes.NO_CONTENT || resUpdate?.status === HttpCodes.OK) {
            console.log(`updateHostType -- User:${req.user} Succeeded to update host:${req.params.hostname}, on type:${req.body.field} with value:${req.body.field}`);
            return res.status(HttpCodes.OK).send({ data: req.body.value, statusCode: HttpCodes.OK, message: null });
        }
        throw resUpdate;
    } catch (ex) {
        const err = `updateHostType -- User:${req.user} Failed to update host:${req.params.hostname}, on type:${req.body.field} with value:${req.body.field}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to update fact' });
    }
};

const getReportByID = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getReportByID -- User:${req.user} Trying to get report by ID:${req.params.id} from foreman`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getReportByID -- User:${req.user} Validation error while trying to get report by ID:${req.params.id}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const reportResponse = await axios.get(`${process.env.FOREMAN_URL}/api/config_reports/${req.params.id}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            },
            timeout: 8000
        });
        if (reportResponse?.status === HttpCodes.OK) {
            if (reportResponse?.data?.total === 0) {
                return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
            }
            return res.status(HttpCodes.OK).send({ data: reportResponse.data, statusCode: HttpCodes.OK, message: null });
        }
        throw reportResponse;
    } catch (ex) {
        console.error(`getReportByID -- User:${req.user} Error while trying to get report by ID:${req.params.id}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get report' });
    }
};

const getYAMLByHostname = async (req, res, next) => {
    try {
        console.log(`getYAMLByHostname -- User:${req.user} Trying to get YAML by hostname: ${req.params.hostname} from foreman`);
        const schema = joi.object().keys({
            hostname: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getHostByID -- User:${req.user} Validation error while trying to get YAML by hostname:${req.params.hostname}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const hostResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${req.params.hostname}/enc`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            },
            timeout: 8000
        });
        if (hostResponse?.status === HttpCodes.OK) {
            return res.status(HttpCodes.OK).send({ data: JSON.stringify(hostResponse.data.data), statusCode: HttpCodes.OK, message: null });
        }
        throw hostResponse;
    } catch (ex) {
        console.error(`getHostByID -- User:${req.user} Error while trying to get YAML by hostname:${req.params.hostname},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get YAML' });
    }
};

const getFactsByHostname = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        console.log(`getFactsByHostname -- User:${req.user} Trying to get host by hostname:${req.params.hostname} from foreman`);
        const schema = joi.object().keys({
            hostname: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getFactsByHostname -- User:${req.user} Validation error while trying to get facts by hostname:${req.params.hostname}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const factsResponse = await axios.get(`${process.env.FOREMAN_URL}/api/hosts/${req.params.hostname}/facts?per_page=1000`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.FOREMAN_USERNAME}:${process.env.FOREMAN_PASSWORD}`).toString('base64')}`
            },
            timeout: 8000
        });
        if (factsResponse?.status === HttpCodes.OK) {
            const hostname = factsResponse.data.results[req.params.hostname];
            const factsData = {
                bt_lob: hostname?.bt_lob ? hostname?.bt_lob : 'NA',
                bt_role: hostname?.bt_role ? hostname?.bt_role : 'NA',
                bt_alias: hostname?.bt_alias ? hostname?.bt_alias : 'NA',
                bt_customer: hostname?.bt_customer ? hostname?.bt_customer : 'NA',
                bt_tier: hostname?.bt_tier ? hostname?.bt_tier : 'NA',
                bt_env: hostname?.bt_env ? hostname?.bt_env : 'NA',
                bt_product: hostname?.bt_product ? hostname?.bt_product : 'NA',
                bt_infra_cluster: hostname?.bt_infra_cluster ? hostname?.bt_infra_cluster : 'NA',
                bt_infra_network: hostname?.bt_infra_network ? hostname?.bt_infra_network : 'NA',
                firewall_group: hostname?.firewall_group ? hostname?.firewall_group : 'NA',
                cpu: hostname?.processorcount ? hostname?.processorcount : 'NA',
                memory: hostname?.memorysize_mb ? hostname?.memorysize_mb.split('.')[0] : 'NA'
            };
            return res.status(HttpCodes.OK).send({ data: factsData, statusCode: HttpCodes.OK, message: null });
        };
        throw factsResponse;
    } catch (ex) {
        console.error(`getFactsByHostname -- User:${req.user} Error while trying to get facts by hostname:${req.params.hostname}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get host' });
    }
};

const createExistingServers = async (req, res, next) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        const schema = joi.object().keys({
            servers: joi.array().required(),
            tierID: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createExistingServers -- User:${req.user} Validation error while trying to create existing servers,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const promises = [];
        for (const server of req.body.servers) {
            promises.push(handleExistingServer(server, req.body.tierID, req.user, req.cookies['x-access-token']));
        }
        const serversArray = [];
        const serversResponse = await Promise.allSettled(promises);
        for (const server of serversResponse) {
            if (server.status) {
                serversArray.push(server.value);
            }
        }
        return res.status(HttpCodes.OK).send({ data: serversArray, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`createExistingServers -- User:${req.user} Error while trying to create hosts ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get hostgroups' });
    }
};

export default {
    getHostgroups,
    getHostnames,
    getEnvironments,
    getHostsByHostgroupID,
    getReportsByHostname,
    getReportByID,
    getHostByHostname,
    updateHostType,
    getYAMLByHostname,
    getFactsByHostname,
    createExistingServers
};
