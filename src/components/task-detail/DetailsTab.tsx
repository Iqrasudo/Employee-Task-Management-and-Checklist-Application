import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import type { TaskDetail } from '../../types/task';
import { colors, radius, space } from '../../theme';
import { formatDate, formatTime } from '../../utils/date';
import { t } from '../../i18n';

export function DetailsTab({ task }: { task: TaskDetail }) {
  const start = new Date(task.startDate);
  const deadline = new Date(task.deadline);

  const rows: [string, string][] = [
    [t('detail.assignedBy'), task.createdBy],
    [t('detail.taskType'), task.taskType],
    [t('common.department'), task.department],
    [t('detail.start'), `${formatDate(start)}, ${formatTime(start)}`],
    [t('detail.deadline'), `${formatDate(deadline)}, ${formatTime(deadline)}`],
    [t('detail.levels'), String(task.approvalLevels)],
    [t('detail.number'), task.number],
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <AppText variant="overline" color={colors.muted}>
          {t('detail.description')}
        </AppText>
        <AppText variant="body">{task.description}</AppText>
      </View>

      <View style={styles.card}>
        {rows.map(([label, value], i) => (
          <View key={label} style={[styles.row, i < rows.length - 1 ? styles.line : null]}>
            <AppText variant="small" color={colors.muted}>
              {label}
            </AppText>
            <AppText variant="label" style={styles.value}>
              {value}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  card: {
    padding: space.md,
    gap: space.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, paddingVertical: space.xs },
  line: { borderBottomWidth: 1, borderBottomColor: '#F0EEE7' },
  value: { flexShrink: 1, textAlign: 'right' },
});
