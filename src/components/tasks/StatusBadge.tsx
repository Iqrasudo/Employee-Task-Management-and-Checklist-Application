import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, localFont, statusColors, StatusKey } from '../../theme';
import { t, TKey } from '../../i18n';

type Props = { status: StatusKey | 'new'; label?: string };

// Every badge has a small shape + text, so it never relies on colour alone.
export function StatusBadge({ status, label }: Props) {
  const look = status === 'new' ? { fg: colors.pine900, bg: colors.saffron } : statusColors[status];
  const shown = label ?? t(`status.${status}` as TKey);
  const outline = status === 'overdue';

  return (
    <View
      style={[styles.pill, { backgroundColor: look.bg }, outline ? { borderWidth: 1.5, borderColor: look.fg } : null]}
      accessibilityLabel={`${t('common.status')}: ${shown}`}
    >
      <View style={[styles.dot, { backgroundColor: look.fg }, status === 'corrections' ? styles.diamond : null]} />
      <Text style={[styles.text, { color: look.fg, fontFamily: localFont(fonts.semibold) }]}>{shown}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  diamond: { borderRadius: 1, transform: [{ rotate: '45deg' }] },
  text: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});
