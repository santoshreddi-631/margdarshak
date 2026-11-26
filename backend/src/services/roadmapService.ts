import { getAdminClient, getUserClient, isSupabaseConfigured } from '../config/supabase';
import { LanguageCode, Roadmap, RoadmapStep, UserProgress } from '../types';
import { ROADMAPS_DATA } from '../data/roadmapsData';
import { CAREERS_DATA } from '../data/careersData';
import { logger } from '../utils/logger';

// In-memory fallback tracking for dev / test sandbox environments
const devProgressMemory = new Map<string, Map<string, UserProgress>>();

export class RoadmapService {
  /**
   * Resolves a career identifier (legacy c-1/c-2 alias, slug, or UUID) to a canonical career ID
   */
  private isUuid(val?: string | null): boolean {
    return Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
  }

  private resolveCareerId(careerInput: string): string {
    const trimmed = careerInput.trim().toLowerCase();

    // Exact legacy short aliases used in tests and mobile drafts (no substring hijacking)
    const legacyAliasMap: Record<string, string> = {
      'c-1': 'a1000000-0000-0000-0000-000000000001',
      'solar-technician': 'a1000000-0000-0000-0000-000000000001',
      'solar-pv-technician': 'a1000000-0000-0000-0000-000000000001',
      'c-2': 'a1000000-0000-0000-0000-000000000006',
      'frontend-developer': 'a1000000-0000-0000-0000-000000000006',
      'frontend-web-developer': 'a1000000-0000-0000-0000-000000000006',
      'c-3': 'a1000000-0000-0000-0000-000000000023',
      'agriculture-extension-worker': 'a1000000-0000-0000-0000-000000000023',
      electrician: 'a1000000-0000-0000-0000-000000000024',
    };
    if (legacyAliasMap[trimmed]) {
      return legacyAliasMap[trimmed];
    }

    // Match exact UUID or exact slug in seed data
    const matchedSeed = CAREERS_DATA.find(
      (c) => c.id.toLowerCase() === trimmed || c.slug.toLowerCase() === trimmed
    );
    if (matchedSeed) return matchedSeed.id;

    return careerInput.trim();
  }

  /**
   * List all available career roadmaps with localized career titles
   */
  async getRoadmapsList(lang: LanguageCode = 'en') {
    if (isSupabaseConfigured()) {
      try {
        const client = getAdminClient();
        const { data, error } = await client
          .from('roadmaps')
          .select(`
            id,
            career_id,
            title,
            total_stages,
            estimated_duration,
            career:careers (
              slug,
              title,
              translations:career_translations (
                language_code,
                title
              )
            )
          `)
          .order('career_id', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((rm: any) => {
            const c = Array.isArray(rm.career) ? rm.career[0] : rm.career;
            const tr =
              c?.translations?.find((t: any) => t.language_code === lang) ||
              c?.translations?.find((t: any) => t.language_code === 'en');
            return {
              id: rm.id,
              career_id: rm.career_id,
              career_slug: c?.slug,
              career_title: tr?.title || c?.title || rm.title,
              title: rm.title,
              total_stages: rm.total_stages,
              estimated_duration: rm.estimated_duration,
            };
          });
        }
      } catch (err: any) {
        logger.warn('Failed fetching roadmaps list:', err.message);
      }
    }

    return ROADMAPS_DATA.map((rm) => {
      const c = CAREERS_DATA.find((item) => item.id === rm.career_id);
      const tr = c?.translations?.[lang] || c?.translations?.en;
      return {
        id: rm.id,
        career_id: rm.career_id,
        career_slug: c?.slug,
        career_title: tr?.title || c?.title || rm.title,
        title: rm.title,
        total_stages: rm.total_stages,
        estimated_duration: rm.estimated_duration,
      };
    });
  }

