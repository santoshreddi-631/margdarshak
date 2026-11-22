import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { adminService } from '../services/adminService';
import {
  createCareerSchema,
  updateCareerSchema,
  createSkillSchema,
  updateSkillSchema,
  createResourceSchema,
  updateResourceSchema,
  createSchemeSchema,
  updateSchemeSchema,
} from '../validators/adminValidator';
import { sendSuccess } from '../utils/response';

export class AdminController {
  // Statistics overview
  async getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      return sendSuccess(res, stats, 'System statistics retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  // Careers CRUD
  async getCareers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const careers = await adminService.getCareers();
      return sendSuccess(res, careers, 'Admin careers list retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getCareerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const career = await adminService.getCareerById(req.params.id);
      return sendSuccess(res, career, 'Career details retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createCareer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createCareerSchema.parse(req.body);
      const created = await adminService.createCareer(validated);
      return sendSuccess(res, created, 'Career created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCareer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateCareerSchema.parse(req.body);
      const updated = await adminService.updateCareer(req.params.id, validated);
      return sendSuccess(res, updated, 'Career updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteCareer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deleteCareer(req.params.id);
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  // Skills CRUD
  async getSkills(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const skills = await adminService.getSkills();
      return sendSuccess(res, skills, 'Master skills retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createSkillSchema.parse(req.body);
      const created = await adminService.createSkill(validated);
      return sendSuccess(res, created, 'Skill created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateSkillSchema.parse(req.body);
      const updated = await adminService.updateSkill(req.params.id, validated);
      return sendSuccess(res, updated, 'Skill updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deleteSkill(req.params.id);
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  // Resources CRUD
  async getResources(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const careerId = req.query.career_id as string | undefined;
      const resources = await adminService.getResources(careerId);
      return sendSuccess(res, resources, 'Learning resources retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createResourceSchema.parse(req.body);
      const created = await adminService.createResource(validated);
      return sendSuccess(res, created, 'Resource created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateResourceSchema.parse(req.body);
      const updated = await adminService.updateResource(req.params.id, validated);
      return sendSuccess(res, updated, 'Resource updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deleteResource(req.params.id);
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  // Schemes CRUD
  async getSchemes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const schemes = await adminService.getSchemes(category);
      return sendSuccess(res, schemes, 'Schemes and opportunities retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createScheme(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createSchemeSchema.parse(req.body);
      const created = await adminService.createScheme(validated);
      return sendSuccess(res, created, 'Scheme created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateScheme(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateSchemeSchema.parse(req.body);
      const updated = await adminService.updateScheme(req.params.id, validated);
      return sendSuccess(res, updated, 'Scheme updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteScheme(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deleteScheme(req.params.id);
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
