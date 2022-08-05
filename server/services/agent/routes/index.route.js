import express from 'express';
import Agent from '../models/index.model.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/check-health', verifyToken, async (req, res, next) => {
    try {
        const lastAgentUpdate = await Agent.find().sort({ _id: -1 }).limit(1);
        if (lastAgentUpdate && Array.isArray(lastAgentUpdate) && lastAgentUpdate.length > 0) {
            return res.status(HttpCodes.OK).send({ data: lastAgentUpdate[0], statusCode: HttpCodes.OK, message: null });
        }
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
});

export default router;
