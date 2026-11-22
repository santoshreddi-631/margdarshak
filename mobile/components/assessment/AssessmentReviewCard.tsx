import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Edit3 } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export interface ReviewItem {
  label: string;
  value: string | string[];
}

export interface AssessmentReviewCardProps {
  title: string;
  items: ReviewItem[];
  onEdit: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AssessmentReviewCard: React.FC<AssessmentReviewCardProps> = ({
  title,
  items,
  onEdit,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
          style={({ pressed }) => [
            styles.editPill,
            pressed && styles.editPillPressed,
          ]}
        >
          <Edit3 size={12} color={Colors.primary} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.contentList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            {Array.isArray(item.value) ? (
              <View style={styles.tagsWrap}>
                {item.value.length === 0 ? (
                  <Text style={styles.emptyValText}>None selected</Text>
                ) : (
                  item.value.map((tag, tIdx) => (
                    <View key={tIdx} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <Text style={styles.itemValue}>{item.value || 'Not specified'}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.body,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  editPillPressed: {
    opacity: 0.75,
  },
  editText: {
    fontSize: Typography.fontSizes.caption,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primaryDark,
  },
  contentList: {
    gap: Spacing.xs + 2,
  },
  itemRow: {
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xs,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textPrimary,
  },
  emptyValText: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
