import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { CareerHeroIllustration } from '@/components/illustrations/CareerHeroIllustration';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xxl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Branding */}
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrapper}>
            <Compass size={22} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.brandName}>{t('common.appName')}</Text>
            <Text style={styles.brandScript}>मार्गदर्शक • మార్గదర్శి • Margdarshak</Text>
          </View>
        </View>

        {/* Hero Illustration */}
        <View style={styles.illustrationWrapper}>
          <CareerHeroIllustration size={220} />
        </View>

        {/* Hero Heading & Proposition */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>
            {t('onboarding.welcomeTitle')}
          </Text>
          <Text style={styles.heroDescription}>
            {t('onboarding.welcomeSubtitle')}
          </Text>
        </View>

        {/* Value Highlights */}
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightItem}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.highlightText}>
              {t('onboarding.vernacularHighlights')}
            </Text>
          </View>
          <View style={styles.highlightItem}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.highlightText}>
              {t('onboarding.schemesHighlights')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button
            title={t('onboarding.getStarted')}
            size="lg"
            variant="primary"
            fullWidth
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            onPress={() => router.push('/(auth)/language')}
          />

          <View style={styles.loginOptionRow}>
            <Text style={styles.loginPromptText}>{t('onboarding.alreadyHaveAccount')}</Text>
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.logIn')}
            >
              <Text style={styles.loginLinkText}>{t('onboarding.logIn')}</Text>
            </Pressable>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  brandIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: Typography.fontSizes.title,
    lineHeight: Typography.lineHeights.title,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
  },
  brandScript: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  illustrationWrapper: {
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  heroTextContainer: {
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
    letterSpacing: -0.4,
  },
  heroDescription: {
    fontSize: Typography.fontSizes.body,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  highlightsContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightText: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
    flex: 1,
    lineHeight: 18,
  },
  actionContainer: {
    gap: Spacing.md,
  },
  loginOptionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  loginPromptText: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
  },
  loginLinkText: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryDark,
  },
});
