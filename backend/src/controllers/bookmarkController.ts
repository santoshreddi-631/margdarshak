import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { bookmarkService } from '../services/bookmarkService';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/appError';
import { z } from 'zod';

const bookmarkResourceSchema = z.object({
  resource_id: z.string().optional().nullable(),
  title: z.string().min(2, 'Resource title is required'),
  provider_name: z.string().optional().nullable(),
  url: z.string().url('A valid URL is required'),
  resource_type: z.string().default('portal'),
});

export class BookmarkController {
  async getBookmarkedResources(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const bookmarks = await bookmarkService.getBookmarkedResources(req.user.id, req.token);
      return sendSuccess(res, bookmarks, 'Bookmarked resources retrieved');
    } catch (err) {
      next(err);
    }
  }

  async bookmarkResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const validated = bookmarkResourceSchema.parse(req.body);
      const result = await bookmarkService.bookmarkResource(req.user.id, validated, req.token);
      return sendSuccess(res, result, 'Resource bookmarked successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async removeBookmarkedResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new UnauthorizedError();
      const id = req.params.id;
      const result = await bookmarkService.removeBookmarkedResource(req.user.id, id, req.token);
      return sendSuccess(res, result, 'Bookmark removed successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const bookmarkController = new BookmarkController();
