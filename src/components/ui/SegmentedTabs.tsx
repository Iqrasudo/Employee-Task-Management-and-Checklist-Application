import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../../theme';

type Tab<K extends string> = { key: K; label: string };

type Props<K extends string> = {
  tabs: Tab<K>[];
  value: K;
  onChange: (key: K) => void;
};

export function SegmentedTabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {tabs.map((t) => {
        const selected = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected ? styles.tabOn : null]}
          >
            <AppText variant={selected ? 'label' : 'small'} color={selected ? colors.text : colors.muted} numberOfLines={1} style={styles.text}>
              {t.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: radius.md, backgroundColor: '#ECEAE3' },
  tab: { flex: 1, minHeight: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabOn: {
    backgroundColor: colors.surface,
    shadowColor: '#0E2A23',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  text: { fontSize: 13 },
});
