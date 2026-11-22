import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, LanguageCode } from '../types';
import { savedCareerService } from '../services/savedCareerService';
import { saveCareerSchema } from '../validators/savedCareerValidator';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/appError';

export class SavedCareerController {
  async getSavedCareers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const lang = (req.query.lang as LanguageCode) || 'en';
      const items = await savedCareerService.getSavedCareers(req.user.id, lang, req.token);
      return sendSuccess(res, items, 'Saved careers retrieved');
    } catch (err) {
      next(err);
    }
  }

  async saveCareer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = saveCareerSchema.parse(req.body);
      const result = await savedCareerService.saveCareer(req.user.id, validated.career_id, req.token);
      return sendSuccess(res, result, 'Career saved to bookmarks', 201);
    } catch (err) {
      next(err);
    }
  }

  async unsaveCareer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const careerId = req.params.careerId;
      const result = await savedCareerService.unsaveCareer(req.user.id, careerId, req.token);
      return sendSuccess(res, result, 'Career removed from bookmarks');
    } catch (err) {
      next(err);
    }
  }
}

export const savedCareerController = new SavedCareerController();
