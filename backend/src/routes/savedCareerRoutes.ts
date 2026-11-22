import { Router } from 'express';
import { savedCareerController } from '../controllers/savedCareerController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

router.get('/', (req, res, next) => savedCareerController.getSavedCareers(req as any, res, next));
router.post('/', (req, res, next) => savedCareerController.saveCareer(req as any, res, next));
router.delete('/:careerId', (req, res, next) => savedCareerController.unsaveCareer(req as any, res, next));

export default router;
