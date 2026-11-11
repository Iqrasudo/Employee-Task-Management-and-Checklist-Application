import React, { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton, TaskCardSkeleton } from '../../../components/ui/Skeleton';
import { TaskCard } from '../../../components/tasks/TaskCard';
import { useAuth } from '../../../context/AuthContext';
import { useUnreadCount } from '../../../hooks/useUnreadCount';
import { getDashboard } from '../../../services/tasks';
import type { Dashboard, Task } from '../../../types/task';
import { colors, radius, space } from '../../../theme';
import { friendlyToday } from '../../../utils/date';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function openTask(task: Task) {
  router.push({ pathname: '/task/[id]', params: { id: String(task.id) } });
}

export default function HomeTab() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 'initial' shows skeletons, 'refresh' shows the pull spinner, 'silent' updates quietly.
  const load = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else if (mode === 'initial') setLoading(true);
    setError(null);
    try {
      setData(await getDashboard());
    } catch {
      setError('Could not load your tasks. Check your internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Every time this tab is opened: load (first time) or quietly refresh (after visiting a task).
  // Also: light status bar icons on the dark header, dark icons again when leaving.
  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      load(loadedOnce.current ? 'silent' : 'initial');
      loadedOnce.current = true;
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [load]),
  );

  const firstName = user?.name.split(' ')[0] ?? '';
  const initials = (user?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  const summary = data
    ? `You have ${data.dueToday} ${data.dueToday === 1 ? 'task' : 'tasks'} due today${
        data.toFix ? ` and ${data.toFix} waiting for your fix` : ''
      }.`
    : ' ';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load('refresh')}
            tintColor={colors.onDark}
            colors={[colors.pine600]}
          />
        }
      >
        {/* Dark header */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <AppText variant="label" color={colors.pine900}>
                {initials}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="caption" color={colors.onDarkMuted}>
                {friendlyToday()}
              </AppText>
              <AppText variant="h2" color={colors.onDark}>
                {greeting()}, {firstName}
              </AppText>
            </View>
            <Pressable
              onPress={() => router.push('/alerts')}
              style={styles.bell}
              accessibilityRole="button"
              accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.onDark} />
              {unread > 0 ? <View style={styles.bellDot} /> : null}
            </Pressable>
          </View>
          <AppText variant="small" color={colors.onDarkMuted}>
            {summary}
          </AppText>
        </SafeAreaView>

        {/* Summary tiles, overlapping the header */}
        <View style={styles.stats}>
          {loading || !data ? (
            [0, 1, 2].map((i) => (
              <View key={i} style={styles.stat}>
                <Skeleton width={36} height={26} />
                <Skeleton width="70%" height={12} />
              </View>
            ))
          ) : (
            <>
              <View style={styles.stat}>
                <AppText variant="h1">{data.dueToday}</AppText>
                <AppText variant="caption" color={colors.muted}>
                  Due today
                </AppText>
              </View>
              <View style={styles.stat}>
                <AppText variant="h1">{data.inProgress}</AppText>
                <AppText variant="caption" color={colors.muted}>
                  In progress
                </AppText>
              </View>
              <View style={[styles.stat, styles.statWarn]}>
                <AppText variant="h1" color={colors.warning}>
                  {data.toFix}
                </AppText>
                <AppText variant="caption" color={colors.warning}>
                  To fix
                </AppText>
              </View>
            </>
          )}
        </View>

        <View style={styles.content}>
          {error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <AppText variant="small" color={colors.danger}>
                {error}
              </AppText>
              <AppButton title="Try again" variant="secondary" onPress={() => load()} />
            </View>
          ) : null}

          {loading ? (
            <View style={styles.section}>
              <Skeleton width={140} height={12} />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </View>
          ) : data ? (
            <>
              {data.attention.length > 0 ? (
                <View style={styles.section}>
                  <AppText variant="overline" color={colors.muted}>
                    Needs your attention
                  </AppText>
                  {data.attention.map((t, i) => (
                    <TaskCard key={t.id} task={t} index={i} variant="attention" onPress={() => openTask(t)} />
                  ))}
                </View>
              ) : null}

              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <AppText variant="overline" color={colors.muted}>
                    Due today
                  </AppText>
                  <Pressable onPress={() => router.push('/my-tasks')} hitSlop={8} accessibilityRole="link">
                    <AppText variant="label" color={colors.pine600}>
                      See all
                    </AppText>
                  </Pressable>
                </View>
                {data.today.length > 0 ? (
                  data.today.map((t, i) => (
                    <TaskCard key={t.id} task={t} index={i + data.attention.length} onPress={() => openTask(t)} />
                  ))
                ) : (
                  <EmptyState
                    icon="sunny-outline"
                    title="Nothing else due today"
                    message="Check My Tasks for what's coming next."
                  />
                )}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scroll: { paddingBottom: space.xl },
  header: {
    backgroundColor: colors.pine900,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl + space.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: space.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingTop: space.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.pine700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.saffron,
  },
  stats: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: -(space.xl + space.xs),
    paddingHorizontal: space.md,
  },
  stat: {
    flex: 1,
    gap: 2,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  statWarn: { backgroundColor: colors.warningBg, borderColor: '#F3D9A8' },
  content: { paddingHorizontal: space.md, paddingTop: space.lg, gap: space.lg },
  section: { gap: space.sm },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorBox: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.dangerBg },
});
