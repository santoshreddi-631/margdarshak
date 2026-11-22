import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmarkController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

router.get('/', (req, res, next) => bookmarkController.getBookmarkedResources(req as any, res, next));
router.post('/', (req, res, next) => bookmarkController.bookmarkResource(req as any, res, next));
router.delete('/:id', (req, res, next) => bookmarkController.removeBookmarkedResource(req as any, res, next));

export default router;
