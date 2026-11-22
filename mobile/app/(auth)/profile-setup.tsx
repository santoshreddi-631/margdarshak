import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { User, MapPin, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { ControlledInput } from '@/components/form/ControlledInput';
import { ControlledSelect, type SelectOption } from '@/components/form/ControlledSelect';
import { useAuth } from '@/context/AuthContext';
import { upsertUserProfile } from '@/services/api';

const AGE_RANGES: SelectOption[] = [
  { label: '15 - 18 Years', value: '15-18', sublabel: 'School / Early Vocational Age' },
  { label: '19 - 22 Years', value: '19-22', sublabel: 'College / ITI / First Job Seeker' },
  { label: '23 - 28 Years', value: '23-28', sublabel: 'Skilling & Career Transition' },
  { label: '29 Years & Above', value: '29+', sublabel: 'Upskilling & Self-Employment' },
];

const STATES: SelectOption[] = [
  { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
  { label: 'Telangana', value: 'Telangana' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Bihar', value: 'Bihar' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Other State / UT', value: 'Other' },
];

const EDUCATION_LEVELS: SelectOption[] = [
  { label: 'Below 10th Standard', value: 'below_10th', sublabel: 'Direct practical vocational trades' },
  { label: '10th Pass (Matriculation)', value: '10th_pass', sublabel: 'Eligible for ITI & PMKVY courses' },
  { label: '12th Pass (Intermediate / HSC)', value: '12th_pass', sublabel: 'Arts, Science, Commerce or Vocational' },
  { label: 'ITI Student / Certified Trade', value: 'iti', sublabel: 'Electrician, Fitter, Welder, etc.' },
  { label: 'Polytechnic Diploma', value: 'diploma', sublabel: 'Mechanical, Civil, Electrical, CS' },
  { label: 'College Graduate (BA / BSc / BCom / BTech)', value: 'graduate', sublabel: 'Bachelor degree level' },
  { label: 'Post Graduate / Other', value: 'post_graduate', sublabel: 'Higher education & specialization' },
];

const profileSchema = z.object({
  name: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  ageRange: z.string().min(1, 'Please select your age range'),
  state: z.string().min(1, 'Please select your state'),
  district: z.string().min(2, 'Please enter your district name'),
  educationLevel: z.string().min(1, 'Please select your highest education level'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, completeOnboarding } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || user?.fullName || '',
      ageRange: profile?.ageRange || '',
      state: profile?.state || '',
      district: profile?.district || '',
      educationLevel: profile?.educationLevel || '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      try {
        await upsertUserProfile({
          full_name: values.name,
          state: values.state,
          district: values.district,
          current_education_level: values.educationLevel,
          preferred_language: 'en',
          willingness_to_relocate: 'within_district',
        });
      } catch (_apiErr) {
        // Offline resilience: continues even if remote backend is temporarily unavailable
      }

      await updateProfile({
        name: values.name,
        ageRange: values.ageRange,
        state: values.state,
        district: values.district,
        educationLevel: values.educationLevel,
      });
      await completeOnboarding();
      // Navigate to the main application tabs
      router.replace('/(tabs)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('onboarding.profileSetupTitle')}
        subtitle={t('onboarding.profileSetupSubtitle')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepIndicator
            currentStep={3}
            totalSteps={3}
            stepTitle={t('onboarding.profileSetupTitle')}
          />

          <View style={styles.introBlock}>
            <Text style={styles.heading}>{t('onboarding.profileSetupTitle')}</Text>
            <Text style={styles.subheading}>
              {t('onboarding.profileSetupSubtitle')}
            </Text>
          </View>

          {/* Form Fields */}
          <ControlledInput
            name="name"
            control={control}
            label={t('onboarding.fullName')}
            placeholder={t('onboarding.fullNamePlaceholder')}
            required
            leftIcon={<User size={18} color={Colors.textMuted} />}
          />

          <ControlledSelect
            name="ageRange"
            control={control}
            label={t('onboarding.ageRange')}
            required
            placeholder={t('onboarding.selectAge')}
            options={AGE_RANGES}
          />

          <ControlledSelect
            name="state"
            control={control}
            label={t('onboarding.state')}
            required
            placeholder={t('onboarding.state')}
            options={STATES}
          />

          <ControlledInput
            name="district"
            control={control}
            label={t('onboarding.district')}
            placeholder={t('onboarding.districtPlaceholder')}
            required
            leftIcon={<MapPin size={18} color={Colors.textMuted} />}
          />

          <ControlledSelect
            name="educationLevel"
            control={control}
            label={t('onboarding.educationLevel')}
            required
            placeholder={t('onboarding.selectEducation')}
            options={EDUCATION_LEVELS}
          />

          <Button
            title={t('common.continue')}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            rightIcon={<CheckCircle size={18} color="#FFFFFF" />}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  introBlock: {
    marginBottom: Spacing.md,
  },
  heading: {
    fontSize: Typography.fontSizes.title,
    lineHeight: Typography.lineHeights.title,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
