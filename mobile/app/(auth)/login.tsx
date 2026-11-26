import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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
import { Mail, Lock, AlertCircle, HelpCircle, X, Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { ControlledInput } from '@/components/form/ControlledInput';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, resetPassword, completeOnboarding, isDevMode } = useAuth();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const enteredEmail = watch('email');

  const onSubmit = async (values: LoginFormData) => {
    setAuthError(null);
    try {
      const result = await signIn(values.email, values.password);
      if (result.error) {
        setAuthError(result.error);
        return;
      }
      // Successfully authenticated
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    setResetEmailSent(false);
    setResetError(null);
    setForgotModalVisible(true);
  };

  const triggerResetEmail = async () => {
    const email = enteredEmail?.trim() || '';
    const parsedEmail = z.string().email().safeParse(email);
    if (!parsedEmail.success) {
      setResetError(t('onboarding.invalidResetEmail'));
      return;
    }

    setIsSendingReset(true);
    setResetError(null);
    try {
      const result = await resetPassword(email);
      if (result.error) {
        setResetError(
          isDevMode ? t('onboarding.resetPasswordUnavailable') : result.error
        );
        return;
      }
      setResetEmailSent(true);
    } catch (error) {
      setResetError(
        error instanceof Error ? error.message : t('errors.genericError')
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('onboarding.logIn')}
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
          <View style={styles.introBlock}>
            <Text style={styles.heading}>{t('onboarding.logIn')}</Text>
            <Text style={styles.subheading}>
              {t('onboarding.welcomeSubtitle')}
            </Text>
          </View>

          {/* Error Banner */}
          {authError ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
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

          {/* Forgot Password Action */}
          <View style={styles.forgotRow}>
            <Pressable
              onPress={handleForgotPassword}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.forgotPassword')}
            >
              <Text style={styles.forgotText}>{t('onboarding.forgotPassword')}</Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Button
            title={t('onboarding.logIn')}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            style={styles.submitButton}
          />

          {/* Register Prompt */}
          <View style={styles.registerRedirectRow}>
            <Text style={styles.redirectText}>{t('onboarding.dontHaveAccount')}</Text>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.register')}
            >
              <Text style={styles.redirectLink}>{t('onboarding.register')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setForgotModalVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <HelpCircle size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>{t('onboarding.resetPasswordTitle')}</Text>
              </View>
              <Pressable
                onPress={() => setForgotModalVisible(false)}
                hitSlop={8}
                style={styles.modalClose}
              >
                <X size={20} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {resetEmailSent ? (
                <View style={styles.successBox}>
                  <View style={styles.checkCircle}>
                    <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.successTitle}>{t('onboarding.resetPasswordSent')}</Text>
                  <Text style={styles.successDesc}>
                    {t('onboarding.resetPasswordSentDescription', { email: enteredEmail })}
                  </Text>
                  <Button
                    title={t('common.done')}
                    variant="primary"
                    size="md"
                    onPress={() => setForgotModalVisible(false)}
                    style={{ marginTop: Spacing.md }}
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.modalDesc}>
                    {t('onboarding.resetPasswordDescription')}
                  </Text>
                  <View style={styles.emailDisplayBox}>
                    <Mail size={16} color={Colors.textSecondary} />
                    <Text style={styles.emailDisplayText}>
                      {enteredEmail || t('onboarding.enterEmailFirst')}
                    </Text>
                  </View>
                  {resetError ? (
                    <Text accessibilityRole="alert" style={styles.resetErrorText}>
                      {resetError}
                    </Text>
                  ) : null}
                  <Button
                    title={t('onboarding.sendResetLink')}
                    variant="primary"
                    size="md"
                    loading={isSendingReset}
                    disabled={!enteredEmail?.trim()}
                    onPress={() => void triggerResetEmail()}
                    style={{ marginTop: Spacing.md }}
                  />
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  forgotText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeights.semibold,
  },
  submitButton: {
    marginBottom: Spacing.md,
  },
  registerRedirectRow: {
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    marginTop: Spacing.xs,
  },
  modalDesc: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emailDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailDisplayText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.textPrimary,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  checkCircle: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  successDesc: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resetErrorText: {
    color: Colors.danger,
    fontSize: Typography.fontSizes.caption,
    marginTop: Spacing.xs,
  },
});
