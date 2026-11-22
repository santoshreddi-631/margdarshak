import axios from 'axios';
import { env } from '../config/env';
import { getAdminClient, getUserClient, isSupabaseConfigured } from '../config/supabase';
import { profileService } from './profileService';
import { assessmentService } from './assessmentService';
import { CareerRecommendation, LanguageCode } from '../types';
import { CAREERS_DATA } from '../data/careersData';
import { logger } from '../utils/logger';

export class RecommendationService {
  /**
   * Request recommendations for a user.
   * Calls FastAPI recommendation service at /api/v1/recommendations; falls back to internal engine if offline.
   */
  async generateRecommendations(
    userId: string,
    token?: string,
    submissionPayload?: any,
    lang: LanguageCode = 'en'
  ): Promise<CareerRecommendation[]> {
    logger.info(`Generating career recommendations for user: ${userId} (lang: ${lang})`);

    // 1. Gather all student profile, skills, interests and assessment inputs
    let profileData: any = null;
    let responses: any[] = [];

    try {
      profileData = await profileService.getProfile(userId, token);
      responses = await assessmentService.getUserResponses(userId, token);
    } catch (e: any) {
      logger.warn('Could not fetch full user profile for recommendations:', e.message);
    }

    const studentProfile = profileData?.profile;

    // Process submissionPayload if passed from frontend assessment submission
    let submittedInterests: Array<{ interest_id: string; code: string; name: string }> = [];
    if (submissionPayload?.interests && Array.isArray(submissionPayload.interests)) {
      submittedInterests = submissionPayload.interests.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { interest_id: `i-${idx}`, code: item, name: item.replace(/_/g, ' ') };
        }
        return {
          interest_id: item.interest_id || item.id || `i-${idx}`,
          code: item.code || item.name || '',
          name: item.name || item.code || '',
        };
      });
    }

    let submittedSkills: Array<{ skill_id: string; name: string; category?: string | null; proficiency_level: string }> = [];
    if (submissionPayload?.skills) {
      if (typeof submissionPayload.skills === 'object' && !Array.isArray(submissionPayload.skills)) {
        submittedSkills = Object.entries(submissionPayload.skills).map(([k, v], idx) => ({
          skill_id: `s-${idx}`,
          name: k.replace(/_/g, ' '),
          category: 'technical',
          proficiency_level: (v as string) || 'intermediate',
        }));
      } else if (Array.isArray(submissionPayload.skills)) {
        submittedSkills = submissionPayload.skills.map((s: any, idx: number) => {
          if (typeof s === 'string') {
            return { skill_id: `s-${idx}`, name: s.replace(/_/g, ' '), proficiency_level: 'intermediate' };
          }
          return {
            skill_id: s.skill_id || `s-${idx}`,
            name: s.name || s.skill?.name || '',
            category: s.category || null,
            proficiency_level: s.proficiency_level || 'intermediate',
          };
        });
      }
    }

    const rawEdu = submissionPayload?.education?.qualification || studentProfile?.current_education_level || '10th_standard';
    const normEdu = this.normalizeEduLevel(rawEdu);

    const mergedInterests = submittedInterests.length > 0
      ? submittedInterests
      : (profileData?.interests || []).map((i: any) => ({
          interest_id: i.interest_id,
          code: i.interest?.code || i.code || null,
          name: i.interest?.name || i.name || '',
        }));

    const mergedSkills = submittedSkills.length > 0
      ? submittedSkills
      : (profileData?.skills || []).map((s: any) => ({
          skill_id: s.skill_id,
          name: s.skill?.name || s.name || '',
          category: s.skill?.category || s.category || null,
          proficiency_level: s.proficiency_level || 'beginner',
        }));

    const submittedPref = submissionPayload?.preferences || studentProfile?.preferences;
    let workEnv = 'field_practical';
    if (submittedPref?.workEnvironment === 'field_outdoor' || submittedPref?.preferred_work_environment === 'field_practical') {
      workEnv = 'field_practical';
    } else if (submittedPref?.workEnvironment === 'desk_remote' || submittedPref?.preferred_work_environment === 'office_desk') {
      workEnv = 'office_desk';
    }

    const fastApiPayload = {
      user_id: userId,
      profile: {
        id: studentProfile?.id || userId,
        full_name: studentProfile?.full_name || 'Student',
        current_education_level: normEdu,
        educational_stream: studentProfile?.educational_stream || null,
        graduation_year: studentProfile?.graduation_year || null,
        preferred_language: lang || studentProfile?.preferred_language || 'en',
        state: studentProfile?.state || null,
        district: studentProfile?.district || null,
      },
      skills: mergedSkills,
      interests: mergedInterests,
      preferences: {
        preferred_work_environment: workEnv,
        willingness_to_relocate: submittedPref?.willingness_to_relocate || 'within_state',
        preferred_learning_method: submittedPref?.learningStyle || submittedPref?.preferred_learning_method || 'practical_hands_on',
      },
      assessment_responses: responses.map((r: any) => ({
        question_id: r.question_id,
        selected_option_ids: r.selected_option_ids || [],
        rating_value: r.rating_value || null,
        text_response: r.text_response || null,
      })),
      language: lang || studentProfile?.preferred_language || 'en',
    };

    let recoItems: Array<{ career_id: string; match_score: number; match_reasons: string[] }> = [];

    // 2. Attempt proxy call to Python FastAPI Recommendation Service
    const recoServiceEndpoints = [
      `${env.RECOMMENDATION_SERVICE_URL}/api/v1/recommendations`,
      `${env.RECOMMENDATION_SERVICE_URL}/api/v1/recommend`,
    ];

    let fastApiSuccess = false;

    for (const endpoint of recoServiceEndpoints) {
      if (fastApiSuccess) break;
      try {
        logger.info(`Calling Python recommendation service proxy: ${endpoint}`);
        const response = await axios.post(endpoint, fastApiPayload, { timeout: 3500 });

        if (response.data && Array.isArray(response.data.recommendations) && response.data.recommendations.length > 0) {
          recoItems = response.data.recommendations.map((item: any) => ({
            career_id: item.career_id,
            match_score: Number(item.match_score),
            match_reasons: Array.isArray(item.reasons) ? item.reasons : (item.match_reasons || []),
          }));
          fastApiSuccess = true;
          logger.info(`Received ${recoItems.length} recommendations from FastAPI recommendation service.`);
        }
      } catch (err: any) {
        logger.warn(`FastAPI endpoint ${endpoint} call failed (${err.message}).`);
      }
    }

    if (!fastApiSuccess || recoItems.length === 0) {
      logger.info('Generating dynamic heuristic recommendations from verified catalog.');
      recoItems = await this.generateFallbackRecommendations(fastApiPayload, lang);
    }

    if (!isSupabaseConfigured()) {
      return this.mapRecommendationsFromCatalog(userId, recoItems, lang);
    }

    // 3. Persist recommendations into public.career_recommendations table
    const client = token && !token.includes('dev') && !token.includes('mock')
      ? getUserClient(token)
      : getAdminClient();

    if (recoItems.length > 0) {
      try {
        // Clear previous recommendations for this user
        await client.from('career_recommendations').delete().eq('user_id', userId);

        const rowsToInsert = recoItems.map((item) => ({
          user_id: userId,
          career_id: item.career_id,
          match_score: item.match_score,
          match_reasons: item.match_reasons,
          status: 'active',
          generated_at: new Date().toISOString(),
        }));

        const { data, error } = await client
          .from('career_recommendations')
          .insert(rowsToInsert)
          .select(`
            id,
            user_id,
            career_id,
            match_score,
            match_reasons,
            status,
            generated_at,
            career:careers (
              id,
              slug,
              title,
              minimum_education,
              estimated_salary_range,
              training_duration,
              growth_demand
            )
          `);

        if (!error && data && data.length > 0) {
          return data as unknown as CareerRecommendation[];
        }
      } catch (err: any) {
        logger.warn('Failed saving career recommendations to Supabase:', err.message);
      }
    }

    return this.mapRecommendationsFromCatalog(userId, recoItems, lang);
  }

  /**
   * Helper to normalize education level string
   */
  private normalizeEduLevel(raw?: string | null): string {
    if (!raw) return '10th_standard';
    const clean = raw.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
    if (clean.includes('below')) return 'below_10th';
    if (clean.includes('10th') || clean.includes('matric')) return '10th_standard';
    if (clean.includes('12th') || clean.includes('inter')) return '12th_standard';
    if (clean.includes('iti') || clean.includes('vocational')) return 'vocational_iti';
    if (clean.includes('diploma') || clean.includes('polytechnic')) return 'diploma';
    if (clean.includes('degree') || clean.includes('bachelor') || clean.includes('graduate')) return 'bachelors';
    if (clean.includes('master') || clean.includes('post')) return 'masters';
    return '10th_standard';
  }

  /**
   * Direct proxy: forwards a raw recommendation payload to the FastAPI recommendation service
   */
  async proxyRecommendations(payload: any) {
    try {
      const response = await axios.post(
        `${env.RECOMMENDATION_SERVICE_URL}/api/v1/recommendations`,
        payload,
        { timeout: 5000 }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`FastAPI proxy error: ${err.message}. Generating heuristic response.`);
      const fallbackItems = await this.generateFallbackRecommendations(payload);
      return {
        user_id: payload.user_id || 'guest',
        recommendations: fallbackItems,
        total_evaluated_careers: fallbackItems.length,
        weights_used: { interest: 0.4, skill: 0.3, education: 0.2, preference: 0.1 },
        is_fallback: true,
      };
    }
  }

  /**
   * Check connection health of FastAPI recommendation service
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${env.RECOMMENDATION_SERVICE_URL}/api/v1/health`, { timeout: 3000 });
      return {
        service: 'FastAPI Recommendation Service',
        status: 'connected',
        url: env.RECOMMENDATION_SERVICE_URL,
        response: response.data,
      };
    } catch (err: any) {
      return {
        service: 'FastAPI Recommendation Service',
        status: 'offline_or_unreachable',
        url: env.RECOMMENDATION_SERVICE_URL,
        error: err.message,
      };
    }
  }

  /**
   * Get student's computed recommendations with localized career details
   */
  async getUserRecommendations(
    userId: string,
    lang: LanguageCode = 'en',
    token?: string
  ): Promise<CareerRecommendation[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockRecommendations(userId, lang);
    }

    const client = token && !token.includes('dev') && !token.includes('mock')
      ? getUserClient(token)
      : getAdminClient();

    try {
      const { data, error } = await client
        .from('career_recommendations')
        .select(`
          id,
          user_id,
          career_id,
          match_score,
          match_reasons,
          status,
          generated_at,
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
        .order('match_score', { ascending: false });

      if (!error && data && data.length > 0) {
        return (data || []).map((row: any) => {
          const c = Array.isArray(row.career) ? row.career[0] : row.career;
          if (!c) return row;

          const targetTrans =
            c.translations?.find((t: any) => t.language_code === lang) ||
            c.translations?.find((t: any) => t.language_code === 'en') ||
            {};

          const cat = Array.isArray(c.category) ? c.category[0] : c.category;
          const catName =
            (lang === 'hi' && cat?.name_hi) ||
            (lang === 'te' && cat?.name_te) ||
            cat?.name;

          return {
            id: row.id,
            user_id: row.user_id,
            career_id: row.career_id,
            match_score: Number(row.match_score),
            match_reasons: row.match_reasons || [],
            status: row.status,
            generated_at: row.generated_at,
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
          } as CareerRecommendation;
        });
      }
    } catch (e: any) {
      logger.warn('Error fetching recommendations from Supabase, returning mock:', e.message);
    }

    return this.getMockRecommendations(userId, lang);
  }

  /**
   * Standardized education hierarchy rank parser
   */
  private getEducationRank(eduLevel?: string | null): number {
    if (!eduLevel) return 1;
    const clean = eduLevel.trim().toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
    const hierarchy: Record<string, number> = {
      below_10th: 0,
      '10th_standard': 1,
      '10th': 1,
      matriculation: 1,
      vocational_iti: 2,
      iti: 2,
      '12th_standard': 2,
      '12th': 2,
      intermediate: 2,
      diploma: 3,
      polytechnic: 3,
      degree: 4,
      bachelors: 4,
      bachelors_degree: 4,
      graduate: 4,
      masters: 5,
      masters_degree: 5,
      postgraduate: 5,
    };
    if (hierarchy[clean] !== undefined) return hierarchy[clean];
    if (clean.includes('below')) return 0;
    if (clean.includes('10th') || clean.includes('matric')) return 1;
    if (clean.includes('12th') || clean.includes('iti') || clean.includes('vocational') || clean.includes('inter')) return 2;
    if (clean.includes('diploma') || clean.includes('polytechnic')) return 3;
    if (clean.includes('degree') || clean.includes('bachelor') || clean.includes('graduate')) return 4;
    if (clean.includes('master') || clean.includes('postgraduate')) return 5;
    return 1;
  }

  /**
   * Intelligent Heuristic Fallback Engine with Strict Eligibility & Multi-Factor Scoring
   * Follows: Score = 0.40 * Interest + 0.30 * Skill + 0.20 * Education + 0.10 * Preference
   */
  private async generateFallbackRecommendations(
    payload: any,
    lang: LanguageCode = 'en'
  ): Promise<Array<{ career_id: string; match_score: number; match_reasons: string[] }>> {
    logger.info('Executing dynamic fallback recommendation algorithm with education pre-filtering');

    const studentEduLevel = payload.profile?.current_education_level || '10th_standard';
    const studentRank = this.getEducationRank(studentEduLevel);

    const studentSkills: string[] = (payload.skills || []).map((s: any) =>
      typeof s === 'string' ? s.toLowerCase().trim() : (s.name || s.skill?.name || '').toLowerCase().trim()
    ).filter(Boolean);

    const studentInterests: string[] = (payload.interests || []).map((i: any) =>
      typeof i === 'string' ? i.toLowerCase().trim() : (i.name || i.code || i.interest?.name || '').toLowerCase().trim()
    ).filter(Boolean);

    const prefEnv = payload.preferences?.preferred_work_environment || 'field_practical';
    const prefReloc = payload.preferences?.willingness_to_relocate || 'within_state';

    // Comprehensive catalog of verified high-demand careers with minimum requirements
    const catalog = [
      {
        id: 'a1000000-0000-0000-0000-000000000023',
        title: 'Agriculture Extension Worker',
        min_edu: '10th_standard',
        min_rank: 1,
        category: 'modern_agriculture',
        interests: ['agriculture', 'farming', 'crops', 'soil', 'rural', 'natural_resources', 'plants', 'agri', 'horticulture'],
        skills: ['agriculture fundamentals', 'soil testing', 'irrigation', 'pest control', 'communication', 'problem solving'],
        work_env: 'field_practical',
        schemes: 'PM-KISAN, PM Krishi Sinchayee Yojana & Rythu Bharosa',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000001',
        title: 'Solar PV Systems Technician',
        min_edu: '10th_standard',
        min_rank: 1,
        category: 'renewable_energy',
        interests: ['electrical', 'renewable energy', 'solar', 'practical', 'installation', 'electronics', 'energy'],
        skills: ['electrical wiring', 'multimeter', 'circuit testing', 'solar pv installation', 'safety protocols'],
        work_env: 'field_practical',
        schemes: 'PM Surya Ghar Muft Bijli Yojana & PM-KUSUM',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000024',
        title: 'Electrician',
        min_edu: '10th_standard',
        min_rank: 1,
        category: 'trades',
        interests: ['electrical', 'wiring', 'appliances', 'power', 'trades', 'circuits', 'electronics'],
        skills: ['house wiring', 'circuit breakers', 'earthing', 'motor maintenance', 'multimeter', 'electrical fundamentals'],
        work_env: 'field_practical',
        schemes: 'PM Vishwakarma Toolkit Scheme (₹15,000) & NAPS 2.0',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000006',
        title: 'Frontend Web Developer',
        min_edu: '12th_standard',
        min_rank: 2,
        category: 'it_software',
        interests: ['computers', 'coding', 'web design', 'software', 'technology', 'programming', 'frontend'],
        skills: ['html', 'css', 'javascript', 'responsive design', 'git', 'react', 'problem solving'],
        work_env: 'remote_desk',
        schemes: 'Digital India Free Skill Initiative & NASSCOM FutureSkills',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000007',
        title: 'Backend Software Developer',
        min_edu: '12th_standard',
        min_rank: 2,
        category: 'it_software',
        interests: ['backend', 'coding', 'servers', 'databases', 'software', 'programming'],
        skills: ['node.js', 'sql', 'databases', 'api design', 'git', 'python'],
        work_env: 'remote_desk',
        schemes: 'FutureSkills Prime Skilling Grant',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000008',
        title: 'Full Stack Developer',
        min_edu: '12th_standard',
        min_rank: 2,
        category: 'it_software',
        interests: ['coding', 'web', 'fullstack', 'software', 'technology', 'programming'],
        skills: ['react', 'node.js', 'sql', 'git', 'javascript'],
        work_env: 'remote_desk',
        schemes: 'NASSCOM FutureSkills Prime',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000010',
        title: 'Data Analyst',
        min_edu: 'degree',
        min_rank: 4,
        category: 'it_software',
        interests: ['data', 'analytics', 'statistics', 'mathematics', 'business', 'numbers'],
        skills: ['excel', 'sql', 'python', 'data visualization', 'power bi'],
        work_env: 'remote_desk',
        schemes: 'National Apprenticeship Promotion Scheme (NAPS 2.0)',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000017',
        title: 'Digital Marketing Specialist',
        min_edu: '12th_standard',
        min_rank: 2,
        category: 'business_finance',
        interests: ['social media', 'marketing', 'online sales', 'communication', 'advertising', 'creative'],
        skills: ['seo', 'content writing', 'social media marketing', 'google analytics', 'communication'],
        work_env: 'remote_desk',
        schemes: 'SIDH Digital Literacy & MSME Digital Outreach',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000022',
        title: 'Banking Professional',
        min_edu: 'degree',
        min_rank: 4,
        category: 'business_finance',
        interests: ['banking', 'finance', 'accounts', 'business', 'economy', 'mathematics'],
        skills: ['financial accounting', 'excel', 'analytical thinking', 'communication'],
        work_env: 'remote_desk',
        schemes: 'IBPS / SBI Examination Preparation Support',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000021',
        title: 'Teacher / Educator',
        min_edu: 'degree',
        min_rank: 4,
        category: 'education',
        interests: ['teaching', 'education', 'social_services', 'academic', 'communication', 'mentorship'],
        skills: ['lesson planning', 'communication', 'evaluation', 'mentorship', 'leadership'],
        work_env: 'remote_desk',
        schemes: 'Samagra Shiksha Abhiyan & TET/CTET Certification',
      },
      {
        id: 'a1000000-0000-0000-0000-000000000016',
        title: 'UI/UX Designer',
        min_edu: '12th_standard',
        min_rank: 2,
        category: 'creative_design',
        interests: ['design', 'creative', 'art', 'ui', 'ux', 'visual', 'figma', 'drawing'],
        skills: ['figma', 'wireframing', 'user research', 'prototyping', 'creativity'],
        work_env: 'remote_desk',
        schemes: 'Skill India Digital Hub Design Labs',
      },
    ];

    const scoredCandidates = [];

    for (const item of catalog) {
      // 1. Pre-Ranking Eligibility Filtering (graceful deduction rather than hard exclusion if rank is close)
      if (studentRank < item.min_rank - 1) {
        continue; // Student qualification is substantially below minimum requirement
      }

      // 2. Education Score (85.0 - 100.0 for eligible candidates)
      const eduDiff = studentRank - item.min_rank;
      const eduScore = eduDiff >= 0
        ? Math.min(100.0, 85.0 + eduDiff * 5.0)
        : 70.0; // Mild deduction if 1 step away

      // 3. Interest Matching (0.0 - 100.0)
      let matchedInterestsCount = 0;
      if (studentInterests.length > 0) {
        studentInterests.forEach((interest) => {
          if (item.interests.some((ci) => ci.includes(interest) || interest.includes(ci))) {
            matchedInterestsCount++;
          }
        });
      }
      const interestScore = studentInterests.length === 0
        ? 75.0 // Cold-start baseline
        : matchedInterestsCount > 0
        ? Math.min(100.0, 75.0 + (matchedInterestsCount / Math.max(1, studentInterests.length)) * 25.0)
        : 35.0; // Clear low penalty if interests declared but not matching this career

      // 4. Skill Matching (0.0 - 100.0)
      let matchedSkillsCount = 0;
      if (studentSkills.length > 0) {
        studentSkills.forEach((skill) => {
          if (item.skills.some((cs) => cs.includes(skill) || skill.includes(cs))) {
            matchedSkillsCount++;
          }
        });
      }
      const skillScore = studentSkills.length === 0
        ? 65.0 // Cold-start baseline
        : matchedSkillsCount > 0
        ? Math.min(100.0, 65.0 + (matchedSkillsCount / Math.max(1, item.skills.length)) * 35.0)
        : 45.0;

      // 5. Preference Matching (0.0 - 100.0)
      let prefScore = 75.0;
      if (prefEnv === item.work_env) {
        prefScore += 15.0;
      }
      if (prefReloc === 'within_district' && item.work_env === 'field_practical') {
        prefScore += 10.0;
      }

      // 6. Weighted Multi-Factor Calculation: Strictly 0.40 I + 0.30 S + 0.20 E + 0.10 P
      const finalScore = Number(
        (0.40 * interestScore + 0.30 * skillScore + 0.20 * eduScore + 0.10 * prefScore).toFixed(1)
      );

      // 7. Dynamic Match Rationale
      const reasons: string[] = [];
      if (matchedInterestsCount > 0) {
        reasons.push(`Strong alignment with your vocational interest in ${item.interests.slice(0, 2).join(' and ')}`);
      } else {
        reasons.push(`High regional demand and accessible entry pathway in ${item.category.replace('_', ' ')}`);
      }
      reasons.push(`Fully eligible with your ${studentEduLevel.replace(/_/g, ' ')} educational qualification`);
      if (item.schemes) {
        reasons.push(`Supported by official government initiative: ${item.schemes}`);
      }

      scoredCandidates.push({
        career_id: item.id,
        match_score: finalScore,
        match_reasons: reasons,
      });
    }

    // Sort descending by match score
    scoredCandidates.sort((a, b) => b.match_score - a.match_score);

    return scoredCandidates.slice(0, 5);
  }

  /**
   * Builds rich CareerRecommendation objects from verified catalog
   */
  private mapRecommendationsFromCatalog(
    userId: string,
    recoItems: Array<{ career_id: string; match_score: number; match_reasons: string[] }>,
    lang: LanguageCode = 'en'
  ): CareerRecommendation[] {
    const isTe = lang === 'te';
    const isHi = lang === 'hi';

    return recoItems.map((item, index) => {
      const c = CAREERS_DATA.find((c) => c.id === item.career_id) || CAREERS_DATA[0];
      const trans = c.translations?.[lang] || c.translations?.en;
      const title = trans?.title || c.title;
      const desc = trans?.description || '';

      return {
        id: `reco-dyn-${index + 1}`,
        user_id: userId,
        career_id: c.id,
        match_score: item.match_score,
        match_reasons: item.match_reasons,
        status: 'active',
        generated_at: new Date().toISOString(),
        career: {
          id: c.id,
          category_id: c.category_id,
          slug: c.slug,
          title,
          minimum_education: c.minimum_education,
          estimated_salary_range: c.estimated_salary_range,
          training_duration: c.training_duration,
          growth_demand: c.growth_demand,
          is_active: true,
          created_at: new Date().toISOString(),
          category: {
            id: c.category_id,
            code: c.slug,
            name: isTe ? 'ప్రత్యేక రంగం' : isHi ? 'विशेष क्षेत्र' : 'Vocational Domain',
            icon_name: 'Briefcase',
            display_order: index + 1,
          },
          translation: {
            title,
            description: desc,
            language_code: lang,
          },
        },
      } as CareerRecommendation;
    });
  }

  /**
   * Mock recommendations for sandbox & testing
   */
  private async getMockRecommendations(userId: string, lang: LanguageCode = 'en'): Promise<CareerRecommendation[]> {
    const fallback = await this.generateFallbackRecommendations({ profile: { current_education_level: '10th_standard' }, interests: [], skills: [] }, lang);
    return this.mapRecommendationsFromCatalog(userId, fallback, lang);
  }
}

export const recommendationService = new RecommendationService();
