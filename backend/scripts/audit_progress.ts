import { getAdminClient } from '../src/config/supabase';

async function audit() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      id,
      user_id,
      roadmap_step_id,
      status,
      updated_at,
      step:roadmap_steps (
        id,
        step_number,
        title,
        roadmap_id,
        roadmap:roadmaps (
          id,
          title
        )
      )
    `);

  if (error) {
    console.error('Audit query error:', error.message);
    return;
  }

  console.log(`Total user_progress rows in DB: ${data.length}`);
  const userCounts: Record<string, number> = {};
  const roadmapCounts: Record<string, number> = {};

  data.forEach((r: any) => {
    userCounts[r.user_id] = (userCounts[r.user_id] || 0) + 1;
    const rTitle = r.step?.roadmap?.title || 'Unknown Roadmap';
    roadmapCounts[rTitle] = (roadmapCounts[rTitle] || 0) + 1;
    console.log(`[User: ${r.user_id}] Step ${r.step?.step_number}: "${r.step?.title}" | Roadmap: "${rTitle}" | Status: ${r.status}`);
  });

  console.log('\n--- Summary by User ---');
  console.log(userCounts);
  console.log('\n--- Summary by Roadmap ---');
  console.log(roadmapCounts);
}

audit();
