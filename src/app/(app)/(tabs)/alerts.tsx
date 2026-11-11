import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { NotificationRow } from '../../../components/notifications/NotificationRow';
import { useUnreadCount } from '../../../hooks/useUnreadCount';
import { getNotifications, markAllRead, markRead } from '../../../services/notifications';
import type { AppNotification } from '../../../types/notification';
import { colors, radius, space } from '../../../theme';
import { dayDiff } from '../../../utils/date';

type Filter = 'all' | 'unread';

// Splits the list into Today / Yesterday / Earlier.
function groupByDay(items: AppNotification[]) {
  const groups: { title: string; data: AppNotification[] }[] = [
    { title: 'Today', data: [] },
    { title: 'Yesterday', data: [] },
    { title: 'Earlier', data: [] },
  ];
  for (const n of items) {
    const diff = dayDiff(n.at);
    groups[diff === 0 ? 0 : diff === -1 ? 1 : 2].data.push(n);
  }
  return groups.filter((g) => g.data.length > 0);
}

export default function AlertsTab() {
  const unread = useUnreadCount();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else if (mode === 'initial') setLoading(true);
    setError(null);
    try {
      setItems(await getNotifications());
    } catch {
      setError('Could not load notifications. Check your internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load the first time; quietly refresh every time the tab is opened again.
  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      load(loadedOnce.current ? 'silent' : 'initial');
      loadedOnce.current = true;
    }, [load]),
  );

  const sections = useMemo(
    () => groupByDay(filter === 'unread' ? items.filter((n) => !n.read) : items),
    [items, filter],
  );

  function open(item: AppNotification) {
    if (!item.read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      markRead(item.id);
    }
    if (item.taskId) router.push({ pathname: '/task/[id]', params: { id: String(item.taskId) } });
  }

  async function readAll() {
    setMarkingAll(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllRead();
    setMarkingAll(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.top}>
        <ScreenHeader
          title="Alerts"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
          right={
            unread > 0 ? (
              <Pressable onPress={readAll} disabled={markingAll} hitSlop={8} accessibilityRole="button" style={styles.readAll}>
                <AppText variant="label" color={colors.pine600}>
                  Mark all as read
                </AppText>
              </Pressable>
            ) : null
          }
        />

        <View style={styles.chips} accessibilityRole="tablist">
          {(['all', 'unread'] as Filter[]).map((f) => {
            const selected = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                style={[styles.chip, selected ? styles.chipOn : null]}
              >
                <AppText variant="label" color={selected ? colors.onDark : colors.text} style={styles.chipText}>
                  {f === 'all' ? `All · ${items.length}` : `Unread · ${unread}`}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={44} height={44} rounded={22} />
              <View style={styles.flex}>
                <Skeleton width="75%" />
                <Skeleton width="95%" height={12} style={styles.gapTop} />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={styles.list}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Something went wrong"
            message={error}
            action={<AppButton title="Try again" onPress={() => load()} style={styles.fullWidth} />}
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <AppText variant="overline" color={colors.muted} style={styles.sectionHead}>
              {section.title}
            </AppText>
          )}
          renderItem={({ item, index }) => <NotificationRow item={item} index={index} onPress={() => open(item)} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} colors={[colors.pine600]} tintColor={colors.pine600} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              message={filter === 'unread' ? 'You have read everything.' : 'New tasks, approvals and reminders will show up here.'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  top: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md },
  readAll: { paddingVertical: space.xs },
  chips: { flexDirection: 'row', gap: space.xs },
  chip: {
    height: 38,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.pine900, borderColor: colors.pine900 },
  chipText: { fontSize: 13 },
  list: { padding: space.md, paddingBottom: space.xxl },
  sectionHead: { marginTop: space.sm, marginBottom: space.xs },
  sep: { height: space.xs },
  skeletonRow: {
    flexDirection: 'row',
    gap: space.sm,
    padding: space.md,
    marginBottom: space.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  gapTop: { marginTop: space.xs },
  fullWidth: { alignSelf: 'stretch', marginTop: space.sm },
});
