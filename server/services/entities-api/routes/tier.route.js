import express from 'express';
import tierController from '../controllers/tier/tier.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/', verifyToken, tierController.createTier);
router.get('/', verifyToken, tierController.getAllTiers);
router.get('/:id', verifyToken, tierController.getTierByID);
router.put('/:id', verifyToken, tierController.updateTierByID);
router.post('/:id', verifyToken, tierController.deleteTierByID);

export default router;
