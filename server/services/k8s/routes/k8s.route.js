import express from 'express';
import k8sController from '../controlleres/k8s.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.get('/namespaces', verifyToken, k8sController.getAllNamespaces);
router.get('/namespace/onboard', verifyToken, k8sController.getOnboardNamespaces);
router.get('/namespace/onboard/tier', verifyToken, k8sController.getOnboardNamespacesByTier);
router.post('/namespace/remove/tier', verifyToken, k8sController.removeNamespaceFromTier);
router.post('/namespace/onboard', verifyToken, k8sController.onboardNamespace);
router.get('/namespace/dashboard', verifyToken, k8sController.getDashboardStats);
router.get('/namespace/pods', verifyToken, k8sController.getPodsByNamespace);
router.get('/namespace/pods-metadata', verifyToken, k8sController.getPodMetadata);
router.get('/namespace/deployments', verifyToken, k8sController.getDeploymentsByNamespace);
router.get('/namespace/deployments-metadata', verifyToken, k8sController.getDeploymentMetadata);

export default router;
