import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import type { SkillProficiency } from '@/models/assessment';

export interface ProficiencyRatingProps {
  skillName: string;
  skillDescription: string;
  value?: SkillProficiency;
  onChange: (level: SkillProficiency) => void;
  style?: StyleProp<ViewStyle>;
}

const PROFICIENCY_LEVELS: {
  id: SkillProficiency;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    subtitle: 'Need guidance / Starting',
  },
  {
    id: 'intermediate',
    title: 'Can Do',
    subtitle: 'Basic practice & skills',
  },
  {
    id: 'advanced',
    title: 'Confident',
    subtitle: 'Strong / Independent',
  },
];

export const ProficiencyRating: React.FC<ProficiencyRatingProps> = ({
  skillName,
  skillDescription,
  value = 'intermediate',
  onChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.skillTitle}>{skillName}</Text>
      <Text style={styles.skillDesc}>{skillDescription}</Text>

      <View style={styles.levelsRow}>
        {PROFICIENCY_LEVELS.map((level) => {
          const isSelected = value === level.id;
          return (
            <Pressable
              key={level.id}
              onPress={() => onChange(level.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${skillName}: ${level.title}`}
              style={({ pressed }) => [
                styles.levelButton,
                isSelected && styles.levelButtonSelected,
                pressed && styles.levelButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.levelTitle,
                  isSelected && styles.levelTitleSelected,
                ]}
              >
                {level.title}
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.levelSubtitle,
                  isSelected && styles.levelSubtitleSelected,
                ]}
              >
                {level.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  skillTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  skillDesc: {
    fontSize: Typography.fontSizes.caption + 1,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  levelButtonSelected: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  levelButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  levelTitle: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  levelTitleSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
  levelSubtitle: {
    fontSize: Typography.fontSizes.caption - 1,
    lineHeight: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  levelSubtitleSelected: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
