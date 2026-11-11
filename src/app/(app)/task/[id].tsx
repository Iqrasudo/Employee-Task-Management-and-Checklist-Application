import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { PriorityBars } from '../../../components/tasks/PriorityBars';
import { StatusBadge } from '../../../components/tasks/StatusBadge';
import { getTask } from '../../../services/tasks';
import type { Task } from '../../../types/task';
import { colors, radius, space } from '../../../theme';
import { dueLabel } from '../../../utils/date';

// TEMPORARY: the full Task detail (checklist, files, comments, submit) is step 7.
export default function TaskDetailPlaceholder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null | undefined>(undefined);

  useEffect(() => {
    getTask(Number(id)).then((t) => setTask(t ?? null));
  }, [id]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {task === undefined ? (
          <>
            <Skeleton width={44} height={44} />
            <Skeleton width="70%" height={24} />
            <Skeleton width="40%" />
          </>
        ) : task === null ? (
          <>
            <ScreenHeader title="Task not found" showBack />
            <EmptyState icon="alert-circle-outline" title="This task is not available" message="It may have been reassigned or removed." />
          </>
        ) : (
          <>
            <ScreenHeader title={task.title} subtitle={`${task.number} · ${task.department}`} showBack />
            <View style={styles.row}>
              <StatusBadge status={task.isNew ? 'new' : task.status} />
              <PriorityBars priority={task.priority} />
              <AppText variant="caption" color={colors.muted}>
                {dueLabel(task).text}
              </AppText>
            </View>
            <View style={styles.card}>
              <AppText variant="small">{task.description}</AppText>
            </View>
            <EmptyState
              icon="construct-outline"
              title="Full task screen comes in step 7"
              message="Checklist, files, comments, approval ladder, and Accept / Decline / Submit buttons."
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: space.lg, gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
  card: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
});
