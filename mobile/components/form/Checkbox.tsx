import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export interface CheckboxProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Checkbox<T extends FieldValues>({
  name,
  control,
  label,
  containerStyle,
}: CheckboxProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const isChecked = Boolean(value);

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={() => onChange(!isChecked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        style={styles.checkboxRow}
      >
        <View style={[styles.box, isChecked && styles.boxChecked, Boolean(error) && styles.boxError]}>
          {isChecked ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <View style={styles.labelContainer}>
          {typeof label === 'string' ? (
            <Text style={styles.labelText}>{label}</Text>
          ) : (
            label
          )}
        </View>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm - 2,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  boxError: {
    borderColor: Colors.danger,
  },
  labelContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: Typography.fontSizes.subtext,
    lineHeight: Typography.lineHeights.subtext,
    color: Colors.textPrimary,
  },
  errorText: {
    marginTop: 4,
    fontSize: Typography.fontSizes.caption,
    color: Colors.danger,
    fontWeight: Typography.fontWeights.medium,
  },
});
