import { Request, Response, NextFunction } from 'express';
import { opportunityService } from '../services/opportunityService';
import { sendSuccess } from '../utils/response';
import { LanguageCode } from '../types';

export class OpportunityController {
  async getOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const lang = (req.query.lang as LanguageCode) || 'en';
      const list = await opportunityService.getOpportunities(category, lang);
      return sendSuccess(res, list, 'Opportunities retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getOpportunityById(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = (req.query.lang as LanguageCode) || 'en';
      const item = await opportunityService.getOpportunityById(req.params.id, lang);
      return sendSuccess(res, item, 'Opportunity details retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const opportunityController = new OpportunityController();
