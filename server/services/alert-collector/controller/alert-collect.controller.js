
import joi from 'joi';
import HttpCodes from '../../../shared/http-status-codes.js';
import {
    getAllAlertsFromDB,
    getAlertCountByEachDay,
    getAlertCountByType,
    getTopAlerts,
    getTopServersByAlerts,
    buildChartData,
    updateAlertToAknowledge
} from '../helpers/helpers.js';
import { CACHE_KEYS, ALERT_STATUS } from '../config/config.js';
import { getKey } from '../../../shared/node-cache.js';
import Cloudspace from '../../entities-api/models/cloudspace/cloudspace.model.js';
import Project from '../../entities-api/models/project/project.model.js';
import Tier from '../../entities-api/models/tier/tier.model.js';
import Server from '../../entities-api/models/server/server.model.js';
import Alert from '../models/alert.model.js';

const getServerAlerts = async (req, res, next) => {
    try {
        console.log(`getServerAlerts -- User:${req.user} Trying to get alerts for server:${req.params.id}`);
        const paramsSchema = joi.object().keys({
            id: joi.string().required()
        });
        const paramsResult = paramsSchema.validate(req.params);
        const querySchema = joi.object().keys({
            type: joi.string().required()
        });
        const queryResult = querySchema.validate(req.query);
        if (paramsResult.error || queryResult.error) {
            if (paramsResult.error) {
                console.error(`getServerAlerts -- User:${req.user} Trying to get  alerts for server:${req.params.id},Error:${paramsResult.error}`);
                return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: paramsResult.error });
            } else {
                console.error(`getServerAlerts -- User:${req.user} Trying to get  alerts for server:${req.params.id},Error:${queryResult.error}`);
                return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: queryResult.error });
            }
        }
        const alerts = await getAllAlertsFromDB(req.params.id, req.query.type);
        console.log(`getServerAlerts -- User:${req.user} found :${alerts.length} alerts`);
        return res.status(HttpCodes.OK).send({ data: alerts, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getServerAlerts -- User:${req.user} Trying to get  alerts for server:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get server alerts' });
    }
};

