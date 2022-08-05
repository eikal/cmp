import express from 'express';
import controller from '../controllers/sync.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/sync', verifyToken, controller.sync);
router.get('/branchList', verifyToken, controller.branchList);
router.get('/check-health', verifyToken, controller.checkHealth);

export default router;
