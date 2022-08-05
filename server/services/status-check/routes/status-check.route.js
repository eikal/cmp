import express from 'express';
import statusCheckController from '../controller/status-check.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/status-check', verifyToken, statusCheckController.getStatusCheckByServer);
router.get('/dashboard', verifyToken, statusCheckController.getDashboardStatusCheckStats);
export default router;
