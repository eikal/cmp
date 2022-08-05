import express from 'express';
import actionJobConfigController from '../controlleres/action-job-config.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/cloudspace/:id', verifyToken, actionJobConfigController.getActionJobsByCloudspace);
router.get('/project/:id', verifyToken, actionJobConfigController.getActionJobsByProject);

router.post('/create-label', verifyToken, actionJobConfigController.createLabelConfig);
router.delete('/delete-label/:id', verifyToken, actionJobConfigController.deleteLabelConfig);
router.put('/update-label', verifyToken, actionJobConfigController.updateLabelConfig);

router.post('/create-action', verifyToken, actionJobConfigController.createActionToLabelConfig);
router.post('/delete-action', verifyToken, actionJobConfigController.deleteActionToLabelConfig);
router.put('/update-action', verifyToken, actionJobConfigController.updateActionToLabelConfig);

router.post('/create-default-actions', verifyToken, actionJobConfigController.createDefaultActions);

export default router;