const getServersAlerts = async (req, res, next) => {
    try {
        req.query.servers = req.query.servers.split(',');
        console.log(`getServersAlerts -- User:${req.user} Trying to get alerts for all servers`);
        const querySchema = joi.object().keys({
            type: joi.string().required(),
            servers: joi.array().required()
        });
        const queryResult = querySchema.validate(req.query);
        if (queryResult.error) {
            console.error(`getServersAlerts -- User:${req.user} Trying to get  alerts for all servers,Error:${queryResult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: queryResult.error });
        }
        const alerts = await getAllAlertsFromDB(req.query.servers, req.query.type);
        console.log(`getServerAlerts -- User:${req.user} found :${alerts.length} alerts`);
        return res.status(HttpCodes.OK).send({ data: alerts, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getServersAlerts -- User:${req.user} Trying to get  alerts for all servers,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get server alerts' });
    }
};

const getAllAlerts = async (req, res, next) => {
    try {
        console.log(`getAllAlerts -- User:${req.user} Trying to get alerts for projects`);
        const querySchema = joi.object().keys({
            type: joi.string().required(),
            cloudspace: joi.string().required()
        });
        const queryResult = querySchema.validate(req.query);
        if (queryResult.error) {
            console.error(`getAllAlerts -- User:${req.user} Trying to get alerts for projects,Error:${queryResult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: queryResult.error });
        }
        const cacheKey = req.query.type === ALERT_STATUS.FIRING ? CACHE_KEYS.FIRING_ALERTS : CACHE_KEYS.RESOLVED_ALERTS;
        const alerts = getKey(cacheKey);
        if (!alerts) {
            return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
        }
        const cloudspaceAlerts = alerts.filter(alert => alert?.cloudspace?.id === req.query.cloudspace);
        console.log(`getServerAlerts -- User:${req.user} found :${cloudspaceAlerts.length} alerts`);
        return res.status(HttpCodes.OK).send({ data: cloudspaceAlerts, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAllAlerts -- User:${req.user} Trying to get alerts for projects,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get alerts' });
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        console.log(`getAnalytics -- User:${req.user} Trying to get alerts analytics for :${req.query.days}`);
        const querySchema = joi.object().keys({
            days: joi.number().required(),
            cloudspace: joi.string().required()
        });
        const queryResult = querySchema.validate(req.query);
        if (queryResult.error) {
            console.error(`getAnalytics -- User:${req.user} Trying to get alerts analytics,Error:${queryResult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: queryResult.error });
        }
        const isCloudspaceIsFound = await Cloudspace.findById(req.query.cloudspace);
        if (!isCloudspaceIsFound) {
            throw `getAnalytics -- Faild to find cloudspace:${req.query.cloudspace}`;
        }
        const isProjectsFound = await Project.find({ _id: { $in: isCloudspaceIsFound._doc.projectIDs } });
        if (!isProjectsFound) {
            throw `getAnalytics -- Faild to find projects in cloudspace:${req.query.cloudspace}`;
        }
        const tierIDs = [];
        for (const project of isProjectsFound) {
            for (const tierID of project._doc.tierIDs) {
                tierIDs.push(tierID);
            }
        }
        const foundTiers = await Tier.find({ _id: { $in: tierIDs } });
        const serverIDs = [];
        for (const tier of foundTiers) {
            for (const serverID of tier._doc.serverIDs) {
                serverIDs.push(serverID);
            }
        }
        const foundServers = await Server.find({ _id: { $in: serverIDs } });
        const serverNames = foundServers.map((server) => server.fullHostname);
        const LineChartPromisesResults = await Promise.all([
            getAlertCountByEachDay(req.query.days, ALERT_STATUS.FIRING, serverNames),
            getAlertCountByEachDay(req.query.days, ALERT_STATUS.PENDING, serverNames)
        ]);
        const LineChartResults = buildChartData(LineChartPromisesResults, req.query.days);

        const currentStatePromisesResults = await Promise.all([
            getAlertCountByType(req.query.days, ALERT_STATUS.FIRING, serverNames),
            getAlertCountByType(req.query.days, ALERT_STATUS.PENDING, serverNames),
            getAlertCountByType(req.query.days, ALERT_STATUS.RESOLVED, serverNames)
        ]);
        const topHitsPromiseResponse = await Promise.all([
            getTopAlerts(req.query.days, 5, serverNames),
            getTopServersByAlerts(req.query.days, 5, serverNames)
        ]);
        const result = {
            overtime: LineChartResults,
            currentAlerts: currentStatePromisesResults,
            topHits: topHitsPromiseResponse
        };
        return res.status(HttpCodes.OK).send({ data: result, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAnalytics -- User:${req.user} Trying to get alerts analytics,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get alerts analytics' });
    }
};

const acknowledgeAlertByID = async (req, res, next) => {
    try {
        console.log(`acknowledgeAlertByID -- User:${req.user} Trying to acknowledge Alert:${req.params.id}`);
        const querySchema = joi.object().keys({
            comment: joi.string().required()
        });
        const queryResult = querySchema.validate(req.body);
        if (queryResult.error) {
            console.error(`acknowledgeAlertByID -- User:${req.user} Trying to acknowledge Alert:${req.params.id},Error:${queryResult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: queryResult.error });
        }
        const alertObj = await Alert.findById(req.params.id);
        if (!alertObj) {
            console.error(`acknowledgeAlertByID -- User:${req.user} Trying to acknowledge Alert:${req.params.id},Alert not found`);
            return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.NOT_FOUND, message: 'Alert not found' });
        }
        await updateAlertToAknowledge(alertObj, req.body.comment, req.user);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`acknowledgeAlertByID -- User:${req.user} Trying to acknowledge Alert:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to update alert' });
    }
};

export default {
    getServerAlerts,
    getServersAlerts,
    getAllAlerts,
    getAnalytics,
    acknowledgeAlertByID
};
