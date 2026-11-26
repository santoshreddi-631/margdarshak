import * as fs from 'fs';
import * as path from 'path';
import { getAdminClient } from '../src/config/supabase';
import { ROADMAPS_DATA } from '../src/data/roadmapsData';
import {
  EXPANDED_SKILLS,
  MISSING_EXISTING_TRANSLATIONS,
  EXTRA_EXISTING_CAREER_SKILLS,
  EXPANDED_CAREERS,
  EXPANDED_LEARNING_RESOURCES,
  EXPANDED_OPPORTUNITIES,
  EXPANDED_JOB_PORTALS,
} from '../src/data/expandedCatalogData';
import { EXPANDED_ROADMAPS_DATA } from '../src/data/expandedRoadmapsData';

function sqlStr(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

function sqlJsonb(val: unknown): string {
  return `${sqlStr(JSON.stringify(val ?? []))}::jsonb`;
}

function buildSqlMigration(): string {
  const lines: string[] = [
    '-- ====================================================================',
    '-- SUPABASE POSTGRESQL MIGRATION: Expanded Careers, Roadmaps, Resources,',
    '-- Internships, Jobs, Government Schemes, and Portals (36 Careers Total)',
    '-- ====================================================================',
    '',
    '-- 1. Expanded Skills',
  ];

  for (const s of EXPANDED_SKILLS) {
    lines.push(
      `INSERT INTO public.skills (id, name, name_hi, name_te, category, description) VALUES (${sqlStr(s.id)}, ${sqlStr(s.name)}, ${sqlStr(s.name_hi)}, ${sqlStr(s.name_te)}, ${sqlStr(s.category)}, ${sqlStr(s.description)}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, name_hi = EXCLUDED.name_hi, name_te = EXCLUDED.name_te, category = EXCLUDED.category, description = EXCLUDED.description;`
    );
  }

  lines.push('', '-- 2. Expanded Careers');
  for (const c of EXPANDED_CAREERS) {
    lines.push(
      `INSERT INTO public.careers (id, category_id, slug, title, minimum_education, estimated_salary_range, training_duration, growth_demand, is_active, verification_status, source_url, official_occupational_code, last_verified_date) VALUES (${sqlStr(c.id)}, ${sqlStr(c.category_id)}, ${sqlStr(c.slug)}, ${sqlStr(c.title)}, ${sqlStr(c.minimum_education)}, ${sqlStr(c.estimated_salary_range)}, ${sqlStr(c.training_duration)}, ${sqlStr(c.growth_demand)}, true, ${sqlStr(c.verification_status)}, ${sqlStr(c.source_url)}, ${sqlStr(c.official_occupational_code)}, ${sqlStr(c.last_verified_date)}) ON CONFLICT (id) DO UPDATE SET category_id = EXCLUDED.category_id, slug = EXCLUDED.slug, title = EXCLUDED.title, minimum_education = EXCLUDED.minimum_education, estimated_salary_range = EXCLUDED.estimated_salary_range, training_duration = EXCLUDED.training_duration, growth_demand = EXCLUDED.growth_demand, is_active = true, verification_status = EXCLUDED.verification_status, source_url = EXCLUDED.source_url, official_occupational_code = EXCLUDED.official_occupational_code, last_verified_date = EXCLUDED.last_verified_date;`
    );
  }

  lines.push('', '-- 3. Career Translations (Missing 03/04/05 + Expanded 25..36)');
  const allTrans = [
    ...MISSING_EXISTING_TRANSLATIONS,
    ...EXPANDED_CAREERS.flatMap((c) => [
      { career_id: c.id, language_code: 'en' as const, ...c.translations.en },
      { career_id: c.id, language_code: 'te' as const, ...c.translations.te },
      { career_id: c.id, language_code: 'hi' as const, ...c.translations.hi },
    ]),
  ];
  for (const t of allTrans) {
    lines.push(
      `INSERT INTO public.career_translations (career_id, language_code, title, description, job_responsibilities, pathway_summary) VALUES (${sqlStr(t.career_id)}, ${sqlStr(t.language_code)}, ${sqlStr(t.title)}, ${sqlStr(t.description)}, ${sqlStr(t.job_responsibilities)}, ${sqlStr(t.pathway_summary)}) ON CONFLICT (career_id, language_code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, job_responsibilities = EXCLUDED.job_responsibilities, pathway_summary = EXCLUDED.pathway_summary;`
    );
  }

  lines.push('', '-- 4. Career Skills Mappings');
  const allCareerSkills = [
    ...EXTRA_EXISTING_CAREER_SKILLS,
    ...EXPANDED_CAREERS.flatMap((c) =>
      c.skills.map((s) => ({
        career_id: c.id,
        skill_id: s.skill_id,
        importance: s.importance,
      }))
    ),
  ];
  for (const cs of allCareerSkills) {
    lines.push(
      `INSERT INTO public.career_skills (career_id, skill_id, importance) VALUES (${sqlStr(cs.career_id)}, ${sqlStr(cs.skill_id)}, ${sqlStr(cs.importance)}) ON CONFLICT (career_id, skill_id) DO UPDATE SET importance = EXCLUDED.importance;`
    );
  }

  lines.push('', '-- 5. Expanded Learning Resources');
  for (const lr of EXPANDED_LEARNING_RESOURCES) {
    lines.push(
      `INSERT INTO public.learning_resources (id, career_id, title, title_hi, title_te, resource_type, provider_name, url, is_free, language, verification_status, source_url, last_verified_date) VALUES (${sqlStr(lr.id)}, ${sqlStr(lr.career_id)}, ${sqlStr(lr.title)}, ${sqlStr(lr.title_hi)}, ${sqlStr(lr.title_te)}, ${sqlStr(lr.resource_type)}, ${sqlStr(lr.provider_name)}, ${sqlStr(lr.url)}, ${lr.is_free ? 'true' : 'false'}, ${sqlStr(lr.language)}, 'OFFICIAL_VERIFIED', ${sqlStr(lr.url)}, '2026-11-26') ON CONFLICT (id) DO UPDATE SET career_id = EXCLUDED.career_id, title = EXCLUDED.title, title_hi = EXCLUDED.title_hi, title_te = EXCLUDED.title_te, resource_type = EXCLUDED.resource_type, provider_name = EXCLUDED.provider_name, url = EXCLUDED.url, is_free = EXCLUDED.is_free, language = EXCLUDED.language;`
    );
  }

  lines.push('', '-- 6. Roadmaps & Steps (23, 24 from base + 24 expanded roadmaps)');
  const roadmapMap = new Map<string, (typeof EXPANDED_ROADMAPS_DATA)[number]>();
  for (const r of [...ROADMAPS_DATA, ...EXPANDED_ROADMAPS_DATA]) {
    roadmapMap.set(r.career_id, r);
  }
  for (const rm of roadmapMap.values()) {
    lines.push(
      `INSERT INTO public.roadmaps (id, career_id, title, total_stages, estimated_duration) VALUES (${sqlStr(rm.id)}, ${sqlStr(rm.career_id)}, ${sqlStr(rm.title)}, ${rm.total_stages}, ${sqlStr(rm.estimated_duration)}) ON CONFLICT (career_id) DO UPDATE SET title = EXCLUDED.title, total_stages = EXCLUDED.total_stages, estimated_duration = EXCLUDED.estimated_duration;`
    );
    for (const st of rm.steps) {
      lines.push(
        `INSERT INTO public.roadmap_steps (id, roadmap_id, step_number, title, title_hi, title_te, description, description_hi, description_te, action_cta, schemes_applicable, learning_objectives, estimated_duration, resource_links) SELECT ${sqlStr(st.id)}, r.id, ${st.step_number}, ${sqlStr(st.title)}, ${sqlStr(st.title_hi)}, ${sqlStr(st.title_te)}, ${sqlStr(st.description)}, ${sqlStr(st.description_hi)}, ${sqlStr(st.description_te)}, ${sqlStr(st.action_cta)}, ${sqlJsonb(st.schemes_applicable || [])}, ${sqlJsonb(st.learning_objectives || [])}, ${sqlStr(st.estimated_duration)}, ${sqlJsonb(st.resource_links || [])} FROM public.roadmaps r WHERE r.career_id = ${sqlStr(rm.career_id)} ON CONFLICT (roadmap_id, step_number) DO UPDATE SET title = EXCLUDED.title, title_hi = EXCLUDED.title_hi, title_te = EXCLUDED.title_te, description = EXCLUDED.description, description_hi = EXCLUDED.description_hi, description_te = EXCLUDED.description_te, action_cta = EXCLUDED.action_cta, schemes_applicable = EXCLUDED.schemes_applicable, learning_objectives = EXCLUDED.learning_objectives, estimated_duration = EXCLUDED.estimated_duration, resource_links = EXCLUDED.resource_links;`
      );
    }
  }

  lines.push('', '-- 7. Expanded Opportunities (Internships, Jobs, Schemes, Apprenticeships, Courses)');
  for (const op of EXPANDED_OPPORTUNITIES) {
    lines.push(
      `INSERT INTO public.opportunities (id, title, title_hi, title_te, ministry_or_agency, category, financial_benefit, eligibility_criteria, portal_url, deadline_notice, is_active, verification_status, source_url, last_verified_date) VALUES (${sqlStr(op.id)}, ${sqlStr(op.title)}, ${sqlStr(op.title_hi)}, ${sqlStr(op.title_te)}, ${sqlStr(op.ministry_or_agency)}, ${sqlStr(op.category)}, ${sqlStr(op.financial_benefit)}, ${sqlStr(op.eligibility_criteria)}, ${sqlStr(op.portal_url)}, ${sqlStr(op.deadline_notice)}, ${op.is_active ? 'true' : 'false'}, ${sqlStr(op.verification_status)}, ${sqlStr(op.source_url)}, ${sqlStr(op.last_verified_date)}) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, title_hi = EXCLUDED.title_hi, title_te = EXCLUDED.title_te, ministry_or_agency = EXCLUDED.ministry_or_agency, category = EXCLUDED.category, financial_benefit = EXCLUDED.financial_benefit, eligibility_criteria = EXCLUDED.eligibility_criteria, portal_url = EXCLUDED.portal_url, deadline_notice = EXCLUDED.deadline_notice, is_active = EXCLUDED.is_active, verification_status = EXCLUDED.verification_status, source_url = EXCLUDED.source_url, last_verified_date = EXCLUDED.last_verified_date;`
    );
  }

  lines.push('', '-- 8. Expanded Job & Internship Portals');
  for (const jp of EXPANDED_JOB_PORTALS) {
    lines.push(
      `INSERT INTO public.job_portals (id, name, url, portal_type, description, description_hi, description_te, target_users, opportunity_categories, geographic_coverage, application_method, language_availability, verification_status, last_checked_date) VALUES (${sqlStr(jp.id)}, ${sqlStr(jp.name)}, ${sqlStr(jp.url)}, ${sqlStr(jp.portal_type)}, ${sqlStr(jp.description)}, ${sqlStr(jp.description_hi)}, ${sqlStr(jp.description_te)}, ${sqlStr(jp.target_users)}, ${sqlJsonb(jp.opportunity_categories)}, ${sqlStr(jp.geographic_coverage)}, ${sqlStr(jp.application_method)}, ${sqlJsonb(jp.language_availability)}, ${sqlStr(jp.verification_status)}, ${sqlStr(jp.last_checked_date)}) ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url, portal_type = EXCLUDED.portal_type, description = EXCLUDED.description, description_hi = EXCLUDED.description_hi, description_te = EXCLUDED.description_te, target_users = EXCLUDED.target_users, opportunity_categories = EXCLUDED.opportunity_categories, geographic_coverage = EXCLUDED.geographic_coverage, application_method = EXCLUDED.application_method, language_availability = EXCLUDED.language_availability, verification_status = EXCLUDED.verification_status, last_checked_date = EXCLUDED.last_checked_date;`
    );
  }

  return lines.join('\n') + '\n';
}

async function withRetry<T>(label: string, fn: () => Promise<{ data?: T; error: { message: string } | null }>): Promise<T | undefined> {
  let lastErr = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fn();
      if (!res.error) return res.data;
      lastErr = res.error.message;
      if (!lastErr.toLowerCase().includes('fetch failed') && !lastErr.toLowerCase().includes('timeout')) {
        throw new Error(`${label}: ${lastErr}`);
      }
    } catch (err: any) {
      lastErr = err?.message || String(err);
      if (attempt === 4) throw err;
    }
    await new Promise((r) => setTimeout(r, 400 * attempt));
  }
  throw new Error(`${label} failed after retries: ${lastErr}`);
}

