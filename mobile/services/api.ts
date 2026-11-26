import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';

const PRODUCTION_BACKEND_URL = 'https://margdarshak-1-0cnx.onrender.com/api/v1';

// Dynamically resolve backend host:
// 1. Explicit EXPO_PUBLIC_API_URL / EXPO_PUBLIC_BACKEND_URL if configured
// 2. Local web dev host (localhost/127.0.0.1 -> :5000) or production Render URL for cloud web hosts (Vercel)
// 3. Metro hostUri IP (enables seamless physical Android phone testing over Wi-Fi)
// 4. Fallback to production Render API on native builds
const getBackendBaseUrl = (): string => {
  const customUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
  if (customUrl) {
    return customUrl.endsWith('/api/v1') ? customUrl : `${customUrl.replace(/\/$/, '')}/api/v1`;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:5000/api/v1`;
    }
    return PRODUCTION_BACKEND_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api/v1`;
  }
  return PRODUCTION_BACKEND_URL;
};

export const API_BASE_URL = getBackendBaseUrl();

export async function syncLanguagePreference(language: string): Promise<void> {
  try {
    const headers = await getAuthHeader();
    await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ preferred_language: language }),
    });
  } catch (_e) {
    // Non-fatal, offline storage is primary on device
  }
}

export const STORAGE_KEYS = {
  SAVED_CAREERS: '@margdarshak_saved_careers',
  SAVED_RESOURCES: '@margdarshak_saved_resources',
  USER_PROGRESS: '@margdarshak_user_progress',
  CACHED_ROADMAPS: '@margdarshak_cached_roadmaps',
  CACHED_OPPORTUNITIES: '@margdarshak_cached_opportunities',
  CACHED_RECOMMENDATIONS: '@margdarshak_cached_recommendations',
  CACHED_PROFILE: '@margdarshak_cached_profile',
  DEV_SESSION: '@margdarshak_dev_session',
  ADMIN_CUSTOM_CAREERS: '@margdarshak_admin_custom_careers',
  ADMIN_CUSTOM_SKILLS: '@margdarshak_admin_custom_skills',
  ADMIN_CUSTOM_OPPS: '@margdarshak_admin_custom_opps',
};

export async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers.Authorization = `Bearer ${data.session.access_token}`;
      return headers;
    }
  }

  // Fallback for development sandbox mode
  headers.Authorization = 'Bearer dev-mobile-token';
  try {
    const devSession = await AsyncStorage.getItem(STORAGE_KEYS.DEV_SESSION);
    if (devSession) {
      const parsed = JSON.parse(devSession);
      if (parsed.id) {
        headers['X-Dev-User-Id'] = parsed.id;
        return headers;
      }
    }
  } catch (_e) {}

  headers['X-Dev-User-Id'] = 'mobile-dev-student-001';
  return headers;
}

export interface ApiUserProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  phone?: string | null;
  preferred_language: string;
  current_education_level: string;
  educational_stream?: string | null;
  course_or_specialization?: string | null;
  graduation_year?: string | null;
  state: string;
  district: string;
  willingness_to_relocate?: string;
  preferred_learning_method?: string | null;
  skills?: Array<{
    skill_id: string;
    proficiency_level: string;
    skill?: { name: string; category?: string };
  }>;
  interests?: Array<{
    category_id?: string;
    interest_id?: string;
    name?: string;
  }>;
}

export interface ApiAssessmentQuestion {
  id: string;
  section: string;
  question_key: string;
  question_text: string;
  question_type: string;
  display_order: number;
  options: Array<{
    id: string;
    question_id: string;
    option_key: string;
    option_text: string;
    subtext?: string;
    display_order: number;
  }>;
}

export interface ApiRecommendation {
  id: string;
  user_id?: string;
  career_id: string;
  match_score: number;
  match_reasons: string[];
  status?: string;
  career?: ApiCareer;
}

export interface ApiSkillMaster {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface ApiCareer {
  id: string;
  slug: string;
  title: string;
  minimum_education: string;
  estimated_salary_range: string;
  training_duration: string;
  growth_demand: 'high' | 'steady' | 'emerging';
  is_active?: boolean;
  category?: {
    id: string;
    code: string;
    name: string;
    icon_name?: string;
  };
  translation?: {
    title: string;
    description: string;
    job_responsibilities?: string;
    pathway_summary?: string;
  };
  skills?: Array<{
    skill_id: string;
    name: string;
    importance: 'required' | 'recommended' | 'optional';
    category: string;
    description?: string;
  }>;
  resources?: Array<{
    id: string;
    title: string;
    resource_type: string;
    provider_name: string;
    url: string;
    is_free: boolean;
  }>;
}

export interface ApiRoadmapStep {
  id: string;
  roadmap_id: string;
  step_number: number;
  title: string;
  description: string;
  learning_objectives: string[];
  estimated_duration: string;
  resource_links: Array<{
    title: string;
    url: string;
    type?: string;
    provider?: string;
    is_free?: boolean;
  }>;
  action_cta?: string;
  schemes_applicable: string[];
  user_progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    completed_at?: string | null;
    notes?: string | null;
  };
}

export interface ApiRoadmap {
  id: string;
  career_id: string;
  title: string;
  total_stages: number;
  estimated_duration: string;
  steps: ApiRoadmapStep[];
}

export interface ApiOpportunity {
  id: string;
  title: string;
  ministry_or_agency: string;
  category: 'internship' | 'job' | 'scholarship' | 'skilling' | 'free_course' | 'training_program' | string;
  financial_benefit: string;
  eligibility_criteria: string;
  portal_url: string;
  deadline_notice?: string;
  is_active: boolean;
}

// ----------------------------------------------------
// Career Catalog API
// ----------------------------------------------------

export interface ApiCareerCategory {
  id: string;
  code: string;
  name: string;
  icon_name?: string;
  display_order?: number;
}

export interface ApiJobPortal {
  id: string;
  name: string;
  url: string;
  portal_type: 'government' | 'private' | 'hybrid' | 'apprenticeship' | 'skilling' | string;
  description: string;
  target_users: string;
  opportunity_categories: string[];
  geographic_coverage: string;
  application_method: string;
  language_availability: string[];
  verification_status: string;
  last_checked_date: string;
}

