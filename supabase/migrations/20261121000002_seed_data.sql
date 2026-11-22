-- ====================================================================
-- SUPABASE POSTGRESQL MIGRATION: Multilingual Seed Data (EN, TE, HI)
-- Project: AI-Powered Multilingual Career Guidance System (Margdarshak)
-- ====================================================================

-- Grant schema and table permissions to PostgREST roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- --------------------------------------------------------------------
-- 1. SEED CAREER CATEGORIES
-- --------------------------------------------------------------------
INSERT INTO public.career_categories (id, code, name, name_hi, name_te, icon_name, display_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'renewable_energy', 'Renewable Energy', 'नवीकरणीय ऊर्जा', 'పునరుత్పాదక ఇంధనం', 'Sun', 1),
  ('c1000000-0000-0000-0000-000000000002', 'modern_agriculture', 'Modern Agriculture', 'आधुनिक कृषि', 'ఆధునిక వ్యవసాయం', 'Sprout', 2),
  ('c1000000-0000-0000-0000-000000000003', 'automotive', 'Automotive & EV', 'ऑटोमोटिव और ईवी', 'ఆటోమోటివ్ & ఈవీ', 'Wrench', 3),
  ('c1000000-0000-0000-0000-000000000004', 'healthcare', 'Healthcare & Wellness', 'स्वास्थ्य और चिकित्सा', 'ఆరోగ్యం & వెల్నెస్', 'HeartPulse', 4),
  ('c1000000-0000-0000-0000-000000000005', 'digital_services', 'Digital & CSC Services', 'डिजिटल व जन सेवा केंद्र', 'డిజిటల్ & సిఎస్సి సేవలు', 'Laptop', 5)
ON CONFLICT (code) DO NOTHING;

-- --------------------------------------------------------------------
-- 2. SEED SKILLS
-- --------------------------------------------------------------------
INSERT INTO public.skills (id, name, category, description)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Electrical Wiring', 'technical', 'Safe domestic and industrial circuit wiring and testing'),
  ('b1000000-0000-0000-0000-000000000002', 'Multimeter Testing', 'technical', 'Measuring voltage, current, and circuit continuity'),
  ('b1000000-0000-0000-0000-000000000003', 'Solar Panel Mounting', 'trade', 'Structural installation and alignment of solar PV arrays'),
  ('b1000000-0000-0000-0000-000000000004', 'Soil pH Testing', 'trade', 'Sampling and nutrient analysis for crop optimization'),
  ('b1000000-0000-0000-0000-000000000005', 'Drip Irrigation Maintenance', 'trade', 'Tubing inspection, emitter cleaning, and pump pressure setup'),
  ('b1000000-0000-0000-0000-000000000006', 'EV Diagnostic Scanner', 'technical', 'OBD scanner inspection and fault code clearing for electric vehicles'),
  ('b1000000-0000-0000-0000-000000000007', 'Battery Management Systems', 'technical', 'Lithium battery cell balance and temperature safety checks'),
  ('b1000000-0000-0000-0000-000000000008', 'Patient Vitals Recording', 'trade', 'Blood pressure, pulse, temperature, and blood glucose check'),
  ('b1000000-0000-0000-0000-000000000009', 'Digital Data Entry', 'digital', 'Fast keyboard data input, spreadsheets, and online portal forms'),
  ('b1000000-0000-0000-0000-000000000010', 'Customer Communication', 'soft', 'Clear, polite vernacular interaction with rural citizens'),
  ('b1000000-0000-0000-0000-000000000011', 'Problem Solving', 'soft', 'Root cause identification and systematic troubleshooting')
ON CONFLICT (name) DO NOTHING;

-- --------------------------------------------------------------------
-- 3. SEED INTERESTS
-- --------------------------------------------------------------------
INSERT INTO public.interests (id, code, name, description)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'technology', 'Technology & Computing', 'Working with computers, mobile phones, apps, and digital tools'),
  ('e1000000-0000-0000-0000-000000000002', 'agriculture', 'Modern Agriculture & Farming', 'Crops, soil testing, irrigation, and farm machinery'),
  ('e1000000-0000-0000-0000-000000000003', 'engineering', 'Engineering & Mechanics', 'Machinery, electrical, motors, welding, and mechanics'),
  ('e1000000-0000-0000-0000-000000000004', 'healthcare', 'Healthcare & Wellness', 'Hospital care, health records, nursing assistance, pharmacy'),
  ('e1000000-0000-0000-0000-000000000005', 'business', 'Business & Banking', 'Retail store keeping, banking correspondent, accounting'),
  ('e1000000-0000-0000-0000-000000000006', 'government_services', 'Government & Public Services', 'Public administration, panchayat records, postal services')
