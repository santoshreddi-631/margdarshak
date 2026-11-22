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
  User as UserIcon,
  Languages,
  BookOpen,
  MapPin,
  Check,
  Plus,
  LogOut,
  Edit,
  ClipboardCheck,
  Bookmark,
  ChevronRight,
  Bell,
  Award,
  Sparkles,
  Wrench,
  GraduationCap,
  MoreVertical,
  Shield,
  Trash2,
  CheckCircle,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth, type SupportedLanguage } from '@/context/AuthContext';
import { getStudentProfile, getCompletedAssessment } from '@/services/assessmentStorage';
import type { StudentProfile, AssessmentResponse } from '@/models/assessment';

const SUPPORTED_LANGUAGES = [
  { code: 'hi' as SupportedLanguage, label: 'हिंदी (Hindi)', region: 'मध्य प्रदेश, उत्तर प्रदेश व अन्य' },
  { code: 'te' as SupportedLanguage, label: 'తెలుగు (Telugu)', region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
  { code: 'en' as SupportedLanguage, label: 'English', region: 'All Regions' },
];

interface ActivityItem {
  id: string;
  title: string;
  sub: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Solar PV Technician Test',
    sub: 'Scheduled for Batch 2 • Jun 15, 2026',
    icon: Award,
    iconBg: Colors.mint,
    iconColor: Colors.dark,
  },
  {
    id: 'act-2',
    title: 'PMKVY Practical Workshop',
    sub: 'Electrical wiring & inverter setup',
    icon: Wrench,
    iconBg: Colors.primaryBg,
    iconColor: Colors.primaryDark,
  },
  {
    id: 'act-3',
    title: 'State Apprenticeship Verification',
    sub: 'Document eligibility verified',
    icon: GraduationCap,
    iconBg: Colors.tagAmberBg,
    iconColor: Colors.tagAmberText,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, language, setLanguage, resetOnboarding } = useAuth();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<'achievements' | 'language'>('achievements');
  const [detailedProfile, setDetailedProfile] = useState<StudentProfile | null>(null);
  const [completedAssessment, setCompletedAssessment] = useState<AssessmentResponse | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [selectedActivityMenu, setSelectedActivityMenu] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [p, a] = await Promise.all([
        getStudentProfile(),
        getCompletedAssessment(),
      ]);
      setDetailedProfile(p);
      setCompletedAssessment(a);
    }
    loadData();
  }, []);

  const displayName = detailedProfile?.name || profile?.name || user?.fullName || 'Rahul Sharma';
  const displayLocation = detailedProfile?.district && detailedProfile?.state
    ? `${detailedProfile.district}, ${detailedProfile.state}`
    : profile?.district && profile?.state
    ? `${profile.district}, ${profile.state}`
    : 'Sehore District, Madhya Pradesh';

  const displayEducation = detailedProfile?.currentEducationLevel
    ? detailedProfile.currentEducationLevel.replace('_', ' ').toUpperCase()
    : profile?.educationLevel
    ? profile.educationLevel.replace('_', ' ').toUpperCase()
    : 'Class 10 (Matriculation)';

  const userSkills = detailedProfile?.technicalSkills && detailedProfile.technicalSkills.length > 0
    ? detailedProfile.technicalSkills.map((s) => s.replace(/_/g, ' '))
    : ['Basic House Wiring', 'Solar Panel Mounting', 'Smartphone Repair'];

  const handleSignOut = async () => {
    await resetOnboarding();
    router.replace('/(auth)/welcome');
  };

  const handleRemoveActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setSelectedActivityMenu(null);
  };

  const handleCompleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setSelectedActivityMenu(null);
  };

  return (
    <View style={styles.screen}>
      {/* Lavender Header Banner (Matches Image 3) */}
      <View style={styles.lavenderHeader}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={styles.headerIconsRow}>
            <Pressable
              onPress={() => router.push('/profile/edit')}
              style={styles.whiteHeaderCircle}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
            >
              <Edit size={16} color={Colors.primary} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/opportunities')}
              style={styles.whiteHeaderCircle}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={16} color={Colors.primary} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              onPress={() => void handleSignOut()}
              style={[styles.whiteHeaderCircle, styles.headerLogOutBtn]}
              accessibilityRole="button"
              accessibilityLabel="Log Out"
            >
              <LogOut size={16} color={Colors.danger} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>

        {/* Profile Identity Card overlapping the banner (Image 3) */}
        <View style={styles.profileIdentityRow}>
          <View style={styles.avatarRoundedSquare}>
            <UserIcon size={36} color={Colors.primaryDark} strokeWidth={2} />
          </View>

          <View style={styles.identityTextCol}>
            <Text style={styles.studentName}>{displayName}</Text>
            <Text style={styles.studentClass}>{displayEducation}</Text>
            <View style={styles.locationPillRow}>
              <MapPin size={12} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.locationText}>{displayLocation}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? Spacing.xl : 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Switcher Pills (Image 3: Achievements | Notes) */}
        <View style={styles.segmentedRow}>
          <Pressable
            onPress={() => setActiveTab('achievements')}
            style={[
              styles.segmentPill,
              activeTab === 'achievements' && styles.segmentPillActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'achievements' && styles.segmentTextActive,
              ]}
            >
              Achievements & Roadmap
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('language')}
            style={[
              styles.segmentPill,
              activeTab === 'language' && styles.segmentPillActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'language' && styles.segmentTextActive,
              ]}
            >
              Language & Settings
            </Text>
          </Pressable>
        </View>

        {activeTab === 'achievements' ? (
          <>
            {/* About Student Bio Section (Image 3) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>About</Text>
              <Text style={styles.aboutParagraph}>
                Focused vocational trade student interested in renewable energy, solar PV systems, and agricultural electrification. Actively completing state skill development roadmaps and PMKVY programs.
              </Text>
            </View>

            {/* Upcoming Activities & Milestones (Image 3 List with 3-Dots Action Menu) */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Upcoming activities</Text>
                <Text style={styles.sectionCountText}>{activities.length} active</Text>
              </View>

              {activities.length === 0 ? (
                <Card variant="elevated" style={styles.emptyActivityCard}>
                  <Text style={styles.emptyActivityTitle}>No upcoming activities</Text>
                  <Text style={styles.emptyActivitySub}>
                    All milestone activities have been cleared. Select a pathway from your roadmap to schedule new hands-on tests.
                  </Text>
                  <Button
                    title="Open Roadmap"
                    size="sm"
                    variant="outline"
                    onPress={() => router.push('/(tabs)/roadmap')}
                    style={{ marginTop: Spacing.sm }}
                  />
                </Card>
              ) : (
                <View style={styles.activityList}>
                  {activities.map((act) => {
                    const IconComponent = act.icon;
                    const isMenuOpen = selectedActivityMenu === act.id;
                    return (
                      <View key={act.id} style={styles.activityCardWrapper}>
                        <Card variant="elevated" style={styles.activityCard}>
                          <View style={[styles.activityIconSquare, { backgroundColor: act.iconBg }]}>
                            <IconComponent size={18} color={act.iconColor} strokeWidth={2.4} />
                          </View>
                          <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>{act.title}</Text>
                            <Text style={styles.activitySub}>{act.sub}</Text>
                          </View>
                          <Pressable
                            onPress={() => setSelectedActivityMenu(isMenuOpen ? null : act.id)}
                            style={styles.activityMoreBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Manage activity"
                          >
                            <MoreVertical size={16} color={isMenuOpen ? Colors.primaryDark : Colors.textSecondary} />
                          </Pressable>
                        </Card>

                        {/* Dropdown / Action options when 3-dots clicked */}
                        {isMenuOpen && (
                          <View style={styles.activityActionMenu}>
                            <Pressable
                              onPress={() => handleRemoveActivity(act.id)}
                              style={styles.actionMenuItem}
                            >
                              <Trash2 size={15} color={Colors.danger} />
                              <Text style={[styles.actionMenuText, { color: Colors.danger }]}>
                                Remove Activity / Pathway
                              </Text>
                            </Pressable>

                            <View style={styles.actionMenuDivider} />

                            <Pressable
                              onPress={() => handleCompleteActivity(act.id)}
                              style={styles.actionMenuItem}
                            >
                              <CheckCircle size={15} color={Colors.success} />
                              <Text style={styles.actionMenuText}>
                                Mark as Completed
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Technical Skills Inventory */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Technical Skills Portfolio</Text>
              <View style={styles.skillsChipGrid}>
                {userSkills.map((skill, index) => (
                  <View key={index} style={styles.skillPill}>
                    <Check size={13} color={Colors.mintDark} strokeWidth={3} />
                    <Text style={styles.skillPillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Language Selection Section */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>{t('profile.language')}</Text>
              <Text style={styles.aboutParagraph}>
                Select your preferred interface language. All vocational career guides, test items, and roadmap recommendations will instantly update.
              </Text>

              <View style={styles.languagesContainer}>
                {SUPPORTED_LANGUAGES.map((langItem) => {
                  const isCurrent = language === langItem.code;
                  return (
                    <Card
                      key={langItem.code}
                      variant="elevated"
                      style={[
                        styles.langOptionCard,
                        isCurrent && styles.langOptionCardActive,
                      ]}
                      onPress={() => void setLanguage(langItem.code)}
                    >
                      <View style={styles.langLeft}>
                        <View
                          style={[
                            styles.langRadioCircle,
                            isCurrent && styles.langRadioCircleActive,
                          ]}
                        >
                          {isCurrent ? (
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          ) : null}
                        </View>
                        <View>
                          <Text style={styles.langName}>{langItem.label}</Text>
                          <Text style={styles.langRegion}>{langItem.region}</Text>
                        </View>
                      </View>
                      {isCurrent ? (
                        <Badge label="Active" variant="done" />
                      ) : null}
                    </Card>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Global Account Actions / Sign Out Button - Always visible on Mobile & Web */}
        <View style={styles.signOutSection}>
          <Button
            title={t('profile.signOut') || 'Log Out'}
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<LogOut size={16} color={Colors.danger} />}
            onPress={() => void handleSignOut()}
            style={styles.signOutBtn}
            textStyle={{ color: Colors.danger, fontWeight: Typography.fontWeights.bold }}
          />
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
  // LAVENDER HEADER (Image 3)
  lavenderHeader: {
    backgroundColor: Colors.primary, // Soft Lavender #A28EF9
    paddingTop: 54,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl + 4,
    borderBottomRightRadius: BorderRadius.xl + 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.heading,
    fontWeight: Typography.fontWeights.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  whiteHeaderCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  profileIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarRoundedSquare: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  identityTextCol: {
    flex: 1,
  },
  studentName: {
    fontSize: Typography.fontSizes.title,
    fontWeight: Typography.fontWeights.bold,
    color: '#FFFFFF',
  },
  studentClass: {
    fontSize: Typography.fontSizes.subtext,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: Typography.fontSizes.caption,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // SCROLL CONTENT
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // SEGMENTED SWITCHER (Image 3: Achievements | Notes)
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#E7EAF2',
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  segmentPillActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.dark,
    fontWeight: Typography.fontWeights.bold,
  },

  // SECTION BLOCKS
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  aboutParagraph: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: 22,
    color: Colors.textSecondary,
  },

  // ACTIVITIES LIST (Image 3)
  activityList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  activityIconSquare: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  activitySub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityMoreBtn: {
    padding: 6,
  },

  // SKILLS CHIPS
  skillsChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  skillPillText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },

  // LANGUAGE SELECTOR
  languagesContainer: {
    gap: 10,
    marginTop: Spacing.sm,
  },
  langOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  langOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langRadioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langRadioCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langName: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  langRegion: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signOutBtn: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },
  signOutSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  headerLogOutBtn: {
    backgroundColor: '#FEE2E2',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionCountText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeights.semibold,
  },
  emptyActivityCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyActivityTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  activityCardWrapper: {
    marginBottom: Spacing.xs,
  },
  activityActionMenu: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xs,
    ...Shadows.md,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  actionMenuText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  adminCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCardTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  adminCardSub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adminTogglePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F1F5F9',
  },
  adminTogglePillActive: {
    backgroundColor: Colors.mint,
    borderColor: Colors.mintDark,
  },
  adminToggleText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  adminToggleTextActive: {
    color: Colors.dark,
  },
});
