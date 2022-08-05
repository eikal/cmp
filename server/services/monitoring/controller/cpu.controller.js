
import joi from 'joi';
import { buildCpuQuery, getCpuQueryResult } from '../helpers/helpers.js';
import HttpCodes from '../../../shared/http-status-codes.js';

const getCpuUtilizationData = async (req, res, next) => {
    try {
        console.log(`getCpuData -- User:${req.user} Trying to get cpu data:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required(),
            type: joi.string().required(),
            period: joi.number().required().allow(null)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getCpuData -- User:${req.user} Error while Trying to get cpu data:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const { type, period, server } = req.body;
        const queryObj = buildCpuQuery(server, type, period);
        const response = await getCpuQueryResult(queryObj.uri);
        console.log(`getCpuData -- User:${req.user} Succeeded to get cpu data:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: response, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getCpuData -- User:${req.user} Error while trying to get cpu data:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getCpuCurrentData = async (req, res, next) => {
    try {
        console.log(`getCpuCurrentData -- User:${req.user} Trying to get cpu current data:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getCpuCurrentData -- User:${req.user} Error while Trying to get cpu current data:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const { server } = req.body;
        const queryObj = buildCpuQuery(server);
        const queryObjCount = buildCpuQuery(server, 'cpuCount');
        const promises = [getCpuQueryResult(queryObj.uri), getCpuQueryResult(queryObjCount.uri, 'cpuCount')];
        const promisesResponse = await Promise.all(promises);
        console.log(`getCpuCurrentData -- User:${req.user} Succeeded to get cpu current data:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: { current: promisesResponse[0], count: promisesResponse[1].length }, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getCpuCurrentData -- User:${req.user} Error while trying to get current cpu data:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

export default { getCpuUtilizationData, getCpuCurrentData };
