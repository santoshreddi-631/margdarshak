import { getAdminClient, getUserClient, isSupabaseConfigured } from '../config/supabase';
import { LanguageCode, SavedCareer } from '../types';
import { logger } from '../utils/logger';

// In-memory fallback for sandbox/dev testing
const devSavedCareersMemory = new Map<string, SavedCareer[]>();

export class SavedCareerService {
  /**
   * Get all saved careers for a student
   */
  async getSavedCareers(userId: string, lang: LanguageCode = 'en', token?: string): Promise<SavedCareer[]> {
    if (!isSupabaseConfigured()) {
      return devSavedCareersMemory.get(userId) || [];
    }

    const client = token ? getUserClient(token) : getAdminClient();

    try {
      const { data, error } = await client
        .from('saved_careers')
        .select(`
          id,
          user_id,
          career_id,
          created_at,
          career:careers (
            id,
            category_id,
            slug,
            title,
            minimum_education,
            estimated_salary_range,
            training_duration,
            growth_demand,
            is_active,
            category:career_categories (
              id,
              code,
              name,
              name_hi,
              name_te,
              icon_name
            ),
            translations:career_translations (
              language_code,
              title,
              description
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return (data || []).map((row: any) => {
          const c = row.career;
          if (!c) {
            return {
              id: row.id,
              user_id: row.user_id,
              career_id: row.career_id,
              created_at: row.created_at,
            };
          }

          const targetTrans =
            c.translations?.find((t: any) => t.language_code === lang) ||
            c.translations?.find((t: any) => t.language_code === 'en') ||
            {};

          const cat = c.category;
          const catName =
            (lang === 'hi' && cat?.name_hi) ||
            (lang === 'te' && cat?.name_te) ||
            cat?.name;

          return {
            id: row.id,
            user_id: row.user_id,
            career_id: row.career_id,
            created_at: row.created_at,
            career: {
              id: c.id,
              category_id: c.category_id,
              slug: c.slug,
              title: targetTrans.title || c.title,
              minimum_education: c.minimum_education,
              estimated_salary_range: c.estimated_salary_range,
              training_duration: c.training_duration,
              growth_demand: c.growth_demand,
              is_active: c.is_active,
              category: cat ? { ...cat, name: catName } : undefined,
              translation: {
                title: targetTrans.title || c.title,
                description: targetTrans.description || '',
                language_code: lang,
              },
            },
          };
        }) as SavedCareer[];
      }
    } catch (e: any) {
      logger.warn('Error querying saved careers from Supabase:', e.message);
    }

    return devSavedCareersMemory.get(userId) || [];
  }

  /**
   * Bookmark a career for a student
   */
  async saveCareer(userId: string, careerId: string, token?: string): Promise<SavedCareer> {
    const fallbackRecord: SavedCareer = {
      id: `sc-${Date.now()}`,
      user_id: userId,
      career_id: careerId,
      created_at: new Date().toISOString(),
    };

    let list = devSavedCareersMemory.get(userId) || [];
    if (!list.some((item) => item.career_id === careerId)) {
      list = [fallbackRecord, ...list];
      devSavedCareersMemory.set(userId, list);
    }

    if (!isSupabaseConfigured()) {
      return fallbackRecord;
    }

    try {
      const client = token ? getUserClient(token) : getAdminClient();

      const { data, error } = await client
        .from('saved_careers')
        .upsert({ user_id: userId, career_id: careerId }, { onConflict: 'user_id,career_id' })
        .select()
        .single();

      if (!error && data) {
        return data as SavedCareer;
      }
    } catch (err: any) {
      logger.warn('Failed saving career to Supabase, saved in local dev memory:', err.message);
    }

    return fallbackRecord;
  }

  /**
   * Remove a bookmarked career
   */
  async unsaveCareer(userId: string, careerId: string, token?: string): Promise<boolean> {
    const list = devSavedCareersMemory.get(userId) || [];
    devSavedCareersMemory.set(
      userId,
      list.filter((item) => item.career_id !== careerId && item.id !== careerId)
    );

    if (!isSupabaseConfigured()) {
      return true;
    }

    try {
      const client = token ? getUserClient(token) : getAdminClient();
      await client
        .from('saved_careers')
        .delete()
        .eq('user_id', userId)
        .or(`career_id.eq.${careerId},id.eq.${careerId}`);
    } catch (e: any) {
      logger.warn('Failed unsaving career from Supabase:', e.message);
    }

    return true;
  }
}

export const savedCareerService = new SavedCareerService();