export async function fetchCareerCategories(lang = 'en'): Promise<ApiCareerCategory[]> {
  try {
    const url = new URL(`${API_BASE_URL}/careers/categories`);
    url.searchParams.set('lang', lang);
    const res = await fetch(url.toString(), { headers: await getAuthHeader() });
    const data = await res.json();
    if (res.ok && data?.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch {
    // offline fallback below
  }
  return [
    { id: 'c1000000-0000-0000-0000-000000000001', code: 'renewable_energy', name: 'Renewable Energy & Clean Tech', display_order: 1 },
    { id: 'c1000000-0000-0000-0000-000000000002', code: 'modern_agriculture', name: 'Modern Agriculture & Agri-Tech', display_order: 2 },
    { id: 'c1000000-0000-0000-0000-000000000003', code: 'automotive', name: 'Automotive & Electric Vehicles', display_order: 3 },
    { id: 'c1000000-0000-0000-0000-000000000004', code: 'healthcare', name: 'Healthcare & Wellness', display_order: 4 },
    { id: 'c1000000-0000-0000-0000-000000000005', code: 'digital_services', name: 'Digital Services & CSC', display_order: 5 },
    { id: 'c1000000-0000-0000-0000-000000000006', code: 'technical', name: 'Software & Technology', display_order: 6 },
    { id: 'c1000000-0000-0000-0000-000000000007', code: 'business', name: 'Business, Finance & Banking', display_order: 7 },
    { id: 'c1000000-0000-0000-0000-000000000008', code: 'government_services', name: 'Government & Public Services', display_order: 8 },
    { id: 'c1000000-0000-0000-0000-000000000009', code: 'education', name: 'Education & Teaching', display_order: 9 },
    { id: 'c1000000-0000-0000-0000-000000000010', code: 'trades', name: 'Electrical & Industrial Trades', display_order: 10 },
  ];
}

export async function fetchJobPortals(portalType?: string, lang = 'en'): Promise<ApiJobPortal[]> {
  try {
    const url = new URL(`${API_BASE_URL}/opportunities/portals`);
    url.searchParams.set('lang', lang);
    if (portalType && portalType !== 'all') {
      url.searchParams.set('portal_type', portalType);
    }
    const res = await fetch(url.toString(), { headers: await getAuthHeader() });
    const data = await res.json();
    if (res.ok && data?.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch {
    // offline fallback below
  }
  return [
    {
      id: 'f3000000-0000-0000-0000-000000000001',
      name: 'National Career Service (NCS)',
      url: 'https://www.ncs.gov.in',
      portal_type: 'government',
      description: 'Ministry of Labour & Employment national job matching portal across India.',
      target_users: 'All jobseekers, 10th/12th/ITI/Graduates',
      opportunity_categories: ['jobs', 'career_counseling', 'skill_providers'],
      geographic_coverage: 'Pan-India',
      application_method: 'Online Portal',
      language_availability: ['en', 'hi'],
      verification_status: 'OFFICIAL_VERIFIED',
      last_checked_date: '2026-11-26',
    },
    {
      id: 'f3000000-0000-0000-0000-000000000013',
      name: 'PM Internship Scheme Portal (MCA)',
      url: 'https://pminternship.mca.gov.in',
      portal_type: 'apprenticeship',
      description: 'Paid 12-month central government internships across top 500 Indian companies (₹5,000/month).',
      target_users: '10th, 12th, ITI, Diploma & Graduate youth aged 21-24',
      opportunity_categories: ['paid_internships', 'govt_stipend'],
      geographic_coverage: 'Pan-India',
      application_method: 'Aadhaar eKYC & Online Profile',
      language_availability: ['en', 'hi', 'te'],
      verification_status: 'OFFICIAL_VERIFIED',
      last_checked_date: '2026-11-26',
    },
    {
      id: 'f3000000-0000-0000-0000-000000000011',
      name: 'Apprenticeship India (NAPS Portal)',
      url: 'https://www.apprenticeshipindia.gov.in',
      portal_type: 'apprenticeship',
      description: 'Official MSDE portal for paid on-the-job apprenticeships with DBT stipend.',
      target_users: '10th/12th Pass, ITI & Polytechnic students',
      opportunity_categories: ['apprenticeships', 'naps_subsidized'],
      geographic_coverage: 'Pan-India',
      application_method: 'Candidate Aadhaar eKYC',
      language_availability: ['en', 'hi'],
      verification_status: 'OFFICIAL_VERIFIED',
      last_checked_date: '2026-11-26',
    },
  ];
}

export async function fetchCareers(
  lang = 'en',
  categoryId?: string,
  search?: string,
  categoryCode?: string
): Promise<ApiCareer[]> {
  try {
    const url = new URL(`${API_BASE_URL}/careers`);
    url.searchParams.set('lang', lang);
    url.searchParams.set('limit', '100');
    if (categoryId && categoryId !== 'All') url.searchParams.set('category_id', categoryId);
    if (categoryCode && categoryCode !== 'All' && categoryCode !== 'all') {
      url.searchParams.set('category_code', categoryCode);
    }
    if (search) url.searchParams.set('search', search);

    const res = await fetch(url.toString(), {
      headers: await getAuthHeader(),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (_e) {
    // Offline / unreachable fallback
  }

  return getFallbackCareers(lang);
}

export async function fetchCareerDetails(careerId: string, lang = 'en'): Promise<ApiCareer | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/${careerId}?lang=${lang}`, {
      headers: await getAuthHeader(),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (_e) {
    // Offline fallback
  }

  const list = getFallbackCareers(lang);
  return list.find((c) => c.id === careerId || c.slug === careerId) || list[0] || null;
}

// ----------------------------------------------------
// Personalized Roadmap & Progress API
// ----------------------------------------------------

export async function fetchCareerRoadmap(careerId: string, lang = 'en'): Promise<ApiRoadmap> {
  let roadmap: ApiRoadmap | null = null;
  try {
    const res = await fetch(`${API_BASE_URL}/roadmaps/career/${careerId}?lang=${lang}`, {
      headers: await getAuthHeader(),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        roadmap = data.data;
        // Cache roadmap locally per language
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.CACHED_ROADMAPS}_${careerId}_${lang}`,
          JSON.stringify(data.data)
        );
      }
    }
  } catch (_e) {
    // Offline check cached
  }

  if (!roadmap) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHED_ROADMAPS}_${careerId}_${lang}`);
    if (cached) {
      roadmap = JSON.parse(cached);
    } else {
      roadmap = getFallbackRoadmap(careerId, lang);
    }
  }

  // Merge locally persisted offline progress into roadmap steps
  try {
    const rawProgress = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (rawProgress && roadmap) {
      const progressMap = JSON.parse(rawProgress);
      roadmap.steps = roadmap.steps.map((st) => {
        if (progressMap[st.id]) {
          return {
            ...st,
            user_progress: {
              status: progressMap[st.id].status || 'not_started',
              completed_at: progressMap[st.id].completed_at ?? null,
              notes: progressMap[st.id].notes ?? null,
            },
          };
        }
        return st;
      });
    }
  } catch (_e) {}

  return roadmap!;
}

export async function updateStepProgress(
  stepId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  notes?: string
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/roadmaps/progress`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify({
        roadmap_step_id: stepId,
        status,
        notes,
      }),
    });

    if (res.ok) {
      return { success: true };
    }
  } catch (_e) {
    // Sync to local storage offline
  }

  // Persist offline progress in AsyncStorage
  const rawProgress = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  const progressMap = rawProgress ? JSON.parse(rawProgress) : {};
  progressMap[stepId] = {
    status,
    notes,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  };
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progressMap));

  return { success: true };
}

// ----------------------------------------------------
// Opportunities & Government Schemes API
// ----------------------------------------------------

export async function fetchOpportunities(category?: string, lang = 'en'): Promise<ApiOpportunity[]> {
  try {
    const url = new URL(`${API_BASE_URL}/opportunities`);
    url.searchParams.set('lang', lang);
    if (category && category !== 'All' && category !== 'all') {
      url.searchParams.set('category', category.toLowerCase());
    }

    const res = await fetch(url.toString(), {
      headers: await getAuthHeader(),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_OPPORTUNITIES, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (_e) {
    // Fallback
  }

  const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_OPPORTUNITIES);
  if (cached) {
    try {
      const list: ApiOpportunity[] = JSON.parse(cached);
      if (category && category !== 'All' && category !== 'all') {
        return list.filter((o) => o.category === category.toLowerCase());
      }
      return list;
    } catch (_e) {}
  }

  return getFallbackOpportunities(category, lang);
}

// ----------------------------------------------------
// Bookmarks & Saved Careers API
// ----------------------------------------------------

export async function fetchSavedCareers(lang = 'en'): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/saved-careers?lang=${lang}`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      const ids = (data.data || []).map((sc: any) => sc.career_id);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CAREERS, JSON.stringify(ids));
      return ids;
    }
  } catch (_e) {
    // Fallback to local
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAREERS);
  return raw ? JSON.parse(raw) : ['c-1'];
}

export async function toggleSaveCareer(careerId: string, isSaved: boolean): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (isSaved) {
      await fetch(`${API_BASE_URL}/saved-careers/${careerId}`, {
        method: 'DELETE',
        headers,
      });
    } else {
      await fetch(`${API_BASE_URL}/saved-careers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ career_id: careerId }),
      });
    }
  } catch (_e) {
    // Continue with local storage
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAREERS);
  let savedIds: string[] = raw ? JSON.parse(raw) : [];

  if (isSaved) {
    savedIds = savedIds.filter((id) => id !== careerId);
  } else {
    if (!savedIds.includes(careerId)) savedIds.push(careerId);
  }

  await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CAREERS, JSON.stringify(savedIds));
  return !isSaved;
}

