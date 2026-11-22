import { getAdminClient, isSupabaseConfigured } from '../config/supabase';
import { BadRequestError, NotFoundError } from '../utils/appError';
import { logger } from '../utils/logger';

export class AdminService {
  /**
   * System overview statistics for administrative dashboard
   */
  async getStats() {
    if (!isSupabaseConfigured()) {
      return {
        careers_total: 20,
        careers_active: 20,
        skills_total: 46,
        resources_total: 30,
        schemes_total: 18,
        portals_total: 15,
        profiles_total: 1,
        assessment_responses_total: 1,
      };
    }

    const client = getAdminClient();

    const [
      { count: careersTotal },
      { count: careersActive },
      { count: skillsTotal },
      { count: resourcesTotal },
      { count: schemesTotal },
      { count: profilesTotal },
      { count: responsesTotal },
    ] = await Promise.all([
      client.from('careers').select('*', { count: 'exact', head: true }),
      client.from('careers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      client.from('skills').select('*', { count: 'exact', head: true }),
      client.from('learning_resources').select('*', { count: 'exact', head: true }),
      client.from('opportunities').select('*', { count: 'exact', head: true }),
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('assessment_responses').select('*', { count: 'exact', head: true }),
    ]);

    return {
      careers_total: careersTotal || 0,
      careers_active: careersActive || 0,
      skills_total: skillsTotal || 0,
      resources_total: resourcesTotal || 0,
      schemes_total: schemesTotal || 0,
      profiles_total: profilesTotal || 0,
      assessment_responses_total: responsesTotal || 0,
    };
  }

  // ==========================================
  // CAREERS MANAGEMENT
  // ==========================================
  async getCareers() {
    if (!isSupabaseConfigured()) return [];
    const client = getAdminClient();
    const { data, error } = await client
      .from('careers')
      .select(`
        *,
        category:career_categories (id, code, name),
        career_translations (language_code, title)
      `)
      .order('title', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCareerById(id: string) {
    if (!isSupabaseConfigured()) throw new NotFoundError('Career not found');
    const client = getAdminClient();
    const { data, error } = await client
      .from('careers')
      .select(`
        *,
        category:career_categories (*),
        career_translations (*),
        career_skills (
          skill_id,
          importance,
          skill:skills (*)
        ),
        learning_resources (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundError(`Career with ID ${id} not found`);
    return data;
  }

  async createCareer(payload: any) {
    if (!isSupabaseConfigured()) {
      return { id: `career-${Date.now()}`, ...payload };
    }
    const client = getAdminClient();

    const { translations, ...careerFields } = payload;

    const { data: career, error: cErr } = await client
      .from('careers')
      .insert(careerFields)
      .select()
      .single();

    if (cErr) throw cErr;

    // Insert trilingual translations if provided
    if (translations) {
      const transRows = [];
      if (translations.en) transRows.push({ career_id: career.id, language_code: 'en', ...translations.en });
      if (translations.hi) transRows.push({ career_id: career.id, language_code: 'hi', ...translations.hi });
      if (translations.te) transRows.push({ career_id: career.id, language_code: 'te', ...translations.te });

      if (transRows.length > 0) {
        await client.from('career_translations').insert(transRows);
      }
    }

    return career;
  }

  async updateCareer(id: string, payload: any) {
    if (!isSupabaseConfigured()) {
      return { id, ...payload };
    }
    const client = getAdminClient();

    const { translations, ...careerFields } = payload;

    const { data: career, error: cErr } = await client
      .from('careers')
      .update(careerFields)
      .eq('id', id)
      .select()
      .single();

    if (cErr) throw cErr;

    if (translations) {
      for (const lang of ['en', 'hi', 'te'] as const) {
        if (translations[lang]) {
          await client
            .from('career_translations')
            .upsert(
              { career_id: id, language_code: lang, ...translations[lang] },
              { onConflict: 'career_id,language_code' }
            );
        }
      }
    }

    return career;
  }

  /**
   * Safe career deletion: preserves student records!
   * Rather than hard deleting which cascades onto student recommendations,
   * saved careers, or progress, it marks the career as inactive (is_active: false).
   */
  async deleteCareer(id: string) {
    if (!isSupabaseConfigured()) {
      return { id, deleted: true, mode: 'soft_delete' };
    }
    const client = getAdminClient();

    // Check if students have referenced this career in saved_careers or recommendations
    const [{ count: savedCount }, { count: recoCount }] = await Promise.all([
      client.from('saved_careers').select('*', { count: 'exact', head: true }).eq('career_id', id),
      client.from('career_recommendations').select('*', { count: 'exact', head: true }).eq('career_id', id),
    ]);

    const hasStudentRecords = (savedCount || 0) > 0 || (recoCount || 0) > 0;

    if (hasStudentRecords) {
      // Soft-delete to protect student data integrity
      logger.info(`Safely archiving career ${id} to preserve student records (${savedCount} saved, ${recoCount} recommended)`);
      const { data } = await client
        .from('careers')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      return {
        id,
        action: 'archived',
        is_active: false,
        message: 'Career deactivated safely without dropping associated student bookmarks or progress records.',
        details: data,
      };
    }

    // No student records attached; safe to fully remove
    const { error } = await client.from('careers').delete().eq('id', id);
    if (error) throw error;

    return {
      id,
      action: 'deleted',
      message: 'Career deleted successfully.',
    };
  }

  // ==========================================
  // SKILLS MANAGEMENT
  // ==========================================
  async getSkills() {
    if (!isSupabaseConfigured()) return [];
    const client = getAdminClient();
    const { data, error } = await client.from('skills').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createSkill(payload: any) {
    if (!isSupabaseConfigured()) return { id: `skill-${Date.now()}`, ...payload };
    const client = getAdminClient();
    const { data, error } = await client.from('skills').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async updateSkill(id: string, payload: any) {
    if (!isSupabaseConfigured()) return { id, ...payload };
    const client = getAdminClient();
    const { data, error } = await client.from('skills').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteSkill(id: string) {
    if (!isSupabaseConfigured()) return { id, deleted: true };
    const client = getAdminClient();

    // Verify whether students have declared this skill in user_skills
    const { count: studentCount } = await client
      .from('user_skills')
      .select('*', { count: 'exact', head: true })
      .eq('skill_id', id);

    if (studentCount && studentCount > 0) {
      throw new BadRequestError(
        `Cannot delete skill: ${studentCount} students have this skill declared in their profile. Deletion would drop student profile records.`
      );
    }

    const { error } = await client.from('skills').delete().eq('id', id);
    if (error) throw error;
    return { id, action: 'deleted', message: 'Skill deleted successfully.' };
  }

  // ==========================================
  // LEARNING RESOURCES MANAGEMENT
  // ==========================================
  async getResources(careerId?: string) {
    if (!isSupabaseConfigured()) return [];
    const client = getAdminClient();
    let query = client.from('learning_resources').select('*, career:careers(id, title)').order('created_at', { ascending: false });
    if (careerId) query = query.eq('career_id', careerId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createResource(payload: any) {
    if (!isSupabaseConfigured()) return { id: `res-${Date.now()}`, ...payload };
    const client = getAdminClient();
    const { data, error } = await client.from('learning_resources').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async updateResource(id: string, payload: any) {
    if (!isSupabaseConfigured()) return { id, ...payload };
    const client = getAdminClient();
    const { data, error } = await client.from('learning_resources').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteResource(id: string) {
    if (!isSupabaseConfigured()) return { id, deleted: true };
    const client = getAdminClient();
    const { error } = await client.from('learning_resources').delete().eq('id', id);
    if (error) throw error;
    return { id, action: 'deleted', message: 'Resource removed successfully.' };
  }

  // ==========================================
  // SCHEMES / OPPORTUNITIES MANAGEMENT
  // ==========================================
  async getSchemes(category?: string) {
    if (!isSupabaseConfigured()) return [];
    const client = getAdminClient();
    let query = client.from('opportunities').select('*').order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createScheme(payload: any) {
    if (!isSupabaseConfigured()) return { id: `opp-${Date.now()}`, ...payload };
    const client = getAdminClient();
    const { data, error } = await client.from('opportunities').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async updateScheme(id: string, payload: any) {
    if (!isSupabaseConfigured()) return { id, ...payload };
    const client = getAdminClient();
    const { data, error } = await client.from('opportunities').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteScheme(id: string) {
    if (!isSupabaseConfigured()) return { id, deleted: true };
    const client = getAdminClient();
    // Soft-delete opportunities by deactivating them
    const { data, error } = await client
      .from('opportunities')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { id, action: 'deactivated', message: 'Scheme deactivated safely.', details: data };
  }
}

export const adminService = new AdminService();