  /**
   * Get roadmap for a career tailored dynamically against student's acquired skills.
   * Compares roadmap steps against user_skills, auto-advances mastered steps,
   * and persists initial tailored progress into user_progress.
   */
  async getRoadmapByCareer(
    careerInput: string,
    userId?: string,
    lang: LanguageCode = 'en',
    token?: string
  ): Promise<Roadmap> {
    let careerId = this.resolveCareerId(careerInput);
    logger.info(`Generating roadmap for career: ${careerInput} -> resolved: ${careerId} (user: ${userId || 'guest'})`);

    let rawRoadmap: any = null;
    let rawSteps: any[] = [];
    let dbCareerFallback: any = null;

    // 1. Try loading career & roadmap from Supabase
    if (isSupabaseConfigured()) {
      try {
        const client = getAdminClient();
        if (!this.isUuid(careerId)) {
          const { data: slugCareer } = await client
            .from('careers')
            .select('id, slug, title, training_duration, translations:career_translations(language_code, title, description)')
            .eq('slug', careerId)
            .maybeSingle();
          if (slugCareer?.id) {
            dbCareerFallback = slugCareer;
            careerId = slugCareer.id;
          }
        } else {
          const { data: uuidCareer } = await client
            .from('careers')
            .select('id, slug, title, training_duration, translations:career_translations(language_code, title, description)')
            .eq('id', careerId)
            .maybeSingle();
          if (uuidCareer) {
            dbCareerFallback = uuidCareer;
          }
        }

        if (this.isUuid(careerId)) {
          const { data: rm } = await client
            .from('roadmaps')
            .select('*')
            .or(`career_id.eq.${careerId},id.eq.${careerId}`)
            .maybeSingle();

          if (rm) {
            rawRoadmap = rm;
            const { data: steps } = await client
              .from('roadmap_steps')
              .select('*')
              .eq('roadmap_id', rm.id)
              .order('step_number', { ascending: true });

            if (steps && steps.length > 0) {
              rawSteps = steps;
            }
          }
        }
      } catch (err: any) {
        logger.warn('Failed querying roadmap from Supabase, using seed data:', err.message);
      }
    }

    // 2. If not found in DB, pull from master seed data or synthesize from DB career
    if (!rawRoadmap || rawSteps.length === 0) {
      let seedRoadmap = ROADMAPS_DATA.find((r) => r.career_id === careerId || r.id === careerId);

      if (!seedRoadmap) {
        const careerObj = CAREERS_DATA.find(
          (c) => c.id === careerId || c.slug.toLowerCase() === careerInput.toLowerCase()
        );
        if (careerObj) {
          seedRoadmap =
            ROADMAPS_DATA.find((r) => r.career_id === careerObj.id) ||
            this.synthesizeRoadmapForCareer(careerObj);
        } else if (dbCareerFallback) {
          const trMap: Record<string, any> = {};
          for (const tr of dbCareerFallback.translations || []) {
            trMap[tr.language_code] = tr;
          }
          seedRoadmap = this.synthesizeRoadmapForCareer({
            id: dbCareerFallback.id,
            title: dbCareerFallback.title,
            training_duration: dbCareerFallback.training_duration,
            translations: trMap,
          });
        }
      }

      if (!seedRoadmap) {
        seedRoadmap = ROADMAPS_DATA[0];
      }

      rawRoadmap = {
        id: seedRoadmap.id,
        career_id: seedRoadmap.career_id,
        title: seedRoadmap.title,
        total_stages: seedRoadmap.total_stages,
        estimated_duration: seedRoadmap.estimated_duration,
      };
      rawSteps = seedRoadmap.steps.map((s) => ({
        ...s,
        roadmap_id: seedRoadmap!.id,
      }));
    }

    // Localize roadmap title when non-English translation exists
    if (lang !== 'en') {
      const dbTr = dbCareerFallback?.translations?.find((t: any) => t.language_code === lang);
      const seedTr = !dbTr
        ? CAREERS_DATA.find((c) => c.id === (rawRoadmap.career_id || careerId))?.translations?.[lang]
        : null;
      const localizedTitle = dbTr?.title || seedTr?.title;
      if (localizedTitle) {
        rawRoadmap = {
          ...rawRoadmap,
          title: lang === 'hi' ? `${localizedTitle} सीखने का रोडमैप` : `${localizedTitle} అభ్యాస మార్గదర్శి`,
        };
      }
    }

    // 3. Dynamic Skill Comparison & Tailoring
    // Gather user's acquired skills and existing progress
    const acquiredSkills: Array<{ name: string; proficiency: string }> = [];
    const userProgressMap = new Map<string, { status: any; completed_at: string | null; notes: string | null }>();

    if (userId) {
      // a. Fetch student's skills from user_skills
      if (isSupabaseConfigured()) {
        try {
          const client = getAdminClient();
          const { data: userSkillsData } = await client
            .from('user_skills')
            .select(`
              proficiency_level,
              skill:skills (
                name
              )
            `)
            .eq('user_id', userId);

          if (userSkillsData) {
            userSkillsData.forEach((us: any) => {
              const skillName = us.skill?.name;
              if (skillName) {
                acquiredSkills.push({
                  name: skillName.toLowerCase().trim(),
                  proficiency: us.proficiency_level || 'intermediate',
                });
              }
            });
          }

          // b. Fetch existing user_progress records (UUID step IDs only)
          const stepIds = rawSteps.map((s) => s.id).filter((id) => this.isUuid(id));
          if (stepIds.length > 0) {
            const { data: progressData } = await client
              .from('user_progress')
              .select('roadmap_step_id, status, completed_at, notes')
              .eq('user_id', userId)
              .in('roadmap_step_id', stepIds);

            if (progressData) {
              progressData.forEach((p: any) => {
                userProgressMap.set(p.roadmap_step_id, {
                  status: p.status,
                  completed_at: p.completed_at,
                  notes: p.notes,
                });
              });
            }
          }
        } catch (e: any) {
          logger.warn('Error fetching user skills or progress from DB:', e.message);
        }
      }

      // Check dev memory progress if empty
      if (userProgressMap.size === 0 && devProgressMemory.has(userId)) {
        const memMap = devProgressMemory.get(userId)!;
        memMap.forEach((p, stepId) => {
          userProgressMap.set(stepId, {
            status: p.status,
            completed_at: p.completed_at || null,
            notes: p.notes || null,
          });
        });
      }
    }

    // 4. Tailor steps by comparing against acquired skills and persist progress
    let firstUncompletedFound = false;
    const recordsToPersist: any[] = [];

    const mappedSteps: RoadmapStep[] = rawSteps.map((s: any, idx: number) => {
      const stepId = s.id;
      let progress = userProgressMap.get(stepId);

      const title =
        (lang === 'hi' && s.title_hi) || (lang === 'te' && s.title_te) || s.title;
      const description =
        (lang === 'hi' && s.description_hi) || (lang === 'te' && s.description_te) || s.description;

      // Extract search string from title, description and objectives
      const stepTextToSearch = [
        s.title || '',
        s.description || '',
        ...(Array.isArray(s.learning_objectives) ? s.learning_objectives : []),
      ]
        .join(' ')
        .toLowerCase();

      // Check for matching skills in student's skill inventory
      const matchedSkill = acquiredSkills.find((skill) =>
        stepTextToSearch.includes(skill.name)
      );

      if (userId && !progress) {
        if (matchedSkill) {
          // Student already knows this skill! Auto-complete this milestone
          const status = matchedSkill.proficiency === 'beginner' ? 'in_progress' : 'completed';
          progress = {
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
            notes: `Tailored: Acquired skill "${matchedSkill.name}" (${matchedSkill.proficiency}) matches milestone`,
          };
          recordsToPersist.push({
            user_id: userId,
            roadmap_step_id: stepId,
            status: progress.status,
            completed_at: progress.completed_at,
            notes: progress.notes,
            updated_at: new Date().toISOString(),
          });
        } else {
          // If no prior match: first non-completed step is in_progress, subsequent are not_started
          const status = !firstUncompletedFound ? 'in_progress' : 'not_started';
          if (!firstUncompletedFound) firstUncompletedFound = true;
          progress = {
            status,
            completed_at: null,
            notes: status === 'in_progress' ? 'Current recommended focus milestone' : null,
          };
          recordsToPersist.push({
            user_id: userId,
            roadmap_step_id: stepId,
            status: progress.status,
            completed_at: null,
            notes: progress.notes,
            updated_at: new Date().toISOString(),
          });
        }
      } else if (!progress) {
        // Unauthenticated guest view
        progress = {
          status: idx === 0 ? 'in_progress' : 'not_started',
          completed_at: null,
          notes: null,
        };
      }

      return {
        id: stepId,
        roadmap_id: s.roadmap_id || rawRoadmap.id,
        step_number: s.step_number || idx + 1,
        title,
        description,
        learning_objectives: Array.isArray(s.learning_objectives) ? s.learning_objectives : [],
        estimated_duration: s.estimated_duration || '4 Weeks',
        resource_links: Array.isArray(s.resource_links) ? s.resource_links : [],
        action_cta: s.action_cta || 'Start Milestone Training',
        schemes_applicable: Array.isArray(s.schemes_applicable) ? s.schemes_applicable : ['PMKVY 4.0'],
        user_progress: progress,
      };
    });

    // 5. Persist initial tailored progress rows into user_progress (UUID step IDs only)
    const uuidRecordsToPersist = recordsToPersist.filter((r) => this.isUuid(r.roadmap_step_id));
    if (userId && recordsToPersist.length > 0) {
      if (isSupabaseConfigured() && uuidRecordsToPersist.length > 0) {
        try {
          const client = token && !token.includes('dev') && !token.includes('mock')
            ? getUserClient(token)
            : getAdminClient();

          await client
            .from('user_progress')
            .upsert(uuidRecordsToPersist, { onConflict: 'user_id,roadmap_step_id' });
          logger.info(`Persisted ${uuidRecordsToPersist.length} tailored progress rows for user ${userId}`);
        } catch (persistErr: any) {
          logger.warn('Failed persisting tailored progress to Supabase:', persistErr.message);
        }
      }

      // Sync memory cache
      let userMem = devProgressMemory.get(userId);
      if (!userMem) {
        userMem = new Map();
        devProgressMemory.set(userId, userMem);
      }
      for (const r of recordsToPersist) {
        userMem.set(r.roadmap_step_id, {
          id: `prog-${r.roadmap_step_id}`,
          user_id: r.user_id,
          roadmap_step_id: r.roadmap_step_id,
          status: r.status,
          notes: r.notes,
          completed_at: r.completed_at,
          updated_at: r.updated_at,
        });
      }
    }

    const completedStages = mappedSteps.filter((s) => s.user_progress?.status === 'completed').length;

    return {
      id: rawRoadmap.id,
      career_id: rawRoadmap.career_id,
      title: rawRoadmap.title,
      total_stages: rawRoadmap.total_stages || mappedSteps.length,
      estimated_duration: rawRoadmap.estimated_duration || '6 Months',
      steps: mappedSteps,
    };
  }

