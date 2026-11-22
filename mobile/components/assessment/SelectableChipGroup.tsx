import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export interface ChipOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface SelectableChipGroupProps {
  options: ChipOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  minSelections?: number;
  maxSelections?: number;
  style?: StyleProp<ViewStyle>;
}

export const SelectableChipGroup: React.FC<SelectableChipGroupProps> = ({
  options,
  selectedIds,
  onChange,
  multiSelect = true,
  maxSelections,
  style,
}) => {
  const handleToggle = (id: string) => {
    if (!multiSelect) {
      onChange([id]);
      return;
    }

    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      if (maxSelections && selectedIds.length >= maxSelections) {
        return; // limit reached
      }
      onChange([...selectedIds, id]);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);

        return (
          <Pressable
            key={option.id}
            onPress={() => handleToggle(option.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.sublabel ? (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.sublabel,
                    isSelected && styles.sublabelSelected,
                  ]}
                >
                  {option.sublabel}
                </Text>
              ) : null}
            </View>

            {isSelected ? (
              <View style={styles.checkIconWrapper}>
                <Check size={12} color={Colors.dark} strokeWidth={3} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: 9,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  chipSelected: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  textContainer: {
    flexDirection: 'column',
    marginRight: 6,
  },
  label: {
    fontSize: Typography.fontSizes.subtext,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
  sublabel: {
    fontSize: Typography.fontSizes.caption - 1,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  sublabelSelected: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  checkIconWrapper: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
