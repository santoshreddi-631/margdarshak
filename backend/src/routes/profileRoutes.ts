import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Public master lookups for onboarding forms
router.get('/skills/master', (req, res, next) => profileController.getMasterSkills(req as any, res, next));
router.get('/interests/master', (req, res, next) => profileController.getMasterInterests(req as any, res, next));

// Protected student profile endpoints
router.use(authenticateUser);

router.get('/', (req, res, next) => profileController.getProfile(req as any, res, next));
router.put('/', (req, res, next) => profileController.upsertProfile(req as any, res, next));
router.post('/skills', (req, res, next) => profileController.setSkills(req as any, res, next));
router.post('/interests', (req, res, next) => profileController.setInterests(req as any, res, next));

export default router;
