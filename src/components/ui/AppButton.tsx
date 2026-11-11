import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, space, text } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const looks: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.pine600, fg: colors.onDark, border: colors.pine600 },
  secondary: { bg: colors.surface, fg: colors.pine600, border: colors.pine600 },
  ghost: { bg: 'transparent', fg: colors.pine600, border: 'transparent' },
  danger: { bg: colors.danger, fg: colors.onDark, border: colors.danger },
  accent: { bg: colors.saffron, fg: colors.pine900, border: colors.saffron },
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const look = looks[variant];
  const isDisabled = disabled || loading;

  const animateTo = (value: number) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          { backgroundColor: look.bg, borderColor: look.border },
          disabled && !loading ? styles.disabled : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={look.fg} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[text.label, styles.title, { color: look.fg }]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  title: { fontSize: 16 },
  disabled: { opacity: 0.45 },
});
