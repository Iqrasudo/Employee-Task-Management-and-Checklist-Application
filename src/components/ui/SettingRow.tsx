import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, space } from '../../theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string; // text shown on the right
  toggle?: { value: boolean; onChange: (next: boolean) => void; disabled?: boolean };
  onPress?: () => void;
  danger?: boolean;
  last?: boolean; // no divider under the last row
};

// One line in a settings list: a switch, a value, or a chevron that opens something.
export function SettingRow({ icon, title, subtitle, value, toggle, onPress, danger, last }: Props) {
  const tint = danger ? colors.danger : colors.pine600;

  const body = (
    <>
      <View style={[styles.icon, { backgroundColor: danger ? colors.dangerBg : colors.pine100 }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={styles.text}>
        <AppText variant="label" color={danger ? colors.danger : colors.text}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.muted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="small" color={colors.muted}>
          {value}
        </AppText>
      ) : null}
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          disabled={toggle.disabled}
          trackColor={{ false: colors.lineStrong, true: colors.pine600 }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.lineStrong}
          accessibilityLabel={title}
        />
      ) : null}
      {onPress && !toggle ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </>
  );

  if (onPress && !toggle) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.row, !last ? styles.line : null, pressed ? styles.pressed : null]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.row, !last ? styles.line : null]}>{body}</View>;
}

// White rounded box that groups rows, with a small heading above it.
export function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <AppText variant="overline" color={colors.muted} style={styles.groupTitle}>
        {title}
      </AppText>
      <View style={styles.box}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 60, paddingVertical: space.xs },
  line: { borderBottomWidth: 1, borderBottomColor: '#F0EEE7' },
  pressed: { opacity: 0.6 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
  group: { gap: space.xs },
  groupTitle: { paddingHorizontal: space.xs },
  box: {
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
});