async function syncExpandedDatabase() {
  const client = getAdminClient();
  console.log('=== SYNCING EXPANDED MARGDARSHAK DATA TO LIVE SUPABASE ===');

  // 1. Write SQL migration artifact in supabase/migrations/
  const migrationPath = path.resolve(
    __dirname,
    '../../supabase/migrations/20261126000001_expand_careers_roadmaps_internships.sql'
  );
  fs.writeFileSync(migrationPath, buildSqlMigration(), 'utf8');
  console.log(`[OK] Wrote SQL migration -> ${migrationPath}`);

  // 2. Upsert Expanded Skills
  await withRetry('Expanded skills upsert', async () =>
    await client.from('skills').upsert(EXPANDED_SKILLS, { onConflict: 'id' })
  );
  console.log(`[OK] Synced ${EXPANDED_SKILLS.length} expanded skills`);

  const allDbSkills =
    (await withRetry('Fetch skills', async () => await client.from('skills').select('id, name'))) || [];
  const validSkillIds = new Set(allDbSkills.map((s) => s.id));

  // 3. Upsert Missing Existing Translations (03, 04, 05)
  await withRetry('Missing translations upsert', async () =>
    await client
      .from('career_translations')
      .upsert(MISSING_EXISTING_TRANSLATIONS, { onConflict: 'career_id,language_code' })
  );
  console.log(`[OK] Synced ${MISSING_EXISTING_TRANSLATIONS.length} missing career translations (03/04/05)`);

  // 4. Upsert Extra Existing Career Skills
  const validExtraSkills = EXTRA_EXISTING_CAREER_SKILLS.filter((s) => validSkillIds.has(s.skill_id));
  if (validExtraSkills.length > 0) {
    await withRetry('Extra career skills upsert', async () =>
      await client.from('career_skills').upsert(validExtraSkills, { onConflict: 'career_id,skill_id' })
    );
  }
  console.log(`[OK] Synced ${validExtraSkills.length} extra existing career skill mappings`);

  // 5. Batch-Upsert Expanded Careers (25..36), translations, and skills
  const careerRows = EXPANDED_CAREERS.map((c) => ({
    id: c.id,
    category_id: c.category_id,
    slug: c.slug,
    title: c.title,
    minimum_education: c.minimum_education,
    estimated_salary_range: c.estimated_salary_range,
    training_duration: c.training_duration,
    growth_demand: c.growth_demand,
    is_active: true,
    verification_status: c.verification_status,
    source_url: c.source_url,
    official_occupational_code: c.official_occupational_code,
    last_verified_date: c.last_verified_date,
  }));
  await withRetry('Expanded careers upsert', async () =>
    await client.from('careers').upsert(careerRows, { onConflict: 'id' })
  );

  const expandedTransRows = EXPANDED_CAREERS.flatMap((c) => [
    { career_id: c.id, language_code: 'en', ...c.translations.en },
    { career_id: c.id, language_code: 'te', ...c.translations.te },
    { career_id: c.id, language_code: 'hi', ...c.translations.hi },
  ]);
  await withRetry('Expanded career translations upsert', async () =>
    await client.from('career_translations').upsert(expandedTransRows, { onConflict: 'career_id,language_code' })
  );

  const expandedCsRows = EXPANDED_CAREERS.flatMap((c) =>
    c.skills
      .filter((s) => validSkillIds.has(s.skill_id))
      .map((s) => ({
        career_id: c.id,
        skill_id: s.skill_id,
        importance: s.importance,
      }))
  );
  if (expandedCsRows.length > 0) {
    await withRetry('Expanded career skills upsert', async () =>
      await client.from('career_skills').upsert(expandedCsRows, { onConflict: 'career_id,skill_id' })
    );
  }
  console.log(`[OK] Synced ${EXPANDED_CAREERS.length} expanded careers with translations & skills`);

  // 6. Upsert Learning Resources
  const resourceRows = EXPANDED_LEARNING_RESOURCES.map((lr) => ({
    ...lr,
    verification_status: 'OFFICIAL_VERIFIED',
    source_url: lr.url,
    last_verified_date: '2026-11-26',
  }));
  await withRetry('Learning resources upsert', async () =>
    await client.from('learning_resources').upsert(resourceRows, { onConflict: 'id' })
  );
  console.log(`[OK] Synced ${resourceRows.length} expanded learning resources`);

  // 7. Batch-Upsert All Roadmaps & Steps (preserve existing roadmap/step UUIDs)
  const uniqueRoadmaps = new Map<string, (typeof EXPANDED_ROADMAPS_DATA)[number]>();
  for (const r of [...ROADMAPS_DATA, ...EXPANDED_ROADMAPS_DATA]) {
    uniqueRoadmaps.set(r.career_id, r);
  }

  const existingRoadmaps =
    (await withRetry('Fetch roadmaps', async () => await client.from('roadmaps').select('id, career_id'))) || [];
  const existingRmByCareer = new Map<string, string>();
  for (const r of existingRoadmaps) existingRmByCareer.set(r.career_id, r.id);

  const roadmapRowsToUpsert = Array.from(uniqueRoadmaps.values()).map((rm) => ({
    id: existingRmByCareer.get(rm.career_id) || rm.id,
    career_id: rm.career_id,
    title: rm.title,
    total_stages: rm.total_stages,
    estimated_duration: rm.estimated_duration,
  }));
  await withRetry('Roadmaps batch upsert', async () =>
    await client.from('roadmaps').upsert(roadmapRowsToUpsert, { onConflict: 'career_id' })
  );

  const existingSteps =
    (await withRetry('Fetch roadmap_steps', async () =>
      await client.from('roadmap_steps').select('id, roadmap_id, step_number')
    )) || [];
  const existingStepIdMap = new Map<string, string>();
  for (const st of existingSteps) {
    existingStepIdMap.set(`${st.roadmap_id}:${st.step_number}`, st.id);
  }

  const allStepRows = Array.from(uniqueRoadmaps.values()).flatMap((rm) => {
    const targetRoadmapId = existingRmByCareer.get(rm.career_id) || rm.id;
    return rm.steps.map((st) => ({
      id: existingStepIdMap.get(`${targetRoadmapId}:${st.step_number}`) || st.id,
      roadmap_id: targetRoadmapId,
      step_number: st.step_number,
      title: st.title,
      title_hi: st.title_hi,
      title_te: st.title_te,
      description: st.description,
      description_hi: st.description_hi,
      description_te: st.description_te,
      action_cta: st.action_cta,
      schemes_applicable: st.schemes_applicable || [],
      learning_objectives: st.learning_objectives || [],
      estimated_duration: st.estimated_duration,
      resource_links: st.resource_links || [],
    }));
  });

  const CHUNK_SIZE = 40;
  for (let i = 0; i < allStepRows.length; i += CHUNK_SIZE) {
    const chunk = allStepRows.slice(i, i + CHUNK_SIZE);
    await withRetry(`Roadmap steps batch ${i / CHUNK_SIZE + 1}`, async () =>
      await client.from('roadmap_steps').upsert(chunk, { onConflict: 'roadmap_id,step_number' })
    );
  }
  console.log(`[OK] Synced ${uniqueRoadmaps.size} roadmaps and ${allStepRows.length} steps`);

  // 8. Upsert Opportunities
  await withRetry('Opportunities upsert', async () =>
    await client.from('opportunities').upsert(EXPANDED_OPPORTUNITIES, { onConflict: 'id' })
  );
  console.log(`[OK] Synced ${EXPANDED_OPPORTUNITIES.length} expanded opportunities`);

  // 9. Upsert Job Portals
  await withRetry('Job portals upsert', async () =>
    await client.from('job_portals').upsert(EXPANDED_JOB_PORTALS, { onConflict: 'name' })
  );
  console.log(`[OK] Synced ${EXPANDED_JOB_PORTALS.length} expanded job portals`);

  // Dump existing careers 02..05 details + category code map for reco sync
  const { data: legacyFour } = await client
    .from('careers')
    .select('id, slug, title, minimum_education, estimated_salary_range, training_duration, growth_demand, career_categories(code), career_translations(language_code, title, description), career_skills(importance, skills(name))')
    .in('id', [
      'a1000000-0000-0000-0000-000000000002',
      'a1000000-0000-0000-0000-000000000003',
      'a1000000-0000-0000-0000-000000000004',
      'a1000000-0000-0000-0000-000000000005',
    ])
    .order('id');
  console.log('\n--- Base Careers 02-05 Snapshot (for careers.json sync) ---');
  console.log(JSON.stringify(legacyFour, null, 2));

  // 10. Comprehensive Verification Audit
  console.log('\n=== LIVE DATABASE COMPLETENESS AUDIT ===');
  const tableNames = [
    'career_categories',
    'careers',
    'career_translations',
    'skills',
    'career_skills',
    'learning_resources',
    'roadmaps',
    'roadmap_steps',
    'opportunities',
    'job_portals',
  ];
  for (const tbl of tableNames) {
    const { count, error } = await client.from(tbl).select('*', { count: 'exact', head: true });
    console.log(`  ${tbl.padEnd(22)}: ${error ? `ERROR (${error.message})` : count}`);
  }

  const { data: careers } = await client
    .from('careers')
    .select('id, slug, title, is_active')
    .order('id');
  const { data: trans } = await client.from('career_translations').select('career_id, language_code');
  const { data: cskills } = await client.from('career_skills').select('career_id');
  const { data: resources } = await client.from('learning_resources').select('career_id');
  const { data: roadmaps } = await client.from('roadmaps').select('id, career_id');
  const { data: rsteps } = await client.from('roadmap_steps').select('roadmap_id');
  const { data: opps } = await client.from('opportunities').select('category').eq('is_active', true);

  const transByCareer = new Map<string, Set<string>>();
  for (const t of trans || []) {
    if (!transByCareer.has(t.career_id)) transByCareer.set(t.career_id, new Set());
    transByCareer.get(t.career_id)!.add(t.language_code);
  }
  const skillCountByCareer = new Map<string, number>();
  for (const cs of cskills || []) {
    skillCountByCareer.set(cs.career_id, (skillCountByCareer.get(cs.career_id) || 0) + 1);
  }
  const resCountByCareer = new Map<string, number>();
  for (const lr of resources || []) {
    if (lr.career_id) resCountByCareer.set(lr.career_id, (resCountByCareer.get(lr.career_id) || 0) + 1);
  }
  const stepCountByRoadmap = new Map<string, number>();
  for (const st of rsteps || []) {
    stepCountByRoadmap.set(st.roadmap_id, (stepCountByRoadmap.get(st.roadmap_id) || 0) + 1);
  }
  const roadmapByCareer = new Map<string, string>();
  for (const rm of roadmaps || []) {
    roadmapByCareer.set(rm.career_id, rm.id);
  }

  const gaps: string[] = [];
  for (const c of careers || []) {
    const langs = transByCareer.get(c.id)?.size || 0;
    const sk = skillCountByCareer.get(c.id) || 0;
    const rs = resCountByCareer.get(c.id) || 0;
    const rmId = roadmapByCareer.get(c.id);
    const st = rmId ? stepCountByRoadmap.get(rmId) || 0 : 0;
    if (langs < 3 || sk === 0 || rs === 0 || st === 0) {
      gaps.push(`${c.slug} (${c.id}): langs=${langs}, skills=${sk}, res=${rs}, steps=${st}`);
    }
  }

  if (gaps.length === 0) {
    console.log(`\n[PASS] All ${careers?.length} careers have EN/HI/TE translations, skills, learning resources, roadmaps & steps!`);
  } else {
    console.log('\n[WARN] Incomplete careers found:');
    gaps.forEach((g) => console.log('  -', g));
  }

  const oppCounts: Record<string, number> = {};
  for (const o of opps || []) {
    oppCounts[o.category] = (oppCounts[o.category] || 0) + 1;
  }
  console.log('\nActive Opportunities by Category:', oppCounts);
}

syncExpandedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
