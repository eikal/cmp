import express from 'express';
import cloudspaceController from '../controllers/cloudspace/cloudspace.controller.js';
import { verifyToken, verifySuperAdmin } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/', verifyToken, cloudspaceController.getCloudspacesByUser);
router.post('/', verifyToken, cloudspaceController.createCloudspace);
router.put('/:id', verifyToken, cloudspaceController.updateCloudspaceByID);
router.delete('/:id', verifyToken, cloudspaceController.deleteCloudspaceByID);
router.get('/admin', verifySuperAdmin, cloudspaceController.getCloudspacesBySuperAdmin);

export default router;
