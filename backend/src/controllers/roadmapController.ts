import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { roadmapService } from '../services/roadmapService';
import { updateRoadmapProgressSchema, roadmapQuerySchema } from '../validators/roadmapValidator';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/appError';

export class RoadmapController {
  async getRoadmapByCareer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = roadmapQuerySchema.parse(req.query);
      const roadmap = await roadmapService.getRoadmapByCareer(
        req.params.careerId,
        req.user?.id,
        query.lang
      );
      return sendSuccess(res, roadmap, 'Roadmap retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = updateRoadmapProgressSchema.parse(req.body);
      const progress = await roadmapService.updateProgress(
        req.user.id,
        validated.roadmap_step_id,
        validated.status,
        validated.notes,
        req.token
      );
      return sendSuccess(res, progress, 'Progress updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getUserProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const progress = await roadmapService.getUserProgress(req.user.id, req.token);
      return sendSuccess(res, progress, 'Student progress retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const roadmapController = new RoadmapController();
