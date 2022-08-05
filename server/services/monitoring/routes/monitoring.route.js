import express from 'express';
import cpuController from '../controller/cpu.controller.js';
import memoryController from '../controller/memory.controller.js';
import diskController from '../controller/disk.controller.js';
import networkController from '../controller/network.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/cpu/utilization', verifyToken, cpuController.getCpuUtilizationData);
router.post('/cpu/current', verifyToken, cpuController.getCpuCurrentData);

router.post('/memory/utilization', verifyToken, memoryController.getMemoryUtilizationData);
router.post('/memory/usage', verifyToken, memoryController.getMemoryUsage);

router.post('/disk/utilization', verifyToken, diskController.getDiskUtilizationData);
router.post('/disk/usage', verifyToken, diskController.getDiskUsage);

router.post('/network/usage', verifyToken, networkController.getNetworkUsage);

export default router;
