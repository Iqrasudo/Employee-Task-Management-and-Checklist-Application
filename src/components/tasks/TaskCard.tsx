import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import { PriorityBars } from './PriorityBars';
import { ProgressRing } from './ProgressRing';
import { StatusBadge } from './StatusBadge';
import type { Task } from '../../types/task';
import { colors, motion, radius, space } from '../../theme';
import { dueLabel, isOverdue } from '../../utils/date';
import { t } from '../../i18n';

type Props = {
  task: Task;
  index?: number; // used to make cards appear one after another
  onPress?: () => void;
  variant?: 'default' | 'attention';
};

function Dot() {
  return <View style={styles.dot} />;
}

export function TaskCard({ task, index = 0, onPress, variant = 'default' }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: motion.slow,
      delay: Math.min(index, 8) * 60,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const progress = task.checklistTotal ? task.checklistDone / task.checklistTotal : 0;
  const due = dueLabel(task);
  const overdue = isOverdue(task);
  const dueColor = due.tone === 'danger' ? colors.danger : due.tone === 'warning' ? colors.warning : colors.muted;

  const badge = task.isNew ? 'new' : overdue ? 'overdue' : task.status;
  const badgeLabel =
    task.status === 'pendingReview' && !task.isNew ? t('task.levelOf', { level: task.currentLevel, total: task.approvalLevels }) : undefined;

  const isFixCard = variant === 'attention' && task.status === 'corrections';

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${task.title}. ${due.text}`}
        style={({ pressed }) => [styles.card, isFixCard ? styles.fixCard : null, pressed ? styles.pressed : null]}
      >
        {isFixCard ? (
          <View style={styles.fixBody}>
            <View style={styles.fixHeader}>
              <StatusBadge status="corrections" />
              {task.reviewerName ? (
                <AppText variant="caption" color={colors.muted}>
                  {t('task.fromReviewer', { name: task.reviewerName })}
                </AppText>
              ) : null}
            </View>
            <AppText variant="h3">{task.title}</AppText>
            {task.reviewerNote ? (
              <AppText variant="small" color={colors.muted}>
                “{task.reviewerNote}”
              </AppText>
            ) : null}
            <View style={styles.meta}>
              <PriorityBars priority={task.priority} />
              <Dot />
              <AppText variant="caption" color={dueColor}>
                {due.text}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <ProgressRing progress={progress} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <AppText variant="label" style={styles.title} numberOfLines={2}>
                  {task.title}
                </AppText>
                <StatusBadge status={badge} label={badgeLabel} />
              </View>
              <View style={styles.meta}>
                <PriorityBars priority={task.priority} />
                <Dot />
                <AppText variant="caption" color={dueColor}>
                  {due.text}
                </AppText>
                <Dot />
                <AppText variant="caption" color={colors.muted}>
                  {t('task.itemsCount', { done: task.checklistDone, total: task.checklistTotal })}
                </AppText>
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  fixCard: { borderColor: '#F3D9A8', borderTopWidth: 4, borderTopColor: colors.saffron },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  body: { flex: 1, gap: space.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs },
  title: { flex: 1, fontSize: 15 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.lineStrong },
  fixBody: { gap: space.xs },
  fixHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs },
});
