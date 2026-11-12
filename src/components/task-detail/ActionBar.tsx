import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import type { TaskDetail } from '../../types/task';
import { colors, radius, space } from '../../theme';
import { canEdit, canWithdraw } from '../../services/tasks';
import { t, tn } from '../../i18n';

type Props = {
  task: TaskDetail;
  busy: string | null; // which action is running
  onAccept: () => void;
  onDecline: () => void;
  onSubmit: () => void;
  onWithdraw: () => void;
  onAttach: () => void;
};

// The buttons at the bottom change with the task's state.
export function ActionBar({ task, busy, onAccept, onDecline, onSubmit, onWithdraw, onAttach }: Props) {
  const insets = useSafeAreaInsets();
  const requiredLeft = task.checklist.filter((i) => i.required && !i.done).length;
  const current = task.approvals.find((a) => a.decision === 'current');

  let content: React.ReactNode = null;

  if (task.isNew) {
    content = (
      <View style={styles.row}>
        <AppButton title={t('action.decline')} variant="secondary" onPress={onDecline} disabled={!!busy} style={styles.flex} />
        <AppButton title={t('action.accept')} onPress={onAccept} loading={busy === 'accept'} disabled={!!busy} style={styles.flex} />
      </View>
    );
  } else if (canEdit(task)) {
    const label =
      requiredLeft > 0
        ? t('action.finish', { items: tn('count.required', requiredLeft) })
        : task.status === 'corrections'
          ? t('action.resubmit')
          : t('action.submit');
    content = (
      <View style={styles.row}>
        <Pressable
          onPress={onAttach}
          disabled={!!busy}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={t('files.add')}
        >
          <Ionicons name="attach" size={22} color={colors.text} />
        </Pressable>
        <AppButton title={label} onPress={onSubmit} disabled={requiredLeft > 0 || !!busy} loading={busy === 'submit'} style={styles.flex} />
      </View>
    );
  } else if (task.status === 'pendingReview') {
    content = (
      <View style={styles.stack}>
        <View style={styles.info}>
          <Ionicons name="time-outline" size={18} color={colors.review} />
          <AppText variant="small" color={colors.review} style={styles.flex}>
            {current
              ? t('action.waitingFor', { name: current.name, role: current.role, level: current.level })
              : t('action.waitingReview')}
          </AppText>
        </View>
        {canWithdraw(task) ? (
          <AppButton title={t('action.withdraw')} variant="secondary" onPress={onWithdraw} loading={busy === 'withdraw'} disabled={!!busy} />
        ) : null}
      </View>
    );
  } else if (task.status === 'approved') {
    content = (
      <View style={styles.info}>
        <Ionicons name="checkmark-circle" size={18} color={colors.pine600} />
        <AppText variant="small" color={colors.pine600}>
          {t('action.allApproved')}
        </AppText>
      </View>
    );
  }

  if (!content) return null;
  return <View style={[styles.bar, { paddingBottom: space.sm + insets.bottom }]}>{content}</View>;
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', gap: space.xs },
  stack: { gap: space.xs },
  flex: { flex: 1 },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingVertical: space.xs },
});
