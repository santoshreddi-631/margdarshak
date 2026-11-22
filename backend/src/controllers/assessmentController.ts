import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { assessmentService } from '../services/assessmentService';
import {
  getQuestionsQuerySchema,
  submitAssessmentSchema,
  saveDraftSchema,
} from '../validators/assessmentValidator';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/appError';

export class AssessmentController {
  async getQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = getQuestionsQuerySchema.parse(req.query);
      const questions = await assessmentService.getQuestions(query.section, query.lang);
      return sendSuccess(res, questions, 'Assessment questions retrieved');
    } catch (err) {
      next(err);
    }
  }

  async submitResponses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = submitAssessmentSchema.parse(req.body);
      const result = await assessmentService.submitResponses(req.user.id, validated.responses, req.token);
      return sendSuccess(res, result, 'Assessment responses saved successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getUserResponses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const responses = await assessmentService.getUserResponses(req.user.id, req.token);
      return sendSuccess(res, responses, 'User assessment responses retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getDraft(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const draft = await assessmentService.getDraft(req.user.id, req.token);
      return sendSuccess(res, draft, 'Assessment draft retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async saveDraft(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = saveDraftSchema.parse(req.body);
      const result = await assessmentService.saveDraft(
        req.user.id,
        validated.responses,
        validated.current_step,
        req.token
      );
      return sendSuccess(res, result, 'Assessment draft saved successfully');
    } catch (err) {
      next(err);
    }
  }

  async clearResponses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const result = await assessmentService.clearResponses(req.user.id, req.token);
      return sendSuccess(res, result, 'Assessment reset successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const assessmentController = new AssessmentController();
