import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import type { TaskDetail } from '../../types/task';
import { colors, radius, space } from '../../theme';

type Props = {
  task: TaskDetail;
  editable: boolean;
  onToggle: (itemId: number) => void;
};

export function ChecklistTab({ task, editable, onToggle }: Props) {
  const done = task.checklist.filter((i) => i.done).length;
  const total = task.checklist.length;

  const lockedReason = task.isNew
    ? 'Accept the task to start ticking items.'
    : task.status === 'pendingReview'
      ? 'Locked while the task is being reviewed.'
      : task.status === 'approved'
        ? 'This task is approved and closed.'
        : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.progressHead}>
        <AppText variant="label">
          {done} of {total} done
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Items marked Required must be done before you submit
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${total ? (done / total) * 100 : 0}%` as const }]} />
      </View>

      {lockedReason ? (
        <View style={styles.locked}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
          <AppText variant="small" color={colors.muted}>
            {lockedReason}
          </AppText>
        </View>
      ) : null}

      <View style={styles.card}>
        {task.checklist.map((item, i) => (
          <Pressable
            key={item.id}
            disabled={!editable}
            onPress={() => onToggle(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done, disabled: !editable }}
            accessibilityLabel={`${item.text}${item.required ? ', required' : ''}`}
            style={({ pressed }) => [styles.row, i < task.checklist.length - 1 ? styles.line : null, pressed ? styles.pressed : null]}
          >
            <View style={[styles.box, item.done ? styles.boxOn : null, !editable && !item.done ? styles.boxLocked : null]}>
              {item.done ? <Ionicons name="checkmark" size={16} color={colors.onDark} /> : null}
            </View>
            <AppText
              variant="body"
              color={item.done ? colors.muted : colors.text}
              style={[styles.itemText, item.done ? styles.struck : null]}
            >
              {item.text}
            </AppText>
            {item.required ? (
              <AppText variant="caption" color={item.done ? colors.muted : colors.warning}>
                Required
              </AppText>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  progressHead: { gap: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.pine600 },
  locked: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  card: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 56, paddingVertical: space.xs },
  line: { borderBottomWidth: 1, borderBottomColor: '#F0EEE7' },
  pressed: { opacity: 0.6 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C9C5B9',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.pine600, borderColor: colors.pine600 },
  boxLocked: { backgroundColor: '#F4F3EE' },
  itemText: { flex: 1 },
  struck: { textDecorationLine: 'line-through' },
});
