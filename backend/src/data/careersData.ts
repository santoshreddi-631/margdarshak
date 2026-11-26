import { EXPANDED_CAREERS } from './expandedCatalogData';

export interface CareerSeedItem {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  minimum_education: string;
  estimated_salary_range: string;
  training_duration: string;
  growth_demand: 'high' | 'steady' | 'emerging';
  verification_status: string;
  source_url: string;
  official_occupational_code: string;
  last_verified_date: string;
  translations: {
    en: { title: string; description: string; job_responsibilities: string; pathway_summary: string };
    te: { title: string; description: string; job_responsibilities: string; pathway_summary: string };
    hi: { title: string; description: string; job_responsibilities: string; pathway_summary: string };
  };
  skills: Array<{ skill_id: string; importance: 'required' | 'recommended' | 'optional' }>;
}

export const CAREERS_DATA: CareerSeedItem[] = [
  // 1. Frontend Developer
  {
    id: 'a1000000-0000-0000-0000-000000000006',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    minimum_education: '12th Pass / Diploma / Degree (Any Stream)',
    estimated_salary_range: '₹25,000 - ₹55,000 / month (Entry-level in India)',
    training_duration: '6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2513.0101 (Web Developer)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Frontend Developer',
        description: 'Builds interactive, user-facing web and mobile browser experiences using HTML, CSS, JavaScript, and React.',
        job_responsibilities: 'Translating UI wireframes into responsive web pages, integrating backend REST APIs, optimizing mobile performance, and testing browser compatibility.',
        pathway_summary: 'Self-study / Diploma -> HTML/CSS/JS -> React -> Build GitHub portfolio projects -> Junior Web Developer internship.',
      },
      te: {
        title: 'ఫ్రంటెండ్ డెవలపర్ (Frontend Developer)',
        description: 'హెచ్‌టిఎమ్‌ఎల్ (HTML), సిఎస్‌ఎస్ (CSS), జావాస్క్రిప్ట్ మరియు రియాక్ట్ ఉపయోగించి ఆకర్షణీయమైన వెబ్‌సైట్లు మరియు మొబైల్ వెబ్ ఇంటర్‌ఫేస్‌లను రూపొందించే నిపుణుడు.',
        job_responsibilities: 'UI డిజైన్‌లను రెస్పాన్సివ్ వెబ్ పేజీలుగా మార్చడం, బ్యాకెండ్ API లను అనుసంధానించడం మరియు మొబైల్ పనితీరును వేగవంతం చేయడం.',
        pathway_summary: 'ఇంటర్/డిప్లొమా/డిగ్రీ -> HTML/CSS/JS నైపుణ్యాలు -> React ప్రాక్టీస్ -> గిట్‌హబ్ ప్రాజెక్ట్ పోర్ట్‌ఫోలియో -> జూనియర్ డెవలపర్ ఉద్యోగం.',
      },
      hi: {
        title: 'फ्रंटएंड डेवलपर (Frontend Developer)',
        description: 'एचटीएमएल, सीएसएस, जावास्क्रिप्ट और रिएक्ट का उपयोग करके उपयोगकर्ता के अनुकूल वेबसाइटों और वेब अनुप्रयोगों का निर्माण करता है।',
        job_responsibilities: 'यूआई वायरफ्रेम को रिस्पॉन्सिव वेब पेजों में बदलना, बैकएंड एपीआई को कनेक्ट करना और सभी डिवाइसों पर स्मूथ परफॉर्मेंस सुनिश्चित करना।',
        pathway_summary: '12वीं/डिप्लोमा/डिग्री -> HTML/CSS/JS -> रिएक्ट -> गिटहब पोर्टफोलियो प्रोजेक्ट्स -> जूनियर वेब डेवलपर इंटर्नशिप।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000001', importance: 'required' }, // HTML
      { skill_id: 'b1000000-0000-0000-0000-000000000002', importance: 'required' }, // CSS
      { skill_id: 'b1000000-0000-0000-0000-000000000003', importance: 'required' }, // JavaScript
      { skill_id: 'b1000000-0000-0000-0000-000000000005', importance: 'required' }, // React
      { skill_id: 'b1000000-0000-0000-0000-000000000022', importance: 'required' }, // Git
      { skill_id: 'b1000000-0000-0000-0000-000000000004', importance: 'recommended' }, // TypeScript
      { skill_id: 'b1000000-0000-0000-0000-000000000032', importance: 'recommended' }, // Problem Solving
    ],
  },

  // 2. Backend Developer
  {
    id: 'a1000000-0000-0000-0000-000000000007',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'backend-developer',
    title: 'Backend Developer',
    minimum_education: 'Polytechnic Diploma / B.Sc / BCA / B.Tech',
    estimated_salary_range: '₹28,000 - ₹60,000 / month (Entry-level in India)',
    training_duration: '6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2512.0101 (Software Developer)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Backend Developer',
        description: 'Designs server architectures, secure business logic, and databases that power websites and mobile apps.',
        job_responsibilities: 'Writing RESTful microservices in Node.js/Python, designing PostgreSQL database schemas, implementing authentication, and optimizing database queries.',
        pathway_summary: 'Degree/Diploma -> JavaScript/Python -> Node.js & Express -> PostgreSQL -> Cloud Deployment -> Backend Engineer.',
      },
      te: {
        title: 'బ్యాకెండ్ డెవలపర్ (Backend Developer)',
        description: 'వెబ్‌సైట్లు మరియు మొబైల్ యాప్‌ల వెనుక ఉండే సర్వర్ సిస్టమ్‌లు, డేటాబేస్‌లు మరియు సెక్యూరిటీ లాజిక్‌ను నిర్మించే నిపుణుడు.',
        job_responsibilities: 'Node.js లేదా Python లలో REST API లను రూపొందించడం, PostgreSQL డేటాబేస్ పట్టికలను డిజైన్ చేయడం మరియు యూజర్ డేటా భద్రతను కాపాడటం.',
        pathway_summary: 'డిగ్రీ/డిప్లొమా -> Python/JavaScript -> Node.js & Express -> డేటాబేస్ మేనేజ్‌మెంట్ -> సర్వర్ డిప్లాయ్‌మెంట్ -> బ్యాకెండ్ ఇంజనీర్.',
      },
      hi: {
        title: 'बैकएंड डेवलपर (Backend Developer)',
        description: 'वेबसाइटों और ऐप्स को शक्ति देने वाले सर्वर, डेटाबेस और व्यावसायिक तर्क (Business Logic) का निर्माण और रखरखाव करता है।',
        job_responsibilities: 'Node.js या Python में REST API लिखना, PostgreSQL डेटाबेस स्कीमा बनाना, ऑथेंटिकेशन लागू करना और सर्वर स्पीड को तेज करना।',
        pathway_summary: 'डिग्री/डिप्लोमा -> JavaScript/Python -> Node.js & Express -> PostgreSQL -> क्लाउड डिप्लॉयमेंट -> बैकएंड इंजीनियर।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000007', importance: 'required' }, // Node.js
      { skill_id: 'b1000000-0000-0000-0000-000000000008', importance: 'required' }, // Express.js
      { skill_id: 'b1000000-0000-0000-0000-000000000013', importance: 'required' }, // SQL
      { skill_id: 'b1000000-0000-0000-0000-000000000014', importance: 'required' }, // PostgreSQL
      { skill_id: 'b1000000-0000-0000-0000-000000000022', importance: 'required' }, // Git
      { skill_id: 'b1000000-0000-0000-0000-000000000009', importance: 'recommended' }, // Python
      { skill_id: 'b1000000-0000-0000-0000-000000000019', importance: 'recommended' }, // Linux
    ],
  },

  // 3. Full Stack Developer
  {
    id: 'a1000000-0000-0000-0000-000000000008',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    minimum_education: 'Polytechnic Diploma / B.Sc / BCA / B.Tech',
    estimated_salary_range: '₹30,000 - ₹70,000 / month (Entry-level in India)',
    training_duration: '8 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2513.0101',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Full Stack Developer',
        description: 'End-to-end software creator proficient in both frontend user interfaces and backend server architecture.',
        job_responsibilities: 'Developing full web apps from React frontend to Node.js backend, managing databases, deploying to cloud servers, and maintaining systems.',
        pathway_summary: 'HTML/CSS/JS -> React -> Node.js & Express -> PostgreSQL -> Docker & Cloud -> End-to-end Portfolio Applications.',
      },
      te: {
        title: 'ఫుల్ స్టాక్ డెవలపర్ (Full Stack Developer)',
        description: 'ఫ్రంటెండ్ మరియు బ్యాకెండ్ రెండింటినీ సమగ్రంగా అభివృద్ధి చేయగల పూర్తి స్థాయి సాఫ్ట్‌వేర్ నిపుణుడు.',
        job_responsibilities: 'పూర్తి స్థాయి వెబ్ యాప్‌లను నిర్మించడం, రియాక్ట్ యూజర్ ఇంటర్‌ఫేస్ మరియు నోడ్ బ్యాకెండ్ సర్వర్లను సమన్వయం చేయడం, క్లౌడ్‌లో హోస్ట్ చేయడం.',
        pathway_summary: 'HTML/CSS/JS -> React -> Node.js -> PostgreSQL -> క్లౌడ్ డిప్లాయ్‌మెంట్ -> ఎండ్-టు-ఎండ్ లైవ్ ప్రాజెక్ట్‌లు.',
      },
      hi: {
        title: 'फुल स्टैक डेवलपर (Full Stack Developer)',
        description: 'फ्रंटएंड यूजर इंटरफेस और बैकएंड सर्वर दोनों में माहिर संपूर्ण सॉफ्टवेयर निर्माता।',
        job_responsibilities: 'रिएक्ट फ्रंटएंड से लेकर नोड बैकएंड तक संपूर्ण वेब एप्लिकेशन बनाना, डेटाबेस संभालना और क्लाउड पर तैनात करना।',
        pathway_summary: 'HTML/CSS/JS -> रिएक्ट -> नोड.जेएस -> पोस्टग्रेएसक्यूएल -> क्लाउड होस्टिंग -> एंड-टू-एंड प्रोजेक्ट पोर्टफोलियो।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000001', importance: 'required' }, // HTML
      { skill_id: 'b1000000-0000-0000-0000-000000000002', importance: 'required' }, // CSS
      { skill_id: 'b1000000-0000-0000-0000-000000000003', importance: 'required' }, // JavaScript
      { skill_id: 'b1000000-0000-0000-0000-000000000005', importance: 'required' }, // React
      { skill_id: 'b1000000-0000-0000-0000-000000000007', importance: 'required' }, // Node.js
      { skill_id: 'b1000000-0000-0000-0000-000000000014', importance: 'required' }, // PostgreSQL
      { skill_id: 'b1000000-0000-0000-0000-000000000022', importance: 'required' }, // Git
    ],
  },

  // 4. Software Engineer
  {
    id: 'a1000000-0000-0000-0000-000000000009',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'software-engineer',
    title: 'Software Engineer',
    minimum_education: 'B.E / B.Tech / MCA / BCA / B.Sc Computer Science',
    estimated_salary_range: '₹35,000 - ₹75,000 / month (Campus / Fresher)',
    training_duration: '6 to 12 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2512.0101',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Software Engineer',
        description: 'Applies rigorous engineering principles, data structures, and algorithms to develop reliable, scalable software applications.',
        job_responsibilities: 'Designing core software algorithms, writing unit and integration tests, collaborating in agile teams, and reviewing pull requests.',
        pathway_summary: 'Computer Science degree/courses -> Master DSA in Java/C++/Python -> Open-source contributions -> Technical interview prep.',
      },
      te: {
        title: 'సాఫ్ట్‌వేర్ ఇంజనీర్ (Software Engineer)',
        description: 'కంప్యూటర్ అల్గోరిథంలు, డేటా స్ట్రక్చర్స్ మరియు ఇంజనీరింగ్ సూత్రాలను ఉపయోగించి పెద్ద ఎత్తున పనిచేసే సాఫ్ట్‌వేర్ ప్రోగ్రామ్‌లను అభివృద్ధి చేసే నిపుణుడు.',
        job_responsibilities: 'అల్గోరిథంలను డిజైన్ చేయడం, బగ్స్ సరిదిద్దడం, కోడ్ నాణ్యతా పరీక్షలు నిర్వహించడం మరియు టీమ్‌తో కలిసి పనిచేయడం.',
        pathway_summary: 'కంప్యూటర్ సైన్స్ డిగ్రీ -> డేటా స్ట్రక్చర్స్ & అల్గోరిథమ్స్ (DSA) -> లీట్‌కోడ్ ప్రాక్టీస్ -> ప్రాజెక్ట్‌లు -> సాఫ్ట్‌వేర్ కంపెనీ ఉద్యోగం.',
      },
      hi: {
        title: 'सॉफ्टवेयर इंजीनियर (Software Engineer)',
        description: 'डेटा संरचनाओं और एल्गोरिदम के सिद्धांतों को लागू करके मजबूत और स्केलेबल सॉफ्टवेयर सिस्टम का निर्माण करता है।',
        job_responsibilities: 'सॉफ्टवेयर आर्किटेक्चर डिजाइन करना, कुशल कोड लिखना, बग्स का निवारण करना और कोड रिव्यू करना।',
        pathway_summary: 'कंप्यूटर साइंस डिग्री -> जावा/पायथन में डेटा स्ट्रक्चर्स (DSA) -> कोडिंग टेस्ट तैयारी -> सॉफ्टवेयर इंजीनियर पद।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000010', importance: 'required' }, // Java
      { skill_id: 'b1000000-0000-0000-0000-000000000012', importance: 'required' }, // C++
      { skill_id: 'b1000000-0000-0000-0000-000000000013', importance: 'required' }, // SQL
      { skill_id: 'b1000000-0000-0000-0000-000000000022', importance: 'required' }, // Git
      { skill_id: 'b1000000-0000-0000-0000-000000000032', importance: 'required' }, // Problem Solving
      { skill_id: 'b1000000-0000-0000-0000-000000000039', importance: 'recommended' }, // Analytical Thinking
    ],
  },

  // 5. Data Analyst
  {
    id: 'a1000000-0000-0000-0000-000000000010',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'data-analyst',
    title: 'Data Analyst',
    minimum_education: 'Bachelor Degree (B.Sc, BCA, B.Com, B.Tech, Any Quantitative stream)',
    estimated_salary_range: '₹25,000 - ₹50,000 / month (Entry-level in India)',
    training_duration: '4 to 6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2521.0101 (Database and Data Analyst)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Data Analyst',
        description: 'Transforms raw numbers, customer records, and operational spreadsheets into actionable business insights using SQL, Excel, and Power BI.',
        job_responsibilities: 'Writing SQL queries to extract data, cleaning datasets in Python/Excel, building visual dashboards, and communicating trends to stakeholders.',
        pathway_summary: 'Degree -> Advanced Excel -> SQL Database Querying -> Python for Data Analysis -> Power BI Dashboards -> Junior Data Analyst.',
      },
      te: {
        title: 'డేటా అనలిస్ట్ (Data Analyst)',
        description: 'వ్యాపార సమాచారాన్ని, సంఖ్యలను విశ్లేషించి మేనేజ్‌మెంట్‌కు సరైన నిర్ణయాలు తీసుకోవడానికి నివేదికలు అందించే విశ్లేషకుడు.',
        job_responsibilities: 'ఎక్సెల్ మరియు SQL ద్వారా డేటాను శుద్ధి చేయడం, పవర్ బిఐ డాష్‌బోర్డులను రూపొందించడం మరియు ట్రెండ్స్‌ను గుర్తించడం.',
        pathway_summary: 'ఏదైనా డిగ్రీ -> అడ్వాన్స్‌డ్ ఎక్సెల్ -> SQL నైపుణ్యాలు -> పైథాన్ డేటా అనాలిసిస్ -> పవర్ బిఐ -> డేటా అనలిస్ట్ ఉద్యోగం.',
      },
      hi: {
        title: 'डेटा विश्लेषक (Data Analyst)',
        description: 'व्यावसायिक निर्णय लेने के लिए कच्चे डेटा और स्प्रेडशीट को सार्थक अंतर्दृष्टि और विज़ुअल डैशबोर्ड में परिवर्तित करता है।',
        job_responsibilities: 'डेटा निष्कर्षण के लिए SQL क्वेरी लिखना, एक्सेल में डेटा क्लीनिंग, पावर बीआई में चार्ट और रिपोर्ट तैयार करना।',
        pathway_summary: 'ग्रेजुएशन -> एडवांस्ड एक्सेल -> SQL डेटाबेस -> पायथन -> पावर बीआई डैशबोर्ड -> जूनियर डेटा विश्लेषक।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000015', importance: 'required' }, // Excel
      { skill_id: 'b1000000-0000-0000-0000-000000000013', importance: 'required' }, // SQL
      { skill_id: 'b1000000-0000-0000-0000-000000000016', importance: 'required' }, // Data Analysis
      { skill_id: 'b1000000-0000-0000-0000-000000000017', importance: 'recommended' }, // Statistics
      { skill_id: 'b1000000-0000-0000-0000-000000000009', importance: 'recommended' }, // Python
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'recommended' }, // Communication
    ],
  },

  // 6. Data Scientist
  {
    id: 'a1000000-0000-0000-0000-000000000011',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'data-scientist',
    title: 'Data Scientist',
    minimum_education: 'Bachelor / Master in Computer Science, Math, Stats, or Engineering',
    estimated_salary_range: '₹45,000 - ₹95,000 / month (Entry-level in India)',
    training_duration: '8 to 12 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2521.0101',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Data Scientist',
        description: 'Builds machine learning models, statistical predictors, and predictive AI systems from large datasets.',
        job_responsibilities: 'Training predictive models in Scikit-Learn/TensorFlow, feature engineering, mathematical optimization, and deploying model APIs.',
        pathway_summary: 'Quantitative Degree -> Python & Linear Algebra -> Statistics -> Machine Learning -> Kaggle projects -> Data Scientist.',
      },
      te: {
        title: 'డేటా సైంటిస్ట్ (Data Scientist)',
        description: 'భారీ సమాచారం నుండి మెషిన్ లెర్నింగ్ మరియు ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ (AI) మోడళ్లను నిర్మించి భవిష్యత్ ఫలితాలను అంచనా వేసే నిపుణుడు.',
        job_responsibilities: 'ప్రిడిక్టివ్ అల్గోరిథంలను నిర్మించడం, గణాంక నమూనాలు రూపొందించడం మరియు AI సిస్టమ్‌లను అభివృద్ధి చేయడం.',
        pathway_summary: 'గణితం/కంప్యూటర్ డిగ్రీ -> పైథాన్ -> స్టాటిస్టిక్స్ -> మెషిన్ లెర్నింగ్ -> AI మోడల్స్ -> డేటా సైంటిస్ట్.',
      },
      hi: {
        title: 'डेटा वैज्ञानिक (Data Scientist)',
        description: 'जटिल डेटासेट से भविष्यवाणियां करने के लिए गणितीय मॉडल, मशीन लर्निंग और आर्टिफिशियल इंटेलिजेंस एल्गोरिदम विकसित करता है।',
        job_responsibilities: 'मशीन लर्निंग मॉडल को प्रशिक्षित करना, डेटा प्रीप्रोसेसिंग, प्रेडिक्टिव एल्गोरिदम बनाना और परिणाम विश्लेषण।',
        pathway_summary: 'क्वांटिटेटिव डिग्री -> पायथन और सांख्यिकी -> मशीन लर्निंग -> कैगल प्रोजेक्ट्स -> डेटा साइंटिस्ट।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000009', importance: 'required' }, // Python
      { skill_id: 'b1000000-0000-0000-0000-000000000017', importance: 'required' }, // Statistics
      { skill_id: 'b1000000-0000-0000-0000-000000000016', importance: 'required' }, // Data Analysis
      { skill_id: 'b1000000-0000-0000-0000-000000000013', importance: 'required' }, // SQL
      { skill_id: 'b1000000-0000-0000-0000-000000000039', importance: 'recommended' }, // Analytical Thinking
    ],
  },

  // 7. Cybersecurity Analyst
  {
    id: 'a1000000-0000-0000-0000-000000000012',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    minimum_education: 'Polytechnic Diploma / B.Sc / BCA / B.Tech',
    estimated_salary_range: '₹30,000 - ₹65,000 / month (Entry-level in India)',
    training_duration: '6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2529.0101 (Security Analyst)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Cybersecurity Analyst',
        description: 'Safeguards computer networks, user data, and servers from malicious breaches, malware, phishing, and unauthorized intrusion.',
        job_responsibilities: 'Monitoring security logs (SIEM), conducting vulnerability scans, enforcing password and access policies, and responding to cyber incidents.',
        pathway_summary: 'Networking fundamentals -> Linux shell -> Security+ / CEH basics -> SIEM log analysis -> Security Operations Center (SOC) Analyst.',
      },
      te: {
        title: 'సైబర్ సెక్యూరిటీ అనలిస్ట్ (Cybersecurity Analyst)',
        description: 'కంప్యూటర్ నెట్‌వర్క్‌లు, ప్రభుత్వ మరియు బ్యాంకింగ్ డేటాను సైబర్ దాడులు, హ్యాకర్ల నుండి రక్షించే భద్రతా నిపుణుడు.',
        job_responsibilities: 'నెట్‌వర్క్ సెక్యూరిటీని పర్యవేక్షించడం, హ్యాకింగ్ దాడులను అడ్డుకోవడం, భద్రతా నియమాలను అమలు చేయడం.',
        pathway_summary: 'నెట్‌వర్కింగ్ బేసిక్స్ -> లైనక్స్ -> సైబర్ సెక్యూరిటీ కోర్సులు -> సిస్కో సర్టిఫికేషన్ -> SOC సెక్యూరిటీ ఉద్యోగం.',
      },
      hi: {
        title: 'साइबर सुरक्षा विश्लेषक (Cybersecurity Analyst)',
        description: 'कंप्यूटर नेटवर्क, डेटा और सर्वरों को हैकर्स, वायरस और अनधिकृत साइबर हमलों से सुरक्षित रखता है।',
        job_responsibilities: 'नेटवर्क ट्रैफिक की निगरानी, सुरक्षा कमियों की जांच, फायरवॉल प्रबंधन और साइबर घटनाओं का त्वरित समाधान।',
        pathway_summary: 'नेटवर्किंग फंडामेंटल्स -> लिनक्स -> साइबर सुरक्षा मूल सिद्धांत -> एसओसी लैब अभ्यास -> साइबर सुरक्षा विश्लेषक।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000020', importance: 'required' }, // Cybersecurity Fundamentals
      { skill_id: 'b1000000-0000-0000-0000-000000000018', importance: 'required' }, // Networking
      { skill_id: 'b1000000-0000-0000-0000-000000000019', importance: 'required' }, // Linux
      { skill_id: 'b1000000-0000-0000-0000-000000000009', importance: 'recommended' }, // Python
      { skill_id: 'b1000000-0000-0000-0000-000000000033', importance: 'recommended' }, // Critical Thinking
    ],
  },

  // 8. Cloud Support Associate
  {
    id: 'a1000000-0000-0000-0000-000000000013',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'cloud-support-associate',
    title: 'Cloud Support Associate',
    minimum_education: 'Polytechnic Diploma / B.Sc / BCA / B.Tech',
    estimated_salary_range: '₹26,000 - ₹55,000 / month (Entry-level in India)',
    training_duration: '4 to 6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2522.0101 (Network & Systems Administrator)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Cloud Support Associate',
        description: 'Maintains, provisions, and troubleshoots cloud server instances, virtual networks, and databases on AWS, Azure, or Google Cloud.',
        job_responsibilities: 'Deploying virtual machines, configuring storage buckets, monitoring server health alerts, and providing technical support to enterprise teams.',
        pathway_summary: 'Diploma/Degree -> Linux & Networking -> AWS/Azure Fundamentals (AZ-900 / AWS Cloud Practitioner) -> Cloud Support Engineer.',
      },
      te: {
        title: 'క్లౌడ్ సపోర్ట్ అసోసియేట్ (Cloud Support Associate)',
        description: 'AWS, Azure వంటి క్లౌడ్ ప్లాట్‌ఫారమ్‌లలో వర్చువల్ సర్వర్లు, డేటా స్టోరేజ్ మరియు నెట్‌వర్క్ సమస్యలను పరిష్కరించే నిపుణుడు.',
        job_responsibilities: 'క్లౌడ్ సర్వర్లను కాన్ఫిగర్ చేయడం, బ్యాకప్‌లు నిర్వహించడం, సిస్టమ్ సమస్యలను వేగంగా పరిష్కరించడం.',
        pathway_summary: 'డిప్లొమా/డిగ్రీ -> లైనక్స్ & నెట్‌వర్కింగ్ -> AWS లేదా Azure ఫండమెంటల్స్ సర్టిఫికేషన్ -> క్లౌడ్ సపోర్ట్ ఇంజనీర్.',
      },
      hi: {
        title: 'क्लाउड सपोर्ट एसोसिएट (Cloud Support Associate)',
        description: 'AWS, Azure या Google Cloud पर वर्चुअल सर्वर, डेटा स्टोरेज और नेटवर्क का प्रबंधन और तकनीकी समस्याओं का समाधान करता है।',
        job_responsibilities: 'वर्चुअल मशीनें तैनात करना, क्लाउड स्टोरेज कॉन्फ़िगर करना, सिस्टम अलर्ट की निगरानी और तकनीकी सहायता प्रदान करना।',
        pathway_summary: 'डिप्लोमा/डिग्री -> लिनक्स और नेटवर्किंग -> क्लाउड फंडामेंटल्स सर्टिफिकेशन -> क्लाउड सपोर्ट इंजीनियर।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000021', importance: 'required' }, // Cloud Computing
      { skill_id: 'b1000000-0000-0000-0000-000000000019', importance: 'required' }, // Linux
      { skill_id: 'b1000000-0000-0000-0000-000000000018', importance: 'required' }, // Networking
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'recommended' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000032', importance: 'recommended' }, // Problem Solving
    ],
  },

  // 9. DevOps Engineer
  {
    id: 'a1000000-0000-0000-0000-000000000014',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    minimum_education: 'Bachelor Degree in Computer Science, IT or related field',
    estimated_salary_range: '₹35,000 - ₹80,000 / month (Entry-level in India)',
    training_duration: '6 to 9 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2512.0101',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'DevOps Engineer',
        description: 'Bridges software development and IT operations through automated CI/CD pipelines, containerization (Docker), and cloud infrastructure.',
        job_responsibilities: 'Automating build and release pipelines, managing Docker containers, configuring Kubernetes clusters, and monitoring uptime.',
        pathway_summary: 'Linux -> Git -> Docker -> CI/CD pipelines (GitHub Actions) -> Cloud Infrastructure -> DevOps Engineer.',
      },
      te: {
        title: 'డెవ్‌ఆప్స్ ఇంజనీర్ (DevOps Engineer)',
        description: 'సాఫ్ట్‌వేర్ అభివృద్ధి మరియు సర్వర్ కార్యకలాపాలను ఆటోమేటెడ్ పైప్‌లైన్లు మరియు క్లౌడ్ టూల్స్ ద్వారా అనుసంధానించే నిపుణుడు.',
        job_responsibilities: 'ఆటోమేటెడ్ CI/CD పైప్‌లైన్లను రూపొందించడం, డాకర్ కంటైనర్లను నిర్వహించడం, సర్వర్ డౌన్‌టైమ్ లేకుండా చూడటం.',
        pathway_summary: 'లైనక్స్ -> గిట్‌హబ్ యాక్షన్స్ -> డాకర్ కంటైనర్స్ -> క్లౌడ్ ఇన్‌ఫ్రాస్ట్రక్చర్ -> డెవ్‌ఆప్స్ ఇంజనీర్.',
      },
      hi: {
        title: 'डेवऑप्स इंजीनियर (DevOps Engineer)',
        description: 'स्वचालित सीआई/सीडी पाइपलाइन और कंटेनर तकनीक (Docker) के माध्यम से सॉफ्टवेयर डेवलपमेंट और आईटी ऑपरेशन्स को जोड़ता है।',
        job_responsibilities: 'सॉफ्टवेयर रिलीज पाइपलाइन को स्वचालित करना, डॉकर कंटेनरों का प्रबंधन, सर्वर स्थिरता और मॉनिटरिंग।',
        pathway_summary: 'लिनक्स -> गिट -> डॉकर -> सीआई/सीडी पाइपलाइन -> क्लाउड इंफ्रास्ट्रक्चर -> डेवऑप्स इंजीनियर।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000019', importance: 'required' }, // Linux
      { skill_id: 'b1000000-0000-0000-0000-000000000022', importance: 'required' }, // Git
      { skill_id: 'b1000000-0000-0000-0000-000000000021', importance: 'required' }, // Cloud Computing
      { skill_id: 'b1000000-0000-0000-0000-000000000009', importance: 'recommended' }, // Python
      { skill_id: 'b1000000-0000-0000-0000-000000000018', importance: 'recommended' }, // Networking
    ],
  },

  // 10. Mobile Application Developer
  {
    id: 'a1000000-0000-0000-0000-000000000015',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'mobile-app-developer',
    title: 'Mobile Application Developer',
    minimum_education: 'Polytechnic Diploma / BCA / B.Sc / B.Tech',
    estimated_salary_range: '₹26,000 - ₹55,000 / month (Entry-level in India)',
    training_duration: '6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2514.0101 (Applications Programmer)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Mobile Application Developer',
        description: 'Creates native and cross-platform smartphone applications for Android and iOS devices using React Native, Java, or Flutter.',
        job_responsibilities: 'Writing clean mobile code, integrating camera and location hardware, managing offline state, and publishing apps to Google Play Store.',
        pathway_summary: 'JavaScript/Java fundamentals -> React Native / Android Studio -> API integration -> Publish Play Store app -> Mobile App Developer.',
      },
      te: {
        title: 'మొబైల్ యాప్ డెవలపర్ (Mobile Application Developer)',
        description: 'ఆండ్రాయిడ్ మరియు ఐఓఎస్ స్మార్ట్‌ఫోన్ల కోసం సులభంగా పనిచేసే మొబైల్ అప్లికేషన్లను రూపొందించే నిపుణుడు.',
        job_responsibilities: 'మొబైల్ స్క్రీన్లను డిజైన్ చేయడం, ఆఫ్‌లైన్ డేటా స్టోరేజ్ అనుసంధానించడం మరియు గూగుల్ ప్లే స్టోర్‌లో యాప్‌లను పబ్లిష్ చేయడం.',
        pathway_summary: 'జావాస్క్రిప్ట్ -> రియాక్ట్ నేటివ్ -> మొబైల్ API లు -> సొంత యాప్ తయారీ -> గూగుల్ ప్లే స్టోర్ పబ్లిషింగ్ -> యాప్ డెవలపర్.',
      },
      hi: {
        title: 'मोबाइल ऐप डेवलपर (Mobile Application Developer)',
        description: 'स्मार्टफोन के लिए एंड्रॉइड और आईओएस प्लेटफॉर्म पर उच्च गुणवत्ता वाले मोबाइल ऐप का निर्माण करता है।',
        job_responsibilities: 'मोबाइल यूआई स्क्रीन बनाना, फोन हार्डवेयर (कैमरा, जीपीएस) कनेक्ट करना और प्ले स्टोर पर ऐप रिलीज करना।',
        pathway_summary: 'जावास्क्रिप्ट/जावा -> रिएक्ट नेटिव / एंड्रॉइड -> एपीआई इंटीग्रेशन -> प्ले स्टोर पर ऐप पब्लिश -> मोबाइल ऐप डेवलपर।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000006', importance: 'required' }, // React Native
      { skill_id: 'b1000000-0000-0000-0000-000000000003', importance: 'required' }, // JavaScript
      { skill_id: 'b1000000-0000-0000-0000-000000000004', importance: 'recommended' }, // TypeScript
      { skill_id: 'b1000000-0000-0000-0000-000000000022', importance: 'required' }, // Git
      { skill_id: 'b1000000-0000-0000-0000-000000000023', importance: 'recommended' }, // UI/UX Design
    ],
  },

  // 11. UI/UX Designer
  {
    id: 'a1000000-0000-0000-0000-000000000016',
    category_id: 'c1000000-0000-0000-0000-000000000006', // technical
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    minimum_education: '12th Pass / Any Degree / Diploma',
    estimated_salary_range: '₹22,000 - ₹50,000 / month (Entry-level in India)',
    training_duration: '4 to 6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2513.0201 (Web and Multimedia Developer)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'UI/UX Designer',
        description: 'Researches user needs and crafts beautiful, intuitive digital visual interfaces, design systems, and wireframes.',
        job_responsibilities: 'Conducting user research interviews, creating wireframes and interactive prototypes in Figma, and designing design systems.',
        pathway_summary: 'Design theory & typography -> Figma mastery -> Conduct user journey studies -> Complete Behance/Dribbble portfolio -> UI/UX Designer.',
      },
      te: {
        title: 'యుఐ/యుఎక్స్ డిజైనర్ (UI/UX Designer)',
        description: 'డిజిటల్ వెబ్‌సైట్లు మరియు మొబైల్ యాప్‌లను ప్రజలు సులభంగా అర్థం చేసుకునేలా ఆకర్షణీయమైన స్క్రీన్‌లను డిజైన్ చేసే కళాకారుడు/నిపుణుడు.',
        job_responsibilities: 'వినియోగదారుల అవసరాలను పరిశోధించడం, ఫిగ్మా (Figma) లో వైర్‌ఫ్రేమ్‌లు మరియు ప్రోటోటైప్‌లు తయారు చేయడం.',
        pathway_summary: 'డిజైన్ సూత్రాలు -> ఫిగ్మా టూల్ -> యూజర్ రీసెర్చ్ -> పోర్ట్‌ఫోలియో తయారీ (Behance) -> UI/UX డిజైనర్ ఉద్యోగం.',
      },
      hi: {
        title: 'यूआई/यूएक्स डिज़ाइनर (UI/UX Designer)',
        description: 'वेबसाइटों और मोबाइल एप्लिकेशन के लिए उपयोगकर्ता के अनुकूल, सुंदर और सहज दृश्य इंटरफेस और प्रोटोटाइप डिजाइन करता है।',
        job_responsibilities: 'यूजर रिसर्च करना, फिग्मा में वायरफ्रेम और प्रोटोटाइप बनाना, रंग और टाइपोग्राफी के दिशानिर्देश तय करना।',
        pathway_summary: 'डिज़ाइन सिद्धांत -> फिग्मा में महारत -> यूजर जर्नी मैपिंग -> बेहेंस/ड्रिबल पोर्टफोलियो -> यूआई/यूएक्स डिज़ाइनर।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000023', importance: 'required' }, // UI/UX Design
      { skill_id: 'b1000000-0000-0000-0000-000000000024', importance: 'required' }, // Figma
      { skill_id: 'b1000000-0000-0000-0000-000000000034', importance: 'required' }, // Creativity
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'recommended' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000001', importance: 'optional' }, // HTML
    ],
  },

  // 12. Digital Marketing Specialist
  {
    id: 'a1000000-0000-0000-0000-000000000017',
    category_id: 'c1000000-0000-0000-0000-000000000007', // business
    slug: 'digital-marketing-specialist',
    title: 'Digital Marketing Specialist',
    minimum_education: '12th Pass / Any Graduation Degree',
    estimated_salary_range: '₹18,000 - ₹42,000 / month (Entry-level in India)',
    training_duration: '3 to 6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2431.0101 (Advertising and Marketing Professionals)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Digital Marketing Specialist',
        description: 'Promotes products, brands, and local services across search engines, social media platforms, email, and YouTube.',
        job_responsibilities: 'Executing SEO optimization, managing Meta & Google ad campaigns, tracking conversions via Google Analytics, and content marketing.',
        pathway_summary: 'Digital basics -> SEO & Content -> Social Media Ad Campaigns -> Google Analytics Certification -> Agency / In-House Specialist.',
      },
      te: {
        title: 'డిజిటల్ మార్కెటింగ్ స్పెషలిస్ట్ (Digital Marketing Specialist)',
        description: 'గూగుల్, యూట్యూబ్, సోషల్ మీడియా ద్వారా వ్యాపారాలు మరియు బ్రాండ్లను ప్రచారం చేసి కస్టమర్లను ఆకర్షించే నిపుణుడు.',
        job_responsibilities: 'సెర్చ్ ఇంజిన్ ఆప్టిమైజేషన్ (SEO), ఫేస్‌బుక్/ఇన్‌స్టాగ్రామ్ ప్రకటనలు నడపడం, కంటెంట్ తయారీ మరియు అనలిటిక్స్ పర్యవేక్షణ.',
        pathway_summary: 'ఇంటర్/డిగ్రీ -> SEO & కంటెంట్ నైపుణ్యాలు -> సోషల్ మీడియా యాడ్స్ -> గూగుల్ సర్టిఫికేషన్ -> మార్కెటింగ్ ఉద్యోగం.',
      },
      hi: {
        title: 'डिजिटल मार्केटिंग विशेषज्ञ (Digital Marketing Specialist)',
        description: 'सर्च इंजन, सोशल मीडिया, यूट्यूब और विज्ञापनों के माध्यम से उत्पादों और सेवाओं का ऑनलाइन प्रचार और बिक्री बढ़ाता है।',
        job_responsibilities: 'एसईओ (SEO) रणनीतियां बनाना, सोशल मीडिया विज्ञापन चलाना, गूगल एनालिटिक्स द्वारा डेटा ट्रैक करना और ब्रांडिंग।',
        pathway_summary: '12वीं/ग्रेजुएशन -> एसईओ और सोशल मीडिया मार्केटिंग -> गूगल विज्ञापन प्रमाणन -> डिजिटल मार्केटिंग विशेषज्ञ।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000025', importance: 'required' }, // Digital Marketing
      { skill_id: 'b1000000-0000-0000-0000-000000000026', importance: 'required' }, // SEO
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'required' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000034', importance: 'recommended' }, // Creativity
      { skill_id: 'b1000000-0000-0000-0000-000000000016', importance: 'recommended' }, // Data Analysis
    ],
  },

  // 13. Accountant
  {
    id: 'a1000000-0000-0000-0000-000000000018',
    category_id: 'c1000000-0000-0000-0000-000000000007', // business
    slug: 'accountant',
    title: 'Accountant',
    minimum_education: 'B.Com / BBA / Any Graduate with Accounting certification',
    estimated_salary_range: '₹18,000 - ₹38,000 / month (Entry-level in India)',
    training_duration: '3 to 6 Months',
    growth_demand: 'steady',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2411.0101 (Accountant)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Accountant',
        description: 'Maintains verified financial records, prepares balance sheets, manages GST/tax filings, and audits company ledgers.',
        job_responsibilities: 'Recording daily vouchers in Tally Prime, filing monthly GST returns, reconciling bank statements, and preparing profit-loss accounts.',
        pathway_summary: 'B.Com / Finance Degree -> Tally Prime with GST Certification -> Excel for Auditing -> Junior Accounts Executive.',
      },
      te: {
        title: 'అకౌంటెంట్ (Accountant)',
        description: 'వ్యాపార లావాదేవీల లెక్కలను రాయడం, జీఎస్టీ (GST) రిటర్న్స్ ఫైల్ చేయడం మరియు బ్యాలెన్స్ షీట్లను తయారు చేసే నిపుణుడు.',
        job_responsibilities: 'ట్యాలీ ప్రైమ్ (Tally) లో రికార్డులు రాయడం, జీఎస్టీ మరియు పన్ను ఫైలింగ్ నిర్వహించడం, బ్యాంకు ఖాతాల రికన్సిలియేషన్.',
        pathway_summary: 'బీకామ్/డిగ్రీ -> ట్యాలీ & జీఎస్టీ కోర్సు -> ఎక్సెల్ ఫైనాన్స్ -> జూనియర్ అకౌంటెంట్ -> సీనియర్ అకౌంటెంట్.',
      },
      hi: {
        title: 'लेखाकार (Accountant)',
        description: 'वित्तीय रिकॉर्ड का रखरखाव, बैलेंस शीट की तैयारी, जीएसटी व टैक्स फाइलिंग और कंपनी के खातों का ऑडिट करता है।',
        job_responsibilities: 'टैली में दैनिक प्रविष्टियां दर्ज करना, जीएसटी रिटर्न दाखिल करना, बैंक समाधान और लाभ-हानि खाते तैयार करना।',
        pathway_summary: 'बी.कॉम/ग्रेजुएशन -> टैली प्राइम व जीएसटी कोर्स -> एडवांस्ड एक्सेल -> जूनियर अकाउंटेंट पद।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000027', importance: 'required' }, // Accounting
      { skill_id: 'b1000000-0000-0000-0000-000000000015', importance: 'required' }, // Excel
      { skill_id: 'b1000000-0000-0000-0000-000000000039', importance: 'recommended' }, // Analytical Thinking
      { skill_id: 'b1000000-0000-0000-0000-000000000037', importance: 'recommended' }, // Time Management
    ],
  },

  // 14. Business Analyst
  {
    id: 'a1000000-0000-0000-0000-000000000019',
    category_id: 'c1000000-0000-0000-0000-000000000007', // business
    slug: 'business-analyst',
    title: 'Business Analyst',
    minimum_education: 'Bachelor Degree (B.Tech, BBA, B.Com, BCA, or MBA)',
    estimated_salary_range: '₹35,000 - ₹70,000 / month (Entry-level in India)',
    training_duration: '6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2421.0101 (Management and Organization Analysts)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Business Analyst',
        description: 'Analyzes organizational processes, documents technical requirements, and bridges corporate management with software engineering teams.',
        job_responsibilities: 'Gathering business requirements from clients, drafting Functional Requirement Documents (FRDs), modeling process workflows, and verifying acceptance criteria.',
        pathway_summary: 'Degree -> Business Analysis fundamentals -> SQL & Excel modeling -> Agile Scrum methodology -> Junior Business Analyst.',
      },
      te: {
        title: 'బిజినెస్ అనలిస్ట్ (Business Analyst)',
        description: 'వ్యాపార అవసరాలను అర్థం చేసుకుని, వాటికి అనుగుణంగా సాంకేతిక సాఫ్ట్‌వేర్ టీమ్‌లకు మార్గదర్శనం చేసే వ్యూహాత్మక విశ్లేషకుడు.',
        job_responsibilities: 'క్లయింట్ల నుండి అవసరాలను సేకరించడం, వర్క్‌ఫ్లో చార్ట్‌లు గీయడం, సాఫ్ట్‌వేర్ ఫీచర్ల రూపకల్పనలో సహాయపడటం.',
        pathway_summary: 'గ్రాడ్యుయేషన్ -> బిజినెస్ ప్రాసెస్ నైపుణ్యాలు -> ఎక్సెల్ & SQL -> ఎజైల్ (Agile) మెథడాలజీ -> బిజినెస్ అనలిస్ట్ ఉద్యోగం.',
      },
      hi: {
        title: 'बिजनेस एनालिस्ट (Business Analyst)',
        description: 'व्यावसायिक प्रक्रियाओं का विश्लेषण करता है और क्लाइंट की जरूरतों को तकनीकी सॉफ्टवेयर टीम के लिए विस्तृत आवश्यकताओं में बदलता है।',
        job_responsibilities: 'क्लाइंट आवश्यकताओं को एकत्र करना, बिजनेस फ्लोचार्ट बनाना, डेटा मॉडलिंग और एजाइल स्प्रिंट में समन्वय।',
        pathway_summary: 'ग्रेजुएशन -> बिजनेस एनालिसिस फंडामेंटल्स -> SQL और एक्सेल -> एजाइल स्क्रम -> बिजनेस एनालिस्ट।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'required' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000039', importance: 'required' }, // Analytical Thinking
      { skill_id: 'b1000000-0000-0000-0000-000000000015', importance: 'required' }, // Excel
      { skill_id: 'b1000000-0000-0000-0000-000000000013', importance: 'recommended' }, // SQL
      { skill_id: 'b1000000-0000-0000-0000-000000000040', importance: 'recommended' }, // Decision Making
    ],
  },

  // 15. Government Administrative Services
  {
    id: 'a1000000-0000-0000-0000-000000000020',
    category_id: 'c1000000-0000-0000-0000-000000000008', // government_services
    slug: 'govt-administrative-services',
    title: 'Government Administrative Services',
    minimum_education: 'Any Bachelor Degree from a recognized University',
    estimated_salary_range: '₹35,000 - ₹75,000 / month (Basic Pay + DA + HRA per 7th Pay/PRC)',
    training_duration: '12 to 18 Months (Preparation & Academy Training)',
    growth_demand: 'steady',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://psc.ap.gov.in',
    official_occupational_code: 'NCO-2015: 1112.0101 (Senior Government Officials)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Government Administrative Services',
        description: 'Public administration officers recruited through APPSC/UPSC/SSC managing revenue, welfare schemes, district governance, and public services.',
        job_responsibilities: 'Executing government social welfare programs, supervising village secretariats/tahsildar offices, resolving citizen grievances, and maintaining law and order.',
        pathway_summary: 'Any Graduation -> General Studies, Polity & History preparation -> Prelims Exam -> Mains Descriptive Exam -> Interview -> Foundation Academy Training.',
      },
      te: {
        title: 'ప్రభుత్వ పరిపాలనా సేవలు (APPSC / UPSC / SSC)',
        description: 'ప్రభుత్వ సంక్షేమ పథకాలను అమలు చేస్తూ, ప్రజా సమస్యలను పరిష్కరించే పరిపాలనా అధికారులు (గ్రూప్-1, గ్రూప్-2, సివిల్ సర్వీసెస్).',
        job_responsibilities: 'ప్రభుత్వ పథకాల అమలు, రెవెన్యూ మరియు మండల/జిల్లా పరిపాలన, పౌరుల అర్జీల పరిష్కారం మరియు అభివృద్ధి పనుల పర్యవేక్షణ.',
        pathway_summary: 'ఏదైనా డిగ్రీ -> జనరల్ స్టడీస్, భారత రాజ్యాంగం, చరిత్ర ప్రిపరేషన్ -> ప్రిలిమ్స్ -> మెయిన్స్ పరీక్ష -> ఇంటర్వ్యూ -> శిక్షణ అకాడమీ.',
      },
      hi: {
        title: 'सरकारी प्रशासनिक सेवाएं (Civil & State Services)',
        description: 'यूपीएससी/राज्य लोक सेवा आयोग (APPSC) द्वारा चयनित प्रशासनिक अधिकारी जो सरकारी योजनाओं, राजस्व और जन कल्याण का प्रबंधन करते हैं।',
        job_responsibilities: 'सरकारी सामाजिक योजनाओं का क्रियान्वयन, ब्लॉक और जिला प्रशासन का संचालन, नागरिक शिकायतों का निवारण।',
        pathway_summary: 'स्नातक डिग्री -> सामान्य अध्ययन, राजव्यवस्था और इतिहास की तैयारी -> प्रारंभिक परीक्षा -> मुख्य परीक्षा -> साक्षात्कार -> अकादमी प्रशिक्षण।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'required' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000033', importance: 'required' }, // Critical Thinking
      { skill_id: 'b1000000-0000-0000-0000-000000000035', importance: 'required' }, // Leadership
      { skill_id: 'b1000000-0000-0000-0000-000000000040', importance: 'required' }, // Decision Making
    ],
  },

  // 16. Teacher / Educator
  {
    id: 'a1000000-0000-0000-0000-000000000021',
    category_id: 'c1000000-0000-0000-0000-000000000009', // education
    slug: 'teacher-educator',
    title: 'Teacher / Educator',
    minimum_education: 'Bachelor Degree + B.Ed / D.El.Ed / D.Ed (TET / CTET qualified)',
    estimated_salary_range: '₹22,000 - ₹50,000 / month (Govt DSC / Private School)',
    training_duration: '2 Years (Professional B.Ed) + TET prep',
    growth_demand: 'steady',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ncs.gov.in',
    official_occupational_code: 'NCO-2015: 2341.0101 (Primary School Teachers)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Teacher / Educator',
        description: 'Educates school and college students, designs instructional lesson plans, and nurtures foundational literacy, numeracy, and character.',
        job_responsibilities: 'Conducting classroom lessons, grading assessments, organizing parent-teacher meetings, and adapting modern digital teaching tools.',
        pathway_summary: '12th/Degree -> D.El.Ed / B.Ed course -> Qualify State TET / Central CTET -> Appear for Teacher Recruitment DSC -> Appointed Educator.',
      },
      te: {
        title: 'ఉపాధ్యాయుడు / అధ్యాపకుడు (Teacher / Educator)',
        description: 'పాఠశాల విద్యార్థులకు జ్ఞానాన్ని, క్రమశిక్షణను అందిస్తూ వారి బంగారు భవిష్యత్తుకు మార్గదర్శకంగా నిలిచే ఉపాధ్యాయ వృత్తి.',
        job_responsibilities: 'పాఠ్యాంశాలను బోధించడం, విద్యార్థుల ప్రతిభను అంచనా వేయడం, పరీక్షల నిర్వహణ మరియు మార్గదర్శకత్వం అందించడం.',
        pathway_summary: 'డిగ్రీ -> బి.ఇడి (B.Ed) లేదా డి.ఎడ్ -> టెట్ (TET / CTET) అర్హత -> డీఎస్సీ (DSC) పరీక్ష -> ప్రభుత్వ/ప్రైవేట్ ఉపాధ్యాయ ఉద్యోగం.',
      },
      hi: {
        title: 'शिक्षक / अध्यापक (Teacher / Educator)',
        description: 'छात्रों को विभिन्न विषयों में गुणवत्तापूर्ण शिक्षा प्रदान करता है, पाठ योजनाएं बनाता है और उनके सर्वांगीण विकास में मार्गदर्शन करता है।',
        job_responsibilities: 'कक्षा शिक्षण, पाठ योजना बनाना, परीक्षाओं का मूल्यांकन करना और अभिभावक-शिक्षक संवाद।',
        pathway_summary: 'स्नातक -> बी.एड / डी.एल.एड -> टीईटी / सीटीईटी परीक्षा उत्तीर्ण -> शिक्षक भर्ती (DSC / KVS) -> नियुक्त शिक्षक।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'required' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000035', importance: 'required' }, // Leadership
      { skill_id: 'b1000000-0000-0000-0000-000000000037', importance: 'recommended' }, // Time Management
      { skill_id: 'b1000000-0000-0000-0000-000000000038', importance: 'recommended' }, // Adaptability
    ],
  },

  // 17. Banking Professional
  {
    id: 'a1000000-0000-0000-0000-000000000022',
    category_id: 'c1000000-0000-0000-0000-000000000007', // business
    slug: 'banking-professional',
    title: 'Banking Professional',
    minimum_education: 'Any Bachelor Degree from a recognized University',
    estimated_salary_range: '₹32,000 - ₹62,000 / month (IBPS Clerk / PO starting basic pay + allowances)',
    training_duration: '6 to 12 Months (Competitive exam prep)',
    growth_demand: 'steady',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://www.ibps.in',
    official_occupational_code: 'NCO-2015: 2412.0101 (Financial and Investment Advisers)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Banking Professional (IBPS / SBI Clerk & PO)',
        description: 'Manages financial transactions, customer loans, credit verification, savings accounts, and digital banking operations in commercial and rural banks.',
        job_responsibilities: 'Customer service, cash and digital remittances, loan appraisal for agriculture and small businesses, and regulatory compliance.',
        pathway_summary: 'Any Graduation -> Prepare Quantitative Aptitude, Reasoning & English -> Qualify IBPS / SBI PO or Clerk -> Probationary Officer.',
      },
      te: {
        title: 'బ్యాంకింగ్ ఉద్యోగి (IBPS / SBI Clerk & PO)',
        description: 'వాణిజ్య మరియు గ్రామీణ బ్యాంకులలో ఆర్థిక లావాదేవీలు, డిపాజిట్లు, వ్యవసాయ మరియు వ్యాపార రుణాల మంజూరును నిర్వహించే అధికారి.',
        job_responsibilities: 'కస్టమర్ ఖాతాల నిర్వహణ, లోన్ డాక్యుమెంట్ల పరిశీలన, డిజిటల్ బ్యాంకింగ్ సేవల పర్యవేక్షణ మరియు సేవింగ్స్ ప్రోత్సాహం.',
        pathway_summary: 'ఏదైనా డిగ్రీ -> బ్యాంకింగ్ ఆప్టిట్యూడ్, రీజనింగ్ & ఇంగ్లీష్ ప్రిపరేషన్ -> IBPS / SBI పరీక్షలు -> బ్యాంక్ ఆఫీసర్ / క్లర్క్.',
      },
      hi: {
        title: 'बैंकिंग पेशेवर (IBPS / SBI बैंक अधिकारी व लिपिक)',
        description: 'बैंकों में वित्तीय लेन-देन, ग्राहक ऋण, बचत खाते, फिक्स्ड डिपॉजिट और डिजिटल बैंकिंग सेवाओं का संचालन करता है।',
        job_responsibilities: 'ग्राहकों को बैंकिंग सेवाएं देना, कृषि व व्यवसाय ऋण का मूल्यांकन, नकद प्रबंधन और ऑडिट अनुपालन।',
        pathway_summary: 'स्नातक डिग्री -> क्वांटिटेटिव एप्टीट्यूड, रीजनिंग और अंग्रेजी की तैयारी -> आईबीपीएस / एसबीआई परीक्षा -> बैंक अधिकारी।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000015', importance: 'required' }, // Excel
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'required' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000039', importance: 'required' }, // Analytical Thinking
      { skill_id: 'b1000000-0000-0000-0000-000000000040', importance: 'recommended' }, // Decision Making
    ],
  },

  // 18. Agriculture Extension Worker
  {
    id: 'a1000000-0000-0000-0000-000000000023',
    category_id: 'c1000000-0000-0000-0000-000000000002', // modern_agriculture
    slug: 'agriculture-extension-worker',
    title: 'Agriculture Extension Worker',
    minimum_education: 'Diploma in Agriculture / B.Sc Agriculture / Horticulture',
    estimated_salary_range: '₹18,000 - ₹35,000 / month (AP Rythu Bharosa Kendram / NGO)',
    training_duration: '2 Years Diploma / 4 Years Degree',
    growth_demand: 'steady',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://dge.gov.in',
    official_occupational_code: 'NCO-2015: 2132.0101 (Farming Advisers)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Agriculture Extension Worker / Village Agriculture Assistant',
        description: 'Advises farmers at village level (such as Rythu Bharosa Kendras in AP) on crop selection, soil health, drip irrigation, pest remedies, and government subsidies.',
        job_responsibilities: 'Conducting soil sample testing, recommending organic and bio-fertilizers, demonstrating smart farming methods, and registering farmers for PM-KISAN & e-crop.',
        pathway_summary: '10th/12th -> 2-Year Agriculture Polytechnic Diploma or B.Sc Agriculture -> AP Village Secretariat VAA exam or Agri-input company -> Extension Officer.',
      },
      te: {
        title: 'గ్రామ వ్యవసాయ సహాయకుడు (Village Agriculture Assistant)',
        description: 'రైతు భరోసా కేంద్రాల (RBK) ద్వారా రైతులకు నాణ్యమైన విత్తనాలు, ఎరువులు, భూసార పరీక్షలు మరియు ప్రభుత్వ సబ్సిడీలను అందించే వ్యవసాయ సలహాదారు.',
        job_responsibilities: 'భూసార పరీక్షలు చేయడం, పంట తెగుళ్ల నివారణ సలహాలు ఇవ్వడం, ఈ-క్రాప్ బుకింగ్ చేయడం మరియు బిందు సేద్యాన్ని ప్రోత్సహించడం.',
        pathway_summary: 'పదో తరగతి -> అగ్రికల్చర్ పాలిటెక్నిక్ డిప్లొమా లేదా బి.ఎస్సీ అగ్రికల్చర్ -> గ్రామ సచివాలయ VAA పరీక్ష -> వ్యవసాయ విస్తరణ అధికారి.',
      },
      hi: {
        title: 'कृषि विस्तार कार्यकर्ता (Agriculture Extension Worker)',
        description: 'किसानों को उन्नत बीज, मिट्टी परीक्षण, जैविक खाद, ड्रिप सिंचाई और सरकारी सब्सिडी योजनाओं के बारे में तकनीकी सलाह देता है।',
        job_responsibilities: 'मिट्टी के नमूनों का परीक्षण, फसल रोगों का निदान, आधुनिक कृषि तकनीकों का प्रदर्शन और फसल बीमा पंजीकरण।',
        pathway_summary: '10वीं/12वीं -> 2 वर्षीय कृषि डिप्लोमा या बी.एससी कृषि -> ग्राम कृषि सहायक परीक्षा / कंपनी चयन -> कृषि विस्तार अधिकारी।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000030', importance: 'required' }, // Agriculture Fundamentals
      { skill_id: 'b1000000-0000-0000-0000-000000000031', importance: 'required' }, // Communication
      { skill_id: 'b1000000-0000-0000-0000-000000000032', importance: 'recommended' }, // Problem Solving
      { skill_id: 'b1000000-0000-0000-0000-000000000015', importance: 'optional' }, // Excel
    ],
  },

  // 19. Solar PV Technician
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000001', // renewable_energy
    slug: 'solar-pv-technician',
    title: 'Solar PV Systems Technician',
    minimum_education: '10th Pass + ITI (Electrician/Wireman) or Suryamitra Certified',
    estimated_salary_range: '₹18,000 - ₹32,000 / month (Field EPC / PM Surya Ghar installer)',
    training_duration: '3 to 6 Months',
    growth_demand: 'high',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://nise.res.in/suryamitra',
    official_occupational_code: 'NSDC QP: SGJ/Q0101 (Solar PV Installer)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Solar PV Systems Technician',
        description: 'Installs, tests, and maintains rooftop solar panels, grid-tied inverters, and storage batteries under schemes like PM Surya Ghar.',
        job_responsibilities: 'Mounting solar modules on rooftops, wiring DC and AC combiner boxes, conducting earthing resistance tests, and configuring inverters.',
        pathway_summary: '10th Pass -> ITI Electrician or 90-Day Free Suryamitra Skill Training -> SCGJ Certification -> NAPS Apprenticeship -> Certified Solar EPC Technician.',
      },
      te: {
        title: 'సోలార్ పివి టెక్నీషియన్ (Solar PV Systems Technician)',
        description: 'పీఎం సూర్య ఘర్ పథకం క్రింద ఇళ్లపై మరియు వ్యవసాయ పంపులకు సోలార్ ప్యానెల్స్, ఇన్వర్టర్లు మరియు బ్యాటరీలను అమర్చి నిర్వహించే సాంకేతిక నిపుణుడు.',
        job_responsibilities: 'రూఫ్‌టాప్‌పై సోలార్ ప్యానెల్స్ అమర్చడం, వైరింగ్ మరియు ఎర్తింగ్ పరీక్షలు చేయడం, ఇన్వర్టర్ కనెక్షన్లు ఇవ్వడం.',
        pathway_summary: '10వ తరగతి పాస్ -> ఐటిఐ ఎలక్ట్రీషియన్ లేదా ఉచిత సూర్యమిత్ర కోర్సు -> గ్రీన్ జాబ్స్ కౌన్సిల్ సర్టిఫికేట్ -> సోలార్ టెక్నీషియన్ ఉద్యోగం.',
      },
      hi: {
        title: 'सोलर पीवी सिस्टम तकनीशियन (Solar PV Technician)',
        description: 'पीएम सूर्य घर और कुसुम योजना के तहत घरों और खेतों में सोलर पैनल, इन्वर्टर और ग्रिड कनेक्शन स्थापित और मरम्मत करता है।',
        job_responsibilities: 'छतों पर सोलर पैनल लगाना, डीसी/एसी वायरिंग, अर्थिंग परीक्षण और इन्वर्टर की जांच।',
        pathway_summary: '10वीं पास -> आईटीआई या 90 दिवसीय निःशुल्क सूर्यमित्र प्रशिक्षण -> स्किल काउंसिल प्रमाणन -> सोलर तकनीशियन।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000029', importance: 'required' }, // Solar Installation
      { skill_id: 'b1000000-0000-0000-0000-000000000028', importance: 'required' }, // Electrical Fundamentals
      { skill_id: 'b1000000-0000-0000-0000-000000000032', importance: 'recommended' }, // Problem Solving
      { skill_id: 'b1000000-0000-0000-0000-000000000037', importance: 'recommended' }, // Time Management
    ],
  },

  // 20. Electrician
  {
    id: 'a1000000-0000-0000-0000-000000000024',
    category_id: 'c1000000-0000-0000-0000-000000000010', // trades
    slug: 'electrician',
    title: 'Electrician',
    minimum_education: '10th Pass + ITI Electrician Trade Certificate',
    estimated_salary_range: '₹16,000 - ₹30,000 / month (Domestic / DISCOM / Industrial)',
    training_duration: '2 Years ITI or 6 Months Vocational',
    growth_demand: 'steady',
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: 'https://dge.gov.in',
    official_occupational_code: 'NCO-2015: 7411.0101 (General Electrician)',
    last_verified_date: '2026-11-22',
    translations: {
      en: {
        title: 'Electrician',
        description: 'Installs, inspects, and repairs electrical power cables, switchgear, domestic house wiring, transformers, and electrical appliances safely.',
        job_responsibilities: 'Reading electrical single-line diagrams, routing conduits, installing MCBs and distribution boards, troubleshooting short circuits, and maintaining electrical safety.',
        pathway_summary: '10th Class Pass -> 2-Year ITI Electrician Course -> Apprentice Certificate (NAC) via NAPS -> State Wireman License -> Certified Electrician / DISCOM Lineman.',
      },
      te: {
        title: 'ఎలక్ట్రీషియన్ (Electrician)',
        description: 'ఇళ్లు, పరిశ్రమలు మరియు విద్యుత్ బోర్డులలో (DISCOM) వైరింగ్, మీటర్లు, మోటార్లు మరియు ఎలక్ట్రికల్ పరికరాలను సురక్షితంగా అమర్చే సాంకేతిక నిపుణుడు.',
        job_responsibilities: 'హౌస్ వైరింగ్ చేయడం, MCB మరియు స్విచ్ బోర్డులు అమర్చడం, షార్ట్ సర్క్యూట్‌లను గుర్తించి బాగు చేయడం, ట్రాన్స్‌ఫార్మర్ల నిర్వహణ.',
        pathway_summary: 'పదో తరగతి పాస్ -> రెండేళ్ల ఐటిఐ ఎలక్ట్రీషియన్ ట్రేడ్ -> NAPS అప్రెంటిస్‌షిప్ -> వైర్‌మెన్ లైసెన్స్ -> సర్టిఫైడ్ ఎలక్ట్రీషియన్.',
      },
      hi: {
        title: 'इलेक्ट्रीशियन (Electrician)',
        description: 'घरों, दुकानों और कारखानों में बिजली की तारों, स्विचबोर्ड, मोटर, ट्रांसफार्मर और उपकरणों की सुरक्षित स्थापना और मरम्मत करता है।',
        job_responsibilities: 'घरेलू और औद्योगिक वायरिंग, फॉल्ट डायग्नोस्टिक्स, सर्किट ब्रेकर और अर्थिंग की जांच, विद्युत सुरक्षा मानकों का पालन।',
        pathway_summary: '10वीं पास -> 2 वर्षीय आईटीआई इलेक्ट्रीशियन ट्रेड -> नैप्स अप्रेंटिसशिप -> वायरमैन लाइसेंस -> प्रमाणित इलेक्ट्रीशियन।',
      },
    },
    skills: [
      { skill_id: 'b1000000-0000-0000-0000-000000000028', importance: 'required' }, // Electrical Fundamentals
      { skill_id: 'b1000000-0000-0000-0000-000000000032', importance: 'required' }, // Problem Solving
      { skill_id: 'b1000000-0000-0000-0000-000000000037', importance: 'recommended' }, // Time Management
    ],
  },
];

CAREERS_DATA.push(...EXPANDED_CAREERS);

