import { getAdminClient } from '../src/config/supabase';

async function auditDatabase() {
  const supabase = getAdminClient();

  const tables = [
    'profiles',
    'career_categories',
    'careers',
    'career_translations',
    'skills',
    'career_skills',
    'interests',
    'assessment_questions',
    'assessment_options',
    'assessment_responses',
    'roadmaps',
    'roadmap_steps',
    'learning_resources',
    'opportunities',
    'job_portals',
    'user_progress',
    'saved_careers',
  ];

  console.log('=== MARGDARSHAK DATABASE AUDIT ===');
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table [${t}]: ERROR - ${error.message}`);
    } else {
      console.log(`Table [${t}]: ${count} records`);
    }
  }

  // Check profiles details
  const { data: profs } = await supabase.from('profiles').select('id, full_name, email');
  console.log('\n--- Profiles Details ---');
  console.log(profs);

  // Check roadmaps and their steps
  const { data: rms } = await supabase.from('roadmaps').select('id, career_id, title');
  console.log('\n--- Roadmaps and Step Counts ---');
  for (const rm of rms || []) {
    const { data: steps, count } = await supabase.from('roadmap_steps').select('id, step_number, title', { count: 'exact' }).eq('roadmap_id', rm.id);
    console.log(`Roadmap [${rm.id}] "${rm.title}": ${count} steps`);
    if (steps && steps.length > 0) {
      console.log(`   Sample step ID: ${steps[0].id} - "${steps[0].title}"`);
    }
  }
}

auditDatabase().catch(console.error);
