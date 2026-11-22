import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, AlertCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { ControlledInput } from '@/components/form/ControlledInput';
import { Checkbox } from '@/components/form/Checkbox';
import { useAuth } from '@/context/AuthContext';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Please enter your full name (at least 2 characters)')
      .max(60, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and privacy guidelines',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: RegisterFormData) => {
    setAuthError(null);
    try {
      const result = await signUp(values.email, values.password, values.fullName);
      if (result.error) {
        setAuthError(result.error);
        return;
      }
      // Advance to step 3: Basic profile setup
      router.push('/(auth)/profile-setup');
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred during registration.');
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('onboarding.register')}
        subtitle={t('common.appName')}
        canGoBack
        onBack={() => router.back()}
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
            currentStep={2}
            totalSteps={3}
            stepTitle={t('onboarding.register')}
          />

          <View style={styles.introBlock}>
            <Text style={styles.heading}>{t('onboarding.register')}</Text>
            <Text style={styles.subheading}>
              {t('onboarding.welcomeSubtitle')}
            </Text>
          </View>

          {/* Error Notice */}
          {authError ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <ControlledInput
            name="fullName"
            control={control}
            label={t('onboarding.fullName')}
            placeholder={t('onboarding.fullNamePlaceholder')}
            required
            leftIcon={<User size={18} color={Colors.textMuted} />}
            autoCapitalize="words"
          />

          <ControlledInput
            name="email"
            control={control}
            label={t('onboarding.email')}
            placeholder={t('onboarding.emailPlaceholder')}
            required
            leftIcon={<Mail size={18} color={Colors.textMuted} />}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ControlledInput
            name="password"
            control={control}
            label={t('onboarding.password')}
            placeholder={t('onboarding.passwordPlaceholder')}
            required
            isPassword
            leftIcon={<Lock size={18} color={Colors.textMuted} />}
          />

          <ControlledInput
            name="confirmPassword"
            control={control}
            label={t('onboarding.confirmPassword')}
            placeholder={t('onboarding.confirmPasswordPlaceholder')}
            required
            isPassword
            leftIcon={<Lock size={18} color={Colors.textMuted} />}
          />

          <Checkbox
            name="agreeTerms"
            control={control}
            label={
              <Text style={styles.termsText}>
                {t('onboarding.termsAcceptance')}
              </Text>
            }
            containerStyle={styles.checkboxContainer}
          />

          <Button
            title={t('onboarding.registerButton')}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            style={styles.submitButton}
          />

          <View style={styles.loginRedirectRow}>
            <Text style={styles.redirectText}>{t('onboarding.alreadyHaveAccount')}</Text>
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.logIn')}
            >
              <Text style={styles.redirectLink}>{t('onboarding.logIn')}</Text>
            </Pressable>
          </View>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.danger,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.danger,
    flex: 1,
    fontWeight: Typography.fontWeights.medium,
  },
  checkboxContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  termsText: {
    fontSize: Typography.fontSizes.caption + 1,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  submitButton: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  loginRedirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  redirectText: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textSecondary,
  },
  redirectLink: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryDark,
  },
});
