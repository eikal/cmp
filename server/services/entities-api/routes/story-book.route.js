import express from 'express';
import storyBookController from '../controllers/story-book/story-book.controller.js';
import { verifyToken } from '../../../shared/middlewares.js';

const router = express.Router();

router.post('/', verifyToken, storyBookController.createStoryBook);
router.get('/', verifyToken, storyBookController.getStoryBooks);
router.put('/:id', verifyToken, storyBookController.updateStoryBookByID);
router.delete('/:id', verifyToken, storyBookController.deleteStoryBookByID);

export default router;
