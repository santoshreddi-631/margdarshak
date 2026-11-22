import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography, Shadows } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'lavender' | 'mint';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';

export interface ButtonProps {
  title?: string;
  label?: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isInteractive = !disabled && !loading;
  const buttonText = title || label || '';
  const normalizedSize: 'sm' | 'md' | 'lg' =
    size === 'small' ? 'sm' : size === 'medium' ? 'md' : size === 'large' ? 'lg' : size;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || buttonText}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${normalizedSize}`],
        fullWidth && styles.fullWidth,
        pressed && isInteractive && styles[`${variant}_pressed`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'lavender'
              ? '#FFFFFF'
              : Colors.textPrimary
          }
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${normalizedSize}`],
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {buttonText}
          </Text>
          {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full, // Modern pill shape
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  leftIconWrapper: {
    marginRight: Spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: Spacing.sm,
  },
  text: {
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
  },

  // Variants (Clean Fustat Palette)
  primary: {
    backgroundColor: Colors.dark, // Clean #222222 dark pill
    borderWidth: 0,
    ...Shadows.sm,
  },
  primary_pressed: {
    backgroundColor: '#3a3a3a',
    transform: [{ scale: 0.98 }],
  },
  text_primary: {
    color: '#FFFFFF',
  },

  secondary: {
    backgroundColor: Colors.surface, // Clean white pill
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  secondary_pressed: {
    backgroundColor: '#F3F4F8',
    transform: [{ scale: 0.98 }],
  },
  text_secondary: {
    color: Colors.textPrimary,
  },

  lavender: {
    backgroundColor: Colors.primary, // #A28EF9 Soft lavender
    borderWidth: 0,
    ...Shadows.sm,
  },
  lavender_pressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  text_lavender: {
    color: '#FFFFFF',
  },

  mint: {
    backgroundColor: Colors.mint, // #A4F5A6 Pastel mint
    borderWidth: 0,
    ...Shadows.sm,
  },
  mint_pressed: {
    backgroundColor: Colors.mintDark,
    transform: [{ scale: 0.98 }],
  },
  text_mint: {
    color: Colors.dark,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outline_pressed: {
    backgroundColor: 'rgba(34, 34, 34, 0.04)',
    transform: [{ scale: 0.98 }],
  },
  text_outline: {
    color: Colors.textPrimary,
  },

  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  ghost_pressed: {
    backgroundColor: 'rgba(34, 34, 34, 0.04)',
  },
  text_ghost: {
    color: Colors.textSecondary,
  },

  // Sizes
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 52,
  },

  textSize_sm: {
    fontSize: Typography.fontSizes.subtext,
  },
  textSize_md: {
    fontSize: Typography.fontSizes.body,
  },
  textSize_lg: {
    fontSize: Typography.fontSizes.subtitle,
  },

  disabled: {
    opacity: 0.45,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