ON CONFLICT (code) DO NOTHING;

-- --------------------------------------------------------------------
-- 4. SEED CAREERS
-- --------------------------------------------------------------------
INSERT INTO public.careers (id, category_id, slug, title, minimum_education, estimated_salary_range, training_duration, growth_demand, is_active)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'solar-pv-technician',
    'Solar PV Systems Technician',
    '10th Pass + ITI / Diploma',
    '₹18,000 - ₹28,000 / month',
    '3 to 6 months',
    'high',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'organic-farm-supervisor',
    'Organic Farm & Soil Supervisor',
    '10th / 12th Pass',
    '₹16,000 - ₹25,000 / month',
    '4 months',
    'emerging',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000003',
    'ev-two-wheeler-specialist',
    'EV Two-Wheeler Service Specialist',
    '10th Pass + ITI Motor Mechanic',
    '₹20,000 - ₹32,000 / month',
    '6 months',
    'high',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000004',
    'rural-health-facilitator',
    'Rural Community Health Facilitator',
    '12th Pass (Any Stream)',
    '₹15,000 - ₹24,000 / month',
    '6 months',
    'steady',
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000005',
    'csc-digital-operator',
    'Village CSC Digital Services Operator',
    '10th / 12th Pass',
    '₹15,000 - ₹26,000 / month',
    '2 months',
    'high',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- --------------------------------------------------------------------
-- 5. SEED CAREER SKILLS MAPPINGS
-- --------------------------------------------------------------------
INSERT INTO public.career_skills (career_id, skill_id, importance)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'required'),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'required'),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'required'),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'required'),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'required'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 'required'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', 'required'),
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000008', 'required'),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000009', 'required'),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000010', 'recommended')
ON CONFLICT (career_id, skill_id) DO NOTHING;

-- --------------------------------------------------------------------
-- 6. SEED CAREER TRANSLATIONS (EN, TE, HI)
-- --------------------------------------------------------------------
-- Solar PV Technician
INSERT INTO public.career_translations (career_id, language_code, title, description, job_responsibilities, pathway_summary)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'en',
    'Solar PV Systems Technician',
    'Install, test, and maintain rooftop and agricultural solar pump setups across rural and semi-urban clusters.',
    'Mounting PV modules, inverter electrical wiring, grounding checks, and routine performance inspection.',
    'Class 10 -> ITI Electrical or 90-day Suryamitra course -> Apprenticeship -> Certified Solar Installer'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'te',
    'సోలార్ పివి సిస్టమ్స్ టెక్నీషియన్',
    'గ్రామీణ ప్రాంతాల్లో రూఫ్‌టాప్ మరియు వ్యవసాయ సోలార్ పంప్ సెటప్‌లను అమర్చడం, పరీక్షించడం మరియు నిర్వహించడం.',
    'సోలార్ ప్యానెల్ అమరిక, ఇన్వర్టర్ వైరింగ్, ఎర్తింగ్ పరీక్షలు మరియు రెగ్యులర్ రిపేరింగ్.',
    '10వ తరగతి -> ఐటిఐ ఎలక్ట్రికల్ లేదా సూర్యమిత్ర కోర్సు -> అప్రెంటిస్‌షిప్ -> సర్టిఫైడ్ సోలార్ టెక్నీషియన్'
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'hi',
    'सोलर पीवी सिस्टम तकनीशियन',
    'ग्रामीण और अर्ध-शहरी क्षेत्रों में रूफटॉप और कृषि सोलर पंप सिस्टम लगाना, परीक्षण और रखरखाव करना।',
    'सोलर पैनल लगाना, इन्वर्टर वायरिंग, अर्थिंग जांच और नियमित रख-रखाव करना।',
    '10वीं पास -> आईटीआई इलेक्ट्रिकल या सूर्यमित्र कोर्स -> अप्रेंटिसशिप -> प्रमाणित सोलर तकनीशियन'
  ),

  -- Organic Farm Supervisor
  (
    'a1000000-0000-0000-0000-000000000002',
    'en',
    'Organic Farm & Soil Supervisor',
    'Guide farmer clusters in organic certification, bio-fertilizers, and drip irrigation optimization.',
    'Soil pH testing, vermicompost unit setup, organic pesticide preparation, and farmer training.',
    'Class 10/12 -> 4-Month PKVY Agriculture Training -> Farm Cluster Supervisor'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'te',
    'ఆర్గానిక్ వ్యవసాయం & నేల పర్యవేక్షకుడు',
    'రైతు సమూహాలకు సేంద్రీయ ధృవీకరణ, జీవ ఎరువులు మరియు బిందు సేద్యం నిర్వహణలో మార్గదర్శనం చేయడం.',
    'నేల పరీక్ష, వర్మీ కంపోస్ట్ తయారీ, సేంద్రీయ పురుగుమందుల పర్యవేక్షణ మరియు రైతులకు సలహాలు ఇవ్వడం.',
    '10వ/12వ తరగతి -> 4 నెలల వ్యవసాయ శిక్షణ -> సేంద్రీయ వ్యవసాయ పర్యవేక్షకుడు'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'hi',
    'जैविक कृषि एवं मृदा पर्यवेक्षक',
    'किसान समूहों को जैविक प्रमाणीकरण, जैविक खाद और ड्रिप सिंचाई प्रबंधन में मार्गदर्शन देना।',
    'मिट्टी की जांच, वर्मीकम्पोस्ट यूनिट स्थापना, जैविक कीटनाशक निर्माण और किसानों को सलाह देना।',
    '10वीं/12वीं पास -> 4 महीने का पीकेवीवाई कृषि कोर्स -> फार्म क्लस्टर सुपरवाइजर'
  )
