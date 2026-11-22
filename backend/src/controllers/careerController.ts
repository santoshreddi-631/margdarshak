import { Request, Response, NextFunction } from 'express';
import { careerService } from '../services/careerService';
import { careerQuerySchema, careerDetailQuerySchema } from '../validators/careerValidator';
import { sendSuccess } from '../utils/response';
import { LanguageCode } from '../types';

export class CareerController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = (req.query.lang as LanguageCode) || 'en';
      const categories = await careerService.getCategories(lang);
      return sendSuccess(res, categories, 'Career categories retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getCareers(req: Request, res: Response, next: NextFunction) {
    try {
      const params = careerQuerySchema.parse(req.query);
      const { careers, meta } = await careerService.getCareers(params);
      return sendSuccess(res, careers, 'Careers retrieved successfully', 200, meta);
    } catch (err) {
      next(err);
    }
  }

  async getCareerById(req: Request, res: Response, next: NextFunction) {
    try {
      const query = careerDetailQuerySchema.parse(req.query);
      const career = await careerService.getCareerById(req.params.id, query.lang);
      return sendSuccess(res, career, 'Career details retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const careerController = new CareerController();
