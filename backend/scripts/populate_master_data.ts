import { getAdminClient } from '../src/config/supabase';
import { CAREERS_DATA } from './data/careersData';
import { ROADMAPS_DATA } from './data/roadmapsData';
import { LEARNING_RESOURCES } from './data/resourcesData';
import { OPPORTUNITIES } from './data/opportunitiesData';
import { JOB_PORTALS } from './data/portalsData';

// ====================================================================
// MASTER DATABASE POPULATION SCRIPT (Margdarshak Career Guidance System)
// Researched from Official Government & Industry Sources
// Sources: NCS, NSDC, NPTEL, SWAYAM, myScheme, Jnanabhumi AP, Skill India
// ====================================================================

const client = getAdminClient();

// --------------------------------------------------------------------
// 1. CAREER CATEGORIES (10 CATEGORIES)
// --------------------------------------------------------------------
export const CATEGORIES = [
  { id: 'c1000000-0000-0000-0000-000000000001', code: 'renewable_energy', name: 'Renewable Energy & Clean Tech', name_hi: 'नवीकरणीय ऊर्जा व स्वच्छ तकनीक', name_te: 'పునరుత్పాదక ఇంధనం & క్లీన్ టెక్', icon_name: 'Sun', display_order: 1 },
  { id: 'c1000000-0000-0000-0000-000000000002', code: 'modern_agriculture', name: 'Modern Agriculture & Agri-Tech', name_hi: 'आधुनिक कृषि और एग्री-टेक', name_te: 'ఆధునిక వ్యవసాయం & అగ్రి-టెక్', icon_name: 'Sprout', display_order: 2 },
  { id: 'c1000000-0000-0000-0000-000000000003', code: 'automotive', name: 'Automotive & Electric Vehicles', name_hi: 'ऑटोमोटिव और इलेक्ट्रिक वाहन', name_te: 'ఆటోమోటివ్ & ఎలక్ట్రిక్ వాహనాలు', icon_name: 'Wrench', display_order: 3 },
  { id: 'c1000000-0000-0000-0000-000000000004', code: 'healthcare', name: 'Healthcare & Wellness', name_hi: 'स्वास्थ्य और चिकित्सा सेवाएं', name_te: 'ఆరోగ్యం & వెల్నెస్ సేవలు', icon_name: 'HeartPulse', display_order: 4 },
  { id: 'c1000000-0000-0000-0000-000000000005', code: 'digital_services', name: 'Digital Services & CSC', name_hi: 'डिजिटल सेवाएं व जन सेवा केंद्र', name_te: 'డిజిటల్ సేవలు & సిఎస్సి', icon_name: 'Laptop', display_order: 5 },
  { id: 'c1000000-0000-0000-0000-000000000006', code: 'technical', name: 'Software & Technology', name_hi: 'सॉफ्टवेयर और सूचना प्रौद्योगिकी', name_te: 'సాఫ్ట్‌వేర్ & ఇన్ఫర్మేషన్ టెక్నాలజీ', icon_name: 'Code', display_order: 6 },
  { id: 'c1000000-0000-0000-0000-000000000007', code: 'business', name: 'Business, Finance & Banking', name_hi: 'व्यापार, वित्त और बैंकिंग', name_te: 'వ్యాపారం, ఫైనాన్స్ & బ్యాంకింగ్', icon_name: 'Briefcase', display_order: 7 },
  { id: 'c1000000-0000-0000-0000-000000000008', code: 'government_services', name: 'Government & Public Services', name_hi: 'सरकारी और प्रशासनिक सेवाएं', name_te: 'ప్రభుత్వ & పరిపాలనా సేవలు', icon_name: 'Building2', display_order: 8 },
  { id: 'c1000000-0000-0000-0000-000000000009', code: 'education', name: 'Education & Teaching', name_hi: 'शिक्षा और अध्यापन', name_te: 'విద్య & బోధన', icon_name: 'GraduationCap', display_order: 9 },
  { id: 'c1000000-0000-0000-0000-000000000010', code: 'trades', name: 'Electrical & Industrial Trades', name_hi: 'विद्युत और औद्योगिक व्यवसाय', name_te: 'ఎలక్ట్రికల్ & పారిశ్రామిక వృత్తులు', icon_name: 'Zap', display_order: 10 },
];

