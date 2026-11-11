import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, space, text } from '../../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
  password?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
};

export const AppTextInput = forwardRef<TextInput, Props>(function AppTextInput(
  { label, error, helper, password = false, leftIcon, onFocus, onBlur, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? colors.danger : focused ? colors.pine600 : colors.lineStrong;

  return (
    <View style={styles.wrap}>
      <Text style={[text.label, { color: colors.text }]}>{label}</Text>

      <View style={[styles.field, { borderColor }, error ? styles.fieldError : null]}>
        {leftIcon ? (
          <Ionicons name={leftIcon} size={20} color={focused ? colors.pine600 : colors.muted} />
        ) : null}

        <TextInput
          {...rest}
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          secureTextEntry={password && hidden}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />

        {password ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={[text.caption, { color: colors.danger }]}>{error}</Text>
      ) : helper ? (
        <Text style={[text.caption, { color: colors.muted }]}>{helper}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  fieldError: { backgroundColor: '#FFFBFA' },
  input: {
    flex: 1,
    paddingVertical: space.sm,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
});
