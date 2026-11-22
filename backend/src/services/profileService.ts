import { getAdminClient, getUserClient, isSupabaseConfigured } from '../config/supabase';
import { Profile, Skill, UserSkill, Interest, UserInterest } from '../types';
import { NotFoundError } from '../utils/appError';
import { logger } from '../utils/logger';

// In-memory profile fallback for dev/test environments
const devProfilesMemory = new Map<string, { profile: Profile; skills: UserSkill[]; interests: UserInterest[] }>();

export class ProfileService {
  /**
   * Get student profile with their declared skills and interests
   */
  async getProfile(userId: string, token?: string) {
    if (!isSupabaseConfigured()) {
      return this.getMockProfile(userId);
    }

    const client = token ? getUserClient(token) : getAdminClient();

    try {
      // 1. Fetch main profile
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        // 2. Fetch user's skills
        const { data: userSkills } = await client
          .from('user_skills')
          .select(`
            id,
            user_id,
            skill_id,
            proficiency_level,
            created_at,
            skills (
              id,
              name,
              category,
              description
            )
          `)
          .eq('user_id', userId);

        // 3. Fetch user's interests
        const { data: userInterests } = await client
          .from('user_interests')
          .select(`
            id,
            user_id,
            interest_id,
            created_at,
            interests (
              id,
              code,
              name,
              description
            )
          `)
          .eq('user_id', userId);

        return {
          profile: profile as Profile,
          skills: (userSkills || []).map((us: any) => ({
            id: us.id,
            user_id: us.user_id,
            skill_id: us.skill_id,
            proficiency_level: us.proficiency_level,
            created_at: us.created_at,
            skill: us.skills,
          })) as UserSkill[],
          interests: (userInterests || []).map((ui: any) => ({
            id: ui.id,
            user_id: ui.user_id,
            interest_id: ui.interest_id,
            created_at: ui.created_at,
            interest: ui.interests,
          })) as UserInterest[],
        };
      }
    } catch (err: any) {
      logger.warn('Error fetching profile from Supabase, checking memory:', err.message);
    }

    // Check memory fallback
    if (devProfilesMemory.has(userId)) {
      return devProfilesMemory.get(userId)!;
    }