  /**
   * Update student progress on a specific roadmap step
   */
  async updateProgress(
    userId: string,
    roadmapStepId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    notes?: string | null,
    token?: string
  ): Promise<UserProgress> {
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    const updatedAt = new Date().toISOString();

    const fallbackRecord: UserProgress = {
      id: `prog-${Date.now()}`,
      user_id: userId,
      roadmap_step_id: roadmapStepId,
      status,
      notes: notes || null,
      completed_at: completedAt,
      updated_at: updatedAt,
    };

    // Store in dev memory cache
    let userMem = devProgressMemory.get(userId);
    if (!userMem) {
      userMem = new Map();
      devProgressMemory.set(userId, userMem);
    }
    userMem.set(roadmapStepId, fallbackRecord);

    if (!isSupabaseConfigured() || !this.isUuid(roadmapStepId)) {
      return fallbackRecord;
    }

    try {
      const client = token && !token.includes('dev') && !token.includes('mock')
        ? getUserClient(token)
        : getAdminClient();

      const payload = {
        user_id: userId,
        roadmap_step_id: roadmapStepId,
        status,
        notes: notes || null,
        completed_at: completedAt,
        updated_at: updatedAt,
      };

      const { data, error } = await client
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id,roadmap_step_id' })
        .select()
        .single();

      if (!error && data) {
        userMem.set(roadmapStepId, data as UserProgress);
        return data as UserProgress;
      }
    } catch (e: any) {
      logger.warn('Error updating progress in Supabase, using fallback record:', e.message);
    }

    return fallbackRecord;
  }

