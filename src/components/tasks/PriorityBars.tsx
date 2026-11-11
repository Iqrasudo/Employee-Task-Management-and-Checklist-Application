import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, priorityColors, PriorityKey } from '../../theme';

// Signal bars: 1 bar = Low … 4 bars = Critical
export function PriorityBars({ priority, showLabel = true }: { priority: PriorityKey; showLabel?: boolean }) {
  const p = priorityColors[priority];

  return (
    <View style={styles.row} accessibilityLabel={`${p.label} priority`}>
      <View style={styles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.bar, { height: 3 + i * 3, backgroundColor: i <= p.bars ? p.color : colors.lineStrong }]}
          />
        ))}
      </View>
      {showLabel ? <Text style={styles.label}>{p.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 15 },
  bar: { width: 3, borderRadius: 1 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
});
