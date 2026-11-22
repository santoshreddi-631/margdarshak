import { getAdminClient } from '../src/config/supabase';
import { ASSESSMENT_QUESTIONS_DATA } from '../src/data/assessmentQuestionsData';

export async function seedAssessmentQuestions() {
  console.log('--- Seeding Assessment Questions & Options into Supabase ---');
  const client = getAdminClient();

  // 1. Upsert Questions
  const questionRows = ASSESSMENT_QUESTIONS_DATA.map((q) => ({
    id: q.id,
    section: q.section,
    question_key: q.question_key,
    question_text: q.question_text,
    question_text_hi: q.question_text_hi || null,
    question_text_te: q.question_text_te || null,
    question_type: q.question_type,
    display_order: q.display_order,
  }));

  const { error: qErr } = await client
    .from('assessment_questions')
    .upsert(questionRows, { onConflict: 'question_key' });

  if (qErr) {
    console.error('Error inserting assessment questions:', qErr);
    throw qErr;
  }
  console.log(`[OK] Inserted/Upserted ${questionRows.length} assessment questions`);

  // 2. Upsert Options
  const optionRows: any[] = [];
  for (const q of ASSESSMENT_QUESTIONS_DATA) {
    for (const opt of q.options) {
      optionRows.push({
        id: opt.id,
        question_id: q.id,
        option_key: opt.option_key,
        option_text: opt.option_text,
        option_text_hi: opt.option_text_hi || null,
        option_text_te: opt.option_text_te || null,
        subtext: opt.subtext || null,
        display_order: opt.display_order,
      });
    }
  }

  const { error: oErr } = await client
    .from('assessment_options')
    .upsert(optionRows, { onConflict: 'question_id,option_key' });

  if (oErr) {
    console.error('Error inserting assessment options:', oErr);
    throw oErr;
  }
  console.log(`[OK] Inserted/Upserted ${optionRows.length} assessment options`);
  console.log('--- Assessment Seeding Complete ---');
}

seedAssessmentQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
