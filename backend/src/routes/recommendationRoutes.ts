import { Router } from 'express';
import { recommendationController } from '../controllers/recommendationController';
import { authenticateUser, optionalAuth } from '../middleware/auth';

const router = Router();

// Connection health check to FastAPI recommendation service
router.get('/health-check', (req, res, next) =>
  recommendationController.checkHealth(req as any, res, next)
);

// Direct proxy to FastAPI recommendation engine
router.post('/predict', optionalAuth, (req, res, next) =>
  recommendationController.proxyRecommendations(req as any, res, next)
);

// Protected student recommendation endpoints
router.use(authenticateUser);

router.get('/', (req, res, next) =>
  recommendationController.getUserRecommendations(req as any, res, next)
);

router.post('/', (req, res, next) =>
  recommendationController.generateRecommendations(req as any, res, next)
);

router.post('/generate', (req, res, next) =>
  recommendationController.generateRecommendations(req as any, res, next)
);

export default router;
