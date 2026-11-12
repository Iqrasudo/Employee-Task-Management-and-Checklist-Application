import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton, TaskCardSkeleton } from '../../../components/ui/Skeleton';
import { MonthGrid } from '../../../components/calendar/MonthGrid';
import { TaskCard } from '../../../components/tasks/TaskCard';
import { getMyTasks } from '../../../services/tasks';
import type { Task } from '../../../types/task';
import { colors, radius, space } from '../../../theme';
import { dateKey, longDate, monthTitle } from '../../../utils/calendar';
import { chevron, t, TKey, tn } from '../../../i18n';

const LEGEND = [
  { label: 'status.new' as TKey, color: colors.saffron },
  { label: 'status.inProgress' as TKey, color: colors.info },
  { label: 'home.toFix' as TKey, color: colors.warning },
  { label: 'cal.inReview' as TKey, color: colors.review },
  { label: 'status.approved' as TKey, color: colors.pine600 },
  { label: 'status.overdue' as TKey, color: colors.danger },
];

export default function CalendarTab() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date>(today);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else if (mode === 'initial') setLoading(true);
    setError(null);
    try {
      setTasks(await getMyTasks()); // later: GET /api/me/tasks/calendar?from=&to=
    } catch {
      setError(t('common.loadTasksError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      load(loadedOnce.current ? 'silent' : 'initial');
      loadedOnce.current = true;
    }, [load]),
  );

  // Tasks grouped by their deadline day: { "2026-11-12": [task, task] }
  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      const key = dateKey(new Date(t.deadline));
      (map[key] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const selectedKey = dateKey(selected);
  const dayTasks = tasksByDay[selectedKey] ?? [];
  const monthCount = useMemo(
    () => tasks.filter((t) => {
      const d = new Date(t.deadline);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
    [tasks, year, month],
  );

  function changeMonth(step: 1 | -1) {
    const d = new Date(year, month + step, 1);
    setDirection(step);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function goToday() {
    const now = new Date();
    setDirection(now < new Date(year, month, 1) ? -1 : 1);
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelected(now);
  }

  function selectDay(day: Date) {
    setSelected(day);
    // Tapping a grey day from the next/previous month moves to that month.
    if (day.getMonth() !== month) {
      setDirection(day < new Date(year, month, 1) ? -1 : 1);
      setYear(day.getFullYear());
      setMonth(day.getMonth());
    }
  }

  const isTodayShown = year === today.getFullYear() && month === today.getMonth() && selectedKey === dateKey(today);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} colors={[colors.pine600]} tintColor={colors.pine600} />
        }
      >
        <View style={styles.head}>
          <View style={styles.flex}>
            <AppText variant="overline" color={colors.muted}>
              {t('cal.deadlines')}
            </AppText>
            <AppText variant="h1">{monthTitle(year, month)}</AppText>
            <AppText variant="caption" color={colors.muted}>
              {loading ? ' ' : t('cal.monthCount', { tasks: tn('count.tasks', monthCount) })}
            </AppText>
          </View>
          <View style={styles.nav}>
            <Pressable onPress={() => changeMonth(-1)} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('cal.prev')}>
              <Ionicons name={chevron('back')} size={20} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => changeMonth(1)} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('cal.next')}>
              <Ionicons name={chevron('forward')} size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {!isTodayShown ? (
          <Pressable onPress={goToday} style={styles.todayBtn} accessibilityRole="button">
            <Ionicons name="today-outline" size={16} color={colors.pine600} />
            <AppText variant="label" color={colors.pine600}>
              {t('cal.today')}
            </AppText>
          </Pressable>
        ) : null}

        {loading ? (
          <Skeleton height={340} rounded={radius.lg} />
        ) : (
          <MonthGrid
            year={year}
            month={month}
            selectedKey={selectedKey}
            tasksByDay={tasksByDay}
            onSelect={selectDay}
            direction={direction}
          />
        )}

        <View style={styles.legend} accessibilityLabel={t('cal.legendA11y')}>
          {LEGEND.map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <AppText variant="caption" color={colors.muted}>
                {t(l.label)}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.dayHead}>
          <AppText variant="h3">{longDate(selected)}</AppText>
          <AppText variant="caption" color={colors.muted}>
            {loading ? '' : tn('count.tasks', dayTasks.length)}
          </AppText>
        </View>

        {error ? (
          <EmptyState
            icon="cloud-offline-outline"
            title={t('common.errorTitle')}
            message={error}
            action={<AppButton title={t('common.tryAgain')} onPress={() => load()} style={styles.fullWidth} />}
          />
        ) : loading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : dayTasks.length > 0 ? (
          dayTasks.map((t, i) => (
            <TaskCard
              key={`${selectedKey}-${t.id}`}
              task={t}
              index={i}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: String(t.id) } })}
            />
          ))
        ) : (
          <EmptyState icon="sunny-outline" title={t('cal.emptyTitle')} message={t('cal.emptyMsg')} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { padding: space.md, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingHorizontal: space.xs },
  nav: { flexDirection: 'row', gap: space.xs },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pine100,
    marginLeft: space.xs,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: space.xs, marginTop: space.xs },
  fullWidth: { alignSelf: 'stretch', marginTop: space.sm },
});
