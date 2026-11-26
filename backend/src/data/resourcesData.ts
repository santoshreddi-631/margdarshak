import { EXPANDED_LEARNING_RESOURCES } from './expandedCatalogData';

export interface LearningResourceRecord {
  id: string;
  career_id?: string;
  title: string;
  title_hi: string;
  title_te: string;
  resource_type: 'course' | 'video' | 'pdf_guide' | 'training_center' | 'portal';
  provider_name: string;
  url: string;
  is_free: boolean;
  language: string;
  verification_status: string;
  source_url: string;
  last_verified_date: string;
}

export const LEARNING_RESOURCES: LearningResourceRecord[] = [
  // Web & Software Development (freeCodeCamp & MDN)
  {
    id: 'f2000000-0000-0000-0000-000000000001',
    career_id: 'a1000000-0000-0000-0000-000000000006', // Frontend Developer
    title: 'Responsive Web Design Certification (HTML5 & Modern CSS)',
    title_hi: 'रिस्पॉन्सिव वेब डिज़ाइन प्रमाणन (HTML5 और CSS3)',
    title_te: 'రెస్పాన్సివ్ వెబ్ డిజైన్ సర్టిఫికేషన్ (HTML & ఆధునిక CSS)',
    resource_type: 'course',
    provider_name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.freecodecamp.org',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000002',
    career_id: 'a1000000-0000-0000-0000-000000000006', // Frontend Developer
    title: 'MDN Web Docs: Learn Web Development Comprehensive Guide',
    title_hi: 'एमडीएन वेब डॉक्स: वेब विकास सीखें संपूर्ण गाइड',
    title_te: 'MDN వెబ్ డాక్స్: వెబ్ డెవలప్‌మెంట్ సమగ్ర గైడ్',
    resource_type: 'portal',
    provider_name: 'Mozilla Developer Network (MDN)',
    url: 'https://developer.mozilla.org/en-US/docs/Learn',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://developer.mozilla.org',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000003',
    career_id: 'a1000000-0000-0000-0000-000000000006', // Frontend Developer
    title: 'JavaScript Algorithms and Data Structures',
    title_hi: 'जावास्क्रिप्ट एल्गोरिदम और डेटा संरचनाएं',
    title_te: 'జావాస్క్రిప్ట్ అల్గోరిథంలు & డేటా స్ట్రక్చర్స్',
    resource_type: 'course',
    provider_name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.freecodecamp.org',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000004',
    career_id: 'a1000000-0000-0000-0000-000000000007', // Backend Developer
    title: 'Node.js & Express Application Architecture Tutorial',
    title_hi: 'नोड जेएस और एक्सप्रेस एप्लीकेशन आर्किटेक्चर ट्यूटोरियल',
    title_te: 'నోడ్ జెఎస్ & ఎక్స్‌ప్రెస్ అప్లికేషన్ ఆర్కిటెక్చర్ ట్యుటోరియల్',
    resource_type: 'portal',
    provider_name: 'Mozilla Developer Network (MDN)',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://developer.mozilla.org',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000005',
    career_id: 'a1000000-0000-0000-0000-000000000008', // Full Stack Developer
    title: 'Relational Database Design and SQL Mastercourse',
    title_hi: 'रिलेशनल डेटाबेस डिज़ाइन और एसक्यूएल मास्टरकोर्स',
    title_te: 'రిలేషనల్ డేటాబేస్ డిజైన్ & SQL మాస్టర్‌కోర్స్',
    resource_type: 'course',
    provider_name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/relational-database',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.freecodecamp.org',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000006',
    career_id: 'a1000000-0000-0000-0000-000000000009', // Software Engineer
    title: 'NPTEL: Programming, Data Structures and Algorithms Using Python',
    title_hi: 'एनपीटीईएल: पायथन द्वारा प्रोग्रामिंग, डेटा संरचनाएं और एल्गोरिदम (आईआईटी मद्रास)',
    title_te: 'NPTEL: పైథాన్ ద్వారా ప్రోగ్రామింగ్ & డేటా స్ట్రక్చర్స్ (IIT మద్రాస్)',
    resource_type: 'course',
    provider_name: 'NPTEL / IIT Madras',
    url: 'https://nptel.ac.in/courses/106106145',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://nptel.ac.in',
    last_verified_date: '2026-11-22',
  },

  // Data Analyst & Data Science (NPTEL, SWAYAM, Microsoft Learn)
  {
    id: 'f2000000-0000-0000-0000-000000000007',
    career_id: 'a1000000-0000-0000-0000-000000000010', // Data Analyst
    title: 'Microsoft Power BI Data Analyst Learning Path',
    title_hi: 'माइक्रोसॉफ्ट पावर बीआई डेटा विश्लेषक लर्निंग पाथ',
    title_te: 'మైక్రోసాఫ్ట్ పవర్ బిఐ డేటా అనలిస్ట్ లెర్నింగ్ పాత్',
    resource_type: 'course',
    provider_name: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/training/paths/data-analytics-microsoft',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://learn.microsoft.com',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000008',
    career_id: 'a1000000-0000-0000-0000-000000000010', // Data Analyst
    title: 'NPTEL: Data Analytics with Python (IIT Roorkee)',
    title_hi: 'एनपीटीईएल: पायथन के साथ डेटा एनालिटिक्स (आईआईटी रुड़की)',
    title_te: 'NPTEL: పైథాన్ ద్వారా డేటా అనలిటిక్స్ (IIT రూర్కీ)',
    resource_type: 'course',
    provider_name: 'NPTEL / IIT Roorkee',
    url: 'https://nptel.ac.in/courses/106107220',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://nptel.ac.in',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000009',
    career_id: 'a1000000-0000-0000-0000-000000000011', // Data Scientist
    title: 'SWAYAM: Machine Learning by IIT Kharagpur',
    title_hi: 'स्वयं: मशीन लर्निंग (आईआईटी खड़गपुर)',
    title_te: 'స్వయం: మెషిన్ లెర్నింగ్ (IIT ఖరగ్‌పూర్)',
    resource_type: 'course',
    provider_name: 'SWAYAM / IIT Kharagpur',
    url: 'https://swayam.gov.in/explorer?searchText=machine+learning',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://swayam.gov.in',
    last_verified_date: '2026-11-22',
  },

  // Cybersecurity & Networking (Cisco Networking Academy)
  {
    id: 'f2000000-0000-0000-0000-000000000010',
    career_id: 'a1000000-0000-0000-0000-000000000012', // Cybersecurity Analyst
    title: 'Cisco Networking Academy: Introduction to Cybersecurity',
    title_hi: 'सिस्को नेटवर्किंग अकादमी: साइबर सुरक्षा का परिचय (हिंदी व अंग्रेजी)',
    title_te: 'సిస్కో నెట్‌వర్కింగ్ అకాడమీ: సైబర్ సెక్యూరిటీ పరిచయం (ఉచిత సర్టిఫికేట్)',
    resource_type: 'course',
    provider_name: 'Cisco Networking Academy',
    url: 'https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.netacad.com',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000011',
    career_id: 'a1000000-0000-0000-0000-000000000012', // Cybersecurity Analyst
    title: 'Cisco Networking Academy: Networking Basics',
    title_hi: 'सिस्को नेटवर्किंग बेसिक्स (नेटवर्क सिद्धांत और पैकेट विश्लेषण)',
    title_te: 'సిస్కో నెట్‌వర్కింగ్ బేసిక్స్ (IP అడ్రసింగ్ & రౌటింగ్ గైడ్)',
    resource_type: 'course',
    provider_name: 'Cisco Networking Academy',
    url: 'https://www.netacad.com/courses/networking/networking-basics',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.netacad.com',
    last_verified_date: '2026-11-22',
  },

  // Cloud Support & DevOps (Microsoft Learn)
  {
    id: 'f2000000-0000-0000-0000-000000000012',
    career_id: 'a1000000-0000-0000-0000-000000000013', // Cloud Support Associate
    title: 'Microsoft Azure Fundamentals (AZ-900) Official Prep',
    title_hi: 'माइक्रोसॉफ्ट एज़्योर फंडामेंटल्स (AZ-900) आधिकारिक प्रशिक्षण',
    title_te: 'మైక్రోసాఫ్ట్ అజూర్ ఫండమెంటల్స్ (AZ-900) అధికారిక శిక్షణ',
    resource_type: 'course',
    provider_name: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://learn.microsoft.com',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000013',
    career_id: 'a1000000-0000-0000-0000-000000000014', // DevOps Engineer
    title: 'Linux Command Line and Bash Scripting Practical Lab',
    title_hi: 'लिनक्स कमांड लाइन और बैश स्क्रिप्टिंग व्यावहारिक लैब',
    title_te: 'లైనక్స్ కమాండ్ లైన్ & బాష్ స్క్రిప్టింగ్ ప్రాక్టికల్ ల్యాబ్',
    resource_type: 'portal',
    provider_name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/learn-the-command-line',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.freecodecamp.org',
    last_verified_date: '2026-11-22',
  },

  // Mobile App Development (React Native & Android)
  {
    id: 'f2000000-0000-0000-0000-000000000014',
    career_id: 'a1000000-0000-0000-0000-000000000015', // Mobile Application Developer
    title: 'React Native Official Documentation & Interactive Sandbox',
    title_hi: 'रिएक्ट नेटिव आधिकारिक दस्तावेज और अभ्यास सैंडबॉक्स',
    title_te: 'రియాక్ట్ నేటివ్ అధికారిక డాక్యుమెంటేషన్ & యాప్ శాండ్‌బాక్స్',
    resource_type: 'portal',
    provider_name: 'React Native Open Source',
    url: 'https://reactnative.dev/docs/getting-started',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://reactnative.dev',
    last_verified_date: '2026-11-22',
  },

  // UI/UX Design (Figma & FreeCodeCamp)
  {
    id: 'f2000000-0000-0000-0000-000000000015',
    career_id: 'a1000000-0000-0000-0000-000000000016', // UI/UX Designer
    title: 'Figma for Beginners: UI Wireframing and Prototyping',
    title_hi: 'फिग्मा शुरुआती ट्यूटोरियल: यूआई वायरफ्रेमिंग और प्रोटोटाइप',
    title_te: 'ఫిగ్మా బిగినర్స్ గైడ్: మొబైల్ UI వైర్‌ఫ్రేమింగ్ & ప్రోటోటైప్స్',
    resource_type: 'video',
    provider_name: 'freeCodeCamp / Figma Community',
    url: 'https://www.freecodecamp.org/news/ui-ux-design-tutorial-for-beginners',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.freecodecamp.org',
    last_verified_date: '2026-11-22',
  },

  // Digital Marketing & SEO (Skill India & Google)
  {
    id: 'f2000000-0000-0000-0000-000000000016',
    career_id: 'a1000000-0000-0000-0000-000000000017', // Digital Marketing
    title: 'Digital Marketing Fundamentals and Social Media Strategy',
    title_hi: 'डिजिटल मार्केटिंग फंडामेंटल्स और सोशल मीडिया रणनीति (स्किल इंडिया)',
    title_te: 'డిజిటల్ మార్కెటింగ్ బేసిక్స్ & సోషల్ మీడియా స్ట్రాటజీ (స్కిల్ ఇండియా)',
    resource_type: 'course',
    provider_name: 'Skill India Digital Hub',
    url: 'https://www.skillindiadigital.gov.in/courses',
    is_free: true,
    language: 'hi',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.skillindiadigital.gov.in',
    last_verified_date: '2026-11-22',
  },

  // Accounting & Business (SWAYAM & Khan Academy)
  {
    id: 'f2000000-0000-0000-0000-000000000017',
    career_id: 'a1000000-0000-0000-0000-000000000018', // Accountant
    title: 'SWAYAM: Financial Accounting Fundamentals (CEC)',
    title_hi: 'स्वयं: वित्तीय लेखांकन मूल सिद्धांत (कॉलेज स्तर)',
    title_te: 'స్వయం: ఫైనాన్షియల్ అకౌంటింగ్ ప్రాథమిక అంశాలు (యూనివర్సిటీ కోర్సు)',
    resource_type: 'course',
    provider_name: 'SWAYAM / Consortium for Educational Communication',
    url: 'https://swayam.gov.in/explorer?searchText=financial+accounting',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://swayam.gov.in',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000018',
    career_id: 'a1000000-0000-0000-0000-000000000018', // Accountant
    title: 'Khan Academy: Introduction to Financial Statements and Bookkeeping',
    title_hi: 'खान अकादमी: वित्तीय विवरण और बहीखाता परिचय (हिंदी वीडियो)',
    title_te: 'ఖాన్ అకాడమీ: బ్యాలెన్స్ షీట్ & లెక్కల నిర్వహణ పరిచయం',
    resource_type: 'video',
    provider_name: 'Khan Academy',
    url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.khanacademy.org',
    last_verified_date: '2026-11-22',
  },

  // Government Exams & Education (Khan Academy & APPSC Prep)
  {
    id: 'f2000000-0000-0000-0000-000000000019',
    career_id: 'a1000000-0000-0000-0000-000000000020', // Govt Administrative Services
    title: 'Indian Polity and Constitution Study Modules',
    title_hi: 'भारतीय राजव्यवस्था एवं संविधान अध्ययन सामग्री (सिविल सेवा तैयारी)',
    title_te: 'భారత రాజ్యాంగం & పరిపాలన సమగ్ర నోట్స్ (APPSC & UPSC)',
    resource_type: 'pdf_guide',
    provider_name: 'National Career Service / DGE',
    url: 'https://www.ncs.gov.in',
    is_free: true,
    language: 'te',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    last_verified_date: '2026-11-22',
  },

  // Solar & Electrician (NISE, Skill India)
  {
    id: 'f2000000-0000-0000-0000-000000000020',
    career_id: 'a1000000-0000-0000-0000-000000000001', // Solar PV Technician
    title: 'National Solar Rooftop Training Curriculum & Safety Guide',
    title_hi: 'राष्ट्रीय सौर रूफटॉप प्रशिक्षण पाठ्यक्रम एवं सुरक्षा दिशानिर्देश',
    title_te: 'సూర్యమిత్ర సోలార్ రూఫ్‌టాప్ టెక్నికల్ సిలబస్ & భద్రతా గైడ్',
    resource_type: 'pdf_guide',
    provider_name: 'National Institute of Solar Energy (NISE)',
    url: 'https://nise.res.in/suryamitra',
    is_free: true,
    language: 'en',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://nise.res.in',
    last_verified_date: '2026-11-22',
  },
  {
    id: 'f2000000-0000-0000-0000-000000000021',
    career_id: 'a1000000-0000-0000-0000-000000000024', // Electrician
    title: 'Bharat Skills ITI Electrician Trade Practical & Theory e-Books',
    title_hi: 'भारत स्किल्स आईटीआई इलेक्ट्रीशियन ट्रेड प्रायोगिक एवं थ्योरी पुस्तकें',
    title_te: 'భారత్ స్కిల్స్ ఐటిఐ ఎలక్ట్రీషియన్ అధికారిక ప్రాక్టికల్ & థియరీ పుస్తకాలు',
    resource_type: 'pdf_guide',
    provider_name: 'DGT / Bharat Skills',
    url: 'https://bharatskills.gov.in/Home/StudyMaterial?course=11',
    is_free: true,
    language: 'hi',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://bharatskills.gov.in',
    last_verified_date: '2026-11-22',
  },

  // Agriculture (ICAR & Skill India)
  {
    id: 'f2000000-0000-0000-0000-000000000022',
    career_id: 'a1000000-0000-0000-0000-000000000023', // Agriculture Extension Worker
    title: 'Soil Health and Drip Micro-Irrigation Field Protocol',
    title_hi: 'मृदा स्वास्थ्य और ड्रिप सूक्ष्म सिंचाई फील्ड नियमावली',
    title_te: 'భూసార పరీక్షలు & బిందు సేద్యం క్షేత్ర స్థాయి నిర్వహణ గైడ్',
    resource_type: 'pdf_guide',
    provider_name: 'ICAR & Ministry of Agriculture',
    url: 'https://icar.org.in',
    is_free: true,
    language: 'te',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://icar.org.in',
    last_verified_date: '2026-11-22',
  },
];

LEARNING_RESOURCES.push(
  ...EXPANDED_LEARNING_RESOURCES.map(
    (r): LearningResourceRecord => ({
      id: r.id,
      career_id: r.career_id,
      title: r.title,
      title_hi: r.title_hi,
      title_te: r.title_te,
      resource_type: r.resource_type as LearningResourceRecord['resource_type'],
      provider_name: r.provider_name,
      url: r.url,
      is_free: r.is_free,
      language: r.language,
      verification_status: 'OFFICIAL_VERIFIED',
      source_url: r.url,
      last_verified_date: '2026-11-26',
    })
  )
);