export async function fetchBookmarkedResources(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/bookmarks/resources`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      const urls = (data.data || []).map((bm: any) => bm.url);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_RESOURCES, JSON.stringify(urls));
      return urls;
    }
  } catch (_e) {
    // Offline
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_RESOURCES);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleBookmarkResource(resource: {
  title: string;
  url: string;
  provider_name?: string;
  type?: string;
}, isBookmarked: boolean): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (isBookmarked) {
      await fetch(`${API_BASE_URL}/bookmarks/resources/${encodeURIComponent(resource.url)}`, {
        method: 'DELETE',
        headers,
      });
    } else {
      await fetch(`${API_BASE_URL}/bookmarks/resources`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: resource.title,
          url: resource.url,
          provider_name: resource.provider_name,
          resource_type: resource.type || 'portal',
        }),
      });
    }
  } catch (_e) {
    // Fallback
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_RESOURCES);
  let urls: string[] = raw ? JSON.parse(raw) : [];

  if (isBookmarked) {
    urls = urls.filter((u) => u !== resource.url);
  } else {
    if (!urls.includes(resource.url)) urls.push(resource.url);
  }

  await AsyncStorage.setItem(STORAGE_KEYS.SAVED_RESOURCES, JSON.stringify(urls));
  return !isBookmarked;
}

// ----------------------------------------------------
// Fallback Data Fixtures (Multilingual)
// ----------------------------------------------------

function getFallbackCareers(lang = 'en'): ApiCareer[] {
  const isTe = lang === 'te';
  const isHi = lang === 'hi';

  return [
    {
      id: 'c-1',
      slug: 'solar-technician',
      title: isTe ? 'సోలార్ పివి టెక్నీషియన్' : isHi ? 'सोलर पीवी तकनीशियन' : 'Solar PV Systems Technician',
      minimum_education: '10th Pass / ITI Electrical',
      estimated_salary_range: '₹18,000 - ₹32,000 / month',
      training_duration: '3 - 6 Months',
      growth_demand: 'high',
      category: {
        id: 'cat-trades',
        code: 'trades',
        name: isTe ? 'ఎలక్ట్రికల్ & ఎనర్జీ' : isHi ? 'इलेक्ट्रिकल और सौर ऊर्जा' : 'Electrical & Clean Energy',
        icon_name: 'Zap',
      },
      translation: {
        title: isTe ? 'సోలార్ పివి టెక్నీషియన్' : isHi ? 'सोलर पीवी तकनीशियन' : 'Solar PV Systems Technician',
        description: 'Installs, tests, and maintains rooftop and ground-mounted solar power systems across rural and suburban communities.',
        job_responsibilities: 'Mounting solar arrays, inverter connections, battery storage wiring, safety earthing checks, and inverter diagnostics.',
        pathway_summary: 'Apprentice Installer -> Certified Suryamitra Technician -> Independent Solar Contractor / EPC Entrepreneur.',
      },
      skills: [
        { skill_id: 'sk-1', name: 'Solar Installation', importance: 'required', category: 'trade', description: 'Mounting solar arrays and structure earthing' },
        { skill_id: 'sk-2', name: 'Electrical Wiring', importance: 'required', category: 'trade', description: 'AC/DC cable routing and inverter connections' },
        { skill_id: 'sk-3', name: 'Workplace Safety & Earthing', importance: 'required', category: 'trade', description: 'Personal protective equipment and ladder safety' },
        { skill_id: 'sk-4', name: 'Multimeter & Testing Tools', importance: 'recommended', category: 'technical', description: 'Continuity, voltage drop, and fault diagnosis' },
      ],
      resources: [
        { id: 'res-1', title: 'Suryamitra National Solar Training Curriculum', resource_type: 'portal', provider_name: 'NISE', url: 'https://nise.res.in/suryamitra', is_free: true },
        { id: 'res-2', title: 'Solar PV Rooftop Installation Handbook', resource_type: 'pdf_guide', provider_name: 'Skill India Digital Hub', url: 'https://www.skillindiadigital.gov.in', is_free: true },
      ],
    },
    {
      id: 'c-2',
      slug: 'junior-web-developer',
      title: isTe ? 'జూనియర్ వెబ్ డెవలపర్' : isHi ? 'जूनियर वेब डेवलपर' : 'Junior Web Developer',
      minimum_education: '12th Pass / Any Diploma / Graduate',
      estimated_salary_range: '₹22,000 - ₹45,000 / month',
      training_duration: '6 Months',
      growth_demand: 'high',
      category: {
        id: 'cat-tech',
        code: 'technical',
        name: isTe ? 'డిజిటల్ & టెక్నాలజీ' : isHi ? 'डिजिटल और प्रौद्योगिकी' : 'Digital & Technology',
        icon_name: 'Cpu',
      },
      translation: {
        title: isTe ? 'జూనియర్ వెబ్ డెవలపర్' : isHi ? 'जूनियर वेब डेवलपर' : 'Junior Web Developer',
        description: 'Builds responsive websites, user interfaces and digital catalogs for businesses, educational institutions and e-governance.',
        job_responsibilities: 'Writing clean HTML/CSS/JavaScript, building reusable component layouts in React, integrating REST APIs, and responsive testing.',
        pathway_summary: 'Trainee Web Designer -> Frontend Developer -> Full Stack Engineer -> Web Agency Owner.',
      },
      skills: [
        { skill_id: 'sk-5', name: 'HTML & CSS', importance: 'required', category: 'technical', description: 'Semantic markup and responsive layouts' },
        { skill_id: 'sk-6', name: 'JavaScript Fundamentals', importance: 'required', category: 'technical', description: 'ES6+ logic, DOM manipulation, async APIs' },
        { skill_id: 'sk-7', name: 'React Basics', importance: 'recommended', category: 'technical', description: 'Component state, props, and hooks' },
        { skill_id: 'sk-8', name: 'Git & Version Control', importance: 'recommended', category: 'technical', description: 'Repository management and GitHub portfolio' },
      ],
      resources: [
        { id: 'res-3', title: 'Responsive Web Design Certification', resource_type: 'course', provider_name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', is_free: true },
        { id: 'res-4', title: 'The Modern JavaScript Tutorial', resource_type: 'portal', provider_name: 'JavaScript.info', url: 'https://javascript.info', is_free: true },
      ],
    },
    {
      id: 'c-3',
      slug: 'precision-agriculture-operator',
      title: isTe ? 'వ్యవసాయ డ్రోన్ & స్మార్ట్ టెక్ ఆపరేటర్' : isHi ? 'कृषि ड्रोन और स्मार्ट टेक ऑपरेटर' : 'Agricultural Drone & Smart Tech Operator',
      minimum_education: '10th Pass with DGCA Drone Pilot License',
      estimated_salary_range: '₹25,000 - ₹50,000 / month',
      training_duration: '3 Months',
      growth_demand: 'emerging',
      category: {
        id: 'cat-agri',
        code: 'agriculture',
        name: isTe ? 'వ్యవసాయ సాంకేతికత' : isHi ? 'कृषि और ग्रामीण प्रौद्योगिकी' : 'Modern Agriculture',
        icon_name: 'Sprout',
      },
      translation: {
        title: isTe ? 'వ్యవసాయ డ్రోన్ & స్మార్ట్ టెక్ ఆపరేటర్' : isHi ? 'कृषि ड्रोन और स्मार्ट टेक ऑपरेटर' : 'Agricultural Drone & Smart Tech Operator',
        description: 'Pilots DGCA-certified drones for precision pesticide spraying, seed dispersal, and crop health mapping across regional farms.',
        job_responsibilities: 'Flight trajectory planning, autonomous spray execution, battery maintenance, farm telemetry reporting.',
        pathway_summary: 'Drone Pilot Assistant -> Certified Kisan Drone Pilot -> Custom Hiring Center Enterprise Owner.',
      },
      skills: [
        { skill_id: 'sk-9', name: 'Drone Flight Operations', importance: 'required', category: 'technical', description: 'DGCA compliant simulator and field piloting' },
        { skill_id: 'sk-10', name: 'Crop Health Assessment', importance: 'required', category: 'trade', description: 'Detecting crop stress, pest patches and NDVI telemetry' },
      ],
      resources: [
        { id: 'res-5', title: 'Kisan Drone Pilot Certification Course', resource_type: 'portal', provider_name: 'ASCI', url: 'https://asci-india.com', is_free: true },
      ],
    },
  ];
}

function getFallbackRoadmap(careerId: string, lang = 'en'): ApiRoadmap {
  const isTe = lang === 'te';
  const isHi = lang === 'hi';
  const isWeb = careerId.toLowerCase().includes('web') || careerId.toLowerCase().includes('c-2') || careerId.toLowerCase().includes('developer');

  if (isWeb) {
    return {
      id: `rm-${careerId}`,
      career_id: careerId,
      title: isTe ? 'వెబ్ డెవలపర్ కెరీర్ రోడ్‌మ్యాప్' : isHi ? 'वेब डेवलपर करियर रोडमैप' : 'Web Developer Learning Roadmap',
      total_stages: 6,
      estimated_duration: '6 Months',
      steps: [
        {
          id: 'step-web-1',
          roadmap_id: `rm-${careerId}`,
          step_number: 1,
          title: isTe ? 'దశ 1: HTML మరియు CSS నేర్చుకోండి' : isHi ? 'चरण 1: HTML और CSS सीखें' : 'Step 1: Learn HTML and CSS',
          description: isTe
            ? 'సెమాంటిక్ హెచ్‌టిఎమ్ఎల్, రెస్పాన్సివ్ ఫ్లెక్స్‌బాక్స్, గ్రిడ్ లేఅవుట్‌లు మరియు ఆధునిక వెబ్ ఫారమ్‌ల డిజైన్ నేర్చుకోండి.'
            : isHi
            ? 'सिमेंटिक मार्कअप, रिस्पॉन्सिव फ्लेक्सबॉक्स, ग्रिड लेआउट और वेब फॉर्म डिजाइन सीखें।'
            : 'Master semantic markup, modern CSS flexbox, grid layouts, and mobile-friendly responsive web pages.',
          learning_objectives: [
            'Build clean semantic HTML5 documents',
            'Create mobile-responsive layouts using CSS Flexbox & Grid',
            'Design accessible input forms and navigation bars',
          ],
          estimated_duration: '4 Weeks',
          resource_links: [
            { title: 'Responsive Web Design Certification', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'course', provider: 'freeCodeCamp', is_free: true },
            { title: 'MDN HTML & CSS Guides', url: 'https://developer.mozilla.org/en-US/docs/Learn', type: 'portal', provider: 'MDN Web Docs', is_free: true },
          ],
          action_cta: 'Start HTML & CSS Modules',
          schemes_applicable: ['Skill India Digital Hub'],
          user_progress: { status: 'completed', completed_at: new Date().toISOString(), notes: 'Built 3 static pages' },
        },
        {
          id: 'step-web-2',
          roadmap_id: `rm-${careerId}`,
          step_number: 2,
          title: isTe ? 'దశ 2: జావాస్క్రిప్ట్ నేర్చుకోండి' : isHi ? 'चरण 2: जावास्क्रिप्ट सीखें' : 'Step 2: Learn JavaScript',
          description: isTe
            ? 'వేరియబుల్స్, లూప్‌లు, ఫంక్షన్‌లు, DOM మానిప్యులేషన్, మరియు అసమకాలిక API కాల్స్ (Fetch/Async) సాధన చేయండి.'
            : isHi
            ? 'वेरिएबल्स, फंक्शन्स, डोम मैनिपुलेशन और एसिंक्रोनस एपीआई फेचिंग का अभ्यास करें।'
            : 'Understand programming logic: variables, arrays, objects, DOM manipulation, event handling, and asynchronous API calls.',
          learning_objectives: [
            'Understand ES6+ JavaScript syntax and functions',
            'Manipulate browser DOM elements dynamically',
            'Fetch data from REST APIs using async/await',
          ],
          estimated_duration: '6 Weeks',
          resource_links: [
            { title: 'JavaScript Algorithms and Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course', provider: 'freeCodeCamp', is_free: true },
            { title: 'The Modern JavaScript Tutorial', url: 'https://javascript.info/', type: 'portal', provider: 'JavaScript.info', is_free: true },
          ],
          action_cta: 'Practice JavaScript Challenges',
          schemes_applicable: ['NPTEL Free Computer Science Courses'],
          user_progress: { status: 'in_progress', completed_at: undefined, notes: 'Currently on array methods & DOM' },
        },
        {
          id: 'step-web-3',
          roadmap_id: `rm-${careerId}`,
          step_number: 3,
          title: isTe ? 'దశ 3: రియాక్ట్ (React) నేర్చుకోండి' : isHi ? 'चरण 3: रिएक्ट (React) सीखें' : 'Step 3: Learn React',
          description: isTe
            ? 'కాంపోనెంట్ ఆర్కిటెక్చర్, JSX, స్టేట్ మరియు ప్రాప్స్, రియాక్ట్ హుక్స్ (useState, useEffect) మరియు రూటింగ్ నేర్చుకోండి.'
            : isHi
            ? 'कंपोनेंट आर्किटेक्चर, जेएसएक्स, स्टेट और प्रॉप्स, रिएक्ट हुक और क्लाइंट-साइड रूटिंग सीखें।'
            : 'Learn modern component-based UI engineering: JSX, props, state management, React hooks, and Single Page Application (SPA) routing.',
          learning_objectives: [
            'Create reusable component hierarchies in React',
            'Manage state and side-effects with useState and useEffect',
            'Integrate navigation using React Router',
          ],
          estimated_duration: '6 Weeks',
          resource_links: [
            { title: 'Official React Documentation', url: 'https://react.dev/learn', type: 'portal', provider: 'React Community', is_free: true },
          ],
          action_cta: 'Build First React Component',
          schemes_applicable: ['PMKVY 4.0 Digital Tech'],
          user_progress: { status: 'not_started' },
        },
        {
          id: 'step-web-4',
          roadmap_id: `rm-${careerId}`,
          step_number: 4,
          title: isTe ? 'దశ 4: ప్రాక్టికల్ ప్రాజెక్ట్‌లను రూపొందించండి' : isHi ? 'चरण 4: व्यावहारिक प्रोजेक्ट बनाएं' : 'Step 4: Build Practical Projects',
          description: isTe
            ? 'గ్రామీణ వ్యవసాయ ధరల పోర్టల్, స్థానిక సేవల డైరెక్టరీ లేదా టాస్క్ ట్రాకర్ వంటి 3 వాస్తవ ప్రపంచ ప్రాజెక్ట్‌లను రూపొందించండి.'
            : isHi
            ? 'ग्रामीण कृषि उत्पाद कैटलॉग या स्थानीय सेवा ट्रैकर जैसे 3 वास्तविक प्रोजेक्ट बनाएं।'
            : 'Synthesize your skills by building 3 real-world web applications: a local artisan catalog, an interactive task manager, and a weather/mandi price dashboard.',
          learning_objectives: [
            'Build end-to-end CRUD applications with REST backend integration',
            'Implement form validations and responsive mobile designs',
            'Version control all source code on GitHub',
          ],
          estimated_duration: '4 Weeks',
          resource_links: [
            { title: 'Frontend Mentor Challenges', url: 'https://www.frontendmentor.io/challenges', type: 'portal', provider: 'Frontend Mentor', is_free: true },
          ],
          action_cta: 'Choose Project Idea',
          schemes_applicable: ['Skill India Hackathons'],
          user_progress: { status: 'not_started' },
        },
        {
          id: 'step-web-5',
          roadmap_id: `rm-${careerId}`,
          step_number: 5,
          title: isTe ? 'దశ 5: పోర్ట్‌ఫోలియో తయారు చేయండి' : isHi ? 'चरण 5: पोर्टफोलियो तैयार करें' : 'Step 5: Prepare a Portfolio',
          description: isTe
            ? 'మీ ప్రాజెక్ట్‌లను GitHub లో హోస్ట్ చేయండి. Vercel లేదా Netlify పై లైవ్ డెమో లింక్‌లతో ప్రొఫెషనల్ పోర్ట్‌ఫోలియో వెబ్‌సైట్‌ను ప్రచురించండి.'
            : isHi
            ? 'Vercel या GitHub Pages पर लाइव डेमो और स्पष्ट विवरण के साथ अपना पेशेवर पोर्टफोलियो प्रकाशित करें।'
            : 'Deploy your live project demos on Vercel/Netlify, polish GitHub READMEs, and create a fast, accessible personal developer portfolio website.',
          learning_objectives: [
            'Deploy production builds using free cloud hosting',
            'Document software architecture and setup instructions clearly',
            'Create a one-page resume and developer profile',
          ],
          estimated_duration: '2 Weeks',
          resource_links: [
            { title: 'Vercel Deployment Guide', url: 'https://vercel.com/docs', type: 'portal', provider: 'Vercel', is_free: true },
          ],
          action_cta: 'Publish Portfolio Site',
          schemes_applicable: ['NASSCOM FutureSkills Prime'],
          user_progress: { status: 'not_started' },
        },
        {
          id: 'step-web-6',
          roadmap_id: `rm-${careerId}`,
          step_number: 6,
          title: isTe ? 'దశ 6: ఇంటర్న్‌షిప్‌లు మరియు ప్రారంభ ఉద్యోగాలను అన్వేషించండి' : isHi ? 'चरण 6: इंटर्नशिप और नौकरियों के लिए आवेदन करें' : 'Step 6: Explore Internships and Entry-Level Jobs',
          description: isTe
            ? 'నేషనల్ కెరీర్ సర్వీస్ (NCS), NAPS అప్రెంటిస్‌షిప్ పోర్టల్ మరియు స్థానిక IT సర్వీస్ కంపెనీలలో జూనియర్ డెవలపర్ ఉద్యోగాలకు దరఖాస్తు చేయండి.'
            : isHi
            ? 'राष्ट्रीय कैरियर सेवा (NCS) और NAPS पोर्टल पर जूनियर वेब डेवलपर या इंटर्नशिप पदों के लिए आवेदन करें।'
            : 'Apply for paid apprenticeships and junior developer roles through National Career Service (NCS), NAPS portal, and regional IT service companies.',
          learning_objectives: [
            'Register verified profile on National Career Service (NCS) portal',
            'Participate in technical screening and mock interviews',
            'Secure paid traineeship or junior frontend developer placement',
          ],
          estimated_duration: '4 Weeks',
          resource_links: [
            { title: 'National Career Service Portal', url: 'https://www.ncs.gov.in', type: 'portal', provider: 'Ministry of Labour & Employment', is_free: true },
            { title: 'National Apprenticeship Portal (NAPS)', url: 'https://www.apprenticeshipindia.gov.in', type: 'portal', provider: 'MSDE', is_free: true },
          ],
          action_cta: 'Register on NCS Portal',
          schemes_applicable: ['NAPS Apprenticeship Scheme', 'National Career Service'],
          user_progress: { status: 'not_started' },
        },
      ],
    };
  }

  // Solar Technician
  return {
    id: `rm-${careerId}`,
    career_id: careerId,
    title: isTe ? 'సోలార్ పివి టెక్నీషియన్ రోడ్‌మ్యాప్' : isHi ? 'सोलर पीवी तकनीशियन रोडमैप' : 'Solar PV Systems Technician Roadmap',
    total_stages: 4,
    estimated_duration: '6 Months',
    steps: [
      {
        id: 'solar-step-1',
        roadmap_id: `rm-${careerId}`,
        step_number: 1,
        title: isTe ? 'దశ 1: ప్రాథమిక విద్యుత్ భావనలు & భద్రత' : isHi ? 'चरण 1: बुनियादी विद्युत अवधारणाएं और सुरक्षा' : 'Step 1: Foundational Electrical Safety & Theory',
        description: isTe
          ? 'వోల్టేజ్, కరెంట్, AC/DC సర్క్యూట్‌లు మరియు ఎలక్ట్రికల్ భద్రతా నియమాలు నేర్చుకోండి. మల్టీమీటర్ వాడకం సాధన చేయండి.'
          : isHi
          ? 'वोल्टेज, करंट, एसी/डीसी सर्किट और विद्युत सुरक्षा उपकरणों का उपयोग सीखें।'
          : 'Master basic electrical fundamentals: voltage, current, resistance, AC vs DC, grounding, safety earthing, and multimeter testing.',
        learning_objectives: [
          'Understand single-phase vs three-phase power supplies',
          'Perform accurate multimeter measurements for voltage and continuity',
          'Adhere to high-voltage safety standards and earthing procedures',
        ],
        estimated_duration: '3 Weeks',
        resource_links: [
          { title: 'Basic Electrical Safety Video Guide', url: 'https://www.skillindiadigital.gov.in', type: 'video', provider: 'Skill India Digital Hub', is_free: true },
        ],
        action_cta: 'Download Electrical Safety Guide',
        schemes_applicable: ['PMKVY 4.0'],
        user_progress: { status: 'completed', completed_at: new Date().toISOString(), notes: 'Completed basic safety module' },
      },
      {
        id: 'solar-step-2',
        roadmap_id: `rm-${careerId}`,
        step_number: 2,
        title: isTe ? 'దశ 2: సూర్యమిత్ర సర్టిఫైడ్ సోలార్ శిక్షణ' : isHi ? 'चरण 2: सूर्यमित्र प्रमाणित सौर प्रशिक्षण' : 'Step 2: Suryamitra Certified Solar PV Training',
        description: isTe
          ? 'ప్రభుత్వ గుర్తింపు పొందిన సూర్యమిత్ర కేంద్రంలో రూఫ్‌టాప్ సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్, ఇన్వర్టర్ వైరింగ్ మరియు టెస్టింగ్ శిక్షణ పొందండి.'
          : isHi
          ? 'सरकारी सूर्यमित्र केंद्र में रूफटॉप सोलर पैनल माउंटिंग और इन्वर्टर वायरिंग का निःशुल्क प्रशिक्षण लें।'
          : 'Enroll in the government-funded 3-month Suryamitra skill training program covering solar array structure mounting, inverter pairing, and grid synchronization.',
        learning_objectives: [
          'Assemble and align solar photovoltaic modules with optimum sun azimuth',
          'Connect charge controllers, inverters, and battery banks safely',
          'Test solar plant output wattage and grid export meters',
        ],
        estimated_duration: '12 Weeks',
        resource_links: [
          { title: 'Suryamitra Solar Training Handbook', url: 'https://nise.res.in/suryamitra', type: 'portal', provider: 'National Institute of Solar Energy', is_free: true },
        ],
        action_cta: 'Find Nearest Suryamitra Center',
        schemes_applicable: ['Suryamitra Skill Development Scheme', 'PM Surya Ghar Muft Bijli Yojana'],
        user_progress: { status: 'in_progress', completed_at: undefined, notes: 'Enrolled in district ITI batch' },
      },
      {
        id: 'solar-step-3',
        roadmap_id: `rm-${careerId}`,
        step_number: 3,
        title: isTe ? 'దశ 3: ఫీల్డ్ అప్రెంటిస్‌షిప్ & అనుభవం' : isHi ? 'चरण 3: फील्ड अप्रेंटिसशिप और अनुभव' : 'Step 3: Practical Field Apprenticeship',
        description: isTe
          ? 'NAPS పోర్టల్ ద్వారా స్థానిక సోలార్ ఇన్‌స్టాలర్ కంపెనీలో 6 నెలల స్టైపెండరీ అప్రెంటిస్‌షిప్ పూర్తి చేయండి.'
          : isHi
          ? 'NAPS पोर्टल के माध्यम से पंजीकृत सोलर कंपनी में मासिक वजीफे के साथ फील्ड कार्य का अनुभव प्राप्त करें।'
          : 'Work on actual commercial and rural agricultural rooftop solar projects with certified installation EPC contractors under NAPS stipend.',
        learning_objectives: [
          'Complete at least 5 residential rooftop installations end-to-end',
          'Diagnose faulty bypass diodes and string inverter errors',
          'Handle customer handover documentation and net-metering commissioning',
        ],
        estimated_duration: '16 Weeks',
        resource_links: [
          { title: 'National Apprenticeship Portal (NAPS)', url: 'https://www.apprenticeshipindia.gov.in', type: 'portal', provider: 'MSDE', is_free: true },
        ],
        action_cta: 'Apply on NAPS Portal',
        schemes_applicable: ['NAPS Apprenticeship Scheme'],
        user_progress: { status: 'not_started' },
      },
      {
        id: 'solar-step-4',
        roadmap_id: `rm-${careerId}`,
        step_number: 4,
        title: isTe ? 'దశ 4: ఉపాధి లేదా స్వయం ఉపాధి (ముద్రా రుణం)' : isHi ? 'चरण 4: रोजगार या सौर उद्यमिता (मुद्रा ऋण)' : 'Step 4: Employment or Solar Entrepreneurship',
        description: isTe
          ? 'పీఎం సూర్య ఘర్ ప్రాజెక్టులలో ఉద్యోగం పొందండి లేదా ముద్రా శిశు రుణం ద్వారా గ్రామీణ సోలార్ సర్వీసింగ్ షాపు ప్రారంభించండి.'
          : isHi
          ? 'पीएम सूर्य घर परियोजना में नौकरी पाएं या मुद्रा शिशु ऋण से अपना सोलर सर्विसिंग व्यवसाय शुरू करें।'
          : 'Join a renewable energy installer as a senior technician or establish your own rural solar servicing and pump repair enterprise with a MUDRA loan.',
        learning_objectives: [
          'Secure full-time technician contract with solar developer',
          'Apply for PM MUDRA collateral-free equipment loan up to ₹50,000',
          'Offer local annual maintenance contracts (AMC) for rural solar water pumps',
        ],
        estimated_duration: 'Ongoing',
        resource_links: [
          { title: 'PM MUDRA Yojana Portal', url: 'https://www.mudra.org.in', type: 'portal', provider: 'Department of Financial Services', is_free: true },
          { title: 'PM Surya Ghar National Portal', url: 'https://pmsuryaghar.gov.in', type: 'portal', provider: 'Ministry of New and Renewable Energy', is_free: true },
        ],
        action_cta: 'Explore MUDRA Application',
        schemes_applicable: ['PMMY Shishu Loan', 'PM KUSUM Solar Pump Scheme'],
        user_progress: { status: 'not_started' },
      },
    ],
  };
}

function getFallbackOpportunities(category?: string, lang = 'en'): ApiOpportunity[] {
  const isTe = lang === 'te';
  const isHi = lang === 'hi';

  const list: ApiOpportunity[] = [
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
    },
    {
      id: 'opp-ncs-2',
      title: isTe
        ? 'నేషనల్ కెరీర్ సర్వీస్ (NCS) - ప్రభుత్వ ఉద్యోగ పోర్టల్'
        : isHi
        ? 'राष्ट्रीय कैरियर सेवा (NCS) - रोजगार मेला एवं नौकरी पोर्टल'
        : 'National Career Service (NCS) - Verified Job Vacancies & Rozgar Mela',
      ministry_or_agency: 'Ministry of Labour & Employment',
      category: 'job',
      financial_benefit: 'Free access to thousands of direct employer vacancies, district job fairs, and career counseling',
      eligibility_criteria: 'Indian citizens seeking employment. All qualification levels from 10th standard to post-graduates',
      portal_url: 'https://www.ncs.gov.in',
      deadline_notice: 'District Rozgar Melas scheduled monthly',
      is_active: true,
    },
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
    },
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
    },
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
    },
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
    },
  ];

  if (category && category !== 'All' && category !== 'all') {
    return list.filter((o) => o.category === category.toLowerCase());
  }
  return list;
}

// ----------------------------------------------------
// Student Profile & Skills APIs
// ----------------------------------------------------

export async function fetchUserProfile(): Promise<ApiUserProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_PROFILE, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (_e) {}

  const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_PROFILE);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_e) {}
  }
  return null;
}

export async function upsertUserProfile(profile: Partial<ApiUserProfile>): Promise<ApiUserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: await getAuthHeader(),
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_PROFILE, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (_e) {}

  const fallback: ApiUserProfile = {
    full_name: profile.full_name || 'Rahul Sharma',
    current_education_level: profile.current_education_level || '10th_pass',
    state: profile.state || 'Madhya Pradesh',
    district: profile.district || 'Sehore',
    preferred_language: profile.preferred_language || 'en',
    willingness_to_relocate: profile.willingness_to_relocate || 'within_district',
    educational_stream: profile.educational_stream || 'vocational',
    course_or_specialization: profile.course_or_specialization || 'Solar PV Systems',
    graduation_year: profile.graduation_year || '2025',
    preferred_learning_method: profile.preferred_learning_method || 'practical_hands_on',
  };
  await AsyncStorage.setItem(STORAGE_KEYS.CACHED_PROFILE, JSON.stringify(fallback));
  return fallback;
}

export async function setUserSkillsApi(
  skills: Array<{ skill_id: string; proficiency_level: 'beginner' | 'intermediate' | 'advanced' }>
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile/skills`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify({ skills }),
    });
    return res.ok;
  } catch (_e) {
    return false;
  }
}

