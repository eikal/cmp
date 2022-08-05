import express from 'express';
import actionJobController from '../controlleres/action-job.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/jobs', verifyToken, actionJobController.executeJobs);
router.get('/jobs', verifyToken, actionJobController.getJobsByServerID);
router.get('/dashboard/jobs', verifyToken, actionJobController.getJobs);
router.post('/job/retry', verifyToken, actionJobController.retryJob);
router.post('/job/kill', verifyToken, actionJobController.killJobBtID);
router.post('/ssh', verifyToken, actionJobController.executeSsh);
router.post('/updateFile', verifyToken, actionJobController.updateFile);
router.post('/getFile', actionJobController.getFile);

export default router;
