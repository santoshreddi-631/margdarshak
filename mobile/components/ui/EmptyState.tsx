import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { FolderOpen } from 'lucide-react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  actionLabel,
  onAction,
  style,
}) => {
  const resolvedActionTitle = actionTitle || actionLabel;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || <FolderOpen size={28} color={Colors.primary} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {resolvedActionTitle && onAction ? (
        <View style={styles.actionWrapper}>
          <Button
            title={resolvedActionTitle}
            onPress={onAction}
            variant="secondary"
            size="sm"
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes.subtitle,
    lineHeight: Typography.lineHeights.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  actionWrapper: {
    marginTop: Spacing.md,
  },
});
