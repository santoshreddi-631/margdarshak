import { getAdminClient, isSupabaseConfigured } from '../config/supabase';
import { LanguageCode, Opportunity, OpportunityCategory } from '../types';
import { NotFoundError } from '../utils/appError';
import { logger } from '../utils/logger';

export class OpportunityService {
  /**
   * Get active government schemes, apprenticeships, and skilling opportunities
   */
  async getOpportunities(category?: string, lang: LanguageCode = 'en'): Promise<Opportunity[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockOpportunities(category, lang);
    }

    const client = getAdminClient();
    let query = client
      .from('opportunities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching opportunities:', error);
      return this.getMockOpportunities(category, lang);
    }

    if (!data || data.length === 0) {
      return this.getMockOpportunities(category, lang);
    }

    return data.map((o: any) => ({
      id: o.id,
      title: (lang === 'hi' && o.title_hi) || (lang === 'te' && o.title_te) || o.title,
      ministry_or_agency: o.ministry_or_agency,
      category: o.category as OpportunityCategory,
      financial_benefit: o.financial_benefit,
      eligibility_criteria: o.eligibility_criteria,
      portal_url: o.portal_url,
      deadline_notice: o.deadline_notice,
      is_active: o.is_active,
      created_at: o.created_at,
    }));
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunityById(id: string, lang: LanguageCode = 'en'): Promise<Opportunity> {
    if (!isSupabaseConfigured()) {
      const mock = this.getMockOpportunities(undefined, lang).find((o) => o.id === id);
      if (!mock) throw new NotFoundError(`Opportunity with ID ${id} not found`);
      return mock;
    }

    const client = getAdminClient();
    const { data, error } = await client
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      const mock = this.getMockOpportunities(undefined, lang).find((o) => o.id === id);
      if (mock) return mock;
      throw new NotFoundError(`Opportunity with ID ${id} not found`);
    }

    return {
      id: data.id,
      title: (lang === 'hi' && data.title_hi) || (lang === 'te' && data.title_te) || data.title,
      ministry_or_agency: data.ministry_or_agency,
      category: data.category as OpportunityCategory,
      financial_benefit: data.financial_benefit,
      eligibility_criteria: data.eligibility_criteria,
      portal_url: data.portal_url,
      deadline_notice: data.deadline_notice,
      is_active: data.is_active,
      created_at: data.created_at,
    };
  }

  // --- Development Mock Data ---
  private getMockOpportunities(category?: string, lang: LanguageCode = 'en'): Opportunity[] {
    const isTe = lang === 'te';
    const isHi = lang === 'hi';

    const list: Opportunity[] = [
      // 1. Internships
      {
        id: 'opp-naps-1',
        title: isTe
          ? 'జాతీయ అప్రెంటిస్‌షిప్ ప్రమోషన్ పథకం (NAPS 2.0)'
          : isHi
          ? 'राष्ट्रीय शिक्षुता संवर्धन योजना (NAPS 2.0)'
          : 'National Apprenticeship Promotion Scheme (NAPS 2.0)',
        ministry_or_agency: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
        category: 'internship',
        financial_benefit: 'Monthly stipend of ₹7,000 to ₹12,000 + Government directly pays 25% to your bank account',
        eligibility_criteria: 'Ages 14 to 35, 8th pass, 10th pass, ITI, Diploma or Graduates in technical/service trades',
        portal_url: 'https://www.apprenticeshipindia.gov.in',
        deadline_notice: 'Rolling registrations open year-round on official portal',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      // 2. Jobs
      {
        id: 'opp-ncs-2',
        title: isTe
          ? 'నేషనల్ కెరీర్ సర్వీస్ (NCS) - ప్రభుత్వ ఉద్యోగ పోర్టల్'
          : isHi
          ? 'राष्ट्रीय कैरियर सेवा (NCS) - रोजगार मेला एवं नौकरी पोर्टल'
          : 'National Career Service (NCS) - Verified Job Vacancies & Rozgar Mela',
        ministry_or_agency: 'Ministry of Labour & Employment',
        category: 'job',
        financial_benefit: 'Free access to thousands of direct employer vacancies, district job fairs, and carrier counseling',
        eligibility_criteria: 'Indian citizens seeking employment. All qualification levels from 10th standard to post-graduates',
        portal_url: 'https://www.ncs.gov.in',
        deadline_notice: 'District Rozgar Melas scheduled monthly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      // 3. Scholarships
      {
        id: 'opp-scholarship-3',
        title: isTe
          ? 'పీఎం-యశస్వి (PM-YASASVI) విద్యార్థి వేతన పథకం'
          : isHi
          ? 'पीएम-यशस्वी (PM-YASASVI) छात्रवृत्ति योजना'
          : 'PM Young Achievers Scholarship (PM-YASASVI)',
        ministry_or_agency: 'Ministry of Social Justice & Empowerment',
        category: 'scholarship',
        financial_benefit: 'Direct scholarship up to ₹75,000/year for Class 9-10 and ₹1,25,000/year for Class 11-12/vocational courses',
        eligibility_criteria: 'OBC, EBC, DNT students studying in designated schools with annual family income below ₹2.5 Lakhs',
        portal_url: 'https://scholarships.gov.in',
        deadline_notice: 'Annual application window open on National Scholarship Portal',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      // 4. Government Skill Development Programs
      {
        id: 'opp-pmkvy-4',
        title: isTe
          ? 'ప్రధాన మంత్రి కౌశల్ వికాస్ యోజన (PMKVY 4.0)'
          : isHi
          ? 'प्रधानमंत्री कौशल विकास योजना (PMKVY 4.0)'
          : 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
        ministry_or_agency: 'National Skill Development Corporation (NSDC)',
        category: 'skilling',
        financial_benefit: '100% Free Government Certification, Skill Kit, Assessment Stipend & Placement Assistance',
        eligibility_criteria: 'Indian youth aged 15-45, school/college dropouts, or unemployed graduates looking for modern trade skills',
        portal_url: 'https://www.pmkvyofficial.org',
        deadline_notice: 'Batches enrolling continuously across all district Pradhan Mantri Kaushal Kendras (PMKK)',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      // 5. Free Online Courses
      {
        id: 'opp-swayam-5',
        title: isTe
          ? 'స్వయం (SWAYAM) - ఉచిత ఆన్‌లైన్ సర్టిఫికేషన్ కోర్సులు'
          : isHi
          ? 'स्वयं (SWAYAM) - निःशुल्क ऑनलाइन प्रमाणन पाठ्यक्रम'
          : 'SWAYAM - Free National Online Certificate Courses',
        ministry_or_agency: 'Ministry of Education & NPTEL (IITs/IISc)',
        category: 'free_course',
        financial_benefit: 'Completely free video lectures, assignments, and study materials; optional low-cost exam for IIT certification',
        eligibility_criteria: 'Open to anyone with an internet connection, from school students to working professionals',
        portal_url: 'https://swayam.gov.in',
        deadline_notice: 'Semester courses start in January and July',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      // 6. Training Programs
      {
        id: 'opp-suryamitra-6',
        title: isTe
          ? 'సూర్యమిత్ర ఉచిత సోలార్ టెక్నీషియన్ శిక్షణ'
          : isHi
          ? 'सूर्यमित्र निःशुल्क सोलर तकनीशियन आवासीय प्रशिक्षण'
          : 'Suryamitra Residential Solar PV Technician Training',
        ministry_or_agency: 'National Institute of Solar Energy (NISE) & MNRE',
        category: 'training_program',
        financial_benefit: 'Free 3-month (600 hours) residential training, boarding, lodging, uniform, and placement with solar EPCs',
        eligibility_criteria: '10th pass + ITI (Electrician/Wireman) or Diploma in Electrical/Mechanical. Age below 28 preferred',
        portal_url: 'https://nise.res.in/suryamitra',
        deadline_notice: 'District batches announced through State Nodal Renewable Energy Agencies',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    if (category && category !== 'all') {
      return list.filter((o) => o.category === category);
    }
    return list;
  }
}

export const opportunityService = new OpportunityService();
