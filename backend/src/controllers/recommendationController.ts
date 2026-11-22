import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, LanguageCode } from '../types';
import { recommendationService } from '../services/recommendationService';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/appError';

export class RecommendationController {
  async getUserRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const lang = (req.query.lang as LanguageCode) || 'en';
      const recommendations = await recommendationService.getUserRecommendations(
        req.user.id,
        lang,
        req.token
      );
      return sendSuccess(res, recommendations, 'Recommendations retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async generateRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const lang = (req.query.lang as LanguageCode) || 'en';
      const recommendations = await recommendationService.generateRecommendations(
        req.user.id,
        req.token,
        req.body,
        lang
      );
      return sendSuccess(res, recommendations, 'Career recommendations freshly generated', 201);
    } catch (err) {
      next(err);
    }
  }

  async proxyRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const result = await recommendationService.proxyRecommendations(payload);
      return sendSuccess(res, result, 'FastAPI recommendation proxy result');
    } catch (err) {
      next(err);
    }
  }

  async checkHealth(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await recommendationService.checkHealth();
      return sendSuccess(res, result, 'FastAPI recommendation service connection status');
    } catch (err) {
      next(err);
    }
  }
}

export const recommendationController = new RecommendationController();
