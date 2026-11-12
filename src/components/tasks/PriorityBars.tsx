import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, localFont, priorityColors, PriorityKey } from '../../theme';
import { t, TKey } from '../../i18n';

// Signal bars: 1 bar = Low … 4 bars = Critical
export function PriorityBars({ priority, showLabel = true }: { priority: PriorityKey; showLabel?: boolean }) {
  const p = priorityColors[priority];
  const label = t(`priority.${priority}` as TKey);

  return (
    <View style={styles.row} accessibilityLabel={t('priority.a11y', { label })}>
      <View style={styles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.bar, { height: 3 + i * 3, backgroundColor: i <= p.bars ? p.color : colors.lineStrong }]}
          />
        ))}
      </View>
      {showLabel ? <Text style={[styles.label, { fontFamily: localFont(fonts.medium) }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 15 },
  bar: { width: 3, borderRadius: 1 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
});
