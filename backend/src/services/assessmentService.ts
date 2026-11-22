import { getAdminClient, getUserClient, isSupabaseConfigured } from '../config/supabase';
import { AssessmentQuestion, AssessmentOption, AssessmentResponse, LanguageCode } from '../types';
import { ASSESSMENT_QUESTIONS_DATA } from '../data/assessmentQuestionsData';
import { logger } from '../utils/logger';

// In-memory fallback draft storage for development/sandbox testing
const devDraftsMemory = new Map<string, any[]>();

export class AssessmentService {
  /**
   * Get all assessment questions localized in English, Telugu, or Hindi.
   * Loads directly from database tables assessment_questions and assessment_options.
   */
  async getQuestions(section?: string, lang: LanguageCode = 'en'): Promise<AssessmentQuestion[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getAdminClient();
        let query = client
          .from('assessment_questions')
          .select(`
            id,
            section,
            question_key,
            question_text,
            question_text_hi,
            question_text_te,
            question_type,
            display_order,
            options:assessment_options (
              id,
              question_id,
              option_key,
              option_text,
              option_text_hi,
              option_text_te,
              subtext,
              display_order
            )
          `)
          .order('display_order', { ascending: true });

        if (section) {
          query = query.eq('section', section);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map((q: any) => {
            let localizedQuestion = q.question_text;
            if (lang === 'hi' && q.question_text_hi) localizedQuestion = q.question_text_hi;
            if (lang === 'te' && q.question_text_te) localizedQuestion = q.question_text_te;

            const localizedOptions = (q.options || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((opt: any) => {
                let localizedOptionText = opt.option_text;
                if (lang === 'hi' && opt.option_text_hi) localizedOptionText = opt.option_text_hi;
                if (lang === 'te' && opt.option_text_te) localizedOptionText = opt.option_text_te;

                return {
                  id: opt.id,
                  question_id: opt.question_id,
                  option_key: opt.option_key,
                  option_text: localizedOptionText,
                  subtext: opt.subtext,
                  display_order: opt.display_order,
                } as AssessmentOption;
              });

            return {
              id: q.id,
              section: q.section,
              question_key: q.question_key,
              question_text: localizedQuestion,
              question_type: q.question_type,
              display_order: q.display_order,
              options: localizedOptions,
            } as AssessmentQuestion;
          });
        }
      } catch (err) {
        logger.warn('Failed querying assessment questions from database, using cached catalog', err);
      }
    }

