import { Router } from 'express';
import { assessmentController } from '../controllers/assessmentController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Public questions catalog (Multilingual: en, te, hi)
router.get('/questions', (req, res, next) => assessmentController.getQuestions(req as any, res, next));

// Protected student responses & submission
router.post('/responses', authenticateUser, (req, res, next) =>
  assessmentController.submitResponses(req as any, res, next)
);
router.get('/responses', authenticateUser, (req, res, next) =>
  assessmentController.getUserResponses(req as any, res, next)
);
router.delete('/responses', authenticateUser, (req, res, next) =>
  assessmentController.clearResponses(req as any, res, next)
);

// Protected assessment draft resumption endpoints
router.get('/draft', authenticateUser, (req, res, next) =>
  assessmentController.getDraft(req as any, res, next)
);
router.post('/draft', authenticateUser, (req, res, next) =>
  assessmentController.saveDraft(req as any, res, next)
);

export default router;
