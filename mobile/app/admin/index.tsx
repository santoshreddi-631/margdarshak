import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Briefcase,
  Wrench,
  Building2,
  Plus,
  Check,
  Power,
  ExternalLink,
  Search,
  Shield,
  Layers,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminCareers,
  createAdminCareer,
  toggleAdminCareer,
  fetchAdminSkills,
  createAdminSkill,
  fetchAdminOpportunities,
  createAdminOpportunity,
  type ApiCareer,
  type ApiSkillMaster,
  type ApiOpportunity,
} from '@/services/api';

type AdminTab = 'careers' | 'skills' | 'opportunities';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { user, isAdmin } = useAuth();
  const isVerifiedAdmin = isAdmin && user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<AdminTab>('careers');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Data states
  const [careers, setCareers] = useState<ApiCareer[]>([]);
  const [skills, setSkills] = useState<ApiSkillMaster[]>([]);
  const [opportunities, setOpportunities] = useState<ApiOpportunity[]>([]);

  // Form expansion states
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);

  // New Career Form State
  const [newCareerTitle, setNewCareerTitle] = useState('');
  const [newCareerCategory, setNewCareerCategory] = useState('trades');
  const [newCareerEducation, setNewCareerEducation] = useState('10th Pass / ITI');
  const [newCareerSalary, setNewCareerSalary] = useState('₹18,000 - ₹30,000 / month');
  const [newCareerDuration, setNewCareerDuration] = useState('3 - 6 Months');

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  // New Opportunity Form State
  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppCategory, setNewOppCategory] = useState('skilling');
  const [newOppMinistry, setNewOppMinistry] = useState('Ministry of Skill Development & Entrepreneurship');
  const [newOppBenefit, setNewOppBenefit] = useState('100% Free Training & Certification');
  const [newOppUrl, setNewOppUrl] = useState('https://www.skillindiadigital.gov.in');

  // Load Admin Data on mount
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [cList, sList, oList] = await Promise.all([
        fetchAdminCareers(),
        fetchAdminSkills(),
        fetchAdminOpportunities(),
      ]);
      setCareers(cList);
      setSkills(sList);
      setOpportunities(oList);
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerifiedAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isVerifiedAdmin]);

  if (!isVerifiedAdmin) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
        <Header title="Administration" />
        <Card
          variant="elevated"
          style={{
            maxWidth: 480,
            width: '100%',
            alignItems: 'center',
            padding: Spacing.xl,
            borderRadius: BorderRadius.xl,
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            ...Shadows.md,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Spacing.md,
            }}
          >
            <Shield size={32} color={Colors.danger} />
          </View>
          <Text
            style={{
              fontSize: Typography.fontSizes.heading,
              fontWeight: Typography.fontWeights.bold,
              color: Colors.textPrimary,
              marginBottom: Spacing.xs,
              textAlign: 'center',
            }}
          >
            Administrator Access Restricted
          </Text>
          <Text
            style={{
              fontSize: Typography.fontSizes.body,
              color: Colors.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: Spacing.lg,
            }}
          >
            This administrative area is restricted to authorized platform administrators. Career catalog entries, roadmap milestones, and government schemes are securely managed directly via the PostgreSQL database.
          </Text>
          <Button
            title="Return to Student Profile"
            variant="primary"
            size="md"
            fullWidth
            onPress={() => router.replace('/(tabs)/profile')}
          />
        </Card>
      </View>
    );
  }

  const showBannerMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => {
      setActionSuccess(null);
    }, 3500);
  };

  // Actions
  const handleToggleCareer = async (careerId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    // Optimistic update
    setCareers((prev) =>
      prev.map((c) => (c.id === careerId ? { ...c, is_active: nextState } : c))
    );
    await toggleAdminCareer(careerId, nextState);
    showBannerMessage(
      `Career status set to ${nextState ? 'Active' : 'Inactive'}`
    );
  };

  const handleCreateCareer = async () => {
    if (!newCareerTitle.trim()) return;
    const created = await createAdminCareer({
      title: newCareerTitle.trim(),
      category: newCareerCategory,
      minimum_education: newCareerEducation,
      estimated_salary_range: newCareerSalary,
      training_duration: newCareerDuration,
    });
    setCareers((prev) => [created, ...prev]);
    setNewCareerTitle('');
    setShowAddCareer(false);
    showBannerMessage(`Career "${created.title}" published successfully!`);
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) return;
    const created = await createAdminSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      description: newSkillDesc.trim() || undefined,
    });
    setSkills((prev) => [created, ...prev]);
    setNewSkillName('');
    setNewSkillDesc('');
    setShowAddSkill(false);
    showBannerMessage(`Skill "${created.name}" added to master database!`);
  };

  const handleCreateOpportunity = async () => {
    if (!newOppTitle.trim()) return;
    const created = await createAdminOpportunity({
      title: newOppTitle.trim(),
      category: newOppCategory,
      ministry_or_agency: newOppMinistry.trim(),
      financial_benefit: newOppBenefit.trim(),
      portal_url: newOppUrl.trim(),
    });
    setOpportunities((prev) => [created, ...prev]);
    setNewOppTitle('');
    setShowAddOpportunity(false);
    showBannerMessage(`Scheme "${created.title}" added to verified opportunities!`);
  };

  // Filtered Lists
  const filteredCareers = useMemo(() => {
    if (!searchQuery.trim()) return careers;
    const q = searchQuery.toLowerCase();
    return careers.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category?.name && c.category.name.toLowerCase().includes(q))
    );
  }, [careers, searchQuery]);

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    const q = searchQuery.toLowerCase();
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [skills, searchQuery]);

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const q = searchQuery.toLowerCase();
    return opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.ministry_or_agency.toLowerCase().includes(q)
    );
  }, [opportunities, searchQuery]);

  return (
    <View style={styles.screen}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go Back"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Admin Content Manager</Text>
            <View style={styles.adminBadgeRow}>
              <Shield size={12} color={Colors.mint} />
              <Text style={styles.adminBadgeText}>Authorized Management Console</Text>
            </View>
          </View>
        </View>

        {/* Stats Summary Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{careers.length}</Text>
            <Text style={styles.statLabel}>Careers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{skills.length}</Text>
            <Text style={styles.statLabel}>Master Skills</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{opportunities.length}</Text>
            <Text style={styles.statLabel}>Verified Schemes</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? Spacing.xl : 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Success Alert Banner */}
        {actionSuccess ? (
          <View style={styles.successBanner}>
            <Check size={16} color={Colors.dark} strokeWidth={2.5} />
            <Text style={styles.successBannerText}>{actionSuccess}</Text>
          </View>
        ) : null}

        {/* Segmented Switcher */}
        <View style={styles.segmentedRow}>
          <Pressable
            onPress={() => setActiveTab('careers')}
            style={[
              styles.segmentPill,
              activeTab === 'careers' && styles.segmentPillActive,
            ]}
          >
            <Briefcase
              size={15}
              color={activeTab === 'careers' ? Colors.dark : Colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'careers' && styles.segmentTextActive,
              ]}
            >
              Careers ({careers.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('skills')}
            style={[
              styles.segmentPill,
              activeTab === 'skills' && styles.segmentPillActive,
            ]}
          >
            <Wrench
              size={15}
              color={activeTab === 'skills' ? Colors.dark : Colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'skills' && styles.segmentTextActive,
              ]}
            >
              Skills ({skills.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('opportunities')}
            style={[
              styles.segmentPill,
              activeTab === 'opportunities' && styles.segmentPillActive,
            ]}
          >
            <Building2
              size={15}
              color={
                activeTab === 'opportunities' ? Colors.dark : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'opportunities' && styles.segmentTextActive,
              ]}
            >
              Schemes ({opportunities.length})
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={16} color={Colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* TAB 1: CAREERS */}
        {activeTab === 'careers' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Vocational Careers Catalog</Text>
              <Button
                title={showAddCareer ? 'Cancel' : 'Add Career'}
                variant={showAddCareer ? 'outline' : 'primary'}
                size="sm"
                leftIcon={showAddCareer ? <X size={14} /> : <Plus size={14} color="#FFFFFF" />}
                onPress={() => setShowAddCareer(!showAddCareer)}
              />
            </View>

            {/* Expandable Add Career Form */}
            {showAddCareer && (
              <Card variant="elevated" style={styles.formCard}>
                <Text style={styles.formTitle}>Publish New Vocational Career</Text>

                <Text style={styles.inputLabel}>Career Title</Text>
                <TextInput
                  placeholder="e.g. Electric Vehicle Maintenance Specialist"
                  placeholderTextColor={Colors.textSecondary}
                  value={newCareerTitle}
                  onChangeText={setNewCareerTitle}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Sector / Category</Text>
                <View style={styles.chipOptionRow}>
                  {['trades', 'technical', 'agriculture', 'healthcare', 'creative'].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCareerCategory(cat)}
                      style={[
                        styles.formChip,
                        newCareerCategory === cat && styles.formChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formChipText,
                          newCareerCategory === cat && styles.formChipTextActive,
                        ]}
                      >
                        {cat.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Minimum Education</Text>
                <TextInput
                  placeholder="e.g. 10th Pass / ITI Electrical"
                  placeholderTextColor={Colors.textSecondary}
                  value={newCareerEducation}
                  onChangeText={setNewCareerEducation}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Estimated Salary Range</Text>
                <TextInput
                  placeholder="e.g. ₹20,000 - ₹35,000 / month"
                  placeholderTextColor={Colors.textSecondary}
                  value={newCareerSalary}
                  onChangeText={setNewCareerSalary}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Training Duration</Text>
                <TextInput
                  placeholder="e.g. 3 - 6 Months"
                  placeholderTextColor={Colors.textSecondary}
                  value={newCareerDuration}
                  onChangeText={setNewCareerDuration}
                  style={styles.formInput}
                />

                <Button
                  title="Publish Career to Database"
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={() => void handleCreateCareer()}
                  style={{ marginTop: Spacing.sm }}
                />
              </Card>
            )}

            {/* Careers List */}
            {filteredCareers.map((c) => {
              const isActive = c.is_active !== false;
              return (
                <Card key={c.id} variant="elevated" style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.itemTitle}>{c.title}</Text>
                      <Text style={styles.itemSub}>
                        {c.category?.name || 'Vocational Trade'} • {c.minimum_education}
                      </Text>
                    </View>
                    <Badge
                      label={isActive ? 'Active' : 'Inactive'}
                      variant={isActive ? 'done' : 'secondary'}
                    />
                  </View>

                  <View style={styles.itemDetailsRow}>
                    <Text style={styles.itemDetailText}>
                      💰 {c.estimated_salary_range}
                    </Text>
                    <Text style={styles.itemDetailText}>
                      ⏱️ {c.training_duration}
                    </Text>
                  </View>

                  <View style={styles.itemActionsRow}>
                    <Button
                      title={isActive ? 'Deactivate' : 'Activate'}
                      variant="outline"
                      size="sm"
                      leftIcon={<Power size={13} color={isActive ? Colors.danger : Colors.mintDark} />}
                      onPress={() => void handleToggleCareer(c.id, isActive)}
                      textStyle={{ color: isActive ? Colors.danger : Colors.mintDark }}
                    />
                    <Button
                      title="View Details"
                      variant="secondary"
                      size="sm"
                      onPress={() => router.push(`/career/${c.id}`)}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* TAB 2: SKILLS */}
        {activeTab === 'skills' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Master Skills Registry</Text>
              <Button
                title={showAddSkill ? 'Cancel' : 'Add Skill'}
                variant={showAddSkill ? 'outline' : 'primary'}
                size="sm"
                leftIcon={showAddSkill ? <X size={14} /> : <Plus size={14} color="#FFFFFF" />}
                onPress={() => setShowAddSkill(!showAddSkill)}
              />
            </View>

            {/* Expandable Add Skill Form */}
            {showAddSkill && (
              <Card variant="elevated" style={styles.formCard}>
                <Text style={styles.formTitle}>Add Master Skill</Text>

                <Text style={styles.inputLabel}>Skill Name</Text>
                <TextInput
                  placeholder="e.g. Drone Precision Spraying"
                  placeholderTextColor={Colors.textSecondary}
                  value={newSkillName}
                  onChangeText={setNewSkillName}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.chipOptionRow}>
                  {['technical', 'vocational', 'soft', 'digital'].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewSkillCategory(cat)}
                      style={[
                        styles.formChip,
                        newSkillCategory === cat && styles.formChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formChipText,
                          newSkillCategory === cat && styles.formChipTextActive,
                        ]}
                      >
                        {cat.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  placeholder="Brief description of competency standards..."
                  placeholderTextColor={Colors.textSecondary}
                  value={newSkillDesc}
                  onChangeText={setNewSkillDesc}
                  style={styles.formInput}
                />

                <Button
                  title="Add Skill to Master Database"
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={() => void handleCreateSkill()}
                  style={{ marginTop: Spacing.sm }}
                />
              </Card>
            )}

            {/* Skills List */}
            <View style={styles.skillsGrid}>
              {filteredSkills.map((s) => (
                <Card key={s.id} variant="elevated" style={styles.skillCard}>
                  <View style={styles.skillHeaderRow}>
                    <Text style={styles.skillTitle}>{s.name}</Text>
                    <Badge label={s.category} variant="secondary" />
                  </View>
                  {s.description ? (
                    <Text style={styles.skillDesc}>{s.description}</Text>
                  ) : null}
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* TAB 3: SCHEMES & OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Verified Schemes & Portals</Text>
              <Button
                title={showAddOpportunity ? 'Cancel' : 'Add Scheme'}
                variant={showAddOpportunity ? 'outline' : 'primary'}
                size="sm"
                leftIcon={showAddOpportunity ? <X size={14} /> : <Plus size={14} color="#FFFFFF" />}
                onPress={() => setShowAddOpportunity(!showAddOpportunity)}
              />
            </View>

            {/* Expandable Add Scheme Form */}
            {showAddOpportunity && (
              <Card variant="elevated" style={styles.formCard}>
                <Text style={styles.formTitle}>Add Verified Government Scheme</Text>

                <Text style={styles.inputLabel}>Scheme Title</Text>
                <TextInput
                  placeholder="e.g. PM Surya Ghar Muft Bijli Yojana"
                  placeholderTextColor={Colors.textSecondary}
                  value={newOppTitle}
                  onChangeText={setNewOppTitle}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.chipOptionRow}>
                  {['skilling', 'scholarship', 'internship', 'job', 'free_course'].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewOppCategory(cat)}
                      style={[
                        styles.formChip,
                        newOppCategory === cat && styles.formChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formChipText,
                          newOppCategory === cat && styles.formChipTextActive,
                        ]}
                      >
                        {cat.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Ministry / Agency</Text>
                <TextInput
                  placeholder="e.g. Ministry of New & Renewable Energy"
                  placeholderTextColor={Colors.textSecondary}
                  value={newOppMinistry}
                  onChangeText={setNewOppMinistry}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Financial Benefit / Stipend</Text>
                <TextInput
                  placeholder="e.g. Free Toolkit & ₹5,000 monthly stipend"
                  placeholderTextColor={Colors.textSecondary}
                  value={newOppBenefit}
                  onChangeText={setNewOppBenefit}
                  style={styles.formInput}
                />

                <Text style={styles.inputLabel}>Official Portal URL</Text>
                <TextInput
                  placeholder="https://pmsuryaghar.gov.in"
                  placeholderTextColor={Colors.textSecondary}
                  value={newOppUrl}
                  onChangeText={setNewOppUrl}
                  style={styles.formInput}
                />

                <Button
                  title="Add Verified Scheme"
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={() => void handleCreateOpportunity()}
                  style={{ marginTop: Spacing.sm }}
                />
              </Card>
            )}

            {/* Schemes List */}
            {filteredOpportunities.map((o) => (
              <Card key={o.id} variant="elevated" style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.itemTitle}>{o.title}</Text>
                    <Text style={styles.itemSub}>{o.ministry_or_agency}</Text>
                  </View>
                  <Badge label={o.category.toUpperCase()} variant="primary" />
                </View>

                <View style={styles.itemDetailsRow}>
                  <Text style={styles.itemDetailText}>
                    🎁 {o.financial_benefit}
                  </Text>
                </View>

                <View style={styles.itemActionsRow}>
                  <Button
                    title="Open Official Portal"
                    variant="outline"
                    size="sm"
                    rightIcon={<ExternalLink size={13} color={Colors.primaryDark} />}
                    onPress={() => {
                      if (o.portal_url) Linking.openURL(o.portal_url).catch(() => {});
                    }}
                  />
                </View>
              </Card>
            ))}
          </View>
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
  headerBanner: {
    backgroundColor: Colors.primary, // Soft Lavender #A28EF9
    paddingTop: 54,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl + 4,
    borderBottomRightRadius: BorderRadius.xl + 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.heading,
    fontWeight: Typography.fontWeights.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  adminBadgeText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.mint,
    fontWeight: Typography.fontWeights.semibold,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: Typography.fontSizes.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.mint,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  successBannerText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.dark,
    fontWeight: Typography.fontWeights.bold,
    flex: 1,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#E7EAF2',
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.md,
  },
  segmentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    gap: 6,
    borderRadius: BorderRadius.full,
  },
  segmentPillActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.dark,
    fontWeight: Typography.fontWeights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textPrimary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  formTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textPrimary,
  },
  chipOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  formChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  formChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  formChipText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  formChipTextActive: {
    color: '#FFFFFF',
  },
  itemCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  itemSub: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  itemDetailText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textPrimary,
  },
  itemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  skillsGrid: {
    gap: 8,
  },
  skillCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillTitle: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  skillDesc: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