export async function setUserInterestsApi(interestIds: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile/interests`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify({ interest_ids: interestIds }),
    });
    return res.ok;
  } catch (_e) {
    return false;
  }
}

// ----------------------------------------------------
// Assessment & Recommendation APIs
// ----------------------------------------------------

export async function fetchAssessmentQuestions(lang = 'en', section?: string): Promise<ApiAssessmentQuestion[]> {
  try {
    const url = new URL(`${API_BASE_URL}/assessments/questions`);
    url.searchParams.set('lang', lang);
    if (section) url.searchParams.set('section', section);

    const res = await fetch(url.toString(), {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (_e) {}

  return getFallbackAssessmentQuestions(lang, section);
}

export async function submitAssessmentResponses(
  responses: Array<{
    question_id: string;
    selected_option_ids: string[];
    rating_value?: string | null;
    text_response?: string | null;
  }>
): Promise<{ success: boolean; data?: any }> {
  const res = await fetch(`${API_BASE_URL}/assessments/responses`, {
    method: 'POST',
    headers: await getAuthHeader(),
    body: JSON.stringify({ responses }),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || `Assessment submission failed (${res.status})`);
  }
  return { success: true, data: result.data };
}

export async function fetchUserAssessmentResponses(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/responses`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (_e) {}

  const raw = await AsyncStorage.getItem('@margdarshak_offline_responses');
  return raw ? [JSON.parse(raw)] : [];
}

