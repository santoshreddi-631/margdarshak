import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Sun,
  Wrench,
  Sprout,
  HeartPulse,
  Laptop,
  CheckCircle2,
  Calendar,
  Languages,
  Search,
  Bell,
  Clock,
  MessageSquare,
  ChevronRight,
  BookOpen,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getAssessmentDraft, getCompletedAssessment } from '@/services/assessmentStorage';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, language } = useAuth();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [assessmentStatus, setAssessmentStatus] = useState<{
    isCompleted: boolean;
    step: number;
  }>({ isCompleted: false, step: 1 });

  useEffect(() => {
    async function checkAssessment() {
      const completed = await getCompletedAssessment();
      if (completed) {
        setAssessmentStatus({ isCompleted: true, step: 5 });
        return;
      }
      const draft = await getAssessmentDraft();
      if (draft && draft.currentStep) {
        setAssessmentStatus({ isCompleted: false, step: draft.currentStep });
      }
    }
    checkAssessment();
  }, []);

  const userName = profile?.name || user?.fullName || 'Rahul Sharma';
  const userDistrict = profile?.district && profile?.state
    ? `${profile.district}, ${profile.state}`
    : 'Sehore District, Madhya Pradesh';
  const userEdu = profile?.educationLevel
    ? profile.educationLevel.replace('_', ' ').toUpperCase()
    : '10th Pass';

  const languageLabel =
    language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिंदी' : 'English';

  return (
    <View style={styles.screen}>
      {/* Top Header with Circular Icon Buttons (Image 1, 2, 5) */}
      <Header
        title={t('navigation.home')}
        subtitle={`${t('home.greeting')}, ${userName}`}
        rightAction={
          <View style={styles.headerActionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search"
              onPress={() => router.push('/(tabs)/explore')}
              style={({ pressed }) => [
                styles.iconCircleButton,
                pressed && styles.circleButtonPressed,
              ]}
            >
              <Search size={18} color={Colors.textPrimary} strokeWidth={2.2} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/(tabs)/opportunities')}
              style={({ pressed }) => [
                styles.iconCircleButton,
                pressed && styles.circleButtonPressed,
              ]}
            >
              <Bell size={18} color={Colors.textPrimary} strokeWidth={2.2} />
              <View style={styles.notificationDot} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch Language"
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => [
                styles.langPill,
                pressed && styles.circleButtonPressed,
              ]}
            >
              <Languages size={13} color={Colors.primaryDark} strokeWidth={2.2} />
              <Text style={styles.langText}>{languageLabel}</Text>
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? Spacing.xl : 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Filter Chips (Image 1 & 5: All task, In progress, Done) */}
        <View style={styles.filterPillsRow}>
          <Pressable
            onPress={() => setActiveFilter('all')}
            style={[
              styles.filterPill,
              activeFilter === 'all' && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All tasks
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('in_progress')}
            style={[
              styles.filterPill,
              activeFilter === 'in_progress' && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'in_progress' && styles.filterPillTextActive,
              ]}
            >
              In progress
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('completed')}
            style={[
              styles.filterPill,
              activeFilter === 'completed' && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'completed' && styles.filterPillTextActive,
              ]}
            >
              Completed
            </Text>
          </Pressable>
        </View>

        {/* Responsive Grid Container: 1 col on mobile, 2 col on tablet/desktop (Image 5 & 6) */}
        <View style={isDesktop ? styles.desktopGrid : styles.mobileGrid}>
          {/* Main Column: Tasks & Career Assessment Cards */}
          <View style={isDesktop ? styles.desktopLeftCol : styles.fullCol}>
            {/* Career Assessment Task Card (with mint progress fill from Image 1) */}
            <Card variant="elevated" style={styles.taskCard}>
              <View style={styles.taskCardTop}>
                <Badge
                  label={assessmentStatus.isCompleted ? 'Done' : assessmentStatus.step > 1 ? 'In progress' : 'Ready'}
                  variant={assessmentStatus.isCompleted ? 'done' : 'in_progress'}
                />
                <Text style={styles.taskMetaText}>
                  {assessmentStatus.isCompleted
                    ? 'Verified 93% match'
                    : assessmentStatus.step > 1
                    ? `Step ${assessmentStatus.step} of 5`
                    : '5 Min Questionnaire'}
                </Text>
              </View>

              <Text style={styles.taskTitle}>
                {assessmentStatus.isCompleted
                  ? 'Career Assessment Profile Completed'
                  : 'Discover Your Ideal Career Pathway'}
              </Text>
              <Text style={styles.taskSubtitle}>
                {assessmentStatus.isCompleted
                  ? 'Vocational strengths, trade skills & work environment preferences analyzed'
                  : 'Complete our AI-guided assessment to unlock customized roadmaps, trade schemes & jobs'}
              </Text>

              {/* Distinctive Progress Bar with Mint Fill (Image 1) */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarMintFill,
                      {
                        width: assessmentStatus.isCompleted
                          ? '100%'
                          : assessmentStatus.step > 1
                          ? `${Math.min(Math.max(assessmentStatus.step * 25, 25), 90)}%`
                          : '12%',
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.taskCardFooter, !isDesktop && styles.taskCardFooterMobile]}>
                <View style={styles.taskFooterMeta}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.taskFooterMetaText}>10 - 15 mins</Text>
                  <MessageSquare size={14} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
                  <Text style={styles.taskFooterMetaText}>Instant AI Report</Text>
                </View>

                <Button
                  title={
                    assessmentStatus.isCompleted
                      ? 'Review Recommendations'
                      : assessmentStatus.step > 1
                      ? 'Continue Assessment'
                      : 'Start Assessment'
                  }
                  size="sm"
                  variant="primary"
                  fullWidth={!isDesktop}
                  rightIcon={<ArrowRight size={14} color="#FFFFFF" />}
                  onPress={() => router.push('/assessment')}
                />
              </View>
            </Card>

            {/* Featured Career Spotlight - ONLY for completed users with active roadmap */}
            {assessmentStatus.isCompleted && (
              <Card variant="elevated" style={styles.taskCard}>
                <View style={styles.taskCardTop}>
                  <Badge label="In progress" variant="in_progress" />
                  <Badge label="High Demand" variant="done" />
                </View>

                <Text style={styles.taskTitle}>Solar PV Systems Technician</Text>
                <Text style={styles.taskSubtitle}>
                  Clean Energy & Rural Electrification • MP State District
                </Text>

                {/* Metric stats row */}
                <View style={styles.metricStatsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Min. Education</Text>
                    <Text style={styles.metricValue}>10th + ITI</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Est. Earnings</Text>
                    <Text style={styles.metricValue}>₹18k - ₹28k/mo</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Duration</Text>
                    <Text style={styles.metricValue}>3 - 6 Months</Text>
                  </View>
                </View>

                <View style={styles.schemeNoticeBox}>
                  <CheckCircle2 size={15} color={Colors.success} />
                  <Text style={styles.schemeNoticeText}>
                    Supported by PMKVY 4.0 Free Government Training & Apprenticeship
                  </Text>
                </View>

                <View style={[styles.taskCardFooter, !isDesktop && styles.taskCardFooterMobile]}>
                  <Button
                    title="View Pathway & Roadmap"
                    variant="secondary"
                    size="sm"
                    fullWidth={!isDesktop}
                    rightIcon={<ChevronRight size={14} color={Colors.textPrimary} />}
                    onPress={() => router.push('/career/a1000000-0000-0000-0000-000000000001')}
                  />
                </View>
              </Card>
            )}

            {/* High-Opportunity Vocational Sectors */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>High-Opportunity Sectors</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.sectionLink}>View all</Text>
              </Pressable>
            </View>

            <View style={styles.sectorsGrid}>
              {[
                { title: 'Solar Energy', count: '12 Pathways', icon: <Sun size={18} color="#FFFFFF" />, bg: Colors.primary },
                { title: 'Agriculture', count: '9 Pathways', icon: <Sprout size={18} color={Colors.dark} />, bg: Colors.mint },
                { title: 'Auto & EV', count: '8 Pathways', icon: <Wrench size={18} color="#FFFFFF" />, bg: Colors.dark },
                { title: 'Healthcare', count: '7 Pathways', icon: <HeartPulse size={18} color="#FFFFFF" />, bg: '#FB7185' },
                { title: 'IT & Digital', count: '14 Pathways', icon: <Laptop size={18} color="#FFFFFF" />, bg: '#6366F1' },
                { title: 'Electrical & Power', count: '11 Pathways', icon: <Wrench size={18} color="#FFFFFF" />, bg: '#F59E0B' },
              ].map((sector, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => router.push('/(tabs)/explore')}
                  style={({ pressed }) => [
                    styles.sectorCard,
                    pressed && styles.sectorCardPressed,
                  ]}
                >
                  <View style={[styles.sectorIconBox, { backgroundColor: sector.bg }]}>
                    {sector.icon}
                  </View>
                  <View style={styles.sectorInfo}>
                    <Text style={styles.sectorTitle}>{sector.title}</Text>
                    <Text style={styles.sectorCount}>{sector.count}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Right Column on Desktop Web / Bottom Column on Mobile */}
          <View style={isDesktop ? styles.desktopRightCol : styles.fullCol}>
            {/* Career Conspectus Cards */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Career Conspectus</Text>
              <Pressable onPress={() => router.push('/(tabs)/opportunities')}>
                <Text style={styles.sectionLink}>Explore Schemes</Text>
              </Pressable>
            </View>

            <View style={styles.conspectusRow}>
              {/* Mint Card */}
              <Card variant="mint" padding="md" style={styles.conspectusCard}>
                <Text style={styles.conspectusCardTag}>Technical Trade Fit</Text>
                <Text style={styles.conspectusCardTitle}>Solar PV & Electrical Systems</Text>
                <Text style={styles.conspectusCardBody}>
                  Solar installation and pump wiring skills match your rural district preference with strong local employment.
                </Text>
                <Text style={styles.conspectusCardDate}>Updated Today</Text>
              </Card>

              {/* Lavender Card */}
              <Card variant="lavender" padding="md" style={styles.conspectusCard}>
                <Text style={[styles.conspectusCardTag, { color: '#FFFFFF' }]}>Scholarship Scheme</Text>
                <Text style={[styles.conspectusCardTitle, { color: '#FFFFFF' }]}>PM Vishwakarma Toolkit</Text>
                <Text style={[styles.conspectusCardBody, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                  ₹15,000 tool incentive and credit support for technical apprentice students completing state exams.
                </Text>
                <Text style={[styles.conspectusCardDate, { color: 'rgba(255, 255, 255, 0.75)' }]}>Active for 2026</Text>
              </Card>

              {/* Solar Scheme Card for New Users */}
              <Card variant="elevated" padding="md" style={styles.conspectusCard}>
                <Text style={[styles.conspectusCardTag, { color: Colors.primaryDark }]}>Government Grant</Text>
                <Text style={styles.conspectusCardTitle}>PM Surya Ghar Muft Bijli Yojana</Text>
                <Text style={[styles.conspectusCardBody, { color: Colors.textSecondary }]}>
                  Subsidized national rooftop installation program with 100,000+ local technician openings.
                </Text>
                <Text style={[styles.conspectusCardDate, { color: Colors.textMuted }]}>National Portal Verified</Text>
              </Card>
            </View>

            {/* Daily Roadmap Schedule Preview - ONLY for users who have completed assessment */}
            {assessmentStatus.isCompleted && (
              <>
                <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                  <Text style={styles.sectionTitle}>Today's Learning Schedule</Text>
                  <Pressable onPress={() => router.push('/(tabs)/roadmap')}>
                    <Text style={styles.sectionLink}>Open roadmap</Text>
                  </Pressable>
                </View>

                {/* In-Progress Milestone (Pastel Mint Card Highlight) */}
                <Card variant="mint" padding="md" style={styles.scheduleItemNow}>
                  <View style={styles.scheduleTimeCol}>
                    <Text style={styles.scheduleTime}>10:30 AM</Text>
                    <View style={styles.scheduleDottedLine} />
                    <Text style={styles.scheduleTime}>12:00 PM</Text>
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Badge label="Current Milestone" variant="dark" style={{ marginBottom: 4 }} />
                    <Text style={styles.scheduleSubject}>Solar Panel Inverter & Wiring</Text>
                    <Text style={styles.scheduleRoom}>Practical Hands-On Lab • Workshop A</Text>
                  </View>
                </Card>

                {/* Upcoming Milestone */}
                <Card variant="elevated" padding="md" style={styles.scheduleItem}>
                  <View style={styles.scheduleTimeCol}>
                    <Text style={styles.scheduleTime}>01:15 PM</Text>
                    <View style={styles.scheduleDottedLine} />
                    <Text style={styles.scheduleTime}>02:45 PM</Text>
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleSubjectUpcoming}>Multimeter & Circuit Testing</Text>
                    <Text style={styles.scheduleRoom}>Self-Paced Video Module 4</Text>
                  </View>
                </Card>
              </>
            )}
          </View>
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
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  circleButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, // Soft lavender indicator
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  langText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },

  // FILTER PILLS (Image 1)
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  filterPillActive: {
    backgroundColor: Colors.dark, // Black active pill #222222
    borderColor: Colors.dark,
  },
  filterPillText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },

  // GRID LAYOUT
  desktopGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'flex-start',
  },
  mobileGrid: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  desktopLeftCol: {
    flex: 1.2,
  },
  desktopRightCol: {
    flex: 1,
  },
  fullCol: {
    width: '100%',
  },

  // TASK / CAREER CARD (Image 1)
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, // 24px rounded corners
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskMetaText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  taskTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },

  // MINT PROGRESS BAR (Image 1)
  progressBarWrapper: {
    marginBottom: Spacing.md,
  },
  progressBarTrack: {
    height: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EEF0F5',
    borderWidth: 1,
    borderColor: '#E2E5EC',
    overflow: 'hidden',
  },
  progressBarMintFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.mint, // Pastel mint green #A4F5A6
  },
  taskCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  taskCardFooterMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  taskFooterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskFooterMetaText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  // METRIC STATS
  metricStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FB',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.fontSizes.caption - 1,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  schemeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tagMintBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  schemeNoticeText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.tagMintText,
    fontWeight: Typography.fontWeights.semibold,
    flex: 1,
  },

  // SECTOR GRID
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryDark,
  },
  sectorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  sectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
    ...Shadows.sm,
  },
  sectorCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  sectorIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectorInfo: {
    flex: 1,
  },
  sectorTitle: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  sectorCount: {
    fontSize: Typography.fontSizes.caption - 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // CONSPECTUS / NOTES (Image 5 & 6)
  conspectusRow: {
    gap: 12,
  },
  conspectusCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: 8,
  },
  conspectusCardTag: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  conspectusCardTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: 4,
  },
  conspectusCardBody: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.dark,
    lineHeight: 18,
    marginBottom: 8,
  },
  conspectusCardDate: {
    fontSize: Typography.fontSizes.caption - 1,
    color: '#4B5563',
    fontWeight: Typography.fontWeights.medium,
  },

  // SCHEDULE LIST (Image 2)
  scheduleItemNow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  scheduleTimeCol: {
    alignItems: 'center',
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(34, 34, 34, 0.1)',
  },
  scheduleTime: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  scheduleDottedLine: {
    width: 1,
    height: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    marginVertical: 2,
  },
  scheduleDetails: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  scheduleSubject: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  scheduleSubjectUpcoming: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  scheduleRoom: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
