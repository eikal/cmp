import express from 'express';
import controller from '../controllers/store.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/encrypt', verifyToken, controller.encrypt);
router.post('/decrypt', controller.decrypt);

export default router;
