import { getAdminClient, getUserClient, isSupabaseConfigured } from '../config/supabase';
import { SavedResource } from '../types';
import { logger } from '../utils/logger';

// In-memory fallback for sandbox/dev testing
const devBookmarksMemory = new Map<string, SavedResource[]>();

export class BookmarkService {
  /**
   * Get all bookmarked resources for a student
   */
  async getBookmarkedResources(userId: string, token?: string): Promise<SavedResource[]> {
    if (!isSupabaseConfigured()) {
      return devBookmarksMemory.get(userId) || this.getMockBookmarks(userId);
    }

    const client = token ? getUserClient(token) : getAdminClient();

    try {
      const { data, error } = await client
        .from('saved_resources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SavedResource[];
      }
    } catch (e: any) {
      logger.warn('Error fetching saved resources from Supabase:', e.message);
    }

    return devBookmarksMemory.get(userId) || this.getMockBookmarks(userId);
  }

  /**
   * Bookmark a learning resource
   */
  async bookmarkResource(
    userId: string,
    payload: {
      resource_id?: string | null;
      title: string;
      provider_name?: string | null;
      url: string;
      resource_type?: string;
    },
    token?: string
  ): Promise<SavedResource> {
    const fallbackRecord: SavedResource = {
      id: `bm-${Date.now()}`,
      user_id: userId,
      resource_id: payload.resource_id || null,
      title: payload.title,
      provider_name: payload.provider_name || 'Verified Portal',
      url: payload.url,
      resource_type: payload.resource_type || 'portal',
      created_at: new Date().toISOString(),
    };

    let list = devBookmarksMemory.get(userId) || [];
    if (!list.some((item) => item.url === payload.url)) {
      list = [fallbackRecord, ...list];
      devBookmarksMemory.set(userId, list);
    }

    if (!isSupabaseConfigured()) {
      return fallbackRecord;
    }

    try {
      const client = token ? getUserClient(token) : getAdminClient();

      const record = {
        user_id: userId,
        resource_id: payload.resource_id || null,
        title: payload.title,
        provider_name: payload.provider_name || 'Verified Portal',
        url: payload.url,
        resource_type: payload.resource_type || 'portal',
      };

      const { data, error } = await client
        .from('saved_resources')
        .upsert(record, { onConflict: 'user_id,url' })
        .select()
        .single();

      if (!error && data) {
        return data as SavedResource;
      }
    } catch (err: any) {
      logger.warn('Error bookmarking resource in Supabase, stored in memory:', err.message);
    }

    return fallbackRecord;
  }

  /**
   * Remove a bookmarked resource
   */
  async removeBookmarkedResource(userId: string, resourceId: string, token?: string) {
    const list = devBookmarksMemory.get(userId) || [];
    devBookmarksMemory.set(
      userId,
      list.filter((item) => item.id !== resourceId && item.url !== resourceId)
    );

    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const client = token ? getUserClient(token) : getAdminClient();
      await client
        .from('saved_resources')
        .delete()
        .eq('user_id', userId)
        .or(`id.eq.${resourceId},url.eq.${resourceId}`);
    } catch (e: any) {
      logger.warn('Failed removing bookmark from Supabase:', e.message);
    }

    return { success: true };
  }

  private getMockBookmarks(userId: string): SavedResource[] {
    return [
      {
        id: 'bm-mock-1',
        user_id: userId,
        resource_id: 'r-001',
        title: 'freeCodeCamp Responsive Web Design Certification',
        provider_name: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
        resource_type: 'course',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export const bookmarkService = new BookmarkService();
