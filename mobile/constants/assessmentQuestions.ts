/**
 * Guided Career Assessment Question Bank & Options
 * Formulated in simple, non-intimidating vernacular-friendly language.
 */

export interface InterestOption {
  id: string;
  title: string;
  titleHi: string;
  titleTe: string;
  description: string;
  examples: string;
}

export interface SkillItem {
  id: string;
  name: string;
  nameHi: string;
  nameTe: string;
  description: string;
}

export interface PreferenceQuestion {
  id: keyof import('@/models/assessment').WorkPreferences;
  title: string;
  description: string;
  options: {
    value: string;
    label: string;
    sublabel: string;
  }[];
}

// SECTION A: INTERESTS
export const INTEREST_FIELDS: InterestOption[] = [
  {
    id: 'technology',
    title: 'Technology & Computing',
    titleHi: 'तकनीक और कंप्यूटर',
    titleTe: 'సాంకేతికత & కంప్యూటర్లు',
    description: 'Working with computers, mobile phones, internet applications, and digital tools.',
    examples: 'Computer operator, mobile repair, coding, data entry, IT support.',
  },
  {
    id: 'agriculture',
    title: 'Modern Agriculture & Farming',
    titleHi: 'आधुनिक कृषि और खेती',
    titleTe: 'వ్యవసాయం & ఆర్గానిక్ సాగు',
    description: 'Crop management, organic farming, soil testing, irrigation, and farm machinery.',
    examples: 'Tractor technician, soil analyst, dairy manager, organic farmer.',
  },
  {
    id: 'engineering',
    title: 'Engineering & Mechanics',
    titleHi: 'इंजीनियरिंग और मशीनरी',
    titleTe: 'ఇంజనీరింగ్ & మెకానికల్ పనులు',
    description: 'Repairing machinery, electrical wiring, motors, welding, and civil construction.',
    examples: 'Electrician, solar installer, motor mechanic, welder, fitter.',
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Wellness',
    titleHi: 'स्वास्थ्य और चिकित्सा सेवा',
    titleTe: 'ఆరోగ్యం & వైద్య సేవలు',
    description: 'Caring for patients, hospital assistance, pharmacy, first aid, and public health.',
    examples: 'Hospital assistant, pharmacy helper, nursing aide, lab assistant.',
  },
  {
    id: 'government_services',
    title: 'Government & Public Services',
    titleHi: 'सरकारी एवं जन सेवा',
    titleTe: 'ప్రభుత్వ & పౌర సేవలు',
    description: 'Serving through state administration, police, postal, railways, and defense services.',
    examples: 'Panchayat secretary, police constable, postal clerk, railway staff.',
  },
  {
    id: 'business',
    title: 'Business, Retail & Banking',
    titleHi: 'व्यापार, दुकान और बैंकिंग',
    titleTe: 'వ్యాపారం & బ్యాంకింగ్ సేవలు',
    description: 'Managing a shop, inventory, retail sales, accounts, micro-finance, and banking services.',
    examples: 'Store manager, banking correspondent (BC), billing clerk, salesman.',
  },
  {
    id: 'education',
    title: 'Education & Community Training',
    titleHi: 'शिक्षा और प्रशिक्षण',
    titleTe: 'విద్య & శిక్షణ',
    description: 'Teaching children, vocational coaching, youth mentoring, and community welfare.',
    examples: 'Primary school teacher, tuition tutor, anganwadi supervisor.',
  },
  {
    id: 'design',
    title: 'Design, Media & Crafts',
    titleHi: 'डिज़ाइन, मीडिया और शिल्पकारी',
    titleTe: 'డిజైన్, మీడియా & కళలు',
    description: 'Creating graphics, tailoring, photography, video editing, and traditional crafts.',
    examples: 'Graphic designer, tailor/dress designer, video editor, artisan.',
  },
  {
    id: 'logistics',
    title: 'Transport, Delivery & Logistics',
    titleHi: 'परिवहन और लॉजिस्टिक्स',
    titleTe: 'రవాణా & డెలివరీ సేవలు',
    description: 'Operating transport vehicles, delivery logistics, warehouse packing, and supply chain.',
    examples: 'Commercial vehicle driver, warehouse coordinator, delivery associate.',
  },
];

// SECTION B: SKILLS
export const SKILLS_ASSESSMENT_LIST: SkillItem[] = [
  {
    id: 'communication',
    name: 'Communication with People',
    nameHi: 'बातचीत और संवाद कौशल',
    nameTe: 'మాట్లాడటం & భావవ్యక్తీకరణ',
    description: 'Explaining ideas clearly to customers, villagers, teachers, or team members.',
  },
  {
    id: 'problem_solving',
    name: 'Problem-Solving & Troubleshooting',
    nameHi: 'समस्या समाधान और जांच',
    nameTe: 'సమస్యల పరిష్కారం',
    description: 'Figuring out why a machine stopped working or finding ways to solve a daily issue.',
  },
  {
    id: 'mathematics',
    name: 'Practical Mathematics & Calculation',
    nameHi: 'व्यावहारिक गणित और हिसाब-किताब',
    nameTe: 'గణితం & లెక్కలు',
    description: 'Measuring lengths, calculating bills, percentages, and basic budgeting.',
  },
  {
    id: 'programming',
    name: 'Digital & Computer Software',
    nameHi: 'डिजिटल और कंप्यूटर का उपयोग',
    nameTe: 'డిజిటల్ & కంప్యూటర్ పరిజ్ఞానం',
    description: 'Using software apps, spreadsheets, smartphone tools, or basic coding.',
  },
  {
    id: 'creativity',
    name: 'Creativity & Visual Design',
    nameHi: 'रचनात्मकता और नया सोचना',
    nameTe: 'సృజనాత్మకత & డిజైనింగ్',
    description: 'Drawing, arranging things neatly, making banners, or coming up with new visual ideas.',
  },
  {
    id: 'leadership',
    name: 'Leadership & Responsibility',
    nameHi: 'नेतृत्व और ज़िम्मेदारी लेना',
    nameTe: 'నాయకత్వం & నిర్వహణ',
    description: 'Guiding others, organizing village/college events, and taking charge of a project.',
  },
  {
    id: 'analytical_thinking',
    name: 'Analytical Thinking & Organization',
    nameHi: 'विश्लेषण और योजना बनाना',
    nameTe: 'విశ్లేషణాత్మక ఆలోచన',
    description: 'Comparing choices carefully, maintaining orderly records, and checking details.',
  },
];

