/**
 * Realistic Vocational and Career Guidance Domain Data
 * Designed for rural youth and learners exploring practical pathways.
 */

export interface CareerItem {
  id: string;
  title: string;
  category: string;
  minEducation: string;
  salaryRange: string;
  duration: string;
  growth: 'High Demand' | 'Steady Growth' | 'Emerging';
  matchPercent?: number;
  description: string;
  skillsRequired: string[];
  schemes: string[];
}

export interface RoadmapMilestone {
  id: string;
  stageNumber: number;
  title: string;
  estimatedTime: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  description: string;
  actionTitle: string;
  schemesApplicable?: string[];
}

export interface SchemeItem {
  id: string;
  name: string;
  ministry: string;
  financialBenefit: string;
  targetAudience: string;
  portalUrl: string;
  category: 'Skilling' | 'Apprenticeship' | 'Self-Employment' | 'Education';
  deadlineNotice?: string;
}

export const MOCK_CAREERS: CareerItem[] = [
  {
    id: 'solar-pv-tech',
    title: 'Solar PV Systems Technician',
    category: 'Renewable Energy',
    minEducation: '10th Pass + ITI / Diploma',
    salaryRange: '₹18,000 - ₹28,000 / month',
    duration: '3 to 6 months training',
    growth: 'High Demand',
    matchPercent: 92,
    description: 'Install, test, and maintain rooftop and agricultural solar pump electrical setups.',
    skillsRequired: ['Basic Electrical Wiring', 'Multimeter Testing', 'Roof Safety Guidelines'],
    schemes: ['Suryamitra Skill Development', 'PM-KUSUM Scheme'],
  },
  {
    id: 'organic-farm-supervisor',
    title: 'Organic Farm & Soil Supervisor',
    category: 'Modern Agriculture',
    minEducation: '10th / 12th Pass',
    salaryRange: '₹16,000 - ₹25,000 / month',
    duration: '4 months practical training',
    growth: 'Emerging',
    matchPercent: 88,
    description: 'Guide farmer clusters in organic certification, bio-fertilizers, and drip irrigation optimization.',
    skillsRequired: ['Soil pH Testing', 'Composting Methods', 'Drip Line Maintenance'],
    schemes: ['Paramparagat Krishi Vikas Yojana (PKVY)', 'PMKSY'],
  },
  {
    id: 'ev-auto-technician',
    title: 'EV Two-Wheeler Service Specialist',
    category: 'Automotive',
    minEducation: '10th Pass + ITI Motor Mechanic',
    salaryRange: '₹20,000 - ₹32,000 / month',
    duration: '6 months certified course',
    growth: 'High Demand',
    matchPercent: 84,
    description: 'Diagnose lithium battery health, electric powertrain wiring, and motor controller sensors.',
    skillsRequired: ['Diagnostic Scanner Usage', 'Battery Management Systems', 'Circuit Schematics'],
    schemes: ['PMKVY 4.0 Automotive Skill Council', 'NAPS Apprentice'],
  },
  {
    id: 'community-health-assistant',
    title: 'Rural Community Health Facilitator',
    category: 'Healthcare & Wellness',
    minEducation: '12th Pass (Any Stream)',
    salaryRange: '₹15,000 - ₹24,000 / month',
    duration: '6 months certificate',
    growth: 'Steady Growth',
    matchPercent: 79,
    description: 'Assist Primary Health Centres (PHC) in immunisation tracking, maternal health records, and basic triage.',
    skillsRequired: ['Vital Signs Recording', 'Digital Health Record Entry', 'First Aid'],
    schemes: ['National Health Mission Skilling', 'Ayushman Bharat Training'],
  },
];

export const MOCK_ROADMAP: RoadmapMilestone[] = [
  {
    id: 'm1',
    stageNumber: 1,
    title: 'Profile & Aptitude Mapping',
    estimatedTime: 'Completed',
    status: 'completed',
    description: 'Assessed basic educational background (10th standard) and interest in electrical & technical trades.',
    actionTitle: 'View Assessment Summary',
  },
  {
    id: 'm2',
    stageNumber: 2,
    title: 'Government Certified Short-Term Course',
    estimatedTime: 'Month 1 - 3 (In Progress)',
    status: 'in_progress',
    description: 'Enrolled in 90-day Suryamitra Solar Technician course at the District ITI training center.',
    actionTitle: 'Check Center Attendance & Module',
    schemesApplicable: ['PMKVY 4.0 - Free Training & Free Assessment'],
  },
  {
    id: 'm3',
    stageNumber: 3,
    title: 'Skill Council Practical Certification',
    estimatedTime: 'Month 4',
    status: 'upcoming',
    description: 'Practical exam on DC inverter wiring, safety protocols, and panel installation inspection.',
    actionTitle: 'Review Practical Exam Checklist',
  },
  {
    id: 'm4',
    stageNumber: 4,
    title: 'Paid On-Job Apprenticeship',
    estimatedTime: 'Month 5 - 10',
    status: 'upcoming',
    description: '6-month industrial apprenticeship under National Apprenticeship Promotion Scheme (NAPS) with monthly stipend.',
    actionTitle: 'Browse District Apprentice Vacancies',
    schemesApplicable: ['NAPS Govt Monthly Stipend Subsidy'],
  },
];

export const MOCK_SCHEMES: SchemeItem[] = [
  {
    id: 'pmkvy-4',
    name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    financialBenefit: '100% Free Training + ₹1,500 Assessment Conveyance',
    targetAudience: 'School/College Dropouts & Unemployed Youth (15-45 yrs)',
    portalUrl: 'https://www.skillindiadigital.gov.in',
    category: 'Skilling',
    deadlineNotice: 'Batches starting next week at 14 District Centres',
  },
  {
    id: 'naps-india',
    name: 'National Apprenticeship Promotion Scheme (NAPS)',
    ministry: 'Directorate General of Training (DGT)',
    financialBenefit: '₹7,000 - ₹12,000/mo Stipend (25% Govt Contribution)',
    targetAudience: 'ITI, Diploma & Class 10/12 certificate holders',
    portalUrl: 'https://www.apprenticeshipindia.gov.in',
    category: 'Apprenticeship',
    deadlineNotice: 'Direct local employer matching open',
  },
  {
    id: 'ddu-gky',
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
    ministry: 'Ministry of Rural Development',
    financialBenefit: 'Residential Training + Uniforms + Guaranteed Placement Support',
    targetAudience: 'Rural youth from low-income families (18-35 yrs)',
    portalUrl: 'http://ddugky.gov.in',
    category: 'Skilling',
  },
  {
    id: 'pm-mudra-shishu',
    name: 'Pradhan Mantri MUDRA Yojana (Shishu)',
    ministry: 'Department of Financial Services',
    financialBenefit: 'Collateral-free micro loans up to ₹50,000 at low interest',
    targetAudience: 'Youth starting micro-repair or service shops',
    portalUrl: 'https://www.mudra.org.in',
    category: 'Self-Employment',
  },
];