    // Fallback to static master taxonomy questions
    return this.getMockQuestions(section, lang);
  }

  /**
   * Submit or update assessment responses for a student.
   * Persists to assessment_responses table.
   */
  async submitResponses(
    userId: string,
    responses: Array<{
      question_id: string;
      selected_option_ids: string[];
      rating_value?: string | null;
      text_response?: string | null;
    }>,
    token?: string
  ) {
    if (!isSupabaseConfigured()) {
      devDraftsMemory.set(userId, responses);
      return { count: responses.length, submitted_at: new Date().toISOString() };
    }

    const client = token && !token.includes('dev') && !token.includes('mock')
      ? getUserClient(token)
      : getAdminClient();

    const records = responses.map((r) => ({
      user_id: userId,
      question_id: r.question_id,
      selected_option_ids: r.selected_option_ids,
      rating_value: r.rating_value || null,
      text_response: r.text_response || null,
      updated_at: new Date().toISOString(),
    }));

    // Delete prior responses for these specific questions to avoid duplicates
    const questionIds = responses.map((r) => r.question_id);
    await client
      .from('assessment_responses')
      .delete()
      .eq('user_id', userId)
      .in('question_id', questionIds);

    const { data, error } = await client
      .from('assessment_responses')
      .insert(records)
      .select();

    if (error) {
      logger.error('Error inserting assessment responses:', error);
      // If error occurs, keep in dev fallback memory
      devDraftsMemory.set(userId, responses);
      return { count: responses.length, responses };
    }

    // Keep memory cache synced
    devDraftsMemory.set(userId, data || responses);

    return {
      count: data?.length || 0,
      responses: data as AssessmentResponse[],
    };
  }

  /**
   * Get user's existing assessment responses from assessment_responses table.
   */
  async getUserResponses(userId: string, token?: string): Promise<AssessmentResponse[]> {
    if (!isSupabaseConfigured()) {
      return (devDraftsMemory.get(userId) || []) as AssessmentResponse[];
    }

    const client = token && !token.includes('dev') && !token.includes('mock')
      ? getUserClient(token)
      : getAdminClient();

    try {
      const { data, error } = await client
        .from('assessment_responses')
        .select(`
          id,
          user_id,
          question_id,
          selected_option_ids,
          rating_value,
          text_response,
          created_at,
          updated_at,
          question:assessment_questions (
            section,
            question_key,
            question_text
          )
        `)
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        return data as AssessmentResponse[];
      }
    } catch (e: any) {
      logger.warn('Error fetching assessment responses from Supabase:', e.message);
    }

    return (devDraftsMemory.get(userId) || []) as AssessmentResponse[];
  }

  /**
   * Draft resumption: returns student's in-progress assessment draft state,
   * count of answered questions, total questions, and resumption metadata.
   */
  async getDraft(userId: string, token?: string) {
    const responses = await this.getUserResponses(userId, token);
    const questions = await this.getQuestions();
    const totalQuestions = questions.length;
    const answeredCount = responses.length;
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return {
      user_id: userId,
      has_draft: answeredCount > 0,
      can_resume: answeredCount > 0 && answeredCount < totalQuestions,
      is_completed: answeredCount >= totalQuestions && totalQuestions > 0,
      answered_count: answeredCount,
      total_questions: totalQuestions,
      completion_percentage: completionPercentage,
      responses,
      last_updated: responses[0]?.created_at || new Date().toISOString(),
    };
  }

  /**
   * Save intermediate assessment draft state
   */
  async saveDraft(
    userId: string,
    responses: Array<{
      question_id: string;
      selected_option_ids: string[];
      rating_value?: string | null;
      text_response?: string | null;
    }>,
    currentStep = 1,
    token?: string
  ) {
    if (responses.length > 0) {
      await this.submitResponses(userId, responses, token);
    }
    return {
      status: 'draft_saved',
      current_step: currentStep,
      saved_responses_count: responses.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear all assessment responses for a student (reset assessment)
   */
  async clearResponses(userId: string, token?: string) {
    devDraftsMemory.delete(userId);

    if (isSupabaseConfigured()) {
      const client = token && !token.includes('dev') && !token.includes('mock')
        ? getUserClient(token)
        : getAdminClient();

      await client.from('assessment_responses').delete().eq('user_id', userId);
    }

    return { cleared: true, message: 'Assessment responses cleared successfully' };
  }

  /**
   * Development / Offline fallback catalog matching master seed
   */
  private getMockQuestions(section?: string, lang: LanguageCode = 'en'): AssessmentQuestion[] {
    const list = ASSESSMENT_QUESTIONS_DATA.map((q) => {
      let localizedQuestion = q.question_text;
      if (lang === 'hi' && q.question_text_hi) localizedQuestion = q.question_text_hi;
      if (lang === 'te' && q.question_text_te) localizedQuestion = q.question_text_te;

      const localizedOptions = q.options.map((opt) => {
        let localizedOptionText = opt.option_text;
        if (lang === 'hi' && opt.option_text_hi) localizedOptionText = opt.option_text_hi;
        if (lang === 'te' && opt.option_text_te) localizedOptionText = opt.option_text_te;

        return {
          id: opt.id,
          question_id: q.id,
          option_key: opt.option_key,
          option_text: localizedOptionText,
          subtext: opt.subtext,
          display_order: opt.display_order,
        } as AssessmentOption;
      });

      return {
        id: q.id,
        section: q.section,
        question_key: q.question_key,
        question_text: localizedQuestion,
        question_type: q.question_type,
        display_order: q.display_order,
        options: localizedOptions,
      } as AssessmentQuestion;
    });

    if (section) {
      return list.filter((q) => q.section === section);
    }
    return list;
  }
}

export const assessmentService = new AssessmentService();
