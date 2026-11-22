import { Router } from 'express';
import { careerController } from '../controllers/careerController';

const router = Router();

router.get('/categories', (req, res, next) => careerController.getCategories(req, res, next));
router.get('/', (req, res, next) => careerController.getCareers(req, res, next));
router.get('/:id', (req, res, next) => careerController.getCareerById(req, res, next));

export default router;
