import { createApp } from './app';
import http from 'http';

async function runTestSuite() {
  console.log('--- Starting Margdarshak Full Backend API Test Suite ---');
  const app = createApp();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  console.log(`Ephemeral test server listening on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function testEndpoint(
    name: string,
    path: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      expectedStatus?: number;
    } = {}
  ) {
    const expected = options.expectedStatus || 200;
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const json: any = await res.json().catch(() => null);

      if (res.status === expected) {
        console.log(`[PASS] ${name} (${res.status})`);
        passed++;
        return json;
      } else {
        console.error(`[FAIL] ${name} - Expected ${expected}, got ${res.status}`);
        console.error('Response:', json);
        failed++;
        return null;
      }
    } catch (e: any) {
      console.error(`[ERROR] ${name}: ${e.message}`);
      failed++;
      return null;
    }
  }

  // ====================================================
  // 1. Root & Health Check
  // ====================================================
  await testEndpoint('Root API Info', '/');
  const healthData = await testEndpoint('Health Check', '/api/v1/health');
  console.log('Health Output:', JSON.stringify(healthData?.data?.services));

  // ====================================================
  // 2. Career Catalog (Multilingual)
  // ====================================================
  await testEndpoint('Categories (English)', '/api/v1/careers/categories?lang=en');
  await testEndpoint('Categories (Telugu)', '/api/v1/careers/categories?lang=te');
  await testEndpoint('Categories (Hindi)', '/api/v1/careers/categories?lang=hi');

  const careersEn = await testEndpoint('Careers List (English)', '/api/v1/careers?lang=en');
  console.log(`Found ${careersEn?.data?.length || 0} careers in English`);

  const careersTe = await testEndpoint('Careers List (Telugu)', '/api/v1/careers?lang=te');
  console.log(`Sample Career in Telugu: ${careersTe?.data?.[0]?.title}`);

  const careersHi = await testEndpoint('Careers List (Hindi)', '/api/v1/careers?lang=hi');
  console.log(`Sample Career in Hindi: ${careersHi?.data?.[0]?.title}`);

  // ====================================================
  // 3. Database-Driven Assessment Endpoints
  // ====================================================
  const questionsTe = await testEndpoint('Assessment Questions (Telugu)', '/api/v1/assessments/questions?lang=te');
  console.log(`Total Assessment Questions in DB: ${questionsTe?.data?.length || 0}`);
  if (questionsTe?.data?.[0]) {
    console.log(`Sample Question in Telugu: ${questionsTe.data[0].question_text}`);
    console.log(`Options Count: ${questionsTe.data[0].options?.length || 0}`);
  }

  const questionsHi = await testEndpoint('Assessment Questions (Hindi)', '/api/v1/assessments/questions?lang=hi');
  console.log(`Sample Question in Hindi: ${questionsHi?.data?.[0]?.question_text}`);

  // ====================================================
  // 4. Master Taxonomies & Opportunities
  // ====================================================
  await testEndpoint('Master Skills Taxonomy', '/api/v1/profile/skills/master');
  await testEndpoint('Master Interests Taxonomy', '/api/v1/profile/interests/master');
  await testEndpoint('Opportunities (Hindi)', '/api/v1/opportunities?lang=hi');

  // ====================================================
  // 5. Security & Authentication Checks
  // ====================================================
  await testEndpoint('Protected Profile without Token (Expect 401)', '/api/v1/profile', {
    expectedStatus: 401,
  });

  const studentHeaders = {
    Authorization: 'Bearer mock-test-token-12345',
    'X-Dev-User-Id': '11111111-2222-3333-4444-555555555555',
    'X-Dev-Role': 'authenticated',
  };

  // Profile Setup & Update with Dev Authentication
  await testEndpoint('Get Profile (Authenticated Student)', '/api/v1/profile', {
    headers: studentHeaders,
  });

  await testEndpoint('Update Profile (Authenticated Student)', '/api/v1/profile', {
    method: 'PUT',
    headers: studentHeaders,
    body: {
      full_name: 'Kavitha Devi',
      preferred_language: 'te',
      current_education_level: '12th_standard',
      state: 'Telangana',
      district: 'Warangal Rural',
      willingness_to_relocate: 'within_state',
      preferred_learning_method: 'practical_hands_on',
    },
  });

  // ====================================================
  // 6. Assessment Responses & Draft Resumption
  // ====================================================
  await testEndpoint('Submit Assessment Responses', '/api/v1/assessments/responses', {
    method: 'POST',
    headers: studentHeaders,
    expectedStatus: 201,
    body: {
      responses: [
        {
          question_id: 'a0000000-0000-0000-0000-000000000001',
          selected_option_ids: ['f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003'],
        },
        {
          question_id: 'a0000000-0000-0000-0000-000000000002',
          selected_option_ids: ['f0000000-0000-0000-0000-000000000011'],
          rating_value: 'intermediate',
        },
      ],
    },
  });

  const savedResponses = await testEndpoint('Get User Saved Responses', '/api/v1/assessments/responses', {
    headers: studentHeaders,
  });
  console.log(`Saved Responses retrieved: ${savedResponses?.data?.length || 0}`);

  const draftState = await testEndpoint('Check Assessment Draft Resumption Status', '/api/v1/assessments/draft', {
    headers: studentHeaders,
  });
  console.log(`Draft has_draft: ${draftState?.data?.has_draft}, answered: ${draftState?.data?.answered_count}/${draftState?.data?.total_questions}`);

  await testEndpoint('Save Partial Draft State', '/api/v1/assessments/draft', {
    method: 'POST',
    headers: studentHeaders,
    body: {
      current_step: 3,
      responses: [
        {
          question_id: 'a0000000-0000-0000-0000-000000000003',
          selected_option_ids: ['f0000000-0000-0000-0000-000000000014'],
          rating_value: 'intermediate',
        },
      ],
    },
  });

  // ====================================================
  // 7. Dynamic Roadmap Generation & Skill Tailoring
  // ====================================================
  const solarRoadmap = await testEndpoint('Get Career Roadmap (Solar PV)', '/api/v1/roadmaps/career/c-1?lang=te', {
    headers: studentHeaders,
  });
  console.log(`Solar Roadmap title: ${solarRoadmap?.data?.title}, stages: ${solarRoadmap?.data?.steps?.length}`);

  const webDevRoadmap = await testEndpoint('Get Tailored Web Developer Roadmap (Frontend)', '/api/v1/roadmaps/career/c-2?lang=en', {
    headers: studentHeaders,
  });
  console.log(`Web Dev Roadmap steps: ${webDevRoadmap?.data?.steps?.length || 0}`);
  if (webDevRoadmap?.data?.steps?.[0]) {
    console.log(`Step 1: ${webDevRoadmap.data.steps[0].title} | Status: ${webDevRoadmap.data.steps[0].user_progress?.status}`);
    console.log(`Step 1 Objectives: ${webDevRoadmap.data.steps[0].learning_objectives?.length || 0}`);
  }

  await testEndpoint('Update Roadmap Step Progress', '/api/v1/roadmaps/progress', {
    method: 'POST',
    headers: studentHeaders,
    body: {
      roadmap_step_id: 'd2000000-0000-0000-0000-000000000011',
      status: 'in_progress',
      notes: 'Completed HTML forms and accessible semantic markup',
    },
  });

  const progressEntries = await testEndpoint('Get Student Progress Across Roadmaps', '/api/v1/roadmaps/progress', {
    headers: studentHeaders,
  });
  console.log(`Student progress entries: ${progressEntries?.data?.length || 0}`);

  // ====================================================
  // 8. Bookmarks (Careers & Resources)
  // ====================================================
  await testEndpoint('Bookmark Career', '/api/v1/saved-careers', {
    method: 'POST',
    headers: studentHeaders,
    expectedStatus: 201,
    body: {
      career_id: 'a1000000-0000-0000-0000-000000000001',
    },
  });

  await testEndpoint('Get Bookmarked Careers', '/api/v1/saved-careers?lang=en', {
    headers: studentHeaders,
  });

  await testEndpoint('Bookmark Resource', '/api/v1/bookmarks/resources', {
    method: 'POST',
    headers: studentHeaders,
    expectedStatus: 201,
    body: {
      resource_id: 'r-001',
      title: 'freeCodeCamp Responsive Web Design Certification',
      url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      provider_name: 'freeCodeCamp',
      resource_type: 'free_course',
    },
  });

  const bookmarkedResources = await testEndpoint('Get Bookmarked Resources', '/api/v1/bookmarks/resources', {
    headers: studentHeaders,
  });
  console.log(`Bookmarked Resources Count: ${bookmarkedResources?.data?.length || 0}`);

  // ====================================================
  // 9. Protected Admin Content Management API (/api/v1/admin/*)
  // ====================================================
  // Non-admin request must be rejected with 403 Forbidden
  await testEndpoint('Admin Stats as Student (Expect 403 Forbidden)', '/api/v1/admin/stats', {
    headers: studentHeaders,
    expectedStatus: 403,
  });

  const adminHeaders = {
    Authorization: 'Bearer mock-admin-token-777',
    'X-Dev-User-Id': 'admin-00000000-0000-0000-0000-000000000001',
    'X-Dev-Role': 'admin',
    'X-Admin-Key': 'margdarshak-admin-secret',
  };

  const adminStats = await testEndpoint('Admin Dashboard Stats (Authorized Admin)', '/api/v1/admin/stats', {
    headers: adminHeaders,
  });
  console.log('Admin Stats:', JSON.stringify(adminStats?.data));

  const adminCareers = await testEndpoint('Admin Careers List', '/api/v1/admin/careers', {
    headers: adminHeaders,
  });
  console.log(`Admin Careers Count: ${adminCareers?.data?.length || 0}`);

  const adminSkills = await testEndpoint('Admin Skills List', '/api/v1/admin/skills', {
    headers: adminHeaders,
  });
  console.log(`Admin Skills Count: ${adminSkills?.data?.length || 0}`);

  const adminResources = await testEndpoint('Admin Resources List', '/api/v1/admin/resources', {
    headers: adminHeaders,
  });
  console.log(`Admin Resources Count: ${adminResources?.data?.length || 0}`);

  const adminSchemes = await testEndpoint('Admin Schemes List', '/api/v1/admin/schemes', {
    headers: adminHeaders,
  });
  console.log(`Admin Schemes Count: ${adminSchemes?.data?.length || 0}`);

  // Test admin skill creation
  const uniqueSkillName = `Micro-Irrigation Solar Pumps ${Date.now()}`;
  await testEndpoint('Admin Create Skill', '/api/v1/admin/skills', {
    method: 'POST',
    headers: adminHeaders,
    expectedStatus: 201,
    body: {
      name: uniqueSkillName,
      category: 'trade',
      description: 'Installation and servicing of solar-powered borewell submersible pumps',
      name_hi: 'सोलर पंप स्थापना',
      name_te: 'సోలార్ పంప్ ఇన్‌స్టాలేషన్',
    },
  });

  // Test admin safe career deletion (soft-delete to preserve student records)
  const safeDeleteRes = await testEndpoint('Admin Safe Career Archive (Soft Delete)', '/api/v1/admin/careers/a1000000-0000-0000-0000-000000000001', {
    method: 'DELETE',
    headers: adminHeaders,
  });
  console.log('Safe Delete Result:', safeDeleteRes?.data?.message || safeDeleteRes?.message);

  // ====================================================
  // 10. FastAPI Recommendation Proxy & Recommendations
  // ====================================================
  const recoHealth = await testEndpoint('Recommendation Service Health Check', '/api/v1/recommendations/health-check');
  console.log('Reco Service Connection:', recoHealth?.data?.status);

  // Test direct prediction proxy
  const proxyResult = await testEndpoint('Recommendation Direct Predict Proxy', '/api/v1/recommendations/predict', {
    method: 'POST',
    body: {
      user_id: 'test-student-99',
      language: 'en',
      education_level: '12th_standard',
      skills: [{ name: 'HTML', proficiency_level: 'intermediate' }],
      interests: [{ code: 'technology', name: 'Technology & Computing' }],
      preferences: {
        preferred_work_environment: 'office_desk',
        willingness_to_relocate: 'within_state',
      },
    },
  });
  console.log(`Direct Predict Recommendations Count: ${proxyResult?.data?.recommendations?.length || 0}`);

  // Student recommendations
  const studentRecos = await testEndpoint('Get Student Recommendations (Telugu)', '/api/v1/recommendations?lang=te', {
    headers: studentHeaders,
  });
  console.log(`Student Recommendations Count: ${studentRecos?.data?.length || 0}`);
  if (studentRecos?.data?.[0]) {
    console.log(`Top Reco: ${studentRecos.data[0].career?.title} (${studentRecos.data[0].match_score}%)`);
  }

  // ====================================================
  // 11. Opportunities by Categories
  // ====================================================
  await testEndpoint('Opportunities - Scholarships', '/api/v1/opportunities?category=scholarship');
  await testEndpoint('Opportunities - Govt Schemes', '/api/v1/opportunities?category=government_scheme');
  await testEndpoint('Opportunities - Free Courses', '/api/v1/opportunities?category=free_course');
  await testEndpoint('Opportunities - Internships', '/api/v1/opportunities?category=internship');
  await testEndpoint('Opportunities - Jobs', '/api/v1/opportunities?category=job');
  await testEndpoint('Opportunities - Training Programs', '/api/v1/opportunities?category=training_program');

  // Close test server
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log('====================================================');
  console.log(`Full Test Suite Finished: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

void runTestSuite();
