import express from 'express';
import alertController from '../controller/alert-collect.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/server/:id', verifyToken, alertController.getServerAlerts);
router.get('/servers', verifyToken, alertController.getServersAlerts);
router.get('/all', verifyToken, alertController.getAllAlerts);
router.get('/analytics', verifyToken, alertController.getAnalytics);
router.put('/:id', verifyToken, alertController.acknowledgeAlertByID);
export default router;
