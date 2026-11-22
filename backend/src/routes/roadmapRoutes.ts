import { Router } from 'express';
import { roadmapController } from '../controllers/roadmapController';
import { authenticateUser, optionalAuth } from '../middleware/auth';

const router = Router();

// Retrieve or dynamically tailor career roadmap
router.get('/career/:careerId', optionalAuth, (req, res, next) => {
  void roadmapController.getRoadmapByCareer(req as any, res, next);
});

router.post('/career/:careerId/generate', optionalAuth, (req, res, next) => {
  void roadmapController.getRoadmapByCareer(req as any, res, next);
});

// Update & retrieve student roadmap progress
router.post('/progress', authenticateUser, (req, res, next) => {
  void roadmapController.updateProgress(req as any, res, next);
});

router.get('/progress', authenticateUser, (req, res, next) => {
  void roadmapController.getUserProgress(req as any, res, next);
});

export default router;
