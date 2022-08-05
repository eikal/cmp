
import joi from 'joi';
import Server from '../../entities-api/models/server/server.model.js';
import Cloudspace from '../../entities-api/models/cloudspace/cloudspace.model.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import { STATUS_CHECK_STATUS } from '../config/config.js';
import { getCloudspaceRelations } from '../../entities-api/helpers/queries.js';
import { getStatusCheckCountByEachDay } from '../helpers/helpers.js';
import { handleServer } from '../job/index.js';

const getStatusCheckByServer = async (req, res, next) => {
    try {
        console.log(`getStatusCheckByServer -- User:${req.user} Trying to get status check by serverID :${req.query.serverID}`);
        const schema = joi.object().keys({
            serverID: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getStatusCheckByServer -- User:${req.user} Trying to get status check by serverID :${req.query.serverID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const serverObject = await Server.findById(req.query.serverID);
        if (!serverObject) {
            throw `serverID :${req.query.serverID} not found`;
        }
        const statusCheck = await handleServer(serverObject._doc);
        return res.status(HttpCodes.OK).send({ data: statusCheck, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getStatusCheckByServer -- User:${req.user} Trying to get status check by serverID :${req.body.serverID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get server status check' });
    }
};

const getDashboardStatusCheckStats = async (req, res, next) => {
    try {
        console.log(`getDashboardStatusCheckStats -- User:${req.user} Trying to get status check dashboard stats`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getDashboardStatusCheckStats -- User:${req.user} Trying to get status check dashboard stats,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isCloudspaceIsFound = await Cloudspace.findById(req.query.cloudspaceID);
        if (!isCloudspaceIsFound) {
            throw `Faild to find cloudspace:${req.query.cloudspaceID}`;
        }
        const cloudspaceRealtion = await getCloudspaceRelations(isCloudspaceIsFound);
        const serverIDs = [];
        for (const project of cloudspaceRealtion.projects) {
            for (const tier of project.relations) {
                for (const server of tier.servers) {
                    serverIDs.push(server._doc._id.toString());
                }
            }
        }
        const LineChartPromisesResults = await Promise.all([
            getStatusCheckCountByEachDay(serverIDs, 7, STATUS_CHECK_STATUS.RUNNING),
            getStatusCheckCountByEachDay(serverIDs, 7, STATUS_CHECK_STATUS.UNSTABLE),
            getStatusCheckCountByEachDay(serverIDs, 7, STATUS_CHECK_STATUS.STOPPED)
        ]);
        return res.status(HttpCodes.OK).send({ data: LineChartPromisesResults, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getDashboardStatusCheckStats -- User:${req.user} Trying to get status check dashboard stats,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get dashboard stat' });
    }
};

export default { getStatusCheckByServer, getDashboardStatusCheckStats };