export async function fetchRecommendations(lang = 'en'): Promise<ApiRecommendation[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations?lang=${lang}`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_RECOMMENDATIONS, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (_e) {}

  const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_RECOMMENDATIONS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_e) {}
  }

  return getFallbackRecommendations(lang);
}

export async function generateRecommendations(lang = 'en', payload?: any): Promise<ApiRecommendation[]> {
  try {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/recommendations/generate?lang=${lang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_RECOMMENDATIONS, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (_e) {}

  return fetchRecommendations(lang);
}

export async function fetchRoadmapProgress(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/roadmaps/progress`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (_e) {}

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  return raw ? JSON.parse(raw) : [];
}

// ----------------------------------------------------
// Admin Content Management APIs
// ----------------------------------------------------

export async function fetchAdminCareers(): Promise<ApiCareer[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/careers`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) return data.data;
    }
  } catch (_e) {}

  // Fallback to standard careers + locally created admin custom careers
  const [standard, customRaw] = await Promise.all([
    fetchCareers('en'),
    AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CUSTOM_CAREERS),
  ]);
  const custom: ApiCareer[] = customRaw ? JSON.parse(customRaw) : [];
  return [...custom, ...standard];
}

export async function createAdminCareer(
  career: Partial<Omit<ApiCareer, 'category'>> & { category?: string | ApiCareer['category'] }
): Promise<ApiCareer> {
  const catObj =
    typeof career.category === 'string'
      ? {
          id: `cat-${career.category}`,
          code: career.category,
          name: career.category.toUpperCase(),
          icon_name: 'Wrench',
        }
      : career.category || {
          id: 'cat-trades',
          code: 'trades',
          name: 'Vocational Trade',
          icon_name: 'Wrench',
        };

  const newCareer: ApiCareer = {
    id: career.id || `c-admin-${Date.now()}`,
    slug: career.slug || `career-${Date.now()}`,
    title: career.title || 'New Vocational Pathway',
    minimum_education: career.minimum_education || '10th Pass',
    estimated_salary_range: career.estimated_salary_range || '₹20,000 - ₹35,000 / month',
    training_duration: career.training_duration || '3 - 6 Months',
    growth_demand: career.growth_demand || 'high',
    is_active: true,
    category: catObj,
    translation: career.translation || {
      title: career.title || 'New Vocational Pathway',
      description: 'Practical certified skill pathway created via Admin Content Manager.',
    },
    skills: career.skills || [],
    resources: career.resources || [],
  };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/careers`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify(newCareer),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (_e) {}

  // Offline resilience
  const customRaw = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CUSTOM_CAREERS);
  const customList: ApiCareer[] = customRaw ? JSON.parse(customRaw) : [];
  customList.unshift(newCareer);
  await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_CUSTOM_CAREERS, JSON.stringify(customList));

  return newCareer;
}

