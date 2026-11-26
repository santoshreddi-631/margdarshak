import { getAdminClient, isSupabaseConfigured } from '../config/supabase';
import { LanguageCode, Opportunity, OpportunityCategory } from '../types';
import { NotFoundError } from '../utils/appError';
import { logger } from '../utils/logger';
import { OPPORTUNITIES } from '../data/opportunitiesData';
import { JOB_PORTALS } from '../data/portalsData';

export interface JobPortalItem {
  id: string;
  name: string;
  url: string;
  portal_type: string;
  description: string;
  target_users: string;
  opportunity_categories: string[];
  geographic_coverage: string;
  application_method: string;
  language_availability: string[];
  verification_status: string;
  last_checked_date: string;
}

export class OpportunityService {
  /**
   * Get active government schemes, internships, jobs, apprenticeships, and skilling opportunities
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
      .order('last_verified_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching opportunities:', error);
      return this.getMockOpportunities(category, lang);
    }

    return (data || []).map((o: any) => ({
      id: o.id,
      title: (lang === 'hi' && o.title_hi) || (lang === 'te' && o.title_te) || o.title,
      ministry_or_agency: o.ministry_or_agency,
      category: o.category as OpportunityCategory,
      financial_benefit: o.financial_benefit,
      eligibility_criteria: o.eligibility_criteria,
      portal_url: o.portal_url,
      deadline_notice: o.deadline_notice,
      is_active: o.is_active,
      verification_status: o.verification_status,
      source_url: o.source_url,
      last_verified_date: o.last_verified_date,
      created_at: o.created_at,
    }));
  }

  /**
   * Get verified national & state job/internship/apprenticeship portals directory
   */
  async getPortals(portalType?: string, lang: LanguageCode = 'en'): Promise<JobPortalItem[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockPortals(portalType, lang);
    }

    try {
      const client = getAdminClient();
      let query = client
        .from('job_portals')
        .select('*')
        .order('portal_type', { ascending: true })
        .order('name', { ascending: true });

      if (portalType && portalType !== 'all') {
        query = query.eq('portal_type', portalType);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        if (error) logger.error('Error fetching job portals:', error);
        return this.getMockPortals(portalType, lang);
      }

      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        portal_type: p.portal_type,
        description:
          (lang === 'hi' && p.description_hi) ||
          (lang === 'te' && p.description_te) ||
          p.description,
        target_users: p.target_users,
        opportunity_categories: Array.isArray(p.opportunity_categories) ? p.opportunity_categories : [],
        geographic_coverage: p.geographic_coverage || 'Pan-India',
        application_method: p.application_method || 'Online Portal',
        language_availability: Array.isArray(p.language_availability) ? p.language_availability : ['en', 'hi'],
        verification_status: p.verification_status || 'OFFICIAL_VERIFIED',
        last_checked_date: p.last_checked_date || '2026-11-26',
      }));
    } catch (err: any) {
      logger.error('Failed querying job_portals:', err.message);
      return this.getMockPortals(portalType, lang);
    }
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

  // --- Seed Fallback Data ---
  private getMockOpportunities(category?: string, lang: LanguageCode = 'en'): Opportunity[] {
    const mapped: Opportunity[] = OPPORTUNITIES.filter((o) => o.is_active).map((o) => ({
      id: o.id,
      title: (lang === 'hi' && o.title_hi) || (lang === 'te' && o.title_te) || o.title,
      ministry_or_agency: o.ministry_or_agency,
      category: o.category as OpportunityCategory,
      financial_benefit: o.financial_benefit,
      eligibility_criteria: o.eligibility_criteria,
      portal_url: o.portal_url,
      deadline_notice: o.deadline_notice,
      is_active: o.is_active,
      created_at: new Date().toISOString(),
    }));

    if (category && category !== 'all') {
      return mapped.filter((o) => o.category === category);
    }
    return mapped;
  }

  private getMockPortals(portalType?: string, lang: LanguageCode = 'en'): JobPortalItem[] {
    const mapped = JOB_PORTALS.map((p) => ({
      id: p.id,
      name: p.name,
      url: p.url,
      portal_type: p.portal_type,
      description:
        (lang === 'hi' && p.description_hi) ||
        (lang === 'te' && p.description_te) ||
        p.description,
      target_users: p.target_users,
      opportunity_categories: p.opportunity_categories,
      geographic_coverage: p.geographic_coverage,
      application_method: p.application_method,
      language_availability: p.language_availability,
      verification_status: p.verification_status,
      last_checked_date: p.last_checked_date,
    }));

    if (portalType && portalType !== 'all') {
      return mapped.filter((p) => p.portal_type === portalType);
    }
    return mapped;
  }
}

export const opportunityService = new OpportunityService();