// --------------------------------------------------------------------
// 2. NORMALIZED SKILLS (Existing 11 + New 35 = 46 Skills)
// --------------------------------------------------------------------
export const SKILLS = [
  // Preserved Base Skills (from initial seed)
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Electrical Wiring', category: 'trade', description: 'Safe domestic and industrial circuit wiring and testing', name_hi: 'विद्युत वायरिंग (Electrical Wiring)', name_te: 'ఎలక్ట్రికల్ వైరింగ్' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'Multimeter Testing', category: 'trade', description: 'Measuring voltage, current, and circuit continuity', name_hi: 'मल्टीमीटर परीक्षण', name_te: 'మల్టీమీటర్ టెస్టింగ్' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'Solar Panel Mounting', category: 'trade', description: 'Structural installation and alignment of solar PV arrays', name_hi: 'सोलर पैनल स्थापना', name_te: 'సోలార్ ప్యానెల్ మౌంటింగ్' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'Soil pH Testing', category: 'trade', description: 'Sampling and nutrient analysis for crop optimization', name_hi: 'मिट्टी पीएच परीक्षण', name_te: 'నేల పిహెచ్ పరీక్ష' },
  { id: 'b1000000-0000-0000-0000-000000000005', name: 'Drip Irrigation Maintenance', category: 'trade', description: 'Tubing inspection, emitter cleaning, and pump pressure setup', name_hi: 'ड्रिप सिंचाई रखरखाव', name_te: 'డ్రిప్ ఇరిగేషన్ నిర్వహణ' },
  { id: 'b1000000-0000-0000-0000-000000000006', name: 'EV Diagnostic Scanner', category: 'trade', description: 'OBD scanner inspection and fault code clearing for electric vehicles', name_hi: 'ईवी डायग्नोस्टिक स्कैनर', name_te: 'ఇవి డయాగ్నస్టిక్ స్కానర్' },
  { id: 'b1000000-0000-0000-0000-000000000007', name: 'Battery Management Systems', category: 'trade', description: 'Lithium battery cell balance and temperature safety checks', name_hi: 'बैटरी प्रबंधन प्रणाली (BMS)', name_te: 'బ్యాటరీ మేనేజ్‌మెంట్ సిస్టమ్స్' },
  { id: 'b1000000-0000-0000-0000-000000000008', name: 'Patient Vitals Recording', category: 'trade', description: 'Blood pressure, pulse, temperature, and blood glucose check', name_hi: 'रोगी स्वास्थ्य जांच', name_te: 'రోగి ఆరోగ్య పారామితులు' },
  { id: 'b1000000-0000-0000-0000-000000000009', name: 'Digital Data Entry', category: 'digital', description: 'Fast keyboard data input, spreadsheets, and online portal forms', name_hi: 'डिजिटल डेटा प्रविष्टि', name_te: 'డిజిటల్ డేటా ఎంట్రీ' },
  { id: 'b1000000-0000-0000-0000-000000000010', name: 'Customer Communication', category: 'soft', description: 'Clear and respectful customer problem resolution in vernacular', name_hi: 'ग्राहक सेवा संचार', name_te: 'కస్టమర్ కమ్యూనికేషన్' },
  { id: 'b1000000-0000-0000-0000-000000000011', name: 'Problem Solving', category: 'soft', description: 'Analytical diagnosis and structured resolution of issues', name_hi: 'समस्या समाधान (Problem Solving)', name_te: 'సమస్య పరిష్కార నైపుణ్యం' },

  // New Technical / Software Skills
  { id: 'b1000000-0000-0000-0000-000000000101', name: 'HTML', category: 'technical', description: 'Semantic markup and web page structure', name_hi: 'एचटीएमएल (HTML)', name_te: 'హెచ్‌టిఎమ్‌ఎల్ (HTML)' },
  { id: 'b1000000-0000-0000-0000-000000000102', name: 'CSS', category: 'technical', description: 'Web styling, responsive Flexbox and Grid layouts', name_hi: 'सीएसएस (CSS)', name_te: 'సిఎస్‌ఎస్ (CSS)' },
  { id: 'b1000000-0000-0000-0000-000000000103', name: 'JavaScript', category: 'technical', description: 'Core browser scripting, async events, and DOM manipulation', name_hi: 'जावास्क्रिप्ट (JavaScript)', name_te: 'జావాస్క్రిప్ట్ (JavaScript)' },
  { id: 'b1000000-0000-0000-0000-000000000104', name: 'TypeScript', category: 'technical', description: 'Static typed JavaScript for scalable applications', name_hi: 'टाइपस्क्रिप्ट (TypeScript)', name_te: 'టైప్‌స్క్రిప్ట్ (TypeScript)' },
  { id: 'b1000000-0000-0000-0000-000000000105', name: 'React', category: 'technical', description: 'Component architecture, state management, and hooks', name_hi: 'रिएक्ट (React)', name_te: 'రియాక్ట్ (React)' },
  { id: 'b1000000-0000-0000-0000-000000000106', name: 'React Native', category: 'technical', description: 'Cross-platform native mobile application development', name_hi: 'रिएक्ट नेटिव (React Native)', name_te: 'రియాక్ట్ నేటివ్ (React Native)' },
  { id: 'b1000000-0000-0000-0000-000000000107', name: 'Node.js', category: 'technical', description: 'Event-driven server-side JavaScript runtime', name_hi: 'नोड जेएस (Node.js)', name_te: 'నోడ్ జెఎస్ (Node.js)' },
  { id: 'b1000000-0000-0000-0000-000000000108', name: 'Express.js', category: 'technical', description: 'Lightweight REST API backend framework for Node', name_hi: 'एक्सप्रेस जेएस (Express.js)', name_te: 'ఎక్స్‌ప్రెస్ జెఎస్ (Express.js)' },
  { id: 'b1000000-0000-0000-0000-000000000109', name: 'Python', category: 'technical', description: 'General-purpose programming, scripting, and data analysis', name_hi: 'पायथन (Python)', name_te: 'పైథాన్ (Python)' },
  { id: 'b1000000-0000-0000-0000-000000000110', name: 'Java', category: 'technical', description: 'Object-oriented programming for enterprise and Android', name_hi: 'जावा (Java)', name_te: 'జావా (Java)' },
  { id: 'b1000000-0000-0000-0000-000000000111', name: 'C', category: 'technical', description: 'Low-level procedural programming and memory principles', name_hi: 'सी प्रोग्रामिंग (C)', name_te: 'సి ప్రోగ్రామింగ్ (C)' },
  { id: 'b1000000-0000-0000-0000-000000000112', name: 'C++', category: 'technical', description: 'Performance programming, data structures, and algorithms', name_hi: 'सी++ (C++)', name_te: 'సి++ (C++)' },
  { id: 'b1000000-0000-0000-0000-000000000113', name: 'SQL', category: 'technical', description: 'Relational database querying, joins, and indexing', name_hi: 'एसक्यूएल (SQL)', name_te: 'ఎస్క్యుఎల్ (SQL)' },
  { id: 'b1000000-0000-0000-0000-000000000114', name: 'PostgreSQL', category: 'technical', description: 'Advanced open-source relational database management', name_hi: 'पोस्टग्रेएसक्यूएल (PostgreSQL)', name_te: 'పోస్ట్‌గ్రేఎస్క్యుఎల్ (PostgreSQL)' },
  { id: 'b1000000-0000-0000-0000-000000000115', name: 'Excel', category: 'digital', description: 'Spreadsheets, formulas, pivot tables, and VLOOKUP', name_hi: 'माइक्रोसॉफ्ट एक्सेल (Excel)', name_te: 'మైక్రోసాఫ్ట్ ఎక్సెల్ (Excel)' },
  { id: 'b1000000-0000-0000-0000-000000000116', name: 'Data Analysis', category: 'technical', description: 'Cleaning, exploratory analysis, and business metrics', name_hi: 'डेटा विश्लेषण (Data Analysis)', name_te: 'డేటా అనాలిసిస్ (Data Analysis)' },
  { id: 'b1000000-0000-0000-0000-000000000117', name: 'Statistics', category: 'technical', description: 'Probability, hypothesis testing, and regression analysis', name_hi: 'सांख्यिकी (Statistics)', name_te: 'గణాంకాలు (Statistics)' },
  { id: 'b1000000-0000-0000-0000-000000000118', name: 'Networking', category: 'technical', description: 'TCP/IP, DNS, Subnetting, routing, and network diagnostics', name_hi: 'कंप्यूटर नेटवर्किंग (Networking)', name_te: 'కంప్యూటర్ నెట్‌వర్కింగ్ (Networking)' },
  { id: 'b1000000-0000-0000-0000-000000000119', name: 'Linux', category: 'technical', description: 'Command line shell, bash scripting, and permissions', name_hi: 'लिनक्स (Linux)', name_te: 'లైనక్స్ (Linux)' },
  { id: 'b1000000-0000-0000-0000-000000000120', name: 'Cybersecurity Fundamentals', category: 'technical', description: 'Threat detection, access control, firewalls, and encryption', name_hi: 'साइबर सुरक्षा मूल सिद्धांत', name_te: 'సైబర్ సెక్యూరిటీ బేసిక్స్' },
  { id: 'b1000000-0000-0000-0000-000000000121', name: 'Cloud Computing', category: 'technical', description: 'Virtual servers, cloud storage, and IAM security', name_hi: 'क्लाउड कंप्यूटिंग (Cloud Computing)', name_te: 'క్లౌడ్ కంప్యూటింగ్ (Cloud Computing)' },
  { id: 'b1000000-0000-0000-0000-000000000122', name: 'Git', category: 'technical', description: 'Distributed version control, branching, and GitHub workflows', name_hi: 'गिट (Git)', name_te: 'గిట్ (Git)' },
  { id: 'b1000000-0000-0000-0000-000000000123', name: 'UI/UX Design', category: 'technical', description: 'User-centered design principles, wireframing, and usability', name_hi: 'यूआई/यूएक्स डिज़ाइन (UI/UX Design)', name_te: 'యుఐ/యుఎక్స్ డిజైన్ (UI/UX Design)' },
  { id: 'b1000000-0000-0000-0000-000000000124', name: 'Figma', category: 'digital', description: 'Collaborative vector UI design, auto-layout, and prototypes', name_hi: 'फिग्मा (Figma)', name_te: 'ఫిగ్మా (Figma)' },
  { id: 'b1000000-0000-0000-0000-000000000125', name: 'Digital Marketing', category: 'digital', description: 'Content strategy, social media campaigns, and analytics', name_hi: 'डिजिटल मार्केटिंग (Digital Marketing)', name_te: 'డిజిటల్ మార్కెటింగ్ (Digital Marketing)' },
  { id: 'b1000000-0000-0000-0000-000000000126', name: 'SEO', category: 'digital', description: 'Search engine optimization, keyword research, and page rank', name_hi: 'सर्च इंजन ऑप्टिमाइजेशन (SEO)', name_te: 'సెర్చ్ ఇంజిన్ ఆప్టిమైజేషన్ (SEO)' },
  { id: 'b1000000-0000-0000-0000-000000000127', name: 'Accounting', category: 'technical', description: 'Double-entry bookkeeping, Tally, GST, and profit-loss statements', name_hi: 'लेखांकन और टैली (Accounting)', name_te: 'అకౌంటింగ్ & ట్యాలీ (Accounting)' },
  { id: 'b1000000-0000-0000-0000-000000000128', name: 'Electrical Fundamentals', category: 'trade', description: 'Single/three-phase AC/DC theory, earthing, and circuits', name_hi: 'विद्युत मूल सिद्धांत', name_te: 'ఎలక్ట్రికల్ బేసిక్స్' },
  { id: 'b1000000-0000-0000-0000-000000000129', name: 'Solar Installation', category: 'trade', description: 'Solar PV mounting, DC strings, inverter and battery backup', name_hi: 'सोलर पैनल स्थापना', name_te: 'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్' },
  { id: 'b1000000-0000-0000-0000-000000000130', name: 'Agriculture Fundamentals', category: 'trade', description: 'Crop rotation, soil testing, pest management, and drip irrigation', name_hi: 'कृषि मूल सिद्धांत', name_te: 'వ్యవసాయ ప్రాథమిక సూత్రాలు' },

  // Soft Skills
  { id: 'b1000000-0000-0000-0000-000000000131', name: 'Communication', category: 'soft', description: 'Clear verbal and written expression in vernacular and English', name_hi: 'प्रभावी संचार (Communication)', name_te: 'స్పష్టమైన కమ్యూనికేషన్ (సంభాషణ)' },
  { id: 'b1000000-0000-0000-0000-000000000132', name: 'Critical Thinking', category: 'soft', description: 'Objective evaluation of facts and logical evidence', name_hi: 'तार्किक विचार (Critical Thinking)', name_te: 'విమర్శనాత్మక ఆలోచన' },
  { id: 'b1000000-0000-0000-0000-000000000133', name: 'Creativity', category: 'soft', description: 'Inventive approaches to visual, technical, and process design', name_hi: 'रचनात्मकता (Creativity)', name_te: 'సృజనాత్మకత (Creativity)' },
  { id: 'b1000000-0000-0000-0000-000000000134', name: 'Leadership', category: 'soft', description: 'Guiding teammates, setting priorities, and mentoring peers', name_hi: 'नेतृत्व क्षमता (Leadership)', name_te: 'నాయకత్వ లక్షణాలు (Leadership)' },
  { id: 'b1000000-0000-0000-0000-000000000135', name: 'Teamwork', category: 'soft', description: 'Collaborative cooperation and shared responsibility', name_hi: 'टीमवर्क (सहयोग)', name_te: 'సమిష్టి కృషి (Teamwork)' },
  { id: 'b1000000-0000-0000-0000-000000000136', name: 'Time Management', category: 'soft', description: 'Prioritizing tasks and meeting project milestone deadlines', name_hi: 'समय प्रबंधन (Time Management)', name_te: 'సమయ పాలన (Time Management)' },
  { id: 'b1000000-0000-0000-0000-000000000137', name: 'Adaptability', category: 'soft', description: 'Fast learning and flexibility in evolving tool environments', name_hi: 'अनुकूलनशीलता (Adaptability)', name_te: 'సర్దుబాటు తత్వం (Adaptability)' },
  { id: 'b1000000-0000-0000-0000-000000000138', name: 'Analytical Thinking', category: 'soft', description: 'Deconstructing complex workflows into manageable components', name_hi: 'विश्लेषणात्मक सोच', name_te: 'విశ్లేషణాత్మక ఆలోచన' },
  { id: 'b1000000-0000-0000-0000-000000000139', name: 'Decision Making', category: 'soft', description: 'Sound judgment under practical constraints and timelines', name_hi: 'निर्णय लेने की क्षमता', name_te: 'నిర్ణయాత్మక శక్తి' },
];

