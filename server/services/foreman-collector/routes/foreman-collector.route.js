import express from 'express';
import foremanController from '../controller/foreman-collector.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/server', verifyToken, foremanController.runForemanCollectorByServer);
export default router;
