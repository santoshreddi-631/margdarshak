import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AssessmentResponse,
  RecommendationServicePayload,
  StudentProfile,
} from '@/models/assessment';

const STORAGE_KEYS = {
  ASSESSMENT_DRAFT: '@margdarshak_assessment_draft',
  ASSESSMENT_COMPLETED: '@margdarshak_assessment_completed',
  STUDENT_PROFILE_FULL: '@margdarshak_student_profile_full',
};

/**
 * Saves in-progress assessment draft so the student can resume later
 */
export async function saveAssessmentDraft(
  data: Partial<AssessmentResponse>,
  currentStep: number
): Promise<void> {
  try {
    const payload = {
      ...data,
      currentStep,
      isDraft: true,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.ASSESSMENT_DRAFT,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Failed to save assessment draft to storage', error);
  }
}

/**
 * Retrieves the currently saved assessment draft
 */
export async function getAssessmentDraft(): Promise<{
  data: Partial<AssessmentResponse>;
  currentStep: number;
} | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ASSESSMENT_DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      data: parsed,
      currentStep: parsed.currentStep || 1,
    };
  } catch (error) {
    console.error('Failed to read assessment draft from storage', error);
    return null;
  }
}

/**
 * Saves completed assessment response snapshot
 */
export async function saveCompletedAssessment(
  response: AssessmentResponse
): Promise<void> {
  try {
    const finalized: AssessmentResponse = {
      ...response,
      isDraft: false,
      completedAt: new Date().toISOString(),
    };
    await Promise.all([
      AsyncStorage.setItem(
        STORAGE_KEYS.ASSESSMENT_COMPLETED,
        JSON.stringify(finalized)
      ),
      // Clean up the draft once completed
      AsyncStorage.removeItem(STORAGE_KEYS.ASSESSMENT_DRAFT),
    ]);
  } catch (error) {
    console.error('Failed to save completed assessment', error);
    throw error;
  }
}

/**
 * Retrieves completed assessment response
 */
export async function getCompletedAssessment(): Promise<AssessmentResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ASSESSMENT_COMPLETED);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to retrieve completed assessment', error);
    return null;
  }
}

/**
 * Clears assessment data (useful for retaking the assessment)
 */
export async function clearAssessment(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ASSESSMENT_DRAFT),
      AsyncStorage.removeItem(STORAGE_KEYS.ASSESSMENT_COMPLETED),
    ]);
  } catch (error) {
    console.error('Failed to clear assessment data', error);
  }
}

/**
 * Saves comprehensive student profile
 */
export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  try {
    const payload: StudentProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.STUDENT_PROFILE_FULL,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Failed to save comprehensive student profile', error);
    throw error;
  }
}

/**
 * Retrieves comprehensive student profile
 */
export async function getStudentProfile(): Promise<StudentProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE_FULL);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to retrieve comprehensive student profile', error);
    return null;
  }
}

/**
 * Formats user assessment responses & student profile into the structured
 * JSON contract required by the Python FastAPI Recommendation Service.
 */
export function formatForRecommendationService(
  assessment: AssessmentResponse,
  profile?: StudentProfile | null
): RecommendationServicePayload {
  return {
    user_id: assessment.userId || 'guest-user',
    language: profile?.preferredLanguage || 'en',
    education_level: assessment.education.qualification || profile?.currentEducationLevel || '10th_pass',
    stream: profile?.educationalStream || 'general',
    specialization: profile?.courseOrSpecialization || 'none',
    declared_skills: {
      technical: profile?.technicalSkills || [],
      soft: profile?.nonTechnicalSkills || [],
    },
    skill_proficiencies: assessment.skillProficiencies || {},
    interest_sectors: assessment.interests || [],
    work_preferences: {
      environment: assessment.preferences.workEnvironment,
      learning_style: assessment.preferences.learningStyle,
      team_dynamic: assessment.preferences.teamDynamic,
      career_timing: assessment.preferences.careerTiming,
      mobility: profile?.willingnessToRelocate || 'within_district',
    },
    certifications: assessment.education.additionalCertifications || [],
    location: {
      state: profile?.state || 'Madhya Pradesh',
      district: profile?.district || 'Sehore',
    },
  };
}
