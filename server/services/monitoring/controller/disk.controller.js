
import joi from 'joi';
import { buildDiskQuery, getDiskQueryResult } from '../helpers/helpers.js';
import HttpCodes from '../../../shared/http-status-codes.js';

const getDiskUsage = async (req, res, next) => {
    try {
        console.log(`getDiskUsage -- Trying to get disk usage for:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getDiskUsage -- User:${req.user} Error while Trying to get disk usage for:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const queryObj = buildDiskQuery(req.body.server, 'usage');
        const queryTotalUsageObj = buildDiskQuery(req.body.server, 'totalUsage');
        const promises = [getDiskQueryResult(queryObj.uri), getDiskQueryResult(queryTotalUsageObj.uri)];
        const promisesResponse = await Promise.all(promises);
        console.log(`getDiskUsage -- User:${req.user} Succeeded to get disk usage for:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: { usage: promisesResponse[0], totalUsage: promisesResponse[1] }, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getDiskUsage -- User:${req.user} Error while trying to get disk usage for:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getDiskUtilizationData = async (req, res, next) => {
    try {
        console.log(`getDiskUtilizationData -- User:${req.user} Trying to get disk data:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required(),
            type: joi.string().required(),
            period: joi.number().required().allow(null)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getDiskUtilizationData -- User:${req.user} Error while Trying to get disk data:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const { type, period, server } = req.body;
        const queryObj = buildDiskQuery(server, type, period);
        const response = await getDiskQueryResult(queryObj.uri);
        console.log(`getDiskUtilizationData -- User:${req.user} Succeeded to get disk data:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: response, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getDiskUtilizationData -- User:${req.user} Error while trying to get disk data:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

export default { getDiskUsage, getDiskUtilizationData };
