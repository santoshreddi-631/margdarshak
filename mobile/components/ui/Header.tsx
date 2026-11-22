import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
  variant?: 'default' | 'lavender';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  canGoBack = false,
  showBack = false,
  onBack,
  rightAction,
  style,
  bordered = false,
  variant = 'default',
}) => {
  const insets = useSafeAreaInsets();
  const allowBack = canGoBack || showBack;
  const isLavender = variant === 'lavender';

  return (
    <View
      style={[
        styles.container,
        isLavender ? styles.lavenderContainer : styles.defaultContainer,
        { paddingTop: Math.max(insets.top, 16) },
        bordered && styles.bordered,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {allowBack && onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.circleButton,
              isLavender && styles.circleButtonLavender,
              pressed && styles.circleButtonPressed,
            ]}
          >
            <ChevronLeft
              size={20}
              color={isLavender ? Colors.primary : Colors.textPrimary}
              strokeWidth={2.4}
            />
          </Pressable>
        ) : null}

        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[styles.title, isLavender && styles.titleLavender]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, isLavender && styles.subtitleLavender]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightAction ? (
          <View style={styles.rightActionContainer}>{rightAction}</View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  defaultContainer: {
    backgroundColor: Colors.background,
  },
  lavenderContainer: {
    backgroundColor: Colors.primary, // #A28EF9 for profile hero
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: Spacing.sm,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  circleButtonLavender: {
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  circleButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSizes.heading,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  titleLavender: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: Typography.fontSizes.caption + 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subtitleLavender: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
