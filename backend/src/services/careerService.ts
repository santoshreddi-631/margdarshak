import { getAdminClient, isSupabaseConfigured } from '../config/supabase';
import { CareerCategory, LanguageCode } from '../types';
import { NotFoundError } from '../utils/appError';
import { logger } from '../utils/logger';

export interface GetCareersParams {
  lang?: LanguageCode;
  category_id?: string;
  category_code?: string;
  search?: string;
  growth?: string;
  education?: string;
  page?: number;
  limit?: number;
}

export class CareerService {
  /**
   * Get all career categories with localized names
   */
  async getCategories(lang: LanguageCode = 'en'): Promise<CareerCategory[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockCategories(lang);
    }

    const client = getAdminClient();
    const { data, error } = await client
      .from('career_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching career categories:', error);
      throw error;
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      name: (lang === 'hi' && c.name_hi) || (lang === 'te' && c.name_te) || c.name,
      icon_name: c.icon_name,
      display_order: c.display_order,
    }));
  }

  /**
   * Get paginated careers with multilingual translations
   */
  async getCareers(params: GetCareersParams) {
    const lang = params.lang || 'en';
    const page = params.page || 1;
    const limit = params.limit || 100;
    const offset = (page - 1) * limit;

    if (!isSupabaseConfigured()) {
      return this.getMockCareers(params);
    }

    const client = getAdminClient();

    let resolvedCategoryId = params.category_id;
    if (!resolvedCategoryId && params.category_code && params.category_code !== 'All' && params.category_code !== 'all') {
      const { data: catRow } = await client
        .from('career_categories')
        .select('id')
        .eq('code', params.category_code)
        .maybeSingle();
      if (catRow?.id) {
        resolvedCategoryId = catRow.id;
      } else {
        return {
          careers: [],
          meta: { page, limit, total: 0, total_pages: 0 },
        };
      }
    }

    let query = client
      .from('careers')
      .select(
        `
        id,
        category_id,
        slug,
        title,
        minimum_education,
        estimated_salary_range,
        training_duration,
        growth_demand,
        is_active,
        verification_status,
        source_url,
        official_occupational_code,
        last_verified_date,
        created_at,
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
          description,
          job_responsibilities,
          pathway_summary
        ),
        career_skills (
          skill_id,
          importance,
          skills (
            id,
            name,
            name_hi,
            name_te,
            category,
            description
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('is_active', true);

    if (resolvedCategoryId) {
      query = query.eq('category_id', resolvedCategoryId);
    }

    if (params.growth) {
      query = query.eq('growth_demand', params.growth);
    }

    if (params.education) {
      query = query.ilike('minimum_education', `%${params.education}%`);
    }

    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    query = query.range(offset, offset + limit - 1).order('id', { ascending: true });

    const { data, count, error } = await query;

    if (error) {
      logger.error('Error querying careers:', error);
      throw error;
    }

    const mappedCareers = (data || []).map((row: any) => {
      // Find matching translation or fallback to English
      const targetTrans =
        row.translations?.find((t: any) => t.language_code === lang) ||
        row.translations?.find((t: any) => t.language_code === 'en') ||
        {};

      const cat = Array.isArray(row.category) ? row.category[0] : row.category;
      const categoryName =
        (lang === 'hi' && cat?.name_hi) ||
        (lang === 'te' && cat?.name_te) ||
        cat?.name;

      const formattedSkills = (row.career_skills || [])
        .filter((s: any) => s.skills)
        .map((s: any) => ({
          skill_id: s.skill_id,
          importance: s.importance,
          name:
            (lang === 'hi' && s.skills?.name_hi) ||
            (lang === 'te' && s.skills?.name_te) ||
            s.skills?.name ||
            '',
          category: s.skills?.category || '',
          description: s.skills?.description || null,
        }));

      return {
        id: row.id,
        category_id: row.category_id,
        slug: row.slug,
        title: targetTrans.title || row.title,
        minimum_education: row.minimum_education,
        estimated_salary_range: row.estimated_salary_range,
        training_duration: row.training_duration,
        growth_demand: row.growth_demand,
        is_active: row.is_active,
        verification_status: row.verification_status,
        source_url: row.source_url,
        official_occupational_code: row.official_occupational_code,
        last_verified_date: row.last_verified_date,
        created_at: row.created_at,
        category: cat
          ? {
              id: cat.id,
              code: cat.code,
              name: categoryName,
              icon_name: cat.icon_name,
            }
          : undefined,
        translation: {
          title: targetTrans.title || row.title,
          description: targetTrans.description || '',
          job_responsibilities: targetTrans.job_responsibilities || '',
          pathway_summary: targetTrans.pathway_summary || '',
        },
        skills: formattedSkills,
      };
    });

    return {
      careers: mappedCareers,
      meta: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get single career by ID with translation, skills, and learning resources
   */
  async getCareerById(careerId: string, lang: LanguageCode = 'en') {
    if (!isSupabaseConfigured()) {
      return this.getMockCareerById(careerId, lang);
    }

    const client = getAdminClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(careerId);
    let careerQuery = client
      .from('careers')
      .select(`
        id,
        category_id,
        slug,
        title,
        minimum_education,
        estimated_salary_range,
        training_duration,
        growth_demand,
        is_active,
        verification_status,
        source_url,
        official_occupational_code,
        last_verified_date,
        created_at,
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
          description,
          job_responsibilities,
          pathway_summary
        )
      `);

    if (isUuid) {
      careerQuery = careerQuery.eq('id', careerId);
    } else if (careerId === 'c-1' || careerId === 'solar-technician') {
      careerQuery = careerQuery.eq('id', 'a1000000-0000-0000-0000-000000000001');
    } else if (careerId === 'c-2' || careerId === 'frontend-web-developer') {
      careerQuery = careerQuery.eq('id', 'a1000000-0000-0000-0000-000000000006');
    } else if (careerId === 'c-3') {
      careerQuery = careerQuery.eq('id', 'a1000000-0000-0000-0000-000000000023');
    } else {
      careerQuery = careerQuery.eq('slug', careerId);
    }

    const { data: career, error } = await careerQuery.maybeSingle();

    if (error || !career) {
      throw new NotFoundError(`Career with ID ${careerId} not found`);
    }

    const c: any = career;

    // 2. Fetch associated skills using resolved career UUID (c.id)
    const { data: skillsData, error: skillsError } = await client
      .from('career_skills')
      .select(`
        skill_id,
        importance,
        skills (
          id,
          name,
          name_hi,
          name_te,
          category,
          description
        )
      `)
      .eq('career_id', c.id);

    if (skillsError) {
      logger.warn('Error fetching skills for career:', skillsError);
    }

    // 3. Fetch learning resources using resolved career UUID (c.id)
    const { data: resourcesData, error: resError } = await client
      .from('learning_resources')
      .select('*')
      .eq('career_id', c.id);

    if (resError) {
      logger.warn('Error fetching resources for career:', resError);
    }

    // Pick translation
    const targetTrans =
      c.translations?.find((t: any) => t.language_code === lang) ||
      c.translations?.find((t: any) => t.language_code === 'en') ||
      {};

    const cat = Array.isArray(c.category) ? c.category[0] : c.category;
    const categoryName =
      (lang === 'hi' && cat?.name_hi) ||
      (lang === 'te' && cat?.name_te) ||
      cat?.name;

    const formattedSkills = (skillsData || []).map((s: any) => ({
      skill_id: s.skill_id,
      importance: s.importance,
      name:
        (lang === 'hi' && s.skills?.name_hi) ||
        (lang === 'te' && s.skills?.name_te) ||
        s.skills?.name ||
        '',
      category: s.skills?.category || '',
      description: s.skills?.description || null,
    }));

    const formattedResources = (resourcesData || []).map((r: any) => ({
      id: r.id,
      title: (lang === 'hi' && r.title_hi) || (lang === 'te' && r.title_te) || r.title,
      resource_type: r.resource_type,
      provider_name: r.provider_name,
      url: r.url,
      is_free: r.is_free,
      language: r.language,
      verification_status: r.verification_status,
      source_url: r.source_url,
      last_verified_date: r.last_verified_date,
    }));

    return {
      id: c.id,
      slug: c.slug,
      title: targetTrans.title || c.title,
      minimum_education: c.minimum_education,
      estimated_salary_range: c.estimated_salary_range,
      training_duration: c.training_duration,
      growth_demand: c.growth_demand,
      verification_status: c.verification_status,
      source_url: c.source_url,
      official_occupational_code: c.official_occupational_code,
      last_verified_date: c.last_verified_date,
      category: {
        id: cat?.id,
        code: cat?.code,
        name: categoryName,
        icon_name: cat?.icon_name,
      },
      translation: {
        language_code: lang,
        title: targetTrans.title || c.title,
        description: targetTrans.description || '',
        job_responsibilities: targetTrans.job_responsibilities || '',
        pathway_summary: targetTrans.pathway_summary || '',
      },
      skills: formattedSkills,
      resources: formattedResources,
    };
  }

  // --- Development Mock Data ---
  private getMockCategories(lang: LanguageCode): CareerCategory[] {
    return [
      { id: 'cat-1', code: 'digital_tech', name: lang === 'te' ? 'డిజిటల్ & టెక్నాలజీ' : lang === 'hi' ? 'डिजिटल और प्रौद्योगिकी' : 'Digital & Technology', icon_name: 'Cpu', display_order: 1 },
      { id: 'cat-2', code: 'trades_electrical', name: lang === 'te' ? 'ఎలక్ట్రికల్ & ఎనర్జీ' : lang === 'hi' ? 'इलेक्ट्रिकल और सौर ऊर्जा' : 'Electrical & Green Energy', icon_name: 'Zap', display_order: 2 },
      { id: 'cat-3', code: 'agri_tech', name: lang === 'te' ? 'వ్యవసాయ సాంకేతికత' : lang === 'hi' ? 'कृषि और ग्रामीण प्रौद्योगिकी' : 'Agriculture & Rural Tech', icon_name: 'Sprout', display_order: 3 },
      { id: 'cat-4', code: 'healthcare_support', name: lang === 'te' ? 'ఆరోగ్య సంరక్షణ' : lang === 'hi' ? 'स्वास्थ्य सेवा सहायता' : 'Healthcare & Allied Services', icon_name: 'HeartPulse', display_order: 4 },
    ];
  }

  private getMockCareers(params: GetCareersParams) {
    const lang = params.lang || 'en';
    const mockList = [
      {
        id: 'c-1',
        category_id: 'cat-2',
        slug: 'solar-technician',
        title: lang === 'te' ? 'సోలార్ పివి టెక్నీషియన్' : lang === 'hi' ? 'सोलर पीवी तकनीशियन' : 'Solar PV Technician',
        minimum_education: '10th Pass / ITI Electrical',
        estimated_salary_range: '₹18,000 - ₹32,000 / month',
        training_duration: '3 - 6 Months',
        growth_demand: 'high',
        is_active: true,
        created_at: new Date().toISOString(),
        category: { id: 'cat-2', code: 'trades_electrical', name: 'Electrical & Green Energy', icon_name: 'Zap' },
        translation: {
          title: lang === 'te' ? 'సోలార్ పివి టెక్నీషియన్' : lang === 'hi' ? 'सोलर पीवी तकनीशियन' : 'Solar PV Technician',
          description: 'Installs, tests and maintains rooftop and ground-mounted solar power systems in rural and semi-urban areas.',
        },
      },
      {
        id: 'c-2',
        category_id: 'cat-1',
        slug: 'junior-web-developer',
        title: lang === 'te' ? 'జూనియర్ వెబ్ డెవలపర్' : lang === 'hi' ? 'जूनियर वेब डेवलपर' : 'Junior Web Developer',
        minimum_education: '12th Pass / Any Diploma / Graduate',
        estimated_salary_range: '₹22,000 - ₹45,000 / month',
        training_duration: '6 Months',
        growth_demand: 'high',
        is_active: true,
        created_at: new Date().toISOString(),
        category: { id: 'cat-1', code: 'digital_tech', name: 'Digital & Technology', icon_name: 'Cpu' },
        translation: {
          title: lang === 'te' ? 'జూనియర్ వెబ్ డెవలపర్' : lang === 'hi' ? 'जूनियर वेब डेवलपर' : 'Junior Web Developer',
          description: 'Builds responsive websites, user interfaces and digital catalogs for businesses and e-governance.',
        },
      },
      {
        id: 'c-3',
        category_id: 'cat-3',
        slug: 'precision-agriculture-operator',
        title: lang === 'te' ? 'వ్యవసాయ డ్రోన్ ఆపరేటర్' : lang === 'hi' ? 'कृषि ड्रोन ऑपरेटर' : 'Agricultural Drone Operator',
        minimum_education: '10th Pass with Drone Pilot License',
        estimated_salary_range: '₹25,000 - ₹50,000 / month',
        training_duration: '3 Months',
        growth_demand: 'emerging',
        is_active: true,
        created_at: new Date().toISOString(),
        category: { id: 'cat-3', code: 'agri_tech', name: 'Agriculture & Rural Tech', icon_name: 'Sprout' },
        translation: {
          title: lang === 'te' ? 'వ్యవసాయ డ్రోన్ ఆపరేటర్' : lang === 'hi' ? 'कृषि ड्रोन ऑपरेटर' : 'Agricultural Drone Operator',
          description: 'Pilots DGCA-certified drones for pesticide spraying, crop health monitoring and soil mapping.',
        },
      },
    ];

    return {
      careers: mockList,
      meta: { page: 1, limit: 20, total: mockList.length, total_pages: 1 },
    };
  }

  private getMockCareerById(careerId: string, lang: LanguageCode) {
    return {
      id: careerId,
      slug: 'solar-technician',
      title: lang === 'te' ? 'సోలార్ పివి టెక్నీషియన్' : lang === 'hi' ? 'सोलर पीवी तकनीशियन' : 'Solar PV Technician',
      minimum_education: '10th Pass / ITI Electrical',
      estimated_salary_range: '₹18,000 - ₹32,000 / month',
      training_duration: '3 - 6 Months',
      growth_demand: 'high',
      category: { id: 'cat-2', code: 'trades_electrical', name: 'Electrical & Green Energy', icon_name: 'Zap' },
      translation: {
        language_code: lang,
        title: lang === 'te' ? 'సోలార్ పివి టెక్నీషియన్' : lang === 'hi' ? 'सोलर पीवी तकनीशियन' : 'Solar PV Technician',
        description: 'Installs, tests and maintains rooftop and ground-mounted solar power systems in rural and semi-urban areas.',
        job_responsibilities: 'Mounting solar panels, connecting charge controllers and inverters, battery bank wiring, safety earthing and maintenance.',
        pathway_summary: 'Start with 3-month PMKVY Suryamitra course -> Apprentice with local installer -> Independent solar installer.',
      },
      skills: [
        { skill_id: 'sk-4', importance: 'required', name: 'Solar Installation', category: 'trade', description: null },
        { skill_id: 'sk-2', importance: 'required', name: 'Electrical Wiring', category: 'trade', description: null },
        { skill_id: 'sk-3', importance: 'recommended', name: 'Problem Solving', category: 'soft', description: null },
      ],
      resources: [
        {
          id: 'res-1',
          title: 'Suryamitra Solar Training Handbook (NISE)',
          resource_type: 'pdf_guide',
          provider_name: 'National Institute of Solar Energy',
          url: 'https://nise.res.in',
          is_free: true,
          language: 'en',
        },
      ],
    };
  }
}

export const careerService = new CareerService();