// Mapping helper for legacy indices used in careersData.ts
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

// --------------------------------------------------------------------
// 3. NORMALIZED INTERESTS (16 INTERESTS)
// --------------------------------------------------------------------
export const INTERESTS = [
  { id: 'e1000000-0000-0000-0000-000000000001', code: 'technology', name: 'Technology & Computing', description: 'Building software, mobile apps, and digital web services', name_hi: 'प्रौद्योगिकी और कम्प्यूटिंग', name_te: 'సాంకేతికత & కంప్యూటింగ్' },
  { id: 'e1000000-0000-0000-0000-000000000002', code: 'programming', name: 'Programming & Logic', description: 'Writing algorithms, automated scripts, and code', name_hi: 'प्रोग्रामिंग और कोडिंग', name_te: 'ప్రోగ్రామింగ్ & కోడింగ్' },
  { id: 'e1000000-0000-0000-0000-000000000003', code: 'science', name: 'Science & Research', description: 'Experimental discovery, scientific principles, and diagnostics', name_hi: 'विज्ञान और अनुसंधान', name_te: 'సైన్స్ & పరిశోధన' },
  { id: 'e1000000-0000-0000-0000-000000000004', code: 'mathematics', name: 'Mathematics & Statistics', description: 'Numbers, quantitative reasoning, and statistical models', name_hi: 'गणित और सांख्यिकी', name_te: 'గణితం & గణాంకాలు' },
  { id: 'e1000000-0000-0000-0000-000000000005', code: 'business', name: 'Business & Management', description: 'Commerce, operations, markets, and entrepreneurship', name_hi: 'व्यापार और प्रबंधन', name_te: 'వ్యాపారం & నిర్వహణ' },
  { id: 'e1000000-0000-0000-0000-000000000006', code: 'finance', name: 'Finance & Accounting', description: 'Banking, investment, budgeting, and financial records', name_hi: 'वित्त और लेखांकन', name_te: 'ఫైనాన్స్ & అకౌంటింగ్' },
  { id: 'e1000000-0000-0000-0000-000000000007', code: 'healthcare', name: 'Healthcare & Wellness', description: 'Public health, community wellbeing, and patient care', name_hi: 'स्वास्थ्य और कल्याण', name_te: 'ఆరోగ్యం & వెల్నెస్' },
  { id: 'e1000000-0000-0000-0000-000000000008', code: 'agriculture', name: 'Agriculture & Rural Development', description: 'Farming, soil science, crop economics, and irrigation', name_hi: 'कृषि और ग्रामीण विकास', name_te: 'వ్యవసాయం & గ్రామీణాభివృద్ధి' },
  { id: 'e1000000-0000-0000-0000-000000000009', code: 'education', name: 'Education & Teaching', description: 'Pedagogy, tutoring, skill instruction, and knowledge sharing', name_hi: 'शिक्षा और अध्यापन', name_te: 'విద్య & బోధనా రంగం' },
  { id: 'e1000000-0000-0000-0000-000000000010', code: 'government_services', name: 'Government & Public Administration', description: 'Civil service, public policy, panchayat, and social welfare', name_hi: 'सरकारी और जनसेवाएं', name_te: 'ప్రభుత్వ పాలన & ప్రజా సేవలు' },
  { id: 'e1000000-0000-0000-0000-000000000011', code: 'design', name: 'Design & Visual Arts', description: 'Graphic layout, user interfaces, branding, and color theory', name_hi: 'डिज़ाइन और दृश्य कला', name_te: 'డిజైన్ & విజువల్ ఆర్ట్స్' },
  { id: 'e1000000-0000-0000-0000-000000000012', code: 'creativity', name: 'Creativity & Storytelling', description: 'Content writing, digital storytelling, and media', name_hi: 'रचनात्मकता और मीडिया', name_te: 'సృజనాత్మకత & కంటెంట్ క్రియేషన్' },
  { id: 'e1000000-0000-0000-0000-000000000013', code: 'entrepreneurship', name: 'Entrepreneurship & Innovation', description: 'Starting independent enterprises and service centers', name_hi: 'उद्यमिता और नवाचार', name_te: 'స్టార్టప్స్ & వ్యవస్థాపకత' },
  { id: 'e1000000-0000-0000-0000-000000000014', code: 'electronics', name: 'Electronics & Hardware', description: 'Circuit boards, testing meters, sensors, and microchips', name_hi: 'इलेक्ट्रॉनिक्स और हार्डवेयर', name_te: 'ఎలక్ట్రానిక్స్ & హార్డ్‌వేర్' },
  { id: 'e1000000-0000-0000-0000-000000000015', code: 'renewable_energy', name: 'Renewable Energy & Solar', description: 'Solar power, clean energy transitions, and green jobs', name_hi: 'नवीकरणीय और सौर ऊर्जा', name_te: 'పునరుత్పాదక & సౌర విద్యుత్' },
  { id: 'e1000000-0000-0000-0000-000000000016', code: 'social_work', name: 'Social Work & Community Impact', description: 'Helping rural families access education, rights, and health', name_hi: 'समाज सेवा और सामुदायिक विकास', name_te: 'సామాజిక సేవ & కమ్యూనిటీ అభివృద్ధి' },
];

