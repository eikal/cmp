import express from 'express';
import genericFactController from '../controllers/facts/generic.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/generic/:type', verifyToken, genericFactController.createGenericFact);
router.get('/generic/:type', verifyToken, genericFactController.getGenericFactByType);
router.get('/generic/:type/:id', verifyToken, genericFactController.getGenericFactByTypeAndID);
router.put('/generic/:type/:id', verifyToken, genericFactController.updateGenericFactByTypeAndID);
router.delete('/generic/:type/:id', verifyToken, genericFactController.deleteGenericFactByTypeAndID);

router.get('/generic', genericFactController.getGenericFacts);
export default router;
