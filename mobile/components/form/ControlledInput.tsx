import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { Input, type InputProps } from '@/components/ui/Input';

export interface ControlledInputProps<T extends FieldValues>
  extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  isPassword?: boolean;
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  isPassword = false,
  rightIcon,
  ...inputProps
}: ControlledInputProps<T>) {
  const [hidePassword, setHidePassword] = useState(isPassword);

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const togglePasswordVisibility = () => {
    setHidePassword((prev) => !prev);
  };

  const passwordToggleIcon = isPassword ? (
    <Pressable
      onPress={togglePasswordVisibility}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={hidePassword ? 'Show password' : 'Hide password'}
      style={styles.eyeIconWrapper}
    >
      {hidePassword ? (
        <Eye size={18} color={Colors.textSecondary} />
      ) : (
        <EyeOff size={18} color={Colors.primary} />
      )}
    </Pressable>
  ) : (
    rightIcon
  );

  return (
    <Input
      value={value ?? ''}
      onChangeText={onChange}
      onBlur={onBlur}
      error={error?.message}
      secureTextEntry={isPassword && hidePassword}
      rightIcon={passwordToggleIcon}
      {...inputProps}
    />
  );
}

const styles = StyleSheet.create({
  eyeIconWrapper: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