export async function toggleAdminCareer(careerId: string, isActive: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/careers/${careerId}`, {
      method: 'PUT',
      headers: await getAuthHeader(),
      body: JSON.stringify({ is_active: isActive }),
    });
    if (res.ok) return true;
  } catch (_e) {}

  return true;
}

export async function fetchAdminSkills(): Promise<ApiSkillMaster[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/skills`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) return data.data;
    }
  } catch (_e) {}

  try {
    const resMaster = await fetch(`${API_BASE_URL}/profile/skills/master`, {
      headers: await getAuthHeader(),
    });
    if (resMaster.ok) {
      const data = await resMaster.json();
      if (Array.isArray(data.data)) return data.data;
    }
  } catch (_e) {}

  const customRaw = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CUSTOM_SKILLS);
  const custom: ApiSkillMaster[] = customRaw ? JSON.parse(customRaw) : [];

  const defaultSkills: ApiSkillMaster[] = [
    { id: 'sk-1', name: 'Solar PV Installation', category: 'trade', description: 'Mounting arrays, earthing, safety' },
    { id: 'sk-2', name: 'Electrical Inverter Wiring', category: 'trade', description: 'AC/DC cable routing' },
    { id: 'sk-3', name: 'Multimeter & Circuit Testing', category: 'technical', description: 'Continuity & voltage diagnosis' },
    { id: 'sk-4', name: 'Drone Piloting (DGCA)', category: 'technical', description: 'Agricultural spray trajectory' },
    { id: 'sk-5', name: 'HTML & Responsive Web', category: 'technical', description: 'Semantic frontend markup' },
    { id: 'sk-6', name: 'Customer Communication', category: 'soft_skill', description: 'Vernacular customer interaction' },
  ];

  return [...custom, ...defaultSkills];
}

