
import joi from 'joi';
import HttpCodes from '../../../shared/http-status-codes.js';
import Server from '../../entities-api/models/server/server.model.js';
import { handleServer } from '../job/index.js';

const runForemanCollectorByServer = async (req, res, next) => {
    try {
        console.log(`runForemanCollectorByServer -- User:${req.user} Trying update foreman fact for server:${req.body.serverID}`);
        const paramsSchema = joi.object().keys({
            serverID: joi.string().required()
        });
        const paramsResult = paramsSchema.validate(req.body);
        if (paramsResult.error) {
            console.error(`runForemanCollectorByServer -- User:${req.user} Trying update foreman fact for server:${req.body.serverID},Error:${paramsResult.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: paramsResult.error });
        }
        const serverObject = await Server.findById(req.body.serverID);
        if (!serverObject) {
            throw `Failed to find serverID:${req.body.serverID}`;
        }
        handleServer(serverObject);
        console.log(`runForemanCollectorByServer -- User:${req.user} sending update collect foreman fact for server:${req.body.serverID}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`runForemanCollectorByServer -- User:${req.user} failed to send update to foreman collector for server:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to update facts' });
    }
};

export default {
    runForemanCollectorByServer
};
