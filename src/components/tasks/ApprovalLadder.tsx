import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import type { ApprovalDecision, ApprovalStep } from '../../types/task';
import { colors, space } from '../../theme';

// One bar per approval level. Made for the dark task header.
const look: Record<ApprovalDecision, { bar: string; text: string; suffix: string }> = {
  approved: { bar: '#5E9C86', text: colors.onDark, suffix: ' ✓' },
  current: { bar: colors.saffron, text: colors.saffron, suffix: ' · now' },
  corrections: { bar: colors.saffron, text: colors.saffron, suffix: ' · fix' },
  waiting: { bar: colors.pine700, text: colors.onDarkMuted, suffix: '' },
};

export function ApprovalLadder({ steps }: { steps: ApprovalStep[] }) {
  return (
    <View style={styles.row} accessibilityLabel={steps.map((s) => `Level ${s.level} ${s.role}: ${s.decision}`).join(', ')}>
      {steps.map((s) => {
        const l = look[s.decision];
        return (
          <View key={s.level} style={styles.col}>
            <View style={[styles.bar, { backgroundColor: l.bar }]} />
            <AppText variant="caption" color={l.text} numberOfLines={1}>
              {s.role}
              {l.suffix}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  col: { flex: 1, gap: space.xxs + 2 },
  bar: { height: 5, borderRadius: 3 },
});
