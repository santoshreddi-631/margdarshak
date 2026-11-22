import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';

export type CardVariant = 'elevated' | 'outlined' | 'flat' | 'mint' | 'lavender';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  accessibilityLabel,
}) => {
  const isClickable = Boolean(onPress);

  if (isClickable) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.base,
          styles[variant],
          styles[`padding_${padding}`],
          Platform.OS === 'web' && styles.webClickable,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`padding_${padding}`],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg, // 20px rounded corners
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  outlined: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mint: {
    backgroundColor: Colors.mint,
    borderWidth: 1,
    borderColor: 'rgba(34, 34, 34, 0.06)',
    ...Shadows.sm,
  },
  lavender: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(34, 34, 34, 0.06)',
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: Spacing.sm,
  },
  padding_md: {
    padding: Spacing.md,
  },
  padding_lg: {
    padding: Spacing.lg,
  },
  webClickable: {
    cursor: 'pointer' as any,
  },
});
