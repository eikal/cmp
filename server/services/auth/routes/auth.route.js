import express from 'express';
import controller from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', controller.login);
router.post('/logout', controller.logout);

export default router;
