import React, { useState } from 'react';
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
import { Check, ArrowRight, Languages } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useAuth, type SupportedLanguage } from '@/context/AuthContext';

interface LanguageOptionItem {
  id: SupportedLanguage;
  scriptName: string;
  englishName: string;
  region: string;
  greetingSample: string;
}

const LANGUAGES: LanguageOptionItem[] = [
  {
    id: 'en',
    scriptName: 'English',
    englishName: 'English',
    region: 'Default / Pan-India',
    greetingSample: 'Welcome to your career pathway guide',
  },
  {
    id: 'te',
    scriptName: 'తెలుగు',
    englishName: 'Telugu',
    region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ (AP & Telangana)',
    greetingSample: 'మీ నైపుణ్యాలకు అనువైన ఉద్యోగ మార్గాలు',
  },
  {
    id: 'hi',
    scriptName: 'हिंदी',
    englishName: 'Hindi',
    region: 'मध्य प्रदेश, उत्तर प्रदेश व अन्य राज्य',
    greetingSample: 'आपके कौशल के अनुसार सही कॅरियर मार्गदर्शन',
  },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useAuth();
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectLanguage = async (newLang: SupportedLanguage) => {
    setSelectedLang(newLang);
    await setLanguage(newLang);
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await setLanguage(selectedLang);
      router.push('/(auth)/register');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('onboarding.selectLanguage')}
        subtitle={t('onboarding.selectLanguageSubtitle')}
        canGoBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xxl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          stepTitle={t('onboarding.languagePreference')}
        />

        <View style={styles.introContainer}>
          <View style={styles.iconCircle}>
            <Languages size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heading}>{t('onboarding.chooseLanguageHeading')}</Text>
          <Text style={styles.subheading}>
            {t('onboarding.chooseLanguageSub')}
          </Text>
        </View>

        {/* Language Options List */}
        <View style={styles.languageList}>
          {LANGUAGES.map((item) => {
            const isSelected = selectedLang === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelectLanguage(item.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${item.scriptName} (${item.englishName})`}
                style={({ pressed }) => [
                  styles.languageCard,
                  isSelected && styles.languageCardSelected,
                  pressed && styles.languageCardPressed,
                ]}
              >
                <View style={styles.langContentLeft}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.scriptName,
                        isSelected && styles.scriptNameSelected,
                      ]}
                    >
                      {item.scriptName}
                    </Text>
                    <Text style={styles.englishName}>({item.englishName})</Text>
                  </View>
                  <Text style={styles.regionText}>{item.region}</Text>
                  <Text style={styles.sampleText}>"{item.greetingSample}"</Text>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected ? (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Footer Notice & Continue Action */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerNotice}>
            You can easily switch your preferred language at any time from your Profile settings.
          </Text>
          <Button
            title={t('common.continue')}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSaving}
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            onPress={handleContinue}
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  introContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(239, 23, 85, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heading: {
    fontSize: Typography.fontSizes.title,
    lineHeight: Typography.lineHeights.title,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  languageList: {
    gap: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    ...Shadows.sm,
  },
  languageCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  languageCardPressed: {
    opacity: 0.85,
  },
  langContentLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  scriptName: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  scriptNameSelected: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.heavy,
  },
  englishName: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  regionText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  sampleText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.primaryDark,
    fontStyle: 'italic',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footerContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  footerNotice: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
