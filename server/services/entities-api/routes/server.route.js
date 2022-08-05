import express from 'express';
import serverController from '../controllers/server/server.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/', verifyToken, serverController.createServer);
router.get('/', verifyToken, serverController.getAllServersByCloudspace);
router.get('/all', serverController.getAllServers);
router.get('/:id', verifyToken, serverController.getServerByID);
router.put('/:id', verifyToken, serverController.updateServerByID);
router.post('/deleteServers', verifyToken, serverController.deleteServers);
router.post('/updateTier', verifyToken, serverController.changeServerTierByID);

export default router;
