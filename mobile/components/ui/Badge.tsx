import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'outline'
  | 'in_progress'
  | 'to_do'
  | 'done'
  | 'dark';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'secondary',
  icon,
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full, // Modern pill shape
  },
  iconWrapper: {
    marginRight: 4,
  },
  text: {
    fontSize: Typography.fontSizes.caption + 1,
    lineHeight: 16,
    fontWeight: Typography.fontWeights.semibold,
  },

  // Color variants matching reference UI
  in_progress: {
    backgroundColor: Colors.tagAmberBg, // Soft warm amber
  },
  text_in_progress: {
    color: Colors.tagAmberText,
  },

  to_do: {
    backgroundColor: Colors.tagLavenderBg, // Soft lavender
  },
  text_to_do: {
    color: Colors.tagLavenderText,
  },

  done: {
    backgroundColor: Colors.tagMintBg, // Soft mint
  },
  text_done: {
    color: Colors.tagMintText,
  },

  dark: {
    backgroundColor: Colors.dark, // Black pill
  },
  text_dark: {
    color: '#FFFFFF',
  },

  primary: {
    backgroundColor: Colors.primaryBg,
  },
  text_primary: {
    color: Colors.primaryDark,
  },

  secondary: {
    backgroundColor: '#F0F2F6',
  },
  text_secondary: {
    color: Colors.textSecondary,
  },

  success: {
    backgroundColor: Colors.tagMintBg,
  },
  text_success: {
    color: Colors.tagMintText,
  },

  warning: {
    backgroundColor: Colors.tagAmberBg,
  },
  text_warning: {
    color: Colors.tagAmberText,
  },

  info: {
    backgroundColor: Colors.infoBg,
  },
  text_info: {
    color: Colors.info,
  },

  neutral: {
    backgroundColor: '#F3F4F8',
  },
  text_neutral: {
    color: Colors.textSecondary,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text_outline: {
    color: Colors.textSecondary,
  },
});
