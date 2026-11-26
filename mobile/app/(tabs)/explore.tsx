import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Search,
  GraduationCap,
  Banknote,
  Clock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCareers,
  fetchCareerCategories,
  fetchSavedCareers,
  toggleSaveCareer,
  type ApiCareer,
  type ApiCareerCategory,
} from '@/services/api';

const CATEGORY_CODE_ALIASES: Record<string, string[]> = {
  trades: ['trades', 'trades_electrical', 'renewable_energy', 'automotive'],
  technical: ['technical', 'digital_tech', 'trades_electrical', 'automotive'],
  agriculture: ['agriculture', 'modern_agriculture', 'agri_tech'],
  modern_agriculture: ['modern_agriculture', 'agriculture', 'agri_tech'],
  healthcare: ['healthcare', 'healthcare_support'],
  digital: ['digital', 'digital_services', 'digital_tech'],
  digital_services: ['digital_services', 'digital', 'digital_tech'],
};

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { language } = useAuth();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All');
  const [categories, setCategories] = useState<ApiCareerCategory[]>([]);
  const [careers, setCareers] = useState<ApiCareer[]>([]);
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.category && typeof params.category === 'string') {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [list, saved, cats] = await Promise.all([
          fetchCareers(language),
          fetchSavedCareers(language),
          fetchCareerCategories(language),
        ]);
        setCareers(list);
        setSavedCareerIds(saved);
        setCategories(cats);
      } catch (_e) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [language]);

  const categoryPills = useMemo(() => {
    return [
      { code: 'All', name: t('opportunities.all') || 'All Domains' },
      ...categories.map((c) => ({ code: c.code, name: c.name })),
    ];
  }, [categories, t]);

  const handleToggleSave = async (careerId: string, e: any) => {
    e.stopPropagation?.();
    const isCurrentlySaved = savedCareerIds.includes(careerId);
    const nextSaved = await toggleSaveCareer(careerId, isCurrentlySaved);
    if (nextSaved) {
      setSavedCareerIds((prev) => [...prev, careerId]);
    } else {
      setSavedCareerIds((prev) => prev.filter((id) => id !== careerId));
    }
  };

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        career.title.toLowerCase().includes(q) ||
        (career.translation?.description || '').toLowerCase().includes(q) ||
        (career.skills || []).some((s) => s.name.toLowerCase().includes(q));

      const categoryCode = (career.category?.code || '').toLowerCase();
      const selectedLower = selectedCategory.toLowerCase();
      const aliases = CATEGORY_CODE_ALIASES[selectedLower] || [selectedLower];
      const matchesCat =
        selectedCategory === 'All' ||
        categoryCode === selectedLower ||
        aliases.includes(categoryCode);

      return matchesSearch && matchesCat;
    });
  }, [careers, searchQuery, selectedCategory]);

  return (
    <View style={styles.screen}>
      <Header
        title={t('navigation.explore')}
        subtitle={t('common.tagline')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? Spacing.xl : 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar with clean rounded style */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search vocational trades, skills, jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color={Colors.textSecondary} />}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter Pills Carousel (All 10 DB Domains) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {categoryPills.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.code.toLowerCase();
            return (
              <Pressable
                key={cat.code}
                onPress={() => setSelectedCategory(cat.code)}
                style={({ pressed }) => [
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                  pressed && styles.filterPillPressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={styles.resultsInfoRow}>
          <Text style={styles.resultsCount}>
            Showing {filteredCareers.length} career pathways
          </Text>
        </View>

        {/* Career Listings Grid (Responsive on desktop web) */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading career pathways...</Text>
          </View>
        ) : filteredCareers.length === 0 ? (
          <EmptyState
            title="No Careers Match Your Search"
            description="Try clearing your search query or selecting a different trade category."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        ) : (
          <View style={isDesktop ? styles.desktopGrid : styles.mobileGrid}>
            {filteredCareers.map((career) => {
              const isSaved = savedCareerIds.includes(career.id);
              const wageDisplay = career.estimated_salary_range || '₹18,000 - ₹35,000/mo';
              const categoryLabel =
                career.category?.name ||
                (career.category?.code
                  ? career.category.code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  : 'Career');

              return (
                <Card
                  key={career.id}
                  variant="elevated"
                  style={isDesktop ? styles.desktopCard : styles.careerCard}
                  onPress={() => router.push(`/career/${career.id}`)}
                >
                  {/* Top: Category Badge & Bookmark */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Badge
                        label={categoryLabel}
                        variant="primary"
                        style={styles.categoryBadge}
                      />
                      <Text style={styles.careerTitle}>{career.title}</Text>
                    </View>

                    <Pressable
                      onPress={(e) => void handleToggleSave(career.id, e)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={isSaved ? 'Remove Bookmark' : 'Save Career'}
                      style={styles.bookmarkCircle}
                    >
                      {isSaved ? (
                        <BookmarkCheck size={18} color={Colors.primaryDark} strokeWidth={2.4} />
                      ) : (
                        <Bookmark size={18} color={Colors.textSecondary} strokeWidth={2} />
                      )}
                    </Pressable>
                  </View>

                  {/* Description */}
                  <Text numberOfLines={2} style={styles.careerDesc}>
                    {career.translation?.description || career.title}
                  </Text>

                  {/* 3 Metrics Pills */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricBadge}>
                      <GraduationCap size={13} color={Colors.primaryDark} />
                      <Text style={styles.metricText}>
                        {career.minimum_education ? career.minimum_education.toUpperCase() : '10th / ITI'}
                      </Text>
                    </View>

                    <View style={styles.metricBadge}>
                      <Banknote size={13} color={Colors.mintDark} />
                      <Text style={styles.metricText}>{wageDisplay}</Text>
                    </View>

                    <View style={styles.metricBadge}>
                      <Clock size={13} color={Colors.tagAmberText} />
                      <Text style={styles.metricText}>
                        {career.training_duration || '3-6 Months'}
                      </Text>
                    </View>
                  </View>

                  {/* Skills tags */}
                  {career.skills && career.skills.length > 0 ? (
                    <View style={styles.skillsRow}>
                      {career.skills.slice(0, 3).map((skill) => (
                        <View key={skill.name} style={styles.skillChip}>
                          <Text style={styles.skillChipText}>{skill.name}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Footer Action */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.viewDetailsText}>View Career Details & Roadmap</Text>
                    <ArrowRight size={15} color={Colors.dark} />
                  </View>
                </Card>
              );
            })}
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  searchContainer: {
    marginBottom: Spacing.xs,
  },
  pillsScroll: {
    gap: 8,
    paddingBottom: Spacing.sm + 2,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  filterPillActive: {
    backgroundColor: Colors.dark, // Black pill #222222
    borderColor: Colors.dark,
  },
  filterPillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  filterPillText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.semibold,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
  resultsInfoRow: {
    marginBottom: Spacing.sm,
  },
  resultsCount: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
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

  // GRID STYLES
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  mobileGrid: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  desktopCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  careerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryBadge: {
    marginBottom: 6,
  },
  careerTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  bookmarkCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F4F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  careerDesc: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F6FA',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  metricText: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  skillChip: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  skillChipText: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primaryDark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewDetailsText: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
});
