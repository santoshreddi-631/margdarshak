import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string;
  sublabel?: string;
}

export interface ControlledSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  containerStyle?: StyleProp<ViewStyle>;
}

export function ControlledSelect<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  placeholder = 'Select an option',
  options,
  containerStyle,
}: ControlledSelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = Boolean(error);

  const handleSelect = (val: string) => {
    onChange(val);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredMark}> *</Text> : null}
        </View>
      ) : null}

      <Pressable
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        style={({ pressed }) => [
          styles.selectTrigger,
          hasError && styles.selectTriggerError,
          pressed && styles.selectTriggerPressed,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={18} color={Colors.textSecondary} />
      </Pressable>

      {hasError ? (
        <Text style={styles.errorText}>{error?.message}</Text>
      ) : null}

      {/* Accessible Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={8}
                style={styles.closeButton}
              >
                <X size={20} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={({ pressed }) => [
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                      pressed && styles.optionItemPressed,
                    ]}
                  >
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {option.sublabel ? (
                        <Text style={styles.optionSublabel}>{option.sublabel}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Check size={18} color={Colors.primary} strokeWidth={2.5} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  requiredMark: {
    fontSize: Typography.fontSizes.subtext,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  selectTriggerError: {
    borderColor: Colors.danger,
  },
  selectTriggerPressed: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.primary,
  },
  triggerText: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  errorText: {
    marginTop: 4,
    fontSize: Typography.fontSizes.caption,
    lineHeight: Typography.lineHeights.caption,
    color: Colors.danger,
    fontWeight: Typography.fontWeights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    borderColor: Colors.border,
    maxHeight: '75%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.subtitle,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingHorizontal: Spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionItemSelected: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    borderColor: 'transparent',
  },
  optionItemPressed: {
    opacity: 0.8,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  optionLabel: {
    fontSize: Typography.fontSizes.body,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  optionLabelSelected: {
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeights.bold,
  },
  optionSublabel: {
    fontSize: Typography.fontSizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