// SECTION C: PREFERENCES
export const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 'teamDynamic',
    title: 'How do you prefer to carry out your work?',
    description: 'Think about how you feel most comfortable getting tasks done.',
    options: [
      {
        value: 'team_collaboration',
        label: 'Working with a Group or Team',
        sublabel: 'Sharing responsibilities, discussing tasks, and cooperating with coworkers.',
      },
      {
        value: 'independent',
        label: 'Working Independently',
        sublabel: 'Focusing on your own assigned tasks with minimal supervision.',
      },
      {
        value: 'flexible',
        label: 'A Mix of Both / Flexible',
        sublabel: 'Comfortable working alone or with a team as the job requires.',
      },
    ],
  },
  {
    id: 'learningStyle',
    title: 'How do you learn new things best?',
    description: 'Choose the learning style that feels easiest and most natural to you.',
    options: [
      {
        value: 'practical_hands_on',
        label: 'Hands-on Practical Training',
        sublabel: 'Learning by doing, touching equipment, assembling, and trial-and-error.',
      },
      {
        value: 'theoretical_conceptual',
        label: 'Reading Books & Classroom Lectures',
        sublabel: 'Understanding concepts, formulas, and written explanations first.',
      },
      {
        value: 'balanced',
        label: 'Combination of Theory & Practice',
        sublabel: 'A short explanation followed by immediate practical exercise.',
      },
    ],
  },
  {
    id: 'workEnvironment',
    title: 'Where would you prefer to work every day?',
    description: 'Select your ideal physical daily work atmosphere.',
    options: [
      {
        value: 'field_outdoor',
        label: 'Outdoors, Fields or Workshop',
        sublabel: 'Active movement, visiting sites, outdoors, or practical machine shop floor.',
      },
      {
        value: 'office_desk',
        label: 'Office, Bank or Indoor Desk',
        sublabel: 'Working indoors at a desk, service counter, bank, or computer workstation.',
      },
      {
        value: 'remote_home',
        label: 'Work from Village / Remote',
        sublabel: 'Working from your home or local village CSC center via computer/phone.',
      },
      {
        value: 'no_preference',
        label: 'Any Environment / Open to All',
        sublabel: 'Willing to adapt to wherever good opportunities are located.',
      },
    ],
  },
  {
    id: 'careerTiming',
    title: 'What is your primary next goal?',
    description: 'Help us understand your immediate timeline.',
    options: [
      {
        value: 'early_employment',
        label: 'Start Earning Soon (Early Employment)',
        sublabel: 'Prefer a short-term certificate (3-6 months) to start earning quickly.',
      },
      {
        value: 'apprenticeship_while_learning',
        label: 'Paid On-Job Apprenticeship',
        sublabel: 'Earn a monthly stipend from government while gaining real work experience.',
      },
      {
        value: 'higher_education_first',
        label: 'Pursue Higher Studies / Degree',
        sublabel: 'Complete a multi-year diploma, bachelor degree, or government exam preparation.',
      },
    ],
  },
];

// SECTION D: EDUCATION & CERTIFICATIONS
export const RELEVANT_SUBJECTS = [
  'Mathematics',
  'Physics & Chemistry',
  'Biology / Life Sciences',
  'Computer Science / IT',
  'Commerce & Accountancy',
  'Social Studies / History',
  'Agriculture & Botany',
  'General High School Studies',
];

export const CERTIFICATION_OPTIONS = [
  { id: 'iti_ncvt', label: 'ITI NCVT / SCVT Certificate', sublabel: 'National/State Council for Vocational Training' },
  { id: 'pmkvy_cert', label: 'PMKVY Skill India Certificate', sublabel: 'National Skill Development Corporation' },
  { id: 'rscit_ccc', label: 'Basic Computer Certificate (CCC / RSCIT)', sublabel: 'Govt recognized basic computer literacy' },
  { id: 'driving_license', label: 'Valid Driving License (2W / 4W / Commercial)', sublabel: 'Transport & field mobility requirement' },
  { id: 'first_aid', label: 'First Aid / CPR Certificate', sublabel: 'Red Cross or St. John Ambulance' },
  { id: 'none', label: 'No Prior Certificates Yet', sublabel: 'Starting fresh - completely fine!' },
];
