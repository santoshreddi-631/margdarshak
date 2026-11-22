import React, { useState, useEffect, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
import {
  Building2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { fetchOpportunities, type ApiOpportunity } from '@/services/api';

export default function OpportunitiesScreen() {
  const { language } = useAuth();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [opportunities, setOpportunities] = useState<ApiOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    { id: 'all', label: t('opportunities.all') },
    { id: 'internship', label: t('opportunities.internships') },
    { id: 'job', label: t('opportunities.jobs') },
    { id: 'scholarship', label: t('opportunities.scholarships') },
    { id: 'skilling', label: t('opportunities.govtSchemes') },
    { id: 'free_course', label: t('opportunities.freeCourses') },
    { id: 'training_program', label: t('opportunities.training') },
  ];

  useEffect(() => {
    async function loadOpportunities() {
      setLoading(true);
      try {
        const data = await fetchOpportunities(activeCategory, language);
        setOpportunities(data);
      } catch (_e) {
      } finally {
        setLoading(false);
      }
    }
    loadOpportunities();
  }, [activeCategory, language]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const q = searchQuery.toLowerCase();
    return opportunities.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.ministry_or_agency.toLowerCase().includes(q) ||
        item.financial_benefit.toLowerCase().includes(q) ||
        item.eligibility_criteria.toLowerCase().includes(q)
    );
  }, [opportunities, searchQuery]);

  const handleOpenPortal = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch (_e) {
      return 'Official Govt Portal';
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('opportunities.title')}
        subtitle={t('opportunities.subtitle')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? Spacing.xl : 110 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Assurance Banner */}
        <View style={styles.assuranceBanner}>
          <ShieldCheck size={18} color={Colors.mintDark} />
          <Text style={styles.assuranceText}>
            {t('opportunities.officialPortalNotice')}
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search verified internships, schemes, scholarships..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color={Colors.textSecondary} />}
          />
        </View>

        {/* Filter Pills Carousel (Image 1 Style: active is dark #222222) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={({ pressed }) => [
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Opportunities Listing (Responsive Desktop Grid) */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching government programs...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <EmptyState
            title={t('opportunities.noOpportunities')}
            description="No opportunities found matching your search. Try resetting the category filters."
            actionLabel={t('opportunities.browseAll')}
            onAction={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <View style={isDesktop ? styles.desktopGrid : styles.mobileGrid}>
            {filteredList.map((opp) => (
              <Card
                key={opp.id}
                variant="elevated"
                style={isDesktop ? styles.desktopCard : styles.opportunityCard}
              >
                {/* Header: Category Badge & Deadline Tag */}
                <View style={styles.cardHeaderRow}>
                  <Badge
                    label={opp.category ? opp.category.replace('_', ' ').toUpperCase() : 'SCHEME'}
                    variant="primary"
                  />
                  <View style={styles.deadlineBadge}>
                    <Text style={styles.deadlineText}>{opp.deadline_notice || 'Open Year-Round'}</Text>
                  </View>
                </View>

                {/* Title & Ministry */}
                <Text style={styles.oppTitle}>{opp.title}</Text>
                <View style={styles.ministryRow}>
                  <Building2 size={14} color={Colors.textSecondary} />
                  <Text style={styles.ministryText}>{opp.ministry_or_agency}</Text>
                </View>

                {/* Key Benefit Banner (Pastel Mint Tint) */}
                <View style={styles.benefitBox}>
                  <Text style={styles.benefitLabel}>Financial & Skilling Benefit:</Text>
                  <Text style={styles.benefitValue}>{opp.financial_benefit}</Text>
                </View>

                {/* Eligibility Criteria */}
                <View style={styles.eligibilityBlock}>
                  <Text style={styles.eligibilityLabel}>Eligibility:</Text>
                  <Text style={styles.eligibilityText}>{opp.eligibility_criteria}</Text>
                </View>

                {/* Official Action Portal Button */}
                <View style={styles.cardActionRow}>
                  <View style={styles.domainPreview}>
                    <Text style={styles.domainText}>
                      Portal: {getDomainFromUrl(opp.portal_url)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleOpenPortal(opp.portal_url)}
                    accessibilityRole="link"
                    accessibilityLabel={`${t('opportunities.applyOfficial')} - ${opp.title}`}
                    style={({ pressed }) => [
                      styles.portalButton,
                      pressed && styles.portalButtonPressed,
                    ]}
                  >
                    <Text style={styles.portalButtonText}>{t('opportunities.applyOfficial')}</Text>
                    <ExternalLink size={14} color="#FFFFFF" />
                  </Pressable>
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  assuranceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  assuranceText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: Spacing.xs,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: Spacing.md,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  categoryPillActive: {
    backgroundColor: Colors.dark, // Black pill #222222
    borderColor: Colors.dark,
  },
  categoryPillText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.semibold,
  },
  categoryPillTextActive: {
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

  // GRID
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
  opportunityCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  deadlineBadge: {
    backgroundColor: Colors.tagAmberBg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  deadlineText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.tagAmberText,
    fontWeight: Typography.fontWeights.semibold,
  },
  oppTitle: {
    fontSize: Typography.fontSizes.body + 2,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ministryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  ministryText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  benefitBox: {
    backgroundColor: Colors.mintBg,
    borderWidth: 1,
    borderColor: 'rgba(164, 245, 166, 0.4)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  benefitLabel: {
    fontSize: Typography.fontSizes.caption - 1,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.mintDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  benefitValue: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  eligibilityBlock: {
    marginBottom: Spacing.md,
  },
  eligibilityLabel: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  eligibilityText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  domainPreview: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  domainText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textMuted,
  },
  portalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark, // Black pill
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  portalButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  portalButtonText: {
    fontSize: Typography.fontSizes.subtext,
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
});