    // Return auto-generated fallback profile for sandbox/testing
    const mock = this.getMockProfile(userId);
    devProfilesMemory.set(userId, mock);
    return mock;
  }

  /**
   * Upsert student profile
   */
  async upsertProfile(userId: string, data: Partial<Profile>, token?: string): Promise<Profile> {
    const now = new Date().toISOString();
    const existing = devProfilesMemory.get(userId)?.profile;

    const fullProfile: Profile = {
      id: userId,
      full_name: data.full_name || existing?.full_name || 'Margdarshak Student',
      phone: data.phone || existing?.phone || null,
      preferred_language: data.preferred_language || existing?.preferred_language || 'en',
      current_education_level: data.current_education_level || existing?.current_education_level || '10th_standard',
      educational_stream: data.educational_stream || existing?.educational_stream || null,
      course_or_specialization: data.course_or_specialization || existing?.course_or_specialization || null,
      graduation_year: data.graduation_year || existing?.graduation_year || null,
      state: data.state || existing?.state || 'Telangana',
      district: data.district || existing?.district || 'Warangal Rural',
      willingness_to_relocate: data.willingness_to_relocate || existing?.willingness_to_relocate || 'within_state',
      preferred_learning_method: data.preferred_learning_method || existing?.preferred_learning_method || 'practical_hands_on',
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    // Store in dev memory
    const existingEntry = devProfilesMemory.get(userId);
    devProfilesMemory.set(userId, {
      profile: fullProfile,
      skills: existingEntry?.skills || [],
      interests: existingEntry?.interests || [],
    });

    if (!isSupabaseConfigured()) {
      return fullProfile;
    }

    try {
      const client = token ? getUserClient(token) : getAdminClient();
      const { data: dbProfile, error } = await client
        .from('profiles')
        .upsert(fullProfile, { onConflict: 'id' })
        .select()
        .single();

      if (!error && dbProfile) {
        return dbProfile as Profile;
      }
    } catch (err: any) {
      logger.warn('Error saving profile to Supabase, saved in local dev memory:', err.message);
    }

    return fullProfile;
  }

  /**
   * Set user's declared skills
   */
  async setUserSkills(
    userId: string,
    skills: Array<{ skill_id: string; proficiency_level: 'beginner' | 'intermediate' | 'advanced' }>,
    token?: string
  ) {
    const userSkills: UserSkill[] = skills.map((s, idx) => ({
      id: `uskill-${idx}-${Date.now()}`,
      user_id: userId,
      skill_id: s.skill_id,
      proficiency_level: s.proficiency_level,
      created_at: new Date().toISOString(),
    }));

    const entry = devProfilesMemory.get(userId);
    if (entry) {
      entry.skills = userSkills;
    }

    if (!isSupabaseConfigured()) return userSkills;

    try {
      const client = token ? getUserClient(token) : getAdminClient();
      await client.from('user_skills').delete().eq('user_id', userId);
      const rows = skills.map((s) => ({
        user_id: userId,
        skill_id: s.skill_id,
        proficiency_level: s.proficiency_level,
      }));
      const { data, error } = await client.from('user_skills').insert(rows).select();
      if (!error && data) return data;
    } catch (e: any) {
      logger.warn('Failed syncing skills to Supabase:', e.message);
    }

    return userSkills;
  }

  /**
   * Set user's declared interests
   */
  async setUserInterests(userId: string, interestIds: string[], token?: string) {
    const userInterests: UserInterest[] = interestIds.map((id, idx) => ({
      id: `uint-${idx}-${Date.now()}`,
      user_id: userId,
      interest_id: id,
      created_at: new Date().toISOString(),
    }));

    const entry = devProfilesMemory.get(userId);
    if (entry) {
      entry.interests = userInterests;
    }

    if (!isSupabaseConfigured()) return userInterests;

    try {
      const client = token ? getUserClient(token) : getAdminClient();
      await client.from('user_interests').delete().eq('user_id', userId);
      const rows = interestIds.map((interest_id) => ({
        user_id: userId,
        interest_id,
      }));
      const { data, error } = await client.from('user_interests').insert(rows).select();
      if (!error && data) return data;
    } catch (e: any) {
      logger.warn('Failed syncing interests to Supabase:', e.message);
    }

    return userInterests;
  }

  /**
   * Master skills catalog
   */
  async getAllMasterSkills(category?: string) {
    if (!isSupabaseConfigured()) return [];
    const client = getAdminClient();
    let query = client.from('skills').select('*').order('name', { ascending: true });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getMasterSkills(category?: string) {
    return this.getAllMasterSkills(category);
  }

  /**
   * Master interests catalog
   */
  async getAllMasterInterests() {
    if (!isSupabaseConfigured()) return [];
    const client = getAdminClient();
    const { data, error } = await client.from('interests').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getMasterInterests() {
    return this.getAllMasterInterests();
  }

  private getMockProfile(userId: string) {
    return {
      profile: {
        id: userId,
        full_name: 'Kavitha Devi',
        phone: '9876543210',
        preferred_language: 'te' as const,
        current_education_level: '12th_standard',
        educational_stream: 'Vocational Electrical',
        course_or_specialization: null,
        graduation_year: '2024',
        state: 'Telangana',
        district: 'Warangal Rural',
        willingness_to_relocate: 'within_state' as const,
        preferred_learning_method: 'practical_hands_on',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      skills: [
        {
          id: 'mock-s1',
          user_id: userId,
          skill_id: 'b1000000-0000-0000-0000-000000000001',
          proficiency_level: 'intermediate' as const,
          created_at: new Date().toISOString(),
          skill: {
            id: 'b1000000-0000-0000-0000-000000000001',
            name: 'HTML',
            category: 'technical' as const,
            description: 'Semantic web markup',
            created_at: new Date().toISOString(),
          },
        },
      ],
      interests: [],
    };
  }
}

export const profileService = new ProfileService();
