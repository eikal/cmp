import express from 'express';
import generalConfigController from '../controllers/general-config/general-config.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/', verifyToken, generalConfigController.getGeneralConfig);
router.get('/about', verifyToken, generalConfigController.getAboutDetails);
router.post('/mail', verifyToken, generalConfigController.sendEmail);

router.put('/ssh-key', verifyToken, generalConfigController.updateSshKey);
router.get('/ssh-key/:cloudspaceID', verifyToken, generalConfigController.getSshKey);
router.delete('/ssh-key/:cloudspaceID', verifyToken, generalConfigController.deleteSshKey);

export default router;
