import axios from 'axios';
import Server from '../../entities-api/models/server/server.model.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import Alert from '../models/alert.model.js';
import { ALERT_STATUS, CACHE_KEYS } from '../config/config.js';
import { getServerParentsDetails } from '../../entities-api/helpers/queries.js';
import { getKey, setKey } from '../../../shared/node-cache.js';
import pLimit from 'p-limit';
import mongoose from 'mongoose';
const { startSession } = mongoose;

export const filterAlert = async (alertObject) => {
    try {
        if (!alertObject?.labels?.instance || !alertObject?.labels?.alertname) {
            return; // alert not relevant to our pattern
        }
        const isServerExist = await checkIfServerExistInDB(alertObject.labels.instance);
        if (!isServerExist) {
            return; // in that case alert is not relevant beacuse server is not exist in db
        }
        return alertObject;
    } catch (ex) {
        const err = `filterAlert -- Error while trying to filter alert:${alertObject?.labels?.alertname}:${alertObject?.labels?.instance},Error:${ex}`;
        console.error(err);
    }
};

export const getAlerts = async () => {
    try {
        const alertsResponse = await axios.get(`${process.env.PROMETHEUS_URL}/api/v1/alerts`);
        if (alertsResponse?.status === HttpCodes.OK || alertsResponse?.data?.data?.alerts) {
            return alertsResponse.data.data.alerts;
        }
        throw alertsResponse;
    } catch (ex) {
        const err = `getAlerts -- Failed to get alert from Prometheus,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const checkIfServerExistInDB = async (serverHostname) => {
    try {
        const serverHostnameFix = parseServerName(serverHostname);
        const foundServer = await Server.findOne({ fullHostname: serverHostnameFix });
        if (foundServer) {
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        const err = `checkIfServerExistInDB -- Failed to check if server:${serverHostname} exist in DB,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const checkIsAlertExist = async (alertObj) => {
    try {
        const serverHostnameFix = parseServerName(alertObj.labels.instance);
        const foundAlert = await Alert.findOne({ summary: alertObj.annotations.summary, server: serverHostnameFix, state: { $nin: [ALERT_STATUS.RESOLVED] } });
        if (foundAlert) {
            if (alertObj.state !== foundAlert._doc.state) {
                await Alert.findOneAndUpdate({ summary: alertObj.annotations.summary, server: serverHostnameFix, state: foundAlert._doc.state },
                    { state: alertObj.state, lastState: foundAlert._doc.state, updatedDate: new Date() }); // updating alert status , for example pending => firing
            }
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        const err = `checkIsAlertExist -- Failed to check if alert:${alertObj.labels.alertname}:${alertObj.labels.instance} exist in DB,Error:${ex}`;
        console.error(err);
    }
};

export const getAllAlertsFromDB = async (server = null, type) => {
    try {
        const query = { server: server };
        let typeAlertsQuery = null;
        if (type === ALERT_STATUS.RESOLVED) {
            typeAlertsQuery = ALERT_STATUS.RESOLVED;
        }
        if (type === ALERT_STATUS.FIRING) {
            typeAlertsQuery = { $in: [ALERT_STATUS.FIRING, ALERT_STATUS.PENDING] };
        }
        if (!server) {
            delete query.server;
        }
        if (Array.isArray(server)) {
            query.server = { $in: server };
        }
        if (typeAlertsQuery) {
            query.state = typeAlertsQuery;
        }
        const foundAlerts = await Alert.find(query).sort({ _id: type === ALERT_STATUS.RESOLVED ? -1 : 1 });
        if (foundAlerts && foundAlerts.length > 0) {
            return foundAlerts.map((alert) => alert._doc);
        } else {
            return [];
        }
    } catch (ex) {
        const err = `getAllAlertsFromDB -- Failed to get all alerts from db,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const createNewAlert = async (alertObj) => {
    try {
        const serverHostnameFix = parseServerName(alertObj.labels.instance);
        const alert = new Alert({
            name: alertObj.labels.alertname,
            summary: alertObj.annotations.summary,
            server: serverHostnameFix,
            labels: alertObj.labels,
            annotations: alertObj.annotations,
            state: alertObj.state,
            createdDate: new Date(),
            updatedDate: new Date()
        });
        const isAlertCreated = await alert.save(alert);
        if (isAlertCreated?._doc) {
            console.log(`createNewAlert -- Succeeded to create new Alert:${alertObj.annotations.summary}:${alertObj.labels.instance} doc in DB`);
        } else {
            throw 'Failed to create new alert';
        }
    } catch (ex) {
        const err = `createNewAlert -- Failed to check if alert:${alertObj.annotations.summary}:${alertObj.labels.instance} exist in DB,Error:${ex}`;
        console.error(err);
    }
};

export const updateResolveAlert = async (alertObj) => {
    try {
        const query = {
            updatedDate: new Date(),
            state: ALERT_STATUS.RESOLVED,
            lastState: alertObj.state
        };
        const isAlertUpdated = await Alert.updateOne({ _id: alertObj._id }, query);
        if (isAlertUpdated?.ok) {
            console.log(`updateResolveAlert -- Succeeded to update Alert:${alertObj.annotations.summary}:${alertObj.labels.instance} state doc in DB`);
        }
    } catch (ex) {
        const err = `updateResolveAlert -- Failed to update Alert:${alertObj.annotations.summary}:${alertObj.labels.instance} to resolved status,Error:${ex}`;
        console.error(err);
    }
};

export const updateAlertToAknowledge = async (alertObj, comment, createdBy) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const query = {
            updatedDate: new Date(),
            isAcknowledged: true,
            $push: {
                comments: {
                    reason: comment,
                    createdBy: createdBy,
                    updatedDate: new Date()
                }
            }
        };
        const isAlertUpdated = await Alert.updateOne({ _id: alertObj._id }, query, { session });
        if (!isAlertUpdated?.ok) {
            throw 'Failed to update state';
        };
        const alerts = getKey(CACHE_KEYS.FIRING_ALERTS);
        const foundAlertIndex = alerts.findIndex((alert) => alert._id.toString() === alertObj._id.toString());
        const updatedAlert = alerts[foundAlertIndex];
        updatedAlert.isAcknowledged = true;
        updatedAlert.updatedDate = new Date().toISOString();
        updatedAlert.comments.push({ reason: comment, createdBy: createdBy, updatedDate: new Date() });
        alerts[foundAlertIndex] = updatedAlert;
        setKey(CACHE_KEYS.FIRING_ALERTS, alerts);
        await session.commitTransaction();
        session.endSession();
        console.log(`updateAlertToAknowledge -- Succeeded to update Alert:${alertObj._id} state doc in DB`);
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `updateAlertToAknowledge -- Failed to update Alert:${alertObj._id} state doc in DB to aknowledge status,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const getAlertServerRelations = async (alerts) => {
    try {
        const limit = pLimit(70);
        const chunks = [];
        for (const alert of alerts) {
            chunks.push(limit(() => getServerParentsDetails(alert.server)));
        }
        const promiseResult = await Promise.allSettled(chunks);
        for (let i = 0; i < promiseResult.length; i++) {
            if (promiseResult[i]?.value) {
                alerts[i].cloudspace = promiseResult[i]?.value?.cloudspace;
                alerts[i].project = promiseResult[i]?.value?.project;
                alerts[i].tier = promiseResult[i]?.value?.tier;
            }
        }
        return alerts;
    } catch (ex) {
        const err = `getAlertServerRelations -- Failed to get alert server relations,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const getAlertCountByEachDay = async (days, type, servers) => {
    try {
        const result = [];
        for (let i = 0; i < days; i++) {
            const fromDate = new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
            const ToDate = new Date(Date.now() - ((i - 1) * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
            const alertCounts = await Alert.find(
                {
                    createdDate: { $gte: new Date(fromDate), $lt: new Date(ToDate) },
                    lastState: type,
                    server: { $in: servers }
                }
            ).countDocuments();
            result.push({
                date: {
                    day: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).getDate(),
                    month: new Date(Date.now() - (i * 1000 * 60 * 60 * 24)).getMonth() + 1
                },
                count: alertCounts
            });
        }
        return result;
    } catch (ex) {
        const err = `getAlertCountByEachDay -- Failed to get all alerts count by type:${type} from db,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const getAlertCountByType = async (days, type, servers) => {
    try {
        const fromDate = new Date(Date.now() - (days * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
        const alertCounts = await Alert.find(
            {
                createdDate: { $gte: new Date(fromDate) },
                state: type,
                server: { $in: servers }
            }
        ).countDocuments();
        return ({
            count: alertCounts,
            type: type
        });
    } catch (ex) {
        const err = `getAlertCountByType -- Failed to get all alerts count by type:${type} from db,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const getTopAlerts = async (days, numberOfTopAlerts = null, servers) => {
    try {
        const fromDate = new Date(Date.now() - (days * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
        const alertCounts = await Alert.aggregate([
            {
                $match: {
                    createdDate: { $gte: new Date(fromDate) },
                    server: { $in: servers }
                }
            },
            {
                $group: {
                    _id: {
                        name: '$name'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    '_id.name': 1,
                    count: -1
                }
            },
            {
                $group: {
                    _id: {
                        name: '$_id.name'
                    },
                    count: {
                        $first: '$count'
                    }
                }
            }
        ]);
        if (numberOfTopAlerts) {
            return alertCounts.sort((a, b) => b.count - a.count).slice(0, numberOfTopAlerts);
        }
        return alertCounts.sort((a, b) => b.count - a.count);
    } catch (ex) {
        const err = `getTopAlerts -- Failed to get top alerts ,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const getTopServersByAlerts = async (days, numberOfTopAlerts = null, servers) => {
    try {
        const fromDate = new Date(Date.now() - (days * 1000 * 60 * 60 * 24)).toISOString().split('T')[0];
        const alertCounts = await Alert.aggregate([
            {
                $match: {
                    createdDate: { $gte: new Date(fromDate) },
                    server: { $in: servers }
                }
            },
            {
                $group: {
                    _id: {
                        server: '$server'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    '_id.server': 1,
                    count: -1
                }
            },
            {
                $group: {
                    _id: {
                        name: '$_id.server'
                    },
                    count: {
                        $first: '$count'
                    }
                }
            }
        ]);
        if (numberOfTopAlerts) {
            return alertCounts.sort((a, b) => b.count - a.count).slice(0, numberOfTopAlerts);
        }
        return alertCounts.sort((a, b) => b.count - a.count);
    } catch (ex) {
        const err = `getTopServersByAlerts -- Failed to get top servers by alerts ,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const buildChartData = (chartData, days) => {
    const total = [];
    for (let i = 0; i < days; i++) {
        total.push({
            count: chartData[0][i].count + chartData[1][i].count,
            date: chartData[0][i].date
        });
    }
    return chartData.concat([total]);
};

export const parseServerName = (serverHostname) => {
    let serverHostnameFix = serverHostname.replace('https://', '');
    serverHostnameFix = serverHostnameFix.replace('http://', '');
    if (serverHostnameFix.includes(':')) {
        serverHostnameFix = serverHostnameFix.slice(0, serverHostnameFix.lastIndexOf(':'));
    }
    return serverHostnameFix;
};
