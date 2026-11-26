import * as fs from 'fs';
import * as path from 'path';
import { getAdminClient } from '../src/config/supabase';

const INTERESTS_BY_CATEGORY: Record<string, string[]> = {
  renewable_energy: ['renewable_energy', 'electronics', 'technology'],
  modern_agriculture: ['agriculture', 'science', 'entrepreneurship'],
  automotive: ['electronics', 'technology', 'trades'],
  healthcare: ['healthcare', 'science', 'social_work'],
  digital_services: ['technology', 'entrepreneurship', 'social_work'],
  technical: ['technology', 'programming', 'electronics'],
  business: ['business', 'finance', 'entrepreneurship'],
  government_services: ['government_services', 'social_work', 'business'],
  education: ['education', 'social_work', 'creativity'],
  trades: ['trades', 'electronics', 'technology'],
};

function inferRequiredEducation(minEdu: string): '10th_standard' | '12th_standard' | 'degree' {
  const lower = (minEdu || '').toLowerCase();
  if (lower.includes('8th') || lower.includes('10th')) return '10th_standard';
  if (lower.includes('12th')) return '12th_standard';
  if (lower.includes('bachelor') || lower.includes('degree') || lower.includes('b.tech') || lower.includes('b.sc')) {
    return 'degree';
  }
  return '12th_standard';
}

async function syncRecoCareers() {
  const targetPath = path.resolve(__dirname, '../../recommendation-service/app/data/careers.json');
  const existingRaw = fs.existsSync(targetPath) ? JSON.parse(fs.readFileSync(targetPath, 'utf-8')) : [];
  const existingById = new Map<string, any>();
  for (const item of existingRaw) {
    existingById.set(item.id, item);
  }

  const client = getAdminClient();
  const { data: dbCareers, error } = await client
    .from('careers')
    .select(
      `
      id,
      slug,
      title,
      minimum_education,
      estimated_salary_range,
      training_duration,
      growth_demand,
      career_categories ( code ),
      career_translations ( language_code, title, description ),
      career_skills ( importance, skills ( name ) )
    `
    )
    .eq('is_active', true)
    .order('id');

  if (error || !dbCareers) {
    throw new Error(`Failed to fetch careers from Supabase: ${error?.message}`);
  }

  const merged: any[] = [...existingRaw];
  for (const c of dbCareers as any[]) {
    if (existingById.has(c.id)) continue;

    const catCode = c.career_categories?.code || 'trades';
    const reqEdu = inferRequiredEducation(c.minimum_education);
    const translationsMap: Record<string, { title: string; description: string }> = {};
    for (const tr of c.career_translations || []) {
      translationsMap[tr.language_code] = {
        title: tr.title,
        description: tr.description,
      };
    }

    const reqSkills = (c.career_skills || [])
      .filter((s: any) => s.importance === 'required' && s.skills?.name)
      .map((s: any) => ({ name: s.skills.name, importance: 'required', weight: 1.0 }));
    const recSkills = (c.career_skills || [])
      .filter((s: any) => s.importance !== 'required' && s.skills?.name)
      .map((s: any) => ({ name: s.skills.name, importance: 'recommended', weight: 0.6 }));

    merged.push({
      id: c.id,
      slug: c.slug,
      name: c.title,
      category: catCode,
      growth_demand: c.growth_demand || 'steady',
      estimated_salary_range: c.estimated_salary_range,
      training_duration: c.training_duration,
      required_education: reqEdu,
      eligibility_requirements: {
        min_education_level: reqEdu,
        allowed_streams: ['any'],
        mandatory_rules: [
          `Must meet minimum eligibility: ${c.minimum_education}`,
          'Valid verification document or trade certification where required',
        ],
        preferred_qualifications: ['Prior hands-on vocational interest or relevant coursework'],
      },
      required_skills: reqSkills,
      recommended_skills: recSkills,
      matching_interests: INTERESTS_BY_CATEGORY[catCode] || [catCode, 'technology'],
      translations: {
        en: translationsMap.en || { title: c.title, description: '' },
        te: translationsMap.te || translationsMap.en || { title: c.title, description: '' },
        hi: translationsMap.hi || translationsMap.en || { title: c.title, description: '' },
      },
    });
  }

  fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`[OK] Synchronized ${merged.length} careers (kept ${existingRaw.length} existing, added ${merged.length - existingRaw.length} from Supabase) to ${targetPath}`);
}

syncRecoCareers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to sync reco careers:', err);
    process.exit(1);
  });
