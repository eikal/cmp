import express from 'express';
import projectController from '../controllers/project/project.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/', verifyToken, projectController.createProject);
router.get('/', verifyToken, projectController.getProjects);
router.get('/:id', verifyToken, projectController.getProjectByID);
router.put('/:id', verifyToken, projectController.updateProjectByID);
router.delete('/:id', verifyToken, projectController.deleteProjectByID);

export default router;