export async function runMasterSeed() {
  console.log('--- Starting Margdarshak Master Database Population ---');

  // Step 1: Categories
  console.log('1. Upserting Career Categories...');
  const { error: catErr } = await client.from('career_categories').upsert(CATEGORIES, { onConflict: 'id' });
  if (catErr) throw new Error(`Category upsert error: ${catErr.message}`);
  console.log(`[OK] ${CATEGORIES.length} Career Categories synced`);

  // Step 2: Skills
  console.log('2. Upserting Normalized Skills...');
  const { error: skillErr } = await client.from('skills').upsert(SKILLS, { onConflict: 'id' });
  if (skillErr) throw new Error(`Skill upsert error: ${skillErr.message}`);
  console.log(`[OK] ${SKILLS.length} Normalized Skills synced`);

  // Create Skill Name to ID lookup map
  const { data: dbSkills, error: dbSkillsErr } = await client.from('skills').select('id, name');
  if (dbSkillsErr || !dbSkills) throw new Error('Could not fetch skills for mapping');
  const skillNameToId = new Map<string, string>();
  for (const s of dbSkills) {
    skillNameToId.set(s.name.toLowerCase().trim(), s.id);
  }

  // Step 3: Interests
  console.log('3. Upserting Normalized Interests...');
  const { error: intErr } = await client.from('interests').upsert(INTERESTS, { onConflict: 'id' });
  if (intErr) throw new Error(`Interest upsert error: ${intErr.message}`);
  console.log(`[OK] ${INTERESTS.length} Normalized Interests synced`);

  // Step 4: Careers & Trilingual Translations
  console.log('4. Upserting 20 Careers & Trilingual Translations...');
  for (const c of CAREERS_DATA) {
    const careerRow = {
      id: c.id,
      category_id: c.category_id,
      slug: c.slug,
      title: c.title,
      minimum_education: c.minimum_education,
      estimated_salary_range: c.estimated_salary_range,
      training_duration: c.training_duration,
      growth_demand: c.growth_demand,
      verification_status: c.verification_status,
      source_url: c.source_url,
      official_occupational_code: c.official_occupational_code,
      last_verified_date: c.last_verified_date,
    };

    const { error: cErr } = await client.from('careers').upsert(careerRow, { onConflict: 'id' });
    if (cErr) throw new Error(`Career upsert error for ${c.title}: ${cErr.message}`);

    // Insert EN, TE, HI Translations
    const transRows = [
      { career_id: c.id, language_code: 'en', ...c.translations.en },
      { career_id: c.id, language_code: 'te', ...c.translations.te },
      { career_id: c.id, language_code: 'hi', ...c.translations.hi },
    ];
    const { error: tErr } = await client.from('career_translations').upsert(transRows, { onConflict: 'career_id,language_code' });
    if (tErr) throw new Error(`Career translation upsert error for ${c.title}: ${tErr.message}`);

    // Insert Career Skills Mapping using dynamic name lookup
    if (c.skills && c.skills.length > 0) {
      const skillRows = c.skills.map((s) => {
        const skillName = SKILL_NAME_BY_LEGACY_ID[s.skill_id];
        const resolvedId = (skillName ? skillNameToId.get(skillName.toLowerCase().trim()) : null) || s.skill_id;
        return {
          career_id: c.id,
          skill_id: resolvedId,
          importance: s.importance,
        };
      });
      const { error: csErr } = await client.from('career_skills').upsert(skillRows, { onConflict: 'career_id,skill_id' });
      if (csErr) throw new Error(`Career skill mapping error for ${c.title}: ${csErr.message}`);
    }
  }
  console.log(`[OK] 20 Careers, 60 Translations, and Career-Skill associations synced`);

  // Step 5: Roadmaps and Ordered Steps
  console.log('5. Upserting 10 Career Roadmaps & Detailed Steps...');
  for (const r of ROADMAPS_DATA) {
    const roadmapRow = {
      id: r.id,
      career_id: r.career_id,
      title: r.title,
      total_stages: r.total_stages,
      estimated_duration: r.estimated_duration,
    };
    const { error: rErr } = await client.from('roadmaps').upsert(roadmapRow, { onConflict: 'id' });
    if (rErr) throw new Error(`Roadmap upsert error for ${r.title}: ${rErr.message}`);

    for (const step of r.steps) {
      const stepRow = {
        id: step.id,
        roadmap_id: r.id,
        step_number: step.step_number,
        title: step.title,
        title_hi: step.title_hi,
        title_te: step.title_te,
        description: step.description,
        description_hi: step.description_hi,
        description_te: step.description_te,
        learning_objectives: step.learning_objectives,
        estimated_duration: step.estimated_duration,
        resource_links: step.resource_links,
        action_cta: step.action_cta,
      };
      const { error: sErr } = await client.from('roadmap_steps').upsert(stepRow, { onConflict: 'roadmap_id,step_number' });
      if (sErr) throw new Error(`Roadmap step upsert error for ${step.title}: ${sErr.message}`);
    }
  }
  console.log(`[OK] 10 Roadmaps and 66 Steps synced`);

  // Step 6: Learning Resources
  console.log('6. Upserting Verified Learning Resources...');
  const { error: lrErr } = await client.from('learning_resources').upsert(LEARNING_RESOURCES, { onConflict: 'id' });
  if (lrErr) throw new Error(`Learning resources upsert error: ${lrErr.message}`);
  console.log(`[OK] ${LEARNING_RESOURCES.length} Learning Resources synced`);

  // Step 7: Opportunities & Government Schemes
  console.log('7. Upserting Opportunities & Schemes...');
  const { error: oppErr } = await client.from('opportunities').upsert(OPPORTUNITIES, { onConflict: 'id' });
  if (oppErr) throw new Error(`Opportunities upsert error: ${oppErr.message}`);
  console.log(`[OK] ${OPPORTUNITIES.length} Government Schemes & Opportunities synced`);

  // Step 8: Job Portals Directory
  console.log('8. Upserting Verified Job Portals Directory...');
  const { error: portErr } = await client.from('job_portals').upsert(JOB_PORTALS, { onConflict: 'id' });
  if (portErr) throw new Error(`Job portals upsert error: ${portErr.message}`);
  console.log(`[OK] ${JOB_PORTALS.length} Official Job Portals synced`);

  console.log('========================================================');
  console.log('🎉 MARGDARSHAK DATABASE POPULATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

// Execute when run as main script
runMasterSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal master seed error:', err);
    process.exit(1);
  });