ON CONFLICT (career_id, language_code) DO NOTHING;

-- --------------------------------------------------------------------
-- 7. SEED ROADMAPS & ROADMAP STEPS
-- --------------------------------------------------------------------
INSERT INTO public.roadmaps (id, career_id, title, total_stages, estimated_duration)
VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Pathway: Solar PV Systems Technician',
    4,
    '10 Months Total'
  )
ON CONFLICT (career_id) DO NOTHING;

INSERT INTO public.roadmap_steps (id, roadmap_id, step_number, title, title_hi, title_te, description, description_hi, description_te, action_cta, schemes_applicable)
VALUES
  (
    'd2000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000001',
    1,
    'Profile & Aptitude Mapping',
    'प्रोफाइल और योग्यता मूल्यांकन',
    'ప్రొఫైల్ & ఆప్టిట్యూడ్ మ్యాపింగ్',
    'Assess educational qualification (10th pass) and basic interest in electrical trades.',
    '10वीं पास योग्यता और विद्युत कार्यों में रुचि का आकलन।',
    '10వ తరగతి అర్హత మరియు ఎలక్ట్రికల్ పనులపై ప్రాథమిక ఆసక్తిని అంచనా వేయడం.',
    'View Assessment Summary',
    '[]'::jsonb
  ),
  (
    'd2000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000001',
    2,
    'Suryamitra Certified Course',
    'सूर्यमित्र प्रमाणित 90 दिवसीय कोर्स',
    'సూర్యమిత్ర సర్టిఫైడ్ 90 రోజుల కోర్సు',
    'Enroll in government-funded 90-day Suryamitra skill training at the District ITI.',
    'जिला आईटीआई में सरकार द्वारा प्रायोजित 90 दिवसीय सूर्यमित्र सोलर कोर्स में प्रवेश लें।',
    'జిల్లా ఐటిఐ లో ప్రభుత్వం ఉచితంగా అందించే సూర్యమిత్ర సోలార్ కోర్సులో చేరండి.',
    'Check Training Center Batches',
    '["PMKVY 4.0 Free Training", "Suryamitra Scheme"]'::jsonb
  ),
  (
    'd2000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000001',
    3,
    'Skill Council Practical Exam',
    'स्किल काउंसिल प्रायोगिक परीक्षा',
    'స్కిల్ కౌన్సిల్ ప్రాక్టికల్ పరీక్ష',
    'Pass the Skill Council for Green Jobs (SCGJ) practical installation and safety test.',
    'ग्रीन जॉब्स स्किल काउंसिल (SCGJ) की प्रायोगिक और सुरक्षा परीक्षा उत्तीर्ण करें।',
    'గ్రీన్ జాబ్స్ స్కిల్ కౌన్సిల్ ప్రాక్టికల్ మరియు భద్రతా పరీక్షను పూర్తి చేయండి.',
    'Review Practical Checklist',
    '["Govt Conveyance Allowance ₹1,500"]'::jsonb
  ),
  (
    'd2000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000001',
    4,
    'Paid Apprenticeship (NAPS)',
    'वेतन सहित ऑन-जॉब अप्रेंटिसशिप',
    'స్టైపెండ్‌తో కూడిన అప్రెంటిస్‌షిప్',
    '6-month on-job practical training with monthly government-subsidized stipend under NAPS.',
    'नैप्स योजना के तहत मासिक वजीफे के साथ 6 महीने का ऑन-जॉब औद्योगिक प्रशिक्षण।',
    'NAPS పథకం క్రింద ప్రభుత్వ స్టైపెండ్‌తో 6 నెలల ఆన్-జాబ్ ఇండస్ట్రియల్ ట్రైనింగ్.',
    'Browse Local Apprentice Openings',
    '["NAPS Monthly Govt Subsidy"]'::jsonb
  )