  /**
   * Get all progress entries for a student across all roadmaps
   */
  async getUserProgress(userId: string, token?: string) {
    if (!isSupabaseConfigured()) {
      const memMap = devProgressMemory.get(userId);
      return memMap ? Array.from(memMap.values()) : [];
    }

    const client = token && !token.includes('dev') && !token.includes('mock')
      ? getUserClient(token)
      : getAdminClient();

    try {
      const { data, error } = await client
        .from('user_progress')
        .select(`
          id,
          user_id,
          roadmap_step_id,
          status,
          notes,
          completed_at,
          updated_at,
          step:roadmap_steps (
            id,
            step_number,
            title,
            roadmap:roadmaps (
              id,
              career_id,
              title,
              career:careers (
                id,
                title,
                slug
              )
            )
          )
        `)
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e: any) {
      logger.warn('Error querying user progress from Supabase:', e.message);
    }

    const memMap = devProgressMemory.get(userId);
    return memMap ? Array.from(memMap.values()) : [];
  }

  /**
   * Synthesize an authentic tailored 5-stage roadmap for any career dynamically
   */
  private synthesizeRoadmapForCareer(career: any): any {
    const title = career.translations?.en?.title || career.title || 'Career Pathway';
    const titleHi = career.translations?.hi?.title || title;
    const titleTe = career.translations?.te?.title || title;
    const desc = career.translations?.en?.description || '';
    const descHi = career.translations?.hi?.description || desc;
    const descTe = career.translations?.te?.description || desc;

    return {
      id: `syn-rm-${career.id}`,
      career_id: career.id,
      title: `Personalized ${title} Learning Pathway`,
      total_stages: 5,
      estimated_duration: career.training_duration || '6 Months',
      steps: [
        {
          id: `syn-step-${career.id}-1`,
          step_number: 1,
          title: `Foundations & Core Principles of ${title}`,
          title_hi: `${titleHi} की बुनियादी अवधारणाएं`,
          title_te: `${titleTe} ప్రాథమిక సూత్రాలు & అవగాహన`,
          description: `Understand the industry fundamentals, core terminology, standards, and introductory knowledge for ${title}.`,
          description_hi: `${titleHi} के बुनियादी सिद्धांत और शब्दावली सीखें।`,
          description_te: `${titleTe} యొక్క ప్రాథమిక భావనలు మరియు పరిభాషను అర్థం చేసుకోండి.`,
          learning_objectives: ['Industry landscape and career prospects', 'Foundational technical concepts', 'Basic safety and operating protocols'],
          estimated_duration: '3 Weeks',
          resource_links: [{ title: 'Skill India Digital Hub', url: 'https://www.skillindiadigital.gov.in', provider: 'SIDH', is_free: true }],
          action_cta: 'Complete foundational orientation assessment',
          schemes_applicable: ['Skill India Digital Hub (SIDH) Free Access'],
        },
        {
          id: `syn-step-${career.id}-2`,
          step_number: 2,
          title: `Core Technical Skills & Hands-On Practice`,
          title_hi: 'प्रमुख तकनीकी कौशल और व्यावहारिक अभ्यास',
          title_te: 'కీలక సాంకేతిక నైపుణ్యాలు & ప్రాక్టికల్ శిక్షణ',
          description: `Master essential tools and methodologies required for ${title}. ${desc}`,
          description_hi: `${titleHi} के लिए आवश्यक तकनीकी कौशल सीखें। ${descHi}`,
          description_te: `${titleTe} కొరకు కావలసిన ముఖ్యమైన సాంకేతిక పరిజ్ఞానం సాధించండి. ${descTe}`,
          learning_objectives: ['Practical hands-on methodology', 'Operating core equipment and software tools', 'Standard operating procedures'],
          estimated_duration: '4 Weeks',
          resource_links: [{ title: 'Bharat Skills Portal', url: 'https://bharatskills.gov.in', provider: 'Bharat Skills', is_free: true }],
          action_cta: 'Build and document a hands-on sample project',
          schemes_applicable: ['PMKVY 4.0 Skilling Grant'],
        },
        {
          id: `syn-step-${career.id}-3`,
          step_number: 3,
          title: `Intermediate Problem Solving & Project Execution`,
          title_hi: 'समस्या निवारण और परियोजना क्रियान्वयन',
          title_te: 'సమస్య పరిష్కార నైపుణ్యాలు & ప్రాజెక్ట్ నిర్వహణ',
          description: `Execute comprehensive real-world scenarios and tackle common failure modes and challenges in ${title}.`,
          description_hi: 'व्यावहारिक परियोजनाओं का निष्पादन और त्रुटियों का समाधान।',
          description_te: 'రియల్ వరల్డ్ ప్రాజెక్ట్‌లను పూర్తి చేయడం మరియు లోపాలను సరిదిద్దడం.',
          learning_objectives: ['Independent troubleshooting', 'Quality inspection and verification', 'Client and workplace collaboration'],
          estimated_duration: '4 Weeks',
          resource_links: [{ title: 'Swayam Free Online Courses', url: 'https://swayam.gov.in', provider: 'Ministry of Education', is_free: true }],
          action_cta: 'Deliver a verified milestone project demonstrating competency',
          schemes_applicable: [],
        },
        {
          id: `syn-step-${career.id}-4`,
          step_number: 4,
          title: `Industry Compliance, Safety & Best Practices`,
          title_hi: 'उद्योग मानक, सुरक्षा और सर्वोत्तम प्रथाएं',
          title_te: 'పరిశ్రమ ప్రమాణాలు, భద్రత & ఉత్తమ విధానాలు',
          description: `Learn state and national compliance codes, workplace safety norms, and professional communication for ${title}.`,
          description_hi: 'सुरक्षा मानक और पेशेवर कार्यप्रणाली का पालन।',
          description_te: 'వృత్తిపరమైన భద్రత మరియు పరిశ్రమ నాణ్యతా ప్రమాణాలు పాటించడం.',
          learning_objectives: ['National Occupational Standards (NOS) compliance', 'Safety and risk prevention', 'Time management and professional ethics'],
          estimated_duration: '3 Weeks',
          resource_links: [{ title: 'National Career Service Portal', url: 'https://www.ncs.gov.in', provider: 'Ministry of Labour', is_free: true }],
          action_cta: 'Review compliance checklist and safety protocols',
          schemes_applicable: [],
        },
        {
          id: `syn-step-${career.id}-5`,
          step_number: 5,
          title: `Apprenticeship, Certification & Job Placement`,
          title_hi: 'अप्रेंटिसशिप, प्रमाणन और नौकरी प्लेसमेंट',
          title_te: 'అప్రెంటిస్‌షిప్, సర్టిఫికేషన్ & ఉద్యోగ అవకాశాలు',
          description: `Complete state/national skill assessment certification, apply for paid apprenticeship under NAPS, and connect with verified employers.`,
          description_hi: 'स्किल काउंसिल प्रमाणन, नैप्स अप्रेंटिसशिप और रोजगार के अवसर।',
          description_te: 'స్కిల్ కౌన్సిల్ పరీక్ష రాసి సర్టిఫికేట్ పొందడం, NAPS అప్రెంటిస్‌షిప్ మరియు ఉద్యోగాలకు దరఖాస్తు.',
          learning_objectives: ['Preparing for sector skill council assessment', 'NAPS 2.0 apprenticeship onboarding', 'Interview preparation and workplace placement'],
          estimated_duration: '3 Weeks',
          resource_links: [
            { title: 'National Apprenticeship Portal (NAPS 2.0)', url: 'https://www.apprenticeshipindia.gov.in', provider: 'MSDE', is_free: true },
            { title: 'National Career Service', url: 'https://www.ncs.gov.in', provider: 'Govt of India', is_free: true },
          ],
          action_cta: 'Apply for 3 verified apprenticeship or junior employment openings',
          schemes_applicable: ['National Apprenticeship Promotion Scheme (NAPS 2.0) with monthly stipend'],
        },
      ],
    };
  }
}

export const roadmapService = new RoadmapService();
