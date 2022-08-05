import express from 'express';
import controller from '../controllers/role.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/', verifyToken, controller.getRoles);
router.put('/', verifyToken, controller.updateRoleEntities);
router.get('/cloudspace', verifyToken, controller.getUserRoleByCloudspace);
router.get('/available-users', verifyToken, controller.availableUsers);
router.get('/available-groups', verifyToken, controller.availableGroups);
router.get('/user', verifyToken, controller.getUserMetadata);
router.get('/group', verifyToken, controller.getGroupMetadata);

export default router;