ON CONFLICT (roadmap_id, step_number) DO NOTHING;

-- --------------------------------------------------------------------
-- 8. SEED OPPORTUNITIES & GOVERNMENT SCHEMES
-- --------------------------------------------------------------------
INSERT INTO public.opportunities (id, title, title_hi, title_te, ministry_or_agency, category, financial_benefit, eligibility_criteria, portal_url, deadline_notice, is_active)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    'प्रधानमंत्री कौशल विकास योजना (PMKVY 4.0)',
    'ప్రధాన మంత్రి కౌశల్ వికాస్ యోజన (PMKVY 4.0)',
    'Ministry of Skill Development & Entrepreneurship',
    'skilling',
    '100% Free Certified Training + ₹1,500 Assessment Conveyance',
    'School/College dropouts & unemployed rural youth (15-45 yrs)',
    'https://www.skillindiadigital.gov.in',
    'Winter batch admissions open in district centers',
    true
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'National Apprenticeship Promotion Scheme (NAPS)',
    'राष्ट्रीय शिक्षुता संवर्धन योजना (NAPS)',
    'నేషనల్ అప్రెంటిస్‌షిప్ ప్రమోషన్ స్కీమ్ (NAPS)',
    'Directorate General of Training (DGT)',
    'apprenticeship',
    '₹7,000 - ₹12,000/month Stipend (25% Direct Govt Share)',
    'Class 10/12 pass or ITI certificate holders (16+ yrs)',
    'https://www.apprenticeshipindia.gov.in',
    'Continuous direct employer matching',
    true
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
    'दीन दयाल उपाध्याय ग्रामीण कौशल्या योजना (DDU-GKY)',
    'దీన్ దయాళ్ ఉపాధ్యాయ గ్రామీణ కౌశల్య యోజన (DDU-GKY)',
    'Ministry of Rural Development',
    'skilling',
    'Residential Training + Uniforms + Post-Placement Support',
    'Rural youth from low-income families (18-35 yrs)',
    'http://ddugky.gov.in',
    'District batch registrations active',
    true
  ),
  (
    'f1000000-0000-0000-0000-000000000004',
    'PM MUDRA Yojana (Shishu Micro-Credit)',
    'प्रधानमंत्री मुद्रा योजना (शिशु ऋण)',
    'ప్రధాన మంత్రి ముద్ర యోజన (శిశు లోన్)',
    'Department of Financial Services',
    'self_employment',
    'Collateral-free micro loans up to ₹50,000 at low interest',
    'Youth starting micro-repair, solar or trade service shops',
    'https://www.mudra.org.in',
    'Apply at any local rural bank / post office',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 9. SEED LEARNING RESOURCES
-- --------------------------------------------------------------------
INSERT INTO public.learning_resources (id, career_id, title, title_hi, title_te, resource_type, provider_name, url, is_free, language)
VALUES
  (
    'f2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Basics of Solar Panel Installation & Safety',
    'सोलर पैनल लगाने और सुरक्षा के मूल नियम',
    'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్ ప్రాథమిక నియమాలు',
    'video',
    'National Skill Development Corporation (NSDC)',
    'https://www.skillindiadigital.gov.in/courses',
    true,
    'hi'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'Electrical Inverter Connection & Multimeter Guide',
    'इन्वर्टर कनेक्शन और मल्टीमीटर उपयोग गाइड',
    'ఇన్వర్టర్ కనెక్షన్ & మల్టీమీటర్ వాడకం గైడ్',
    'pdf_guide',
    'National Institute of Solar Energy (NISE)',
    'https://nise.res.in',
    true,
    'en'
  )
ON CONFLICT (id) DO NOTHING;
