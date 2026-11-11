import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, space } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, showBack = false, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : null}
        <View style={styles.flex} />
        {right}
      </View>
      {subtitle ? (
        <AppText variant="overline" color={colors.muted}>
          {subtitle}
        </AppText>
      ) : null}
      <AppText variant="h1">{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xxs },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 4 },
  flex: { flex: 1 },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
});
