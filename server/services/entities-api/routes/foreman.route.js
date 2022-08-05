import express from 'express';
import foremanController from '../controllers/foreman/foreman.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/', verifyToken, foremanController.getHostgroups);
router.get('/hostnames/:query', verifyToken, foremanController.getHostnames);
router.get('/environments', verifyToken, foremanController.getEnvironments);
router.get('/hostgroup/:id', verifyToken, foremanController.getHostsByHostgroupID);
router.get('/host/:hostname', verifyToken, foremanController.getHostByHostname);
router.put('/host/:hostname', verifyToken, foremanController.updateHostType);
router.get('/reports/:hostname', verifyToken, foremanController.getReportsByHostname);
router.get('/report/:id', verifyToken, foremanController.getReportByID);
router.get('/facts/:hostname', verifyToken, foremanController.getFactsByHostname);
router.get('/yaml/:hostname', verifyToken, foremanController.getYAMLByHostname);
router.post('/servers', verifyToken, foremanController.createExistingServers);

export default router;
