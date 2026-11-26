import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  Banknote,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  Route,
  Share2,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCareerDetails,
  fetchCareerRoadmap,
  fetchSavedCareers,
  toggleSaveCareer,
  fetchBookmarkedResources,
  toggleBookmarkResource,
  type ApiCareer,
  type ApiRoadmap,
} from '@/services/api';

export default function CareerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useAuth();
  const { t } = useTranslation();

  const [career, setCareer] = useState<ApiCareer | null>(null);
  const [roadmap, setRoadmap] = useState<ApiRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<string[]>([]);
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [details, roadmapData, savedIds, bookmarked] = await Promise.all([
          fetchCareerDetails(id, language),
          fetchCareerRoadmap(id, language).catch(() => null),
          fetchSavedCareers(language),
          fetchBookmarkedResources(),
        ]);
        setCareer(details);
        setRoadmap(roadmapData);
        setIsSaved(savedIds.includes(id) || (details ? savedIds.includes(details.id) : false));
        setBookmarkedUrls(bookmarked);
      } catch (_e) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, language]);

  const handleToggleSave = async () => {
    if (!career || savingAction) return;
    setSavingAction(true);
    try {
      const nextState = await toggleSaveCareer(career.id, isSaved);
      setIsSaved(nextState);
    } finally {
      setSavingAction(false);
    }
  };

  const handleToggleBookmarkResource = async (res: { title: string; url: string; provider_name?: string }) => {
    const isBookmarked = bookmarkedUrls.includes(res.url);
    const updated = await toggleBookmarkResource(res, isBookmarked);
    if (updated) {
      setBookmarkedUrls((prev) => [...prev, res.url]);
    } else {
      setBookmarkedUrls((prev) => prev.filter((u) => u !== res.url));
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleShare = async () => {
    if (!career) return;
    try {
      await Share.share({
        title: career.title,
        message: `Explore the career pathway for ${career.title} on Margdarshak Career Guidance: ${career.estimated_salary_range}, ${career.training_duration}.`,
      });
    } catch (_e) {}
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading career pathway details...</Text>
      </View>
    );
  }

  if (!career) {
    return (
      <View style={styles.screen}>
        <Header title="Career Not Found" showBack onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>The requested career profile could not be located.</Text>
          <Button label="Back to Explore" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const categoryName = career.category?.name || 'Vocational Trade';
  const description = career.translation?.description || 'Practical vocational career pathway.';
  const responsibilities = career.translation?.job_responsibilities || 'Conducts daily operations, safety checks, and customer servicing.';

  return (
    <View style={styles.screen}>
      {/* Navigation Header */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.navActions}>
          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share career"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          >
            <Share2 size={18} color={Colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            onPress={handleToggleSave}
            disabled={savingAction}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save career'}
            style={({ pressed }) => [
              styles.iconBtn,
              isSaved && styles.savedBtnActive,
              pressed && styles.iconBtnPressed,
            ]}
          >
            {isSaved ? (
              <BookmarkCheck size={20} color={Colors.primaryDark} strokeWidth={2.4} />
            ) : (
              <Bookmark size={20} color={Colors.textPrimary} strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Badges */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <Badge label={categoryName} variant="secondary" />
            <Badge
              label={career.growth_demand === 'high' ? 'High Demand' : 'Emerging Field'}
              variant={career.growth_demand === 'high' ? 'primary' : 'outline'}
            />
          </View>
          <Text style={styles.title}>{career.title}</Text>
          <Text style={styles.overviewText}>{description}</Text>
        </View>

        {/* Key Metrics Quick Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Banknote size={20} color={Colors.success} />
            <Text style={styles.statLabel}>Monthly Pay</Text>
            <Text style={styles.statValue}>{career.estimated_salary_range}</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={20} color={Colors.warning} />
            <Text style={styles.statLabel}>Training Time</Text>
            <Text style={styles.statValue}>{career.training_duration}</Text>
          </View>

          <View style={styles.statCard}>
            <GraduationCap size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>Min Education</Text>
            <Text style={styles.statValue}>{career.minimum_education}</Text>
          </View>
        </View>

        {/* Suitability & Why This Fits */}
        <Card variant="elevated" style={styles.suitabilityCard}>
          <View style={styles.sectionHeaderRow}>
            <Sparkles size={18} color={Colors.primary} />
            <Text style={styles.sectionHeading}>{t('careerDetails.whyFitsYou')}</Text>
          </View>
          <Text style={styles.suitabilityText}>
            {career.translation?.pathway_summary ||
              `Eligible with ${career.minimum_education}. Training duration is ${career.training_duration} with verified public/industry pathways.`}
          </Text>
          <View style={styles.suitabilityCheckRow}>
            <CheckCircle2 size={16} color={Colors.success} />
            <Text style={styles.checkText}>
              {(career as any).official_occupational_code || 'Verified occupational career pathway'}
            </Text>
          </View>
          <View style={styles.suitabilityCheckRow}>
            <CheckCircle2 size={16} color={Colors.success} />
            <Text style={styles.checkText}>Apprenticeship & government scheme support available</Text>
          </View>
        </Card>

        {/* What the Professional Does */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('careerDetails.whatYouWillDo')}</Text>
          <Card variant="elevated" style={styles.contentCard}>
            <Text style={styles.paragraphText}>{responsibilities}</Text>
          </Card>
        </View>

        {/* Required Skills vs Recommended Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Required & Recommended</Text>

          <Text style={styles.skillsSubheader}>Mandatory Core Skills</Text>
          <View style={styles.chipGrid}>
            {(career.skills || [])
              .filter((s) => s.importance === 'required')
              .map((s) => (
                <View key={s.name} style={styles.skillChipRequired}>
                  <Text style={styles.skillChipRequiredText}>{s.name}</Text>
                  <Text style={styles.skillReqTag}>Required</Text>
                </View>
              ))}
          </View>

          <Text style={[styles.skillsSubheader, { marginTop: Spacing.md }]}>
            Recommended Skills (Increases Starting Pay)
          </Text>
          <View style={styles.chipGrid}>
            {(career.skills || [])
              .filter((s) => s.importance !== 'required')
              .map((s) => (
                <View key={s.name} style={styles.skillChipRecommended}>
                  <Text style={styles.skillChipRecommendedText}>{s.name}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Career Pathways (Dynamic DB Roadmap Stages) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Route size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Career Progression Pathway</Text>
          </View>

          <Card variant="elevated" style={styles.progressionCard}>
            {(roadmap?.steps && roadmap.steps.length > 0
              ? roadmap.steps
              : [
                  {
                    id: 'fallback-1',
                    step_number: 1,
                    title: 'Foundational Training & Eligibility',
                    estimated_duration: career.training_duration || '3-6 Months',
                  },
                  {
                    id: 'fallback-2',
                    step_number: 2,
                    title: 'Practical Skilling & Certification',
                    estimated_duration: career.estimated_salary_range || 'Entry Pathway',
                  },
                ]
            ).map((step, idx, arr) => (
              <React.Fragment key={step.id}>
                <View style={styles.progressionStep}>
                  <View
                    style={[
                      styles.stepNumBadge,
                      idx === 1 && { backgroundColor: Colors.primary },
                      idx >= 2 && {
                        backgroundColor: Colors.surface,
                        borderWidth: 1.5,
                        borderColor: Colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumText,
                        idx === 1 && { color: '#FFFFFF' },
                        idx >= 2 && { color: Colors.primary },
                      ]}
                    >
                      {step.step_number || idx + 1}
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.progressionRole}>{step.title}</Text>
                    <Text style={styles.progressionSub}>
                      {step.estimated_duration || career.training_duration}
                    </Text>
                  </View>
                </View>
                {idx < arr.length - 1 && <View style={styles.progressionDivider} />}
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Learning Resources */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <BookOpen size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Free Learning Resources</Text>
          </View>

          {(career.resources || []).map((res) => {
            const isBookmarked = bookmarkedUrls.includes(res.url);
            return (
              <Card key={res.url} variant="elevated" style={styles.resourceCard}>
                <View style={styles.resourceHeaderRow}>
                  <Badge
                    label={res.is_free ? 'Free' : 'Certified'}
                    variant={res.is_free ? 'primary' : 'secondary'}
                  />
                  <Text style={styles.resourceProvider}>{res.provider_name}</Text>
                </View>

                <Text style={styles.resourceTitle}>{res.title}</Text>

                <View style={styles.resourceFooterRow}>
                  <Pressable
                    onPress={() => handleToggleBookmarkResource(res)}
                    style={({ pressed }) => [
                      styles.bookmarkResourceBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Bookmark
                      size={16}
                      color={isBookmarked ? Colors.primary : Colors.textMuted}
                      fill={isBookmarked ? Colors.primary : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.bookmarkResourceText,
                        isBookmarked && { color: Colors.primary },
                      ]}
                    >
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleOpenLink(res.url)}
                    accessibilityRole="link"
                    style={({ pressed }) => [
                      styles.openResourceBtn,
                      pressed && styles.openResourceBtnPressed,
                    ]}
                  >
                    <Text style={styles.openResourceText}>Open Guide</Text>
                    <ExternalLink size={14} color={Colors.primary} />
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Hot-Pink CTA to Launch Roadmap */}
      <View style={styles.bottomBar}>
        <Button
          label={t('careerDetails.startRoadmap')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push(`/(tabs)/roadmap?careerId=${career.id}`)}
          rightIcon={<ChevronRight size={18} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl + 4,
    paddingBottom: Spacing.sm + 2,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  iconBtnPressed: {
    backgroundColor: '#F3F4F8',
    transform: [{ scale: 0.96 }],
  },
  savedBtnActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  headerBlock: {
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  title: {
    fontSize: Typography.fontSizes.heading,
    lineHeight: Typography.lineHeights.heading,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  overviewText: {
    fontSize: Typography.fontSizes.body,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  statLabel: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: 3,
  },
  suitabilityCard: {
    backgroundColor: Colors.mintBg,
    borderColor: 'rgba(164, 245, 166, 0.4)',
    marginBottom: Spacing.lg,
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  suitabilityText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textPrimary,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  suitabilityCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginTop: 6,
  },
  checkText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 4,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  paragraphText: {
    fontSize: Typography.fontSizes.body,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  skillsSubheader: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs + 2,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  skillChipRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  skillChipRequiredText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryDark,
  },
  skillReqTag: {
    fontSize: Typography.fontSizes.caption - 1,
    fontWeight: Typography.fontWeights.bold,
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  skillChipRecommended: {
    backgroundColor: '#F3F4F8',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillChipRecommendedText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
  },
  progressionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  progressionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  stepNumBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  stepContent: {
    flex: 1,
  },
  progressionRole: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  progressionSub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressionDivider: {
    width: 2,
    height: 22,
    backgroundColor: Colors.border,
    marginLeft: 15,
    marginVertical: 4,
  },
  resourceCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
    ...Shadows.sm,
  },
  resourceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  resourceProvider: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textMuted,
  },
  resourceTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  resourceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 4,
  },
  bookmarkResourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookmarkResourceText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textMuted,
  },
  openResourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openResourceBtnPressed: {
    opacity: 0.7,
  },
  openResourceText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryDark,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.dock,
  },
});
