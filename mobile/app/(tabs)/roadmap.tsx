import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  CircleDot,
  PlayCircle,
  Clock,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCareerRoadmap,
  updateStepProgress,
  fetchCareers,
  type ApiRoadmap,
  type ApiRoadmapStep,
  type ApiCareer,
} from '@/services/api';

export default function RoadmapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ careerId?: string }>();
  const { language } = useAuth();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [availableCareers, setAvailableCareers] = useState<ApiCareer[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(params.careerId || null);
  const [roadmap, setRoadmap] = useState<ApiRoadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  // Sync param changes to state or retrieve stored active career
  useEffect(() => {
    async function resolveActiveCareer() {
      if (params.careerId) {
        setSelectedCareerId(params.careerId);
        return;
      }
      try {
        const storedCareerId = await AsyncStorage.getItem('@margdarshak_active_career_id');
        if (storedCareerId) {
          setSelectedCareerId(storedCareerId);
        } else {
          setLoading(false);
        }
      } catch (_e) {
        setLoading(false);
      }
    }
    resolveActiveCareer();
  }, [params.careerId]);

  // Load available careers for switching
  useEffect(() => {
    async function loadCareersList() {
      try {
        const list = await fetchCareers(language);
        setAvailableCareers(list);
      } catch (_e) {}
    }
    loadCareersList();
  }, [language]);

  // Load roadmap for the selected career
  useEffect(() => {
    async function loadRoadmapData() {
      if (!selectedCareerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchCareerRoadmap(selectedCareerId, language);
        setRoadmap(data);
      } catch (_e) {
      } finally {
        setLoading(false);
      }
    }
    loadRoadmapData();
  }, [selectedCareerId, language]);

  // Toggle step completion status
  const handleToggleStep = async (step: ApiRoadmapStep) => {
    if (updatingStepId || !roadmap) return;
    setUpdatingStepId(step.id);

    const currentStatus = step.user_progress?.status || 'not_started';
    const nextStatus: 'completed' | 'in_progress' = currentStatus === 'completed' ? 'in_progress' : 'completed';

    // Optimistically update local roadmap state
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedSteps = prev.steps.map((s) => {
        if (s.id === step.id) {
          return {
            ...s,
            user_progress: {
              status: nextStatus,
              completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
              notes: s.user_progress?.notes ?? null,
            },
          };
        }
        return s;
      });
      return {
        ...prev,
        steps: updatedSteps,
      };
    });

    try {
      await updateStepProgress(step.id, nextStatus);
    } catch (_err) {
      // Revert if API fails
    } finally {
      setUpdatingStepId(null);
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
      })
      .catch((_err) => {});
  };

  const steps = roadmap?.steps || [];
  const completedCount = steps.filter((s) => s.user_progress?.status === 'completed').length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const activeStepToResume = steps.find(
    (s) => (s.user_progress?.status || 'not_started') === 'in_progress'
  ) || steps.find((s) => (s.user_progress?.status || 'not_started') === 'not_started');

  return (
    <View style={styles.screen}>
      <Header
        title={t('navigation.roadmap')}
        subtitle="Step-by-step career milestones & training"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? Spacing.xl : 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Career Switcher Carousel (Image 1 & 2 date picker style) */}
        {availableCareers.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.careerSwitchScroll}
          >
            {availableCareers.map((c) => {
              const isSelected = c.id === selectedCareerId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCareerId(c.id)}
                  style={({ pressed }) => [
                    styles.careerPill,
                    isSelected && styles.careerPillActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    style={[
                      styles.careerPillText,
                      isSelected && styles.careerPillTextActive,
                    ]}
                  >
                    {c.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {!selectedCareerId ? (
          <Card variant="elevated" style={styles.starterCard}>
            <View style={styles.starterIconCircle}>
              <Sparkles size={32} color={Colors.primary} />
            </View>
            <Text style={styles.starterTitle}>No Career Pathway Selected Yet</Text>
            <Text style={styles.starterSubtitle}>
              Complete our 5-minute vocational assessment so our AI engine can build your personalized milestone learning roadmap, or pick any pathway below to explore.
            </Text>
            <Button
              title="Take 5-Min Career Assessment"
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              onPress={() => router.push('/assessment')}
              style={{ marginTop: Spacing.md }}
            />

            <View style={styles.orDividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE A PATHWAY DIRECTLY</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.quickCareerList}>
              {availableCareers.slice(0, 6).map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [
                    styles.quickCareerCard,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => setSelectedCareerId(c.id)}
                >
                  <View style={styles.quickCareerContent}>
                    <Text style={styles.quickCareerTitle}>{c.title}</Text>
                    <Text style={styles.quickCareerEdu}>{c.minimum_education}</Text>
                  </View>
                  <ArrowRight size={16} color={Colors.primary} />
                </Pressable>
              ))}
            </View>
          </Card>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Building personalized roadmap...</Text>
          </View>
        ) : !roadmap || steps.length === 0 ? (
          <EmptyState
            title="Roadmap Not Found"
            description="No roadmap steps could be located for this career. Try picking another from the catalog."
            actionLabel="Explore Other Careers"
            onAction={() => router.push('/(tabs)/explore')}
          />
        ) : (
          <>
            {/* Overview Progress Card (Image 1 Task card style with Mint Progress Bar) */}
            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <Badge
                  label={progressPercent === 100 ? '100% Completed' : `${progressPercent}% in progress`}
                  variant={progressPercent === 100 ? 'done' : 'in_progress'}
                />
                <Text style={styles.stagesCountText}>
                  {completedCount} of {steps.length} milestones verified
                </Text>
              </View>

              <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
              <Text style={styles.roadmapDesc}>
                {roadmap.estimated_duration ? `Estimated duration: ${roadmap.estimated_duration}` : ''}
              </Text>

              {/* Mint Progress Bar Track (Image 1) */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarMintFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Resume Active Stage CTA */}
              {activeStepToResume && progressPercent < 100 ? (
                <Pressable
                  onPress={() => handleToggleStep(activeStepToResume)}
                  style={({ pressed }) => [
                    styles.resumeBtn,
                    pressed && styles.resumeBtnPressed,
                  ]}
                >
                  <View style={styles.resumeBtnLeft}>
                    <PlayCircle size={20} color={Colors.dark} />
                    <View>
                      <Text style={styles.resumeBtnTitle}>
                        Resume: {activeStepToResume.title}
                      </Text>
                      <Text style={styles.resumeBtnSub}>
                        {activeStepToResume.estimated_duration} estimated
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={16} color={Colors.dark} />
                </Pressable>
              ) : (
                <View style={styles.congratsBanner}>
                  <Sparkles size={18} color={Colors.mintDark} />
                  <Text style={styles.congratsText}>
                    Congratulations! You have completed all foundational stages for this career!
                  </Text>
                </View>
              )}
            </Card>

            {/* Stepper Timeline Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Progression Milestones</Text>
              <Text style={styles.sectionSubtitle}>
                Follow each stage sequentially to achieve verified employability.
              </Text>
            </View>

            {/* Timeline Stepper (Image 2 style with active Now highlight) */}
            <View style={styles.timelineContainer}>
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const status = step.user_progress?.status || 'not_started';
                const isCompleted = status === 'completed';
                const isInProgress = status === 'in_progress';
                const isUpdating = updatingStepId === step.id;

                return (
                  <View key={step.id} style={styles.timelineRow}>
                    {/* Left Column: Numbered Indicator & Connector */}
                    <View style={styles.indicatorCol}>
                      <View
                        style={[
                          styles.indicatorNode,
                          isCompleted && styles.nodeCompleted,
                          isInProgress && styles.nodeInProgress,
                        ]}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} color={Colors.dark} strokeWidth={2.6} />
                        ) : isInProgress ? (
                          <CircleDot size={16} color="#FFFFFF" strokeWidth={2.6} />
                        ) : (
                          <Text style={styles.nodeNumber}>{step.step_number}</Text>
                        )}
                      </View>
                      {!isLast ? (
                        <View
                          style={[
                            styles.connectorLine,
                            isCompleted && styles.connectorCompleted,
                          ]}
                        />
                      ) : null}
                    </View>

                    {/* Right Column: Step Milestone Card (Active highlighted in Pastel Mint from Image 2!) */}
                    <View style={styles.stepCardContainer}>
                      <Card
                        variant={isInProgress ? 'mint' : 'elevated'}
                        style={[
                          styles.stepCard,
                          isInProgress && styles.stepCardMintHighlight,
                        ]}
                      >
                        {/* Header: Status Badge, Duration Badge */}
                        <View style={styles.stepCardHeader}>
                          <Badge
                            label={
                              isCompleted
                                ? 'Completed'
                                : isInProgress
                                ? 'Now in progress'
                                : `Stage ${step.step_number}`
                            }
                            variant={
                              isCompleted ? 'done' : isInProgress ? 'dark' : 'secondary'
                            }
                          />
                          <View style={styles.stepDurationBadge}>
                            <Clock size={12} color={isInProgress ? Colors.dark : Colors.textSecondary} />
                            <Text
                              style={[
                                styles.stepDurationText,
                                isInProgress && { color: Colors.dark },
                              ]}
                            >
                              {step.estimated_duration}
                            </Text>
                          </View>
                        </View>

                        {/* Title & Description */}
                        <Text
                          style={[
                            styles.stepTitle,
                            isInProgress && styles.stepTitleNow,
                          ]}
                        >
                          {step.title}
                        </Text>
                        <Text
                          style={[
                            styles.stepDescription,
                            isInProgress && styles.stepDescriptionNow,
                          ]}
                        >
                          {step.description}
                        </Text>

                        {/* Learning Objectives */}
                        {step.learning_objectives && step.learning_objectives.length > 0 ? (
                          <View style={styles.objectivesBlock}>
                            <Text
                              style={[
                                styles.objectivesHeader,
                                isInProgress && { color: Colors.dark },
                              ]}
                            >
                              Learning Objectives:
                            </Text>
                            {step.learning_objectives.map((obj, i) => (
                              <View key={i} style={styles.objectiveRow}>
                                <CheckCircle
                                  size={13}
                                  color={isInProgress ? Colors.dark : Colors.mintDark}
                                />
                                <Text
                                  style={[
                                    styles.objectiveText,
                                    isInProgress && { color: Colors.dark },
                                  ]}
                                >
                                  {obj}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}

                        {/* Resource Links */}
                        {step.resource_links && step.resource_links.length > 0 ? (
                          <View style={styles.resourcesBlock}>
                            <Text
                              style={[
                                styles.resourcesHeader,
                                isInProgress && { color: Colors.dark },
                              ]}
                            >
                              Recommended Resources:
                            </Text>
                            {step.resource_links.map((res, i) => (
                              <Pressable
                                key={i}
                                onPress={() => handleOpenLink(res.url)}
                                accessibilityRole="link"
                                style={({ pressed }) => [
                                  styles.resourceLinkRow,
                                  isInProgress && styles.resourceLinkRowMint,
                                  pressed && { opacity: 0.7 },
                                ]}
                              >
                                <BookOpen
                                  size={14}
                                  color={isInProgress ? Colors.dark : Colors.primaryDark}
                                />
                                <View style={styles.resourceLinkTextCol}>
                                  <Text
                                    style={[
                                      styles.resourceLinkTitle,
                                      isInProgress && { color: Colors.dark },
                                    ]}
                                  >
                                    {res.title}
                                  </Text>
                                  {res.provider ? (
                                    <Text
                                      style={[
                                        styles.resourceLinkProvider,
                                        isInProgress && { color: '#374151' },
                                      ]}
                                    >
                                      {res.provider} {res.is_free ? '• Free' : ''}
                                    </Text>
                                  ) : null}
                                </View>
                                <ExternalLink
                                  size={12}
                                  color={isInProgress ? Colors.dark : Colors.primaryDark}
                                />
                              </Pressable>
                            ))}
                          </View>
                        ) : null}

                        {/* Status Action Button */}
                        <View style={styles.stepActionFooter}>
                          <Button
                            label={
                              isCompleted
                                ? t('roadmap.completedReopen')
                                : isUpdating
                                ? t('roadmap.updatingProgress')
                                : t('roadmap.markCompleted')
                            }
                            variant={isCompleted ? 'secondary' : isInProgress ? 'primary' : 'outline'}
                            size="sm"
                            onPress={() => handleToggleStep(step)}
                            disabled={isUpdating}
                            leftIcon={
                              isCompleted ? (
                                <RotateCcw size={14} color={Colors.textSecondary} />
                              ) : (
                                <CheckCircle size={14} color="#FFFFFF" />
                              )
                            }
                          />
                        </View>
                      </Card>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
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
    paddingTop: Spacing.xs,
  },
  careerSwitchScroll: {
    gap: 8,
    paddingBottom: Spacing.sm,
  },
  careerPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  careerPillActive: {
    backgroundColor: Colors.primary, // Soft lavender #A28EF9 (active date pill from Image 1/2)
    borderColor: Colors.primary,
  },
  careerPillText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.semibold,
  },
  careerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stagesCountText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  roadmapTitle: {
    fontSize: Typography.fontSizes.title,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  roadmapDesc: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#EEF0F5',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarMintFill: {
    height: '100%',
    backgroundColor: Colors.mint, // Pastel mint green #A4F5A6
    borderRadius: BorderRadius.full,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FB',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  resumeBtnPressed: {
    opacity: 0.8,
  },
  resumeBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  resumeBtnTitle: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  resumeBtnSub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  congratsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.tagMintBg,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  congratsText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.tagMintText,
    flex: 1,
    fontWeight: Typography.fontWeights.medium,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timelineContainer: {
    paddingLeft: 2,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  indicatorCol: {
    width: 32,
    alignItems: 'center',
  },
  indicatorNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...Shadows.sm,
  },
  nodeCompleted: {
    backgroundColor: Colors.mint, // Pastel mint
    borderColor: Colors.mint,
  },
  nodeInProgress: {
    backgroundColor: Colors.primary, // Soft lavender
    borderColor: Colors.primary,
  },
  nodeNumber: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E8F0',
    marginVertical: 4,
  },
  connectorCompleted: {
    backgroundColor: Colors.mint,
  },
  stepCardContainer: {
    flex: 1,
    paddingLeft: Spacing.sm + 2,
    paddingBottom: Spacing.lg,
  },
  stepCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  stepCardMintHighlight: {
    backgroundColor: Colors.mint, // Full pastel mint card from Image 2
    borderColor: 'transparent',
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDurationText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  stepTitle: {
    fontSize: Typography.fontSizes.body + 1,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepTitleNow: {
    color: Colors.dark,
  },
  stepDescription: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  stepDescriptionNow: {
    color: '#1F2937',
  },
  objectivesBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  objectivesHeader: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  objectiveText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textPrimary,
    flex: 1,
  },
  resourcesBlock: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  resourcesHeader: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  resourceLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: Spacing.xs + 4,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
    gap: 8,
  },
  resourceLinkRowMint: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  resourceLinkTextCol: {
    flex: 1,
  },
  resourceLinkTitle: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  resourceLinkProvider: {
    fontSize: Typography.fontSizes.caption - 1,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  stepActionFooter: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 34, 34, 0.08)',
    marginTop: Spacing.xs,
  },
  starterCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl + 8,
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  starterIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(162, 142, 249, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  starterTitle: {
    fontSize: Typography.fontSizes.heading,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  starterSubtitle: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSizes.caption - 1,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  quickCareerList: {
    width: '100%',
    gap: Spacing.sm,
  },
  quickCareerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FD',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickCareerContent: {
    flex: 1,
  },
  quickCareerTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  quickCareerEdu: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