export async function createAdminSkill(skill: Partial<ApiSkillMaster>): Promise<ApiSkillMaster> {
  const newSkill: ApiSkillMaster = {
    id: skill.id || `sk-admin-${Date.now()}`,
    name: skill.name || 'New Technical Skill',
    category: skill.category || 'trade',
    description: skill.description || 'Verified vocational skill standard',
  };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/skills`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify(newSkill),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (_e) {}

  const customRaw = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CUSTOM_SKILLS);
  const customList: ApiSkillMaster[] = customRaw ? JSON.parse(customRaw) : [];
  customList.unshift(newSkill);
  await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_CUSTOM_SKILLS, JSON.stringify(customList));

  return newSkill;
}

export async function fetchAdminOpportunities(): Promise<ApiOpportunity[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/opportunities`, {
      headers: await getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) return data.data;
    }
  } catch (_e) {}

  const [standard, customRaw] = await Promise.all([
    fetchOpportunities('all', 'en'),
    AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CUSTOM_OPPS),
  ]);
  const custom: ApiOpportunity[] = customRaw ? JSON.parse(customRaw) : [];
  return [...custom, ...standard];
}

export async function createAdminOpportunity(opp: Partial<ApiOpportunity>): Promise<ApiOpportunity> {
  const newOpp: ApiOpportunity = {
    id: opp.id || `opp-admin-${Date.now()}`,
    title: opp.title || 'Government Vocational Skilling Scheme',
    ministry_or_agency: opp.ministry_or_agency || 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    category: opp.category || 'skilling',
    financial_benefit: opp.financial_benefit || '100% Free Government Certification & Stipend Support',
    eligibility_criteria: opp.eligibility_criteria || 'Ages 15-45, School/College youth in state',
    portal_url: opp.portal_url || 'https://www.skillindiadigital.gov.in',
    deadline_notice: opp.deadline_notice || 'Rolling Admissions Active',
    is_active: true,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/opportunities`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: JSON.stringify(newOpp),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (_e) {}

  const customRaw = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_CUSTOM_OPPS);
  const customList: ApiOpportunity[] = customRaw ? JSON.parse(customRaw) : [];
  customList.unshift(newOpp);
  await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_CUSTOM_OPPS, JSON.stringify(customList));

  return newOpp;
}

// ----------------------------------------------------
// Fallback Data Fixtures (Questions & Recommendations)
// ----------------------------------------------------

function getFallbackAssessmentQuestions(lang = 'en', section?: string): ApiAssessmentQuestion[] {
  const isTe = lang === 'te';
  const isHi = lang === 'hi';

  const questions: ApiAssessmentQuestion[] = [
    {
      id: 'q-interests-1',
      section: 'interests',
      question_key: 'sector_interests',
      question_text: isTe
        ? 'మీకు ఏ రంగాలపై అత్యంత ఆసక్తి ఉంది?'
        : isHi
        ? 'आपकी किस क्षेत्र में सबसे अधिक रुचि है?'
        : 'Which career sectors spark your curiosity?',
      question_type: 'chips',
      display_order: 1,
      options: [
        { id: 'opt-tech', question_id: 'q-interests-1', option_key: 'technology', option_text: isTe ? 'సాంకేతికత & కంప్యూటర్లు' : isHi ? 'तकनीक और कंप्यूटर' : 'Technology & Computing', subtext: 'Digital apps & IT', display_order: 1 },
        { id: 'opt-elec', question_id: 'q-interests-1', option_key: 'engineering', option_text: isTe ? 'ఇంజనీరింగ్ & మెకానికల్' : isHi ? 'इंजीनियरिंग और मशीनरी' : 'Engineering & Machinery', subtext: 'Solar & Electrical', display_order: 2 },
        { id: 'opt-agri', question_id: 'q-interests-1', option_key: 'agriculture', option_text: isTe ? 'వ్యవసాయం & ఆర్గానిక్ సాగు' : isHi ? 'आधुनिक कृषि और खेती' : 'Modern Agriculture', subtext: 'Drones & Soil health', display_order: 3 },
        { id: 'opt-health', question_id: 'q-interests-1', option_key: 'healthcare', option_text: isTe ? 'ఆరోగ్యం & వైద్య సేవలు' : isHi ? 'स्वास्थ्य और चिकित्सा सेवा' : 'Healthcare & Wellness', subtext: 'Patient care & Pharmacy', display_order: 4 },
      ],
    },
    {
      id: 'q-skills-1',
      section: 'skills',
      question_key: 'core_strengths',
      question_text: isTe
        ? 'మీ నైపుణ్యాలను ఎలా అంచనా వేస్తారు?'
        : isHi
        ? 'आप अपने कौशल का मूल्यांकन कैसे करते हैं?'
        : 'Rate your familiarity with hands-on trade skills:',
      question_type: 'rating',
      display_order: 2,
      options: [
        { id: 'opt-comm', question_id: 'q-skills-1', option_key: 'communication', option_text: isTe ? 'మాట్లాడటం & భావవ్యక్తీకరణ' : isHi ? 'बातचीत और संवाद' : 'Communication & Customer Interaction', display_order: 1 },
        { id: 'opt-prob', question_id: 'q-skills-1', option_key: 'problem_solving', option_text: isTe ? 'సమస్యల పరిష్కారం' : isHi ? 'समस्या समाधान' : 'Practical Troubleshooting', display_order: 2 },
        { id: 'opt-tool', question_id: 'q-skills-1', option_key: 'tools', option_text: isTe ? 'పరికరాల నిర్వహణ' : isHi ? 'उपकरण और वायरिंग' : 'Tools & Equipment Wiring', display_order: 3 },
      ],
    },
    {
      id: 'q-prefs-1',
      section: 'preferences',
      question_key: 'work_environment',
      question_text: isTe
        ? 'మీరు రోజువారీ పని ఎక్కడ చేయడానికి ఇష్టపడతారు?'
        : isHi
        ? 'आप किस तरह के दैनिक माहौल में काम करना पसंद करेंगे?'
        : 'Where do you prefer to carry out your daily work?',
      question_type: 'single_choice',
      display_order: 3,
      options: [
        { id: 'opt-field', question_id: 'q-prefs-1', option_key: 'field_outdoor', option_text: isTe ? 'ఫీల్డ్ మరియు వర్క్‌షాప్' : isHi ? 'खुले मैदान और कार्यशाला' : 'Outdoors, Fields or Workshop', subtext: 'Active movement on-site', display_order: 1 },
        { id: 'opt-office', question_id: 'q-prefs-1', option_key: 'office_desk', option_text: isTe ? 'కార్యాలయం లేదా కంప్యూటర్' : isHi ? 'कार्यालय या कंप्यूटर डेस्क' : 'Indoor Desk or CSC Center', subtext: 'Calm indoor environment', display_order: 2 },
      ],
    },
  ];

  if (section) {
    return questions.filter((q) => q.section === section);
  }
  return questions;
}

function getFallbackRecommendations(lang = 'en'): ApiRecommendation[] {
  const isTe = lang === 'te';
  const isHi = lang === 'hi';

  return [
    {
      id: 'rec-1',
      career_id: 'c-1',
      match_score: 93,
      match_reasons: [
        isTe ? 'ప్రాక్టికల్ ఫీల్డ్ వర్క్ మరియు ఎలక్ట్రికల్ ఆసక్తికి సరిపోతుంది' : isHi ? 'व्यावहारिक फील्ड कार्य और सौर ऊर्जा में रुचि के अनुकूल' : 'Matches practical hands-on and field work preferences',
        isTe ? '10వ / ఐటీఐ అర్హతతో ఉచిత పీఎంకేవీవై శిక్షణ' : isHi ? '10वीं/आईटीआई योग्यता के साथ निःशुल्क पीएमकेवीवाई 4.0 प्रशिक्षण' : 'High regional demand in your district with free PMKVY 4.0 training',
        isTe ? 'పీఎం సూర్య ఘర్ ప్రాజెక్టు ద్వారా అధిక ఉపాధి' : isHi ? 'पीएम सूर्य घर परियोजना से उच्च रोजगार मांग' : 'Direct career pathway with Suryamitra Certification',
      ],
      status: 'active',
      career: {
        id: 'c-1',
        slug: 'solar-technician',
        title: isTe ? 'సోలార్ పివి టెక్నీషియన్' : isHi ? 'सोलर पीवी तकनीशियन' : 'Solar PV Systems Technician',
        minimum_education: '10th Pass / ITI Electrical',
        estimated_salary_range: '₹18,000 - ₹32,000 / month',
        training_duration: '3 - 6 Months',
        growth_demand: 'high',
        category: { id: 'cat-trades', code: 'trades', name: 'Electrical & Clean Energy', icon_name: 'Zap' },
        translation: {
          title: isTe ? 'సోలార్ పివి టెక్నీషియన్' : isHi ? 'सोलर पीवी तकनीशियन' : 'Solar PV Systems Technician',
          description: 'Installs, tests, and maintains rooftop and ground-mounted solar power systems across rural and suburban communities.',
        },
      },
    },
    {
      id: 'rec-2',
      career_id: 'c-2',
      match_score: 87,
      match_reasons: [
        isTe ? 'డిజిటల్ మరియు సమస్య పరిష్కార నైపుణ్యాలకు తగినది' : isHi ? 'डिजिटल और समस्या समाधान कौशल के अनुकूल' : 'Matches digital literacy and problem-solving aptitude',
        isTe ? 'రిమోట్ లేదా స్థానిక CSC సెంటర్ ద్వారా ఉపాధి' : isHi ? 'रिमोट या स्थानीय सीएससी केंद्र से रोजगार' : 'High growth in digital web services and e-governance',
      ],
      status: 'active',
      career: {
        id: 'c-2',
        slug: 'junior-web-developer',
        title: isTe ? 'జూనియర్ వెబ్ డెవలపర్' : isHi ? 'जूनियर वेब डेवलपर' : 'Junior Web Developer',
        minimum_education: '12th Pass / Any Diploma / Graduate',
        estimated_salary_range: '₹22,000 - ₹45,000 / month',
        training_duration: '6 Months',
        growth_demand: 'high',
        category: { id: 'cat-tech', code: 'technical', name: 'Digital & Technology', icon_name: 'Cpu' },
        translation: {
          title: isTe ? 'జూనియర్ వెబ్ డెవలపర్' : isHi ? 'जूनियर वेब डेवलपर' : 'Junior Web Developer',
          description: 'Builds responsive websites, user interfaces and digital catalogs for businesses and e-governance.',
        },
      },
    },
    {
      id: 'rec-3',
      career_id: 'c-3',
      match_score: 84,
      match_reasons: [
        isTe ? 'వ్యవసాయ సాంకేతికత మరియు డ్రోన్ ఆపరేషన్‌లకు సరిపోతుంది' : isHi ? 'कृषि प्रौद्योगिकी और ड्रोन संचालन के अनुकूल' : 'Matches agricultural background with modern drone robotics',
        isTe ? 'కేంద్ర ప్రభుత్వ కిసాన్ డ్రోన్ రాయితీ పథకం' : isHi ? 'किसान ड्रोन सब्सिडी योजना और डीजीसीए प्रमाणन' : 'Fast licensing under DGCA with custom hiring center business potential',
      ],
      status: 'active',
      career: {
        id: 'c-3',
        slug: 'precision-agriculture-operator',
        title: isTe ? 'వ్యవసాయ డ్రోన్ ఆపరేటర్' : isHi ? 'कृषि ड्रोन ऑपरेटर' : 'Agricultural Drone & Smart Tech Operator',
        minimum_education: '10th Pass with DGCA Drone Pilot License',
        estimated_salary_range: '₹25,000 - ₹50,000 / month',
        training_duration: '3 Months',
        growth_demand: 'emerging',
        category: { id: 'cat-agri', code: 'agriculture', name: 'Modern Agriculture', icon_name: 'Sprout' },
        translation: {
          title: isTe ? 'వ్యవసాయ డ్రోన్ ఆపరేటర్' : isHi ? 'कृषि ड्रोन ऑपरेटर' : 'Agricultural Drone & Smart Tech Operator',
          description: 'Pilots DGCA-certified drones for precision pesticide spraying and crop health mapping.',
        },
      },
    },
  ];
}
