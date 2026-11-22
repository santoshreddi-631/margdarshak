import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  style?: StyleProp<ViewStyle>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text style={styles.stepCounter}>
          STEP {currentStep} OF {totalSteps}
        </Text>
        {stepTitle ? <Text style={styles.stepTitle}>{stepTitle}</Text> : null}
      </View>
      <View style={styles.barsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepIndex = index + 1;
          const isDone = stepIndex < currentStep;
          const isCurrent = stepIndex === currentStep;

          return (
            <View
              key={index}
              style={[
                styles.bar,
                isDone && styles.barCompleted,
                isCurrent && styles.barCurrent,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  stepCounter: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: Typography.fontSizes.caption + 1,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 6,
    height: 6,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E5E8F0',
  },
  barCurrent: {
    backgroundColor: Colors.primary, // #A28EF9 Soft lavender
  },
  barCompleted: {
    backgroundColor: Colors.mint, // #A4F5A6 Pastel mint
  },
});
