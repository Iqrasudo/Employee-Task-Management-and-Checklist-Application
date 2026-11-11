import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import type { TaskDetail } from '../../types/task';
import { colors, radius, space } from '../../theme';
import { formatDate, formatTime } from '../../utils/date';

export function DetailsTab({ task }: { task: TaskDetail }) {
  const start = new Date(task.startDate);
  const deadline = new Date(task.deadline);

  const rows: [string, string][] = [
    ['Assigned by', task.createdBy],
    ['Task type', task.taskType],
    ['Department', task.department],
    ['Start', `${formatDate(start)}, ${formatTime(start)}`],
    ['Deadline', `${formatDate(deadline)}, ${formatTime(deadline)}`],
    ['Approval levels', String(task.approvalLevels)],
    ['Task number', task.number],
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <AppText variant="overline" color={colors.muted}>
          Description
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
