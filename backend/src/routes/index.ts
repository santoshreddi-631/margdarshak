import { Router } from 'express';
import healthRoutes from './healthRoutes';
import profileRoutes from './profileRoutes';
import assessmentRoutes from './assessmentRoutes';
import careerRoutes from './careerRoutes';
import roadmapRoutes from './roadmapRoutes';
import opportunityRoutes from './opportunityRoutes';
import savedCareerRoutes from './savedCareerRoutes';
import recommendationRoutes from './recommendationRoutes';
import bookmarkRoutes from './bookmarkRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/careers', careerRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/saved-careers', savedCareerRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/bookmarks/resources', bookmarkRoutes);
router.use('/admin', adminRoutes);

export default router;
