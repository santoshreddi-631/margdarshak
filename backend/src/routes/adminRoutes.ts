import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with authentication and administrator role check
router.use(authenticateUser);
router.use(requireAdmin);

// 1. Dashboard System Statistics
router.get('/stats', (req, res, next) => adminController.getStats(req as any, res, next));

// 2. Careers Management
router.get('/careers', (req, res, next) => adminController.getCareers(req as any, res, next));
router.get('/careers/:id', (req, res, next) => adminController.getCareerById(req as any, res, next));
router.post('/careers', (req, res, next) => adminController.createCareer(req as any, res, next));
router.put('/careers/:id', (req, res, next) => adminController.updateCareer(req as any, res, next));
router.delete('/careers/:id', (req, res, next) => adminController.deleteCareer(req as any, res, next));

// 3. Master Skills Management
router.get('/skills', (req, res, next) => adminController.getSkills(req as any, res, next));
router.post('/skills', (req, res, next) => adminController.createSkill(req as any, res, next));
router.put('/skills/:id', (req, res, next) => adminController.updateSkill(req as any, res, next));
router.delete('/skills/:id', (req, res, next) => adminController.deleteSkill(req as any, res, next));

// 4. Learning Resources Management
router.get('/resources', (req, res, next) => adminController.getResources(req as any, res, next));
router.post('/resources', (req, res, next) => adminController.createResource(req as any, res, next));
router.put('/resources/:id', (req, res, next) => adminController.updateResource(req as any, res, next));
router.delete('/resources/:id', (req, res, next) => adminController.deleteResource(req as any, res, next));

// 5. Opportunities & Government Schemes Management
router.get('/schemes', (req, res, next) => adminController.getSchemes(req as any, res, next));
router.post('/schemes', (req, res, next) => adminController.createScheme(req as any, res, next));
router.put('/schemes/:id', (req, res, next) => adminController.updateScheme(req as any, res, next));
router.delete('/schemes/:id', (req, res, next) => adminController.deleteScheme(req as any, res, next));

export default router;
