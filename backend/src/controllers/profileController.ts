import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { profileService } from '../services/profileService';
import {
  updateProfileSchema,
  batchUserSkillsSchema,
  batchUserInterestsSchema,
} from '../validators/profileValidator';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/appError';

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const profileData = await profileService.getProfile(req.user.id, req.token);
      return sendSuccess(res, profileData, 'Profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async upsertProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = updateProfileSchema.parse(req.body);
      const profile = await profileService.upsertProfile(req.user.id, validated, req.token);
      return sendSuccess(res, profile, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async setSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = batchUserSkillsSchema.parse(req.body);
      const result = await profileService.setUserSkills(req.user.id, validated.skills, req.token);
      return sendSuccess(res, result, 'Student skills updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async setInterests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = batchUserInterestsSchema.parse(req.body);
      const result = await profileService.setUserInterests(req.user.id, validated.interest_ids, req.token);
      return sendSuccess(res, result, 'Student interests updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getMasterSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const skills = await profileService.getAllMasterSkills(category);
      return sendSuccess(res, skills, 'Skills master list retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getMasterInterests(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interests = await profileService.getAllMasterInterests();
      return sendSuccess(res, interests, 'Interests master list retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();
