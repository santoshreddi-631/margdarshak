import * as fs from 'fs';
import * as path from 'path';
import { CAREERS_DATA } from './data/careersData';

const SKILL_NAME_BY_LEGACY_ID: Record<string, string> = {
  'b1000000-0000-0000-0000-000000000001': 'HTML',
  'b1000000-0000-0000-0000-000000000002': 'CSS',
  'b1000000-0000-0000-0000-000000000003': 'JavaScript',
  'b1000000-0000-0000-0000-000000000004': 'TypeScript',
  'b1000000-0000-0000-0000-000000000005': 'React',
  'b1000000-0000-0000-0000-000000000006': 'React Native',
  'b1000000-0000-0000-0000-000000000007': 'Node.js',
  'b1000000-0000-0000-0000-000000000008': 'Express.js',
  'b1000000-0000-0000-0000-000000000009': 'Python',
  'b1000000-0000-0000-0000-000000000010': 'Java',
  'b1000000-0000-0000-0000-000000000011': 'C',
  'b1000000-0000-0000-0000-000000000012': 'C++',
  'b1000000-0000-0000-0000-000000000013': 'SQL',
  'b1000000-0000-0000-0000-000000000014': 'PostgreSQL',
  'b1000000-0000-0000-0000-000000000015': 'Excel',
  'b1000000-0000-0000-0000-000000000016': 'Data Analysis',
  'b1000000-0000-0000-0000-000000000017': 'Statistics',
  'b1000000-0000-0000-0000-000000000018': 'Networking',
  'b1000000-0000-0000-0000-000000000019': 'Linux',
  'b1000000-0000-0000-0000-000000000020': 'Cybersecurity Fundamentals',
  'b1000000-0000-0000-0000-000000000021': 'Cloud Computing',
  'b1000000-0000-0000-0000-000000000022': 'Git',
  'b1000000-0000-0000-0000-000000000023': 'UI/UX Design',
  'b1000000-0000-0000-0000-000000000024': 'Figma',
  'b1000000-0000-0000-0000-000000000025': 'Digital Marketing',
  'b1000000-0000-0000-0000-000000000026': 'SEO',
  'b1000000-0000-0000-0000-000000000027': 'Accounting',
  'b1000000-0000-0000-0000-000000000028': 'Electrical Fundamentals',
  'b1000000-0000-0000-0000-000000000029': 'Solar Installation',
  'b1000000-0000-0000-0000-000000000030': 'Agriculture Fundamentals',
  'b1000000-0000-0000-0000-000000000031': 'Communication',
  'b1000000-0000-0000-0000-000000000032': 'Problem Solving',
  'b1000000-0000-0000-0000-000000000033': 'Critical Thinking',
  'b1000000-0000-0000-0000-000000000034': 'Creativity',
  'b1000000-0000-0000-0000-000000000035': 'Leadership',
  'b1000000-0000-0000-0000-000000000036': 'Teamwork',
  'b1000000-0000-0000-0000-000000000037': 'Time Management',
  'b1000000-0000-0000-0000-000000000038': 'Adaptability',
  'b1000000-0000-0000-0000-000000000039': 'Analytical Thinking',
  'b1000000-0000-0000-0000-000000000040': 'Decision Making',
};

const CATEGORY_CODE_MAP: Record<string, string> = {
  'c1000000-0000-0000-0000-000000000001': 'renewable_energy',
  'c1000000-0000-0000-0000-000000000002': 'modern_agriculture',
  'c1000000-0000-0000-0000-000000000003': 'automotive',
  'c1000000-0000-0000-0000-000000000004': 'healthcare',
  'c1000000-0000-0000-0000-000000000005': 'digital_services',
  'c1000000-0000-0000-0000-000000000006': 'technical',
  'c1000000-0000-0000-0000-000000000007': 'business',
  'c1000000-0000-0000-0000-000000000008': 'government_services',
  'c1000000-0000-0000-0000-000000000009': 'education',
  'c1000000-0000-0000-0000-000000000010': 'trades',
};

const formatted = CAREERS_DATA.map((c) => {
  const reqSkills = c.skills
    .filter((s) => s.importance === 'required')
    .map((s) => ({
      name: SKILL_NAME_BY_LEGACY_ID[s.skill_id] || 'Core Skill',
      importance: 'required',
      weight: 1.0,
    }));

  const recSkills = c.skills
    .filter((s) => s.importance !== 'required')
    .map((s) => ({
      name: SKILL_NAME_BY_LEGACY_ID[s.skill_id] || 'Advantage Skill',
      importance: 'recommended',
      weight: 0.6,
    }));

  const catCode = CATEGORY_CODE_MAP[c.category_id] || 'technical';

  return {
    id: c.id,
    slug: c.slug,
    name: c.title,
    category: catCode,
    growth_demand: c.growth_demand,
    estimated_salary_range: c.estimated_salary_range,
    training_duration: c.training_duration,
    required_education: c.minimum_education.toLowerCase().includes('10th')
      ? '10th_standard'
      : c.minimum_education.toLowerCase().includes('12th')
      ? '12th_standard'
      : c.minimum_education.toLowerCase().includes('iti')
      ? 'iti'
      : 'degree',
    eligibility_requirements: {
      min_education_level: c.minimum_education,
      allowed_streams: ['any'],
      mandatory_rules: [
        `Must meet minimum eligibility: ${c.minimum_education}`,
        'Valid verification document or trade certification where required',
      ],
      preferred_qualifications: [
        'Prior hands-on vocational interest or relevant coursework',
      ],
    },
    required_skills: reqSkills,
    recommended_skills: recSkills,
    matching_interests: [catCode, 'technology', 'problem_solving'],
    translations: {
      en: {
        title: c.translations.en.title,
        description: c.translations.en.description,
      },
      te: {
        title: c.translations.te.title,
        description: c.translations.te.description,
      },
      hi: {
        title: c.translations.hi.title,
        description: c.translations.hi.description,
      },
    },
  };
});

const targetPath = path.resolve(__dirname, '../../recommendation-service/app/data/careers.json');
fs.writeFileSync(targetPath, JSON.stringify(formatted, null, 2), 'utf-8');
console.log(`[OK] Successfully synchronized ${formatted.length} careers to ${targetPath}`);
