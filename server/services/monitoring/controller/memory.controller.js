
import joi from 'joi';
import { buildMemoryQuery, getMemoryQueryResult } from '../helpers/helpers.js';
import HttpCodes from '../../../shared/http-status-codes.js';

const getMemoryUtilizationData = async (req, res, next) => {
    try {
        console.log(`getMemoryUtilizationData -- User:${req.user} Trying to get memory data:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required(),
            type: joi.string().required(),
            period: joi.number().required().allow(null)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getMemoryUtilizationData -- User:${req.user} Error while Trying to get memory data:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const { type, period, server } = req.body;
        const queryObj = buildMemoryQuery(server, type, period);
        const response = await getMemoryQueryResult(queryObj.uri);
        console.log(`getMemoryUtilizationData -- User:${req.user} Succeeded to get memory data:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: response, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getMemoryUtilizationData -- User:${req.user} Error while trying to get memory data:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getMemoryUsage = async (req, res, next) => {
    try {
        console.log(`getMemoryUsage -- User:${req.user} Trying to get memory usage for:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getMemoryUsage -- User:${req.user} Error while Trying to get memory usage for:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const queryObj = buildMemoryQuery(req.body.server, 'usage');
        const queryTotalUsageObj = buildMemoryQuery(req.body.server, 'totalUsage');
        const queryTotalObj = buildMemoryQuery(req.body.server, 'total');
        const promises = [getMemoryQueryResult(queryObj.uri), getMemoryQueryResult(queryTotalUsageObj.uri), getMemoryQueryResult(queryTotalObj.uri)];
        const promisesResponse = await Promise.all(promises);
        console.log(`getMemoryUsage -- User:${req.user} Succeeded to get memory usage for:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: { usage: promisesResponse[0], totalUsage: promisesResponse[1], total: promisesResponse[2] }, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getMemoryUsage -- User:${req.user} Error while trying to get memory usage for:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

export default { getMemoryUsage, getMemoryUtilizationData };
