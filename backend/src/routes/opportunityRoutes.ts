import { Router } from 'express';
import { opportunityController } from '../controllers/opportunityController';

const router = Router();

router.get('/', (req, res, next) => opportunityController.getOpportunities(req, res, next));
router.get('/:id', (req, res, next) => opportunityController.getOpportunityById(req, res, next));

export default router;
