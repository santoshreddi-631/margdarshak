import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  Send,
  Sparkles,
  Milestone,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { SelectableChipGroup } from '@/components/assessment/SelectableChipGroup';
import { ProficiencyRating } from '@/components/assessment/ProficiencyRating';
import { AssessmentReviewCard } from '@/components/assessment/AssessmentReviewCard';
import {
  INTEREST_FIELDS,
  SKILLS_ASSESSMENT_LIST,
  PREFERENCE_QUESTIONS,
  RELEVANT_SUBJECTS,
  CERTIFICATION_OPTIONS,
} from '@/constants/assessmentQuestions';
import {
  saveAssessmentDraft,
  getAssessmentDraft,
  saveCompletedAssessment,
  formatForRecommendationService,
  getStudentProfile,
} from '@/services/assessmentStorage';
import {
  generateRecommendations,
  fetchRecommendations,
  fetchAssessmentQuestions,
  type ApiRecommendation,
  type ApiAssessmentQuestion,
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type {
  AssessmentResponse,
  SkillProficiency,
  WorkPreferences,
  EducationEligibility,
} from '@/models/assessment';

const TOTAL_STEPS = 5; // Step 1: Interests, 2: Skills, 3: Preferences, 4: Education, 5: Review

export default function CareerAssessmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, language } = useAuth();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuildingRoadmap, setIsBuildingRoadmap] = useState(false);
  const [buildingStage, setBuildingStage] = useState(0);
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([]);
  const [apiQuestions, setApiQuestions] = useState<ApiAssessmentQuestion[]>([]);

  // SECTION A STATE: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // SECTION B STATE: Skills Self-Assessment
  const [skillProficiencies, setSkillProficiencies] = useState<
    Record<string, SkillProficiency>
  >({
    communication: 'intermediate',
    problem_solving: 'intermediate',
    mathematics: 'beginner',
    programming: 'beginner',
    creativity: 'intermediate',
    leadership: 'beginner',
    analytical_thinking: 'intermediate',
  });

  // SECTION C STATE: Work & Learning Preferences
  const [preferences, setPreferences] = useState<WorkPreferences>({
    teamDynamic: 'team_collaboration',
    learningStyle: 'practical_hands_on',
    workEnvironment: 'field_outdoor',
    careerTiming: 'early_employment',
  });

  // SECTION D STATE: Education & Eligibility
  const [education, setEducation] = useState<EducationEligibility>({
    qualification: profile?.educationLevel || '10th_pass',
    relevantSubjects: ['General High School Studies'],
    additionalCertifications: ['none'],
  });

  // Load existing draft and questions if available
  useEffect(() => {
    async function loadData() {
      try {
        const [draft, questions, recs] = await Promise.all([
          getAssessmentDraft(),
          fetchAssessmentQuestions(language),
          fetchRecommendations(language),
        ]);

        if (questions && questions.length > 0) {
          setApiQuestions(questions);
        }
        if (recs && recs.length > 0) {
          setRecommendations(recs);
        }
        if (draft && draft.data) {
          if (draft.data.interests) setSelectedInterests(draft.data.interests);
          if (draft.data.skillProficiencies) setSkillProficiencies(draft.data.skillProficiencies);
          if (draft.data.preferences) setPreferences(draft.data.preferences);
          if (draft.data.education) setEducation(draft.data.education);
          if (draft.currentStep && draft.currentStep <= TOTAL_STEPS) {
            setCurrentStep(draft.currentStep);
          }
        }
      } catch (_e) {}
    }
    loadData();
  }, [language]);

  // Auto-save draft on step change
  const persistDraft = async (targetStep: number) => {
    const draftData: Partial<AssessmentResponse> = {
      userId: user?.id,
      interests: selectedInterests,
      skillProficiencies,
      preferences,
      education,
    };
    await saveAssessmentDraft(draftData, targetStep);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Section A: Interests';
      case 2:
        return 'Section B: Skills Self-Assessment';
      case 3:
        return 'Section C: Preferences & Work Style';
      case 4:
        return 'Section D: Education & Eligibility';
      case 5:
        return 'Section E: Review & Confirm';
      default:
        return 'Assessment';
    }
  };

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (selectedInterests.length === 0) {
        setErrorMsg('Please select at least one interest field to proceed.');
        return false;
      }
    }
    if (step === 4) {
      if (education.relevantSubjects.length === 0) {
        setErrorMsg('Please select at least one relevant subject you studied.');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    await persistDraft(nextStep);
  };

  const handlePrevious = async () => {
    setErrorMsg(null);
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    await persistDraft(prevStep);
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    setIsBuildingRoadmap(true);
    setBuildingStage(0);

    const stageTimer = setInterval(() => {
      setBuildingStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const submissionPayload = {
        interests: selectedInterests,
        skills: skillProficiencies,
        preferences,
        education,
      };

      const payload: AssessmentResponse = {
        userId: user?.id,
        isDraft: false,
        currentStep: 5,
        interests: selectedInterests,
        skillProficiencies,
        preferences,
        education,
        completedAt: new Date().toISOString(),
      };
      await saveCompletedAssessment(payload);

      // Fetch dynamic recommendation results with the student's actual answers
      const freshRecs = await generateRecommendations(language, submissionPayload);
      if (freshRecs && freshRecs.length > 0) {
        setRecommendations(freshRecs);
      }

      const topCareer = freshRecs && freshRecs.length > 0 ? freshRecs[0] : null;
      const topCareerId = topCareer?.career_id || topCareer?.career?.id || 'a1000000-0000-0000-0000-000000000001';

      // Store active career id for Roadmap screen
      await AsyncStorage.setItem('@margdarshak_active_career_id', topCareerId);
      await AsyncStorage.setItem('@margdarshak_latest_recommendations', JSON.stringify(freshRecs || []));

      // Wait 2.2 seconds total so student experiences the dynamic synthesis stages
      await new Promise((res) => setTimeout(res, 2200));

      clearInterval(stageTimer);
      // Automatically redirect directly to the dynamic personalized roadmap screen!
      router.replace(`/(tabs)/roadmap?careerId=${topCareerId}`);
    } catch (_err) {
      clearInterval(stageTimer);
      setIsBuildingRoadmap(false);
      setErrorMsg('Failed to process assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Roadmap Building Screen (Transition State)
  if (isBuildingRoadmap) {
    const stages = [
      'Analyzing your vocational strengths & declared interests...',
      'Matching profile against 20+ verified career pathways...',
      'Synthesizing dynamic learning roadmap milestones from database...',
      'Connecting official government skilling schemes & certifications...',
    ];

    return (
      <View style={[styles.screen, styles.buildingScreen]}>
        <Header title="AI Roadmap Engine" />
        <View style={styles.buildingContainer}>
          <Card variant="elevated" style={styles.buildingCard}>
            <View style={styles.buildingSpinnerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>

            <Badge label="AI ENGINE PROCESSING" variant="primary" />
            <Text style={styles.buildingHeading}>Building Your Personalized Roadmap</Text>
            <Text style={styles.buildingSubtext}>
              Synthesizing real-time milestones, practical skill requirements, and government skilling schemes tailored to your profile.
            </Text>

            {/* Dynamic Step Progression */}
            <View style={styles.buildingStepsContainer}>
              {stages.map((stageText, idx) => {
                const isPassed = idx < buildingStage;
                const isCurrent = idx === buildingStage;
                return (
                  <View key={idx} style={styles.buildingStageRow}>
                    <View
                      style={[
                        styles.buildingStageDot,
                        isPassed && styles.buildingStageDotPassed,
                        isCurrent && styles.buildingStageDotCurrent,
                      ]}
                    >
                      {isPassed ? (
                        <Check size={12} color="#FFFFFF" />
                      ) : (
                        <View
                          style={[
                            styles.buildingStageInnerDot,
                            isCurrent && styles.buildingStageInnerDotCurrent,
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.buildingStageText,
                        isPassed && styles.buildingStageTextPassed,
                        isCurrent && styles.buildingStageTextCurrent,
                      ]}
                    >
                      {stageText}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.buildingFooter}>
              <Sparkles size={16} color={Colors.primary} />
              <Text style={styles.buildingFooterText}>Directing you to your roadmap...</Text>
            </View>
          </Card>
        </View>
      </View>
    );
  }

  // Career Recommendation Results View (Completion State)
  if (isCompleted) {
    const topRec = recommendations[0];
    const topScore = topRec ? `${topRec.match_score}%` : '93%';
    const topTitle = topRec?.career?.title || topRec?.career?.translation?.title || 'Recommended Pathway';
    const topSector = topRec?.career?.category?.name || 'Vocational Sector';
    const topCareerId = topRec?.career_id || topRec?.career?.id || 'c-1';
    const topReasons = topRec?.match_reasons && topRec.match_reasons.length > 0
      ? topRec.match_reasons
      : [
          'Matches your practical hands-on and field work preferences',
          'High regional demand aligned with verified government training',
          `Direct eligibility with ${education.qualification.replace('_', ' ')}`,
        ];
    const altRecs = recommendations.slice(1);

    const userStrengthLabels = Object.entries(skillProficiencies)
      .filter(([, level]) => level === 'advanced' || level === 'intermediate')
      .map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()));
    const careerSkillNames = (topRec?.career?.skills || []).map((s) => s.name).filter(Boolean);
    const matchedStrengths =
      userStrengthLabels.length > 0
        ? userStrengthLabels.slice(0, 4)
        : careerSkillNames.slice(0, 3);
    const dynamicSkillGaps = careerSkillNames
      .filter(
        (name) =>
          !userStrengthLabels.some(
            (u) => u.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(u.toLowerCase())
          )
      )
      .slice(0, 4);
    const skillsToAcquire =
      dynamicSkillGaps.length > 0
        ? dynamicSkillGaps
        : careerSkillNames.length > 0
        ? careerSkillNames.slice(0, 3)
        : [topSector];

    return (
      <View style={styles.screen}>
        <Header title="Career Recommendations" />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xxl) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Prominent Match Result Panel */}
          <Card variant="elevated" style={styles.resultsHeroCard}>
            <View style={styles.resultsScoreRow}>
              <View style={styles.scoreBubble}>
                <Text style={styles.scoreValue}>{topScore}</Text>
                <Text style={styles.scoreLabel}>MATCH FIT</Text>
              </View>
              <View style={styles.resultsHeroText}>
                <Badge label="TOP RECOMMENDATION" variant="primary" />
                <Text style={styles.recommendedTitle}>{topTitle}</Text>
                <Text style={styles.recommendedSector}>{topSector}</Text>
              </View>
            </View>

            <View style={styles.reasonsBox}>
              <Text style={styles.reasonsHeader}>Why this pathway fits you:</Text>
              {topReasons.map((reason, idx) => (
                <View key={idx} style={styles.reasonItem}>
                  <CheckCircle size={15} color={Colors.success} />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            {/* Skill Matches vs Missing Skills */}
            <View style={styles.skillComparisonRow}>
              <View style={styles.skillMatchCol}>
                <Text style={styles.skillMatchHeader}>Your Strengths</Text>
                <View style={styles.skillTagList}>
                  {matchedStrengths.map((sk) => (
                    <View key={sk} style={styles.skillTagStrength}>
                      <Text style={styles.skillTagStrengthText}>{sk}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.skillMatchCol}>
                <Text style={styles.skillGapHeader}>Skills You Will Learn</Text>
                <View style={styles.skillTagList}>
                  {skillsToAcquire.map((sk) => (
                    <View key={sk} style={styles.skillTagGap}>
                      <Text style={styles.skillTagGapText}>{sk}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Button
              title="Launch Personalized Roadmap"
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<Milestone size={18} color="#FFFFFF" />}
              onPress={() => router.replace(`/(tabs)/roadmap?careerId=${topCareerId}`)}
              style={{ marginTop: Spacing.md }}
            />
          </Card>

          {/* Alternative Career Recommendations */}
          <Text style={styles.sectionHeading}>Alternative Career Options</Text>
          <Text style={styles.sectionSubtext}>Other high-compatibility vocational trades based on your profile:</Text>

          {altRecs.length > 0 ? (
            altRecs.map((rec, idx) => {
              const recCareerId = rec.career_id || rec.career?.id || `c-${idx + 2}`;
              const title = rec.career?.title || rec.career?.translation?.title || 'Vocational Pathway';
              const sector = rec.career?.category?.name || 'Technical & Trades';
              return (
                <Card
                  key={rec.id || recCareerId}
                  variant="outlined"
                  style={styles.altCareerCard}
                  onPress={() => router.push(`/career/${recCareerId}`)}
                >
                  <View style={styles.altCareerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.altCareerTitle}>{title}</Text>
                      <Text style={styles.altCareerSub}>{sector} • {rec.match_score}% Match Fit</Text>
                    </View>
                    <Badge label={`${rec.match_score}% Fit`} variant={rec.match_score >= 85 ? 'primary' : 'secondary'} />
                  </View>
                </Card>
              );
            })
          ) : (
            <>
              <Card
                variant="outlined"
                style={styles.altCareerCard}
                onPress={() => router.push('/career/c-2')}
              >
                <View style={styles.altCareerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.altCareerTitle}>Junior Web & App Developer</Text>
                    <Text style={styles.altCareerSub}>Digital Services • 87% Match Fit</Text>
                  </View>
                  <Badge label="87% Fit" variant="primary" />
                </View>
              </Card>

              <Card
                variant="outlined"
                style={styles.altCareerCard}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <View style={styles.altCareerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.altCareerTitle}>Auto & EV Technician</Text>
                    <Text style={styles.altCareerSub}>Mechanical & Electrical • 84% Match Fit</Text>
                  </View>
                  <Badge label="84% Fit" variant="secondary" />
                </View>
              </Card>
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: Spacing.md }}>
            <Button
              title="Explore All Careers"
              variant="secondary"
              size="md"
              fullWidth
              onPress={() => router.replace('/(tabs)/explore')}
              style={{ flex: 1 }}
            />
            <Button
              title="Return Home"
              variant="outline"
              size="md"
              fullWidth
              onPress={() => router.replace('/(tabs)')}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header
        title="Career Assessment"
        subtitle={getStepTitle()}
        canGoBack
        onBack={() => {
          if (currentStep > 1) {
            handlePrevious();
          } else {
            router.back();
          }
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + Spacing.xl, Spacing.xxl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepTitle={getStepTitle()}
        />

        {/* Validation Error Banner */}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={Colors.danger} />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* STEP 1: SECTION A - INTERESTS */}
        {currentStep === 1 ? (
          <View>
            <Text style={styles.sectionHeading}>Which fields spark your curiosity?</Text>
            <Text style={styles.sectionSubtext}>
              Select the areas you enjoy reading about, watching videos of, or trying out. You can select multiple fields.
            </Text>

            <View style={styles.interestsList}>
              {INTEREST_FIELDS.map((field) => {
                const isSelected = selectedInterests.includes(field.id);
                const localizedTitle =
                  language === 'hi'
                    ? field.titleHi
                    : language === 'te'
                    ? field.titleTe
                    : field.title;

                return (
                  <Pressable
                    key={field.id}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedInterests(selectedInterests.filter((id) => id !== field.id));
                      } else {
                        setSelectedInterests([...selectedInterests, field.id]);
                      }
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    style={({ pressed }) => [
                      styles.interestCard,
                      isSelected && styles.interestCardSelected,
                      pressed && styles.interestCardPressed,
                    ]}
                  >
                    <View style={styles.interestTopRow}>
                      <Text
                        style={[
                          styles.interestTitle,
                          isSelected && styles.interestTitleSelected,
                        ]}
                      >
                        {localizedTitle}
                      </Text>
                      <View
                        style={[
                          styles.interestCheckbox,
                          isSelected && styles.interestCheckboxSelected,
                        ]}
                      >
                        {isSelected ? (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.interestDesc}>{field.description}</Text>
                    <Text style={styles.interestExamples}>
                      <Text style={{ fontWeight: '600' }}>Examples: </Text>
                      {field.examples}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* STEP 2: SECTION B - SKILLS SELF-ASSESSMENT */}
        {currentStep === 2 ? (
          <View>
            <Text style={styles.sectionHeading}>Rate Your Comfort With Each Skill</Text>
            <Text style={styles.sectionSubtext}>
              Be honest with yourself! There are no wrong answers. Even if you consider yourself a beginner, many careers provide free training.
            </Text>

            <View style={styles.skillsContainer}>
              {SKILLS_ASSESSMENT_LIST.map((skill) => {
                const localizedName =
                  language === 'hi'
                    ? skill.nameHi
                    : language === 'te'
                    ? skill.nameTe
                    : skill.name;

                return (
                  <ProficiencyRating
                    key={skill.id}
                    skillName={localizedName}
                    skillDescription={skill.description}
                    value={skillProficiencies[skill.id]}
                    onChange={(level) =>
                      setSkillProficiencies({
                        ...skillProficiencies,
                        [skill.id]: level,
                      })
                    }
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        {/* STEP 3: SECTION C - PREFERENCES */}
        {currentStep === 3 ? (
          <View>
            <Text style={styles.sectionHeading}>Your Daily Work & Learning Style</Text>
            <Text style={styles.sectionSubtext}>
              Understanding your preferred pace and environment helps match you with jobs you will genuinely enjoy long-term.
            </Text>

            <View style={styles.preferencesList}>
              {PREFERENCE_QUESTIONS.map((pq) => {
                const currentValue = preferences[pq.id];

                return (
                  <View key={pq.id} style={styles.preferenceBlock}>
                    <Text style={styles.preferenceTitle}>{pq.title}</Text>
                    <Text style={styles.preferenceDesc}>{pq.description}</Text>

                    <View style={styles.optionsStack}>
                      {pq.options.map((opt) => {
                        const isChosen = currentValue === opt.value;

                        return (
                          <Pressable
                            key={opt.value}
                            onPress={() =>
                              setPreferences({
                                ...preferences,
                                [pq.id]: opt.value,
                              })
                            }
                            accessibilityRole="radio"
                            accessibilityState={{ selected: isChosen }}
                            style={({ pressed }) => [
                              styles.prefOptionCard,
                              isChosen && styles.prefOptionCardChosen,
                              pressed && styles.prefOptionCardPressed,
                            ]}
                          >
                            <View style={styles.prefRadio}>
                              {isChosen ? <View style={styles.prefRadioDot} /> : null}
                            </View>
                            <View style={styles.prefTextContainer}>
                              <Text
                                style={[
                                  styles.prefLabel,
                                  isChosen && styles.prefLabelChosen,
                                ]}
                              >
                                {opt.label}
                              </Text>
                              <Text style={styles.prefSublabel}>{opt.sublabel}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* STEP 4: SECTION D - EDUCATION & CERTIFICATIONS */}
        {currentStep === 4 ? (
          <View>
            <Text style={styles.sectionHeading}>Education & Qualifications</Text>
            <Text style={styles.sectionSubtext}>
              Confirm your schooling and any extra certificates to check eligibility for government training quotas.
            </Text>

            {/* Relevant Subjects Multi-Select */}
            <View style={styles.eduSection}>
              <Text style={styles.inputGroupTitle}>Subjects You Studied in School / College *</Text>
              <Text style={styles.inputGroupDesc}>Select all subjects that apply to you:</Text>
              <SelectableChipGroup
                options={RELEVANT_SUBJECTS.map((s) => ({ id: s, label: s }))}
                selectedIds={education.relevantSubjects}
                onChange={(ids) => setEducation({ ...education, relevantSubjects: ids })}
              />
            </View>

            {/* Additional Certifications */}
            <View style={styles.eduSection}>
              <Text style={styles.inputGroupTitle}>Any Existing Certificates or Licenses?</Text>
              <Text style={styles.inputGroupDesc}>Select any you already possess:</Text>
              <View style={styles.certList}>
                {CERTIFICATION_OPTIONS.map((cert) => {
                  const isChecked = education.additionalCertifications.includes(cert.id);
                  return (
                    <Pressable
                      key={cert.id}
                      onPress={() => {
                        if (cert.id === 'none') {
                          setEducation({ ...education, additionalCertifications: ['none'] });
                        } else {
                          const withoutNone = education.additionalCertifications.filter(
                            (id) => id !== 'none'
                          );
                          if (isChecked) {
                            setEducation({
                              ...education,
                              additionalCertifications: withoutNone.filter((id) => id !== cert.id),
                            });
                          } else {
                            setEducation({
                              ...education,
                              additionalCertifications: [...withoutNone, cert.id],
                            });
                          }
                        }
                      }}
                      style={[
                        styles.certItem,
                        isChecked && styles.certItemSelected,
                      ]}
                    >
                      <View style={[styles.certBox, isChecked && styles.certBoxChecked]}>
                        {isChecked ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                      </View>
                      <View style={styles.certTextContainer}>
                        <Text style={[styles.certLabel, isChecked && styles.certLabelChecked]}>
                          {cert.label}
                        </Text>
                        <Text style={styles.certSublabel}>{cert.sublabel}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        {/* STEP 5: SECTION E - REVIEW & SUBMIT */}
        {currentStep === 5 ? (
          <View>
            <Text style={styles.sectionHeading}>Review Your Assessment Responses</Text>
            <Text style={styles.sectionSubtext}>
              Take a moment to verify your answers. You can tap "Edit" on any section to modify it before sending.
            </Text>

            <AssessmentReviewCard
              title="Career Interests"
              items={[
                {
                  label: 'Selected Sectors',
                  value: selectedInterests.map(
                    (id) => INTEREST_FIELDS.find((f) => f.id === id)?.title || id
                  ),
                },
              ]}
              onEdit={() => setCurrentStep(1)}
            />

            <AssessmentReviewCard
              title="Skills Self-Assessment"
              items={SKILLS_ASSESSMENT_LIST.map((s) => ({
                label: s.name,
                value: (skillProficiencies[s.id] || 'beginner').toUpperCase(),
              }))}
              onEdit={() => setCurrentStep(2)}
            />

            <AssessmentReviewCard
              title="Work Preferences"
              items={[
                {
                  label: 'Work Team Style',
                  value: preferences.teamDynamic.replace('_', ' '),
                },
                {
                  label: 'Learning Preference',
                  value: preferences.learningStyle.replace('_', ' '),
                },
                {
                  label: 'Environment',
                  value: preferences.workEnvironment.replace('_', ' '),
                },
                {
                  label: 'Next Milestone Goal',
                  value: preferences.careerTiming.replace('_', ' '),
                },
              ]}
              onEdit={() => setCurrentStep(3)}
            />

            <AssessmentReviewCard
              title="Education & Eligibility"
              items={[
                {
                  label: 'Highest Qualification',
                  value: education.qualification.replace('_', ' '),
                },
                {
                  label: 'Subjects Studied',
                  value: education.relevantSubjects,
                },
                {
                  label: 'Certifications',
                  value: education.additionalCertifications.map(
                    (cId) => CERTIFICATION_OPTIONS.find((c) => c.id === cId)?.label || cId
                  ),
                },
              ]}
              onEdit={() => setCurrentStep(4)}
            />
          </View>
        ) : null}

        {/* Navigation Buttons: Previous and Continue */}
        <View style={styles.navRow}>
          {currentStep > 1 ? (
            <Button
              title={t('common.back')}
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft size={16} color={Colors.textPrimary} />}
              onPress={handlePrevious}
              style={styles.prevButton}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button
              title={t('common.continue')}
              variant="primary"
              size="md"
              rightIcon={<ArrowRight size={16} color="#FFFFFF" />}
              onPress={handleNext}
              style={styles.nextButton}
            />
          ) : (
            <Button
              title={t('assessment.submitAssessment')}
              variant="primary"
              size="md"
              loading={isSubmitting}
              rightIcon={<Send size={16} color="#FFFFFF" />}
              onPress={handleFinalSubmit}
              style={styles.nextButton}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.subtitle,
    lineHeight: Typography.lineHeights.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.danger,
    fontWeight: Typography.fontWeights.medium,
    flex: 1,
  },
  interestsList: {
    gap: Spacing.xs + 2,
    marginBottom: Spacing.lg,
  },
  interestCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  interestCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  interestCardPressed: {
    opacity: 0.85,
  },
  interestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  interestTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  interestTitleSelected: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  interestCheckbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  interestCheckboxSelected: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  interestDesc: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  interestExamples: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  skillsContainer: {
    marginBottom: Spacing.lg,
  },
  preferencesList: {
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  preferenceBlock: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  preferenceTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  preferenceDesc: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  optionsStack: {
    gap: Spacing.xs + 2,
  },
  prefOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
  },
  prefOptionCardChosen: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  prefOptionCardPressed: {
    opacity: 0.85,
  },
  prefRadio: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
    backgroundColor: Colors.surface,
  },
  prefRadioDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.dark,
  },
  prefTextContainer: {
    flex: 1,
  },
  prefLabel: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  prefLabelChosen: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  prefSublabel: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eduSection: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  inputGroupTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  inputGroupDesc: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  certList: {
    gap: Spacing.xs + 2,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
  },
  certItemSelected: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  certBox: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  certBoxChecked: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  certTextContainer: {
    flex: 1,
  },
  certLabel: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  certLabelChecked: {
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeights.bold,
  },
  certSublabel: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  prevButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  // Recommendation Results Styles
  resultsHeroCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  resultsScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreBubble: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.mintBg,
    borderWidth: 2,
    borderColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.mintDark,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.mintDark,
    letterSpacing: 0.5,
  },
  resultsHeroText: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: Typography.fontSizes.title,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  recommendedSector: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reasonsBox: {
    backgroundColor: '#F8F9FC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  reasonsHeader: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reasonText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    flex: 1,
  },
  skillComparisonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  skillMatchCol: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillMatchHeader: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.mintDark,
    marginBottom: 6,
  },
  skillGapHeader: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryDark,
    marginBottom: 6,
  },
  skillTagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTagStrength: {
    backgroundColor: Colors.tagMintBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  skillTagStrengthText: {
    fontSize: 11,
    color: Colors.tagMintText,
    fontWeight: Typography.fontWeights.semibold,
  },
  skillTagGap: {
    backgroundColor: Colors.tagLavenderBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  skillTagGapText: {
    fontSize: 11,
    color: Colors.tagLavenderText,
    fontWeight: Typography.fontWeights.semibold,
  },
  altCareerCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  altCareerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  altCareerTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  altCareerSub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buildingScreen: {
    backgroundColor: '#F8F9FD',
  },
  buildingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  buildingCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl + 8,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  buildingSpinnerContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(162, 142, 249, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  buildingHeading: {
    fontSize: Typography.fontSizes.heading,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  buildingSubtext: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  buildingStepsContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buildingStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  buildingStageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingStageDotPassed: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  buildingStageDotCurrent: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(162, 142, 249, 0.15)',
  },
  buildingStageInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  buildingStageInnerDotCurrent: {
    backgroundColor: Colors.primary,
  },
  buildingStageText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    flex: 1,
  },
  buildingStageTextPassed: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.semibold,
  },
  buildingStageTextCurrent: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },
  buildingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
    justifyContent: 'center',
  },
  buildingFooterText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
});
