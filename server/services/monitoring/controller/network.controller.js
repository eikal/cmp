
import joi from 'joi';
import { buildNetworkQuery, getMemoryQueryResult } from '../helpers/helpers.js';
import HttpCodes from '../../../shared/http-status-codes.js';

const getNetworkUsage = async (req, res, next) => {
    try {
        console.log(`getNetworkUsage -- User:${req.user} Trying to get network usage for:${req.body.server}`);
        const schema = joi.object().keys({
            server: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getNetworkUsage -- User:${req.user} Error while Trying to get network usage for:${req.body.server},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const queryObj = buildNetworkQuery(req.body.server, 'recieve');
        const queryTotalUsageObj = buildNetworkQuery(req.body.server, 'transmit');
        const promises = [getMemoryQueryResult(queryObj.uri), getMemoryQueryResult(queryTotalUsageObj.uri)];
        const promisesResponse = await Promise.all(promises);
        console.log(`getNetworkUsage -- User:${req.user} Succeeded to get network usage for:${req.body.server}`);
        return res.status(HttpCodes.OK).send({ data: { recieve: promisesResponse[0], transmit: promisesResponse[1] }, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getNetworkUsage -- User:${req.user} Error while trying to get network usage for:${req.body.server},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

export default { getNetworkUsage };
