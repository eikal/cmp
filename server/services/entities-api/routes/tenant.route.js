import express from 'express';
import tenantController from '../controllers/tenant/tenant.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/:id', verifyToken, tenantController.getAllTenants);
router.post('/delete', verifyToken, tenantController.deleteTenant);
router.post('/edit', verifyToken, tenantController.editTenant);
router.post('/user', verifyToken, tenantController.createUserByTenant);
router.put('/user/details', verifyToken, tenantController.updateUserByTenant);
router.put('/user/password', verifyToken, tenantController.updateUserPasswordByTenant);
router.post('/user/delete', verifyToken, tenantController.deleteUserByTenant);
router.post('/user/group', verifyToken, tenantController.manageUserWithGroupsByTenatID);
router.post('/user/groups', verifyToken, tenantController.getGroupsByTenant);
router.post('/users', verifyToken, tenantController.getUsersByTenantID);
router.post('/create', verifyToken, tenantController.createNewTenant);
router.get('/config/:id', verifyToken, tenantController.getTenantConfigurationByTierID);
router.post('/config', verifyToken, tenantController.setTenantConfigurationByID);

export default router;
