/**
 * TypeScript Data Models for Student Profile & Guided Career Assessment
 * Structured for direct compatibility with the FastAPI Recommendation Engine.
 */

export interface StudentProfile {
  id?: string;
  name: string;
  currentEducationLevel: string;
  educationalStream: string;
  courseOrSpecialization: string;
  graduationYear: string;
  technicalSkills: string[];
  nonTechnicalSkills: string[];
  interests: string[];
  preferredCareerFields: string[];
  preferredLearningMethod: 'practical_hands_on' | 'classroom' | 'self_paced' | 'apprenticeship_on_job';
  preferredLanguage: 'en' | 'te' | 'hi';
  state: string;
  district: string;
  willingnessToRelocate: 'within_district' | 'within_state' | 'anywhere_in_india';
  updatedAt?: string;
}

export interface InterestRating {
  fieldId: string;
  interestLevel: 'high' | 'moderate' | 'low'; // High interest, Some interest, Not interested
}

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced';

export interface SkillSelfAssessment {
  skillId: string;
  level: SkillProficiency;
}

export interface WorkPreferences {
  teamDynamic: 'independent' | 'team_collaboration' | 'flexible';
  learningStyle: 'practical_hands_on' | 'theoretical_conceptual' | 'balanced';
  workEnvironment: 'field_outdoor' | 'office_desk' | 'remote_home' | 'no_preference';
  careerTiming: 'early_employment' | 'higher_education_first' | 'apprenticeship_while_learning';
}

export interface EducationEligibility {
  qualification: string;
  relevantSubjects: string[];
  additionalCertifications: string[];
  otherCertificationDetails?: string;
}

export interface AssessmentResponse {
  id?: string;
  userId?: string;
  completedAt?: string;
  isDraft: boolean;
  currentStep: number;
  // Section A: Interests
  interests: string[]; // Selected interest IDs
  interestRatings?: Record<string, 'high' | 'moderate'>;
  // Section B: Skills
  skillProficiencies: Record<string, SkillProficiency>;
  // Section C: Preferences
  preferences: WorkPreferences;
  // Section D: Education & Eligibility
  education: EducationEligibility;
}

/**
 * Standard Payload contract sent to the Python FastAPI Recommendation Service
 * Matches the schema specified in PROJECT_ARCHITECTURE.md
 */
export interface RecommendationServicePayload {
  user_id: string;
  language: string;
  education_level: string;
  stream: string;
  specialization: string;
  declared_skills: {
    technical: string[];
    soft: string[];
  };
  skill_proficiencies: Record<string, string>;
  interest_sectors: string[];
  work_preferences: {
    environment: string;
    learning_style: string;
    team_dynamic: string;
    career_timing: string;
    mobility: string;
  };
  certifications: string[];
  location: {
    state: string;
    district: string;
  };
}
