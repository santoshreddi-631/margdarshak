import React, { useState, useEffect } from 'react';
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
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Save,
  CheckCircle,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { ControlledInput } from '@/components/form/ControlledInput';
import { ControlledSelect, type SelectOption } from '@/components/form/ControlledSelect';
import { SelectableChipGroup } from '@/components/assessment/SelectableChipGroup';
import { useAuth, type SupportedLanguage } from '@/context/AuthContext';
import {
  saveStudentProfile,
  getStudentProfile,
} from '@/services/assessmentStorage';
import {
  fetchUserProfile,
  upsertUserProfile,
  setUserSkillsApi,
  setUserInterestsApi,
} from '@/services/api';
import type { StudentProfile } from '@/models/assessment';

const EDUCATION_LEVEL_OPTIONS: SelectOption[] = [
  { label: 'Below 10th Standard', value: 'below_10th' },
  { label: '10th Pass (Matriculation)', value: '10th_pass' },
  { label: '12th Pass (Intermediate / HSC)', value: '12th_pass' },
  { label: 'ITI Certified / Trade Student', value: 'iti' },
  { label: 'Polytechnic Diploma', value: 'diploma' },
  { label: 'College Graduate (BA/BSc/BCom/BTech)', value: 'graduate' },
  { label: 'Post Graduate / Higher Degree', value: 'post_graduate' },
];

const STREAM_OPTIONS: SelectOption[] = [
  { label: 'Vocational & Technical Trades', value: 'vocational' },
  { label: 'Science (Maths / Biology)', value: 'science' },
  { label: 'Agriculture & Allied Sciences', value: 'agriculture' },
  { label: 'Commerce & Business', value: 'commerce' },
  { label: 'Arts & Humanities', value: 'arts' },
  { label: 'General / Non-Specialized', value: 'general' },
];

const GRADUATION_YEAR_OPTIONS: SelectOption[] = [
  { label: '2024 or Earlier (Completed)', value: '2024_earlier' },
  { label: '2025 (Completed / Current)', value: '2025' },
  { label: '2026 (Upcoming)', value: '2026' },
  { label: '2027 (Upcoming)', value: '2027' },
  { label: '2028 or Later', value: '2028_later' },
];

const LEARNING_METHOD_OPTIONS: SelectOption[] = [
  { label: 'Practical Hands-on Workshop Training', value: 'practical_hands_on' },
  { label: 'On-the-Job Apprenticeship with Stipend', value: 'apprenticeship_on_job' },
  { label: 'Traditional Classroom Lectures & Books', value: 'classroom' },
  { label: 'Self-Paced Mobile Video Lessons', value: 'self_paced' },
];

const RELOCATION_OPTIONS: SelectOption[] = [
  { label: 'Within My Home District Only', value: 'within_district' },
  { label: 'Anywhere Within My State', value: 'within_state' },
  { label: 'Willing to Relocate Anywhere in India', value: 'anywhere_in_india' },
];

const TECHNICAL_SKILLS_POOL = [
  { id: 'electrical_wiring', label: 'House / Industrial Wiring' },
  { id: 'multimeter_testing', label: 'Multimeter & Circuit Testing' },
  { id: 'solar_panel_fitting', label: 'Solar Panel Mounting & Wiring' },
  { id: 'tractor_maintenance', label: 'Tractor & Engine Repair' },
  { id: 'mobile_repair', label: 'Smartphone Hardware/Software Repair' },
  { id: 'computer_basics', label: 'MS Excel, Word & Data Entry' },
  { id: 'welding_fabrication', label: 'Arc Welding & Metal Cutting' },
  { id: 'soil_testing', label: 'Soil Sampling & Fertilizer Prep' },
  { id: 'driving_2w_4w', label: 'Two/Four Wheeler Driving' },
  { id: 'plumbing_pvc', label: 'Plumbing & Drip Pipe Fitting' },
];

const SOFT_SKILLS_POOL = [
  { id: 'customer_communication', label: 'Polite Customer Communication' },
  { id: 'team_coordination', label: 'Team Work & Cooperation' },
  { id: 'basic_english', label: 'Basic English Comprehension' },
  { id: 'billing_cash', label: 'Billing, Math & Cash Handling' },
  { id: 'time_management', label: 'Punctuality & Task Scheduling' },
  { id: 'troubleshooting', label: 'Calm Problem Solving' },
];

const INTEREST_FIELDS_POOL = [
  { id: 'solar_energy', label: 'Solar & Renewable Energy' },
  { id: 'organic_farming', label: 'Organic Farming & Agro-processing' },
  { id: 'ev_mechanics', label: 'Electric Vehicles & Auto Mechanics' },
  { id: 'hospital_care', label: 'Hospital & Healthcare Support' },
  { id: 'csc_digital', label: 'CSC Center & Digital Services' },
  { id: 'retail_sales', label: 'Retail Sales & Store Keeping' },
  { id: 'gov_exams', label: 'State & Central Govt Recruitment' },
];

const studentProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currentEducationLevel: z.string().min(1, 'Please select your current education level'),
  educationalStream: z.string().min(1, 'Please select your educational stream'),
  courseOrSpecialization: z.string().min(2, 'Please enter your trade or course specialization'),
  graduationYear: z.string().min(1, 'Please select your graduation or expected year'),
  preferredLearningMethod: z.enum([
    'practical_hands_on',
    'classroom',
    'self_paced',
    'apprenticeship_on_job',
  ]),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  willingnessToRelocate: z.enum([
    'within_district',
    'within_state',
    'anywhere_in_india',
  ]),
});

type ProfileFormData = z.infer<typeof studentProfileSchema>;

export default function StudentProfileEditScreen() {
  const router = useRouter();
  const { user, profile, language, setLanguage, updateProfile } = useAuth();

  const [technicalSkills, setTechnicalSkills] = useState<string[]>([
    'electrical_wiring',
    'solar_panel_fitting',
  ]);
  const [softSkills, setSoftSkills] = useState<string[]>([
    'customer_communication',
    'team_coordination',
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'solar_energy',
    'organic_farming',
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: profile?.name || user?.fullName || 'Rahul Sharma',
      currentEducationLevel: profile?.educationLevel || '10th_pass',
      educationalStream: 'vocational',
      courseOrSpecialization: 'Solar PV Systems & Electrical',
      graduationYear: '2025',
      preferredLearningMethod: 'practical_hands_on',
      state: profile?.state || 'Madhya Pradesh',
      district: profile?.district || 'Sehore',
      willingnessToRelocate: 'within_district',
    },
  });

  // Load persisted detailed profile if available
  useEffect(() => {
    async function loadData() {
      try {
        const remoteProfile = await fetchUserProfile();
        if (remoteProfile) {
          if (remoteProfile.full_name) setValue('name', remoteProfile.full_name);
          if (remoteProfile.current_education_level) setValue('currentEducationLevel', remoteProfile.current_education_level);
          if (remoteProfile.educational_stream) setValue('educationalStream', remoteProfile.educational_stream);
          if (remoteProfile.course_or_specialization) setValue('courseOrSpecialization', remoteProfile.course_or_specialization);
          if (remoteProfile.graduation_year) setValue('graduationYear', remoteProfile.graduation_year);
          if (remoteProfile.preferred_learning_method) setValue('preferredLearningMethod', remoteProfile.preferred_learning_method as any);
          if (remoteProfile.state) setValue('state', remoteProfile.state);
          if (remoteProfile.district) setValue('district', remoteProfile.district);
          if (remoteProfile.willingness_to_relocate) setValue('willingnessToRelocate', remoteProfile.willingness_to_relocate as any);
          if (remoteProfile.preferred_language && (remoteProfile.preferred_language === 'en' || remoteProfile.preferred_language === 'te' || remoteProfile.preferred_language === 'hi')) {
            setSelectedLanguage(remoteProfile.preferred_language as SupportedLanguage);
          }
        }
      } catch (_e) {
        // Fallback to local
      }

      const full = await getStudentProfile();
      if (full) {
        if (full.name) setValue('name', full.name);
        if (full.currentEducationLevel) setValue('currentEducationLevel', full.currentEducationLevel);
        if (full.educationalStream) setValue('educationalStream', full.educationalStream);
        if (full.courseOrSpecialization) setValue('courseOrSpecialization', full.courseOrSpecialization);
        if (full.graduationYear) setValue('graduationYear', full.graduationYear);
        if (full.preferredLearningMethod) setValue('preferredLearningMethod', full.preferredLearningMethod);
        if (full.state) setValue('state', full.state);
        if (full.district) setValue('district', full.district);
        if (full.willingnessToRelocate) setValue('willingnessToRelocate', full.willingnessToRelocate);
        if (full.technicalSkills) setTechnicalSkills(full.technicalSkills);
        if (full.nonTechnicalSkills) setSoftSkills(full.nonTechnicalSkills);
        if (full.interests) setSelectedInterests(full.interests);
        if (full.preferredLanguage) setSelectedLanguage(full.preferredLanguage);
      }
    }
    loadData();
  }, [setValue]);

  const onSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const fullProfileData: StudentProfile = {
        name: values.name,
        currentEducationLevel: values.currentEducationLevel,
        educationalStream: values.educationalStream,
        courseOrSpecialization: values.courseOrSpecialization,
        graduationYear: values.graduationYear,
        technicalSkills,
        nonTechnicalSkills: softSkills,
        interests: selectedInterests,
        preferredCareerFields: selectedInterests,
        preferredLearningMethod: values.preferredLearningMethod,
        preferredLanguage: selectedLanguage,
        state: values.state,
        district: values.district,
        willingnessToRelocate: values.willingnessToRelocate,
      };

      // 1. Sync with backend Profile API
      try {
        await upsertUserProfile({
          full_name: values.name,
          current_education_level: values.currentEducationLevel,
          educational_stream: values.educationalStream,
          course_or_specialization: values.courseOrSpecialization,
          graduation_year: values.graduationYear,
          state: values.state,
          district: values.district,
          willingness_to_relocate: values.willingnessToRelocate,
          preferred_learning_method: values.preferredLearningMethod,
          preferred_language: selectedLanguage,
        });
      } catch (_apiErr) {
        // Offline resilience
      }

      // 2. Save to detailed student profile offline storage
      await saveStudentProfile(fullProfileData);

      // 3. Update primary AuthContext
      await updateProfile({
        name: values.name,
        educationLevel: values.currentEducationLevel,
        state: values.state,
        district: values.district,
        ageRange: profile?.ageRange || '19-22',
      });

      if (selectedLanguage !== language) {
        await setLanguage(selectedLanguage);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.back();
      }, 900);
    } catch (error) {
      console.error('Failed to save student profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Student Profile"
        subtitle="Manage your education & skills portfolio"
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
          {saveSuccess ? (
            <View style={styles.successBanner}>
              <CheckCircle size={18} color={Colors.success} />
              <Text style={styles.successText}>Profile saved successfully! Redirecting...</Text>
            </View>
          ) : null}

          {/* Section 1: Education Background */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <GraduationCap size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>1. Educational Background</Text>
            </View>

            <ControlledInput
              name="name"
              control={control}
              label="Student Full Name"
              required
              leftIcon={<User size={18} color={Colors.textSecondary} />}
            />

            <ControlledSelect
              name="currentEducationLevel"
              control={control}
              label="Current / Highest Education Level"
              required
              options={EDUCATION_LEVEL_OPTIONS}
            />

            <ControlledSelect
              name="educationalStream"
              control={control}
              label="Stream of Study"
              required
              options={STREAM_OPTIONS}
            />

            <ControlledInput
              name="courseOrSpecialization"
              control={control}
              label="Course, Trade or Major Subject"
              placeholder="e.g. Electrician, Agronomy, 10th Board, General"
              required
              helperText="Specific trade or major focus of your schooling/diploma"
            />

            <ControlledSelect
              name="graduationYear"
              control={control}
              label="Year of Completion"
              required
              options={GRADUATION_YEAR_OPTIONS}
            />
          </View>

          {/* Section 2: Technical & Vocational Skills */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Briefcase size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>2. Existing Technical Skills</Text>
            </View>
            <Text style={styles.sectionSubtext}>
              Select any trade tools or practical skills you have tried or practiced:
            </Text>
            <SelectableChipGroup
              options={TECHNICAL_SKILLS_POOL}
              selectedIds={technicalSkills}
              onChange={setTechnicalSkills}
            />
          </View>

          {/* Section 3: Non-Technical / People Skills */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>3. Non-Technical & Everyday Skills</Text>
            <Text style={styles.sectionSubtext}>
              Select your personal strengths:
            </Text>
            <SelectableChipGroup
              options={SOFT_SKILLS_POOL}
              selectedIds={softSkills}
              onChange={setSoftSkills}
            />
          </View>

          {/* Section 4: Vocational Interests */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>4. Career Interests & Sectors</Text>
            <Text style={styles.sectionSubtext}>
              Fields you would love to explore:
            </Text>
            <SelectableChipGroup
              options={INTEREST_FIELDS_POOL}
              selectedIds={selectedInterests}
              onChange={setSelectedInterests}
            />
          </View>

          {/* Section 5: Preferences & Mobility */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>5. Learning Method & Location</Text>
            </View>

            <ControlledSelect
              name="preferredLearningMethod"
              control={control}
              label="Preferred Learning Method"
              required
              options={LEARNING_METHOD_OPTIONS}
            />

            <ControlledInput
              name="state"
              control={control}
              label="Residential State"
              required
            />

            <ControlledInput
              name="district"
              control={control}
              label="Home District"
              required
            />

            <ControlledSelect
              name="willingnessToRelocate"
              control={control}
              label="Relocation & Travel Preference"
              required
              options={RELOCATION_OPTIONS}
            />
          </View>

          {/* Action Button */}
          <Button
            title="Save Complete Profile"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSaving}
            leftIcon={<Save size={18} color={Colors.textInverse} />}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            style={styles.saveButton}
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.tagMintBg,
    borderColor: Colors.mint,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.tagMintText,
    fontWeight: Typography.fontWeights.semibold,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionSubtext: {
    fontSize: Typography.fontSizes.caption + 1,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  saveButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});
