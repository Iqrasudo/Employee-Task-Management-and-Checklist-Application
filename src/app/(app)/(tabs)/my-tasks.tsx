import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { TaskCardSkeleton } from '../../../components/ui/Skeleton';
import { TaskCard } from '../../../components/tasks/TaskCard';
import { getMyTasks } from '../../../services/tasks';
import type { Task } from '../../../types/task';
import { colors, fonts, radius, space } from '../../../theme';
import { isOverdue } from '../../../utils/date';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'progress', label: 'In progress' },
  { key: 'fix', label: 'To fix' },
  { key: 'review', label: 'Submitted' },
  { key: 'done', label: 'Done' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function matchesFilter(task: Task, filter: FilterKey): boolean {
  switch (filter) {
    case 'new':
      return task.isNew;
    case 'progress':
      return task.status === 'inProgress' || (task.status === 'assigned' && !task.isNew);
    case 'fix':
      return task.status === 'corrections' || isOverdue(task);
    case 'review':
      return task.status === 'pendingReview';
    case 'done':
      return task.status === 'approved' || task.status === 'rejected';
    default:
      return true;
  }
}

export default function MyTasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  // 'initial' shows skeletons, 'refresh' shows the pull spinner, 'silent' updates quietly.
  const load = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else if (mode === 'initial') setLoading(true);
    setError(null);
    try {
      setTasks(await getMyTasks());
    } catch {
      setError('Could not load your tasks. Check your internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load the first time; quietly refresh when coming back from a task.
  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      load(loadedOnce.current ? 'silent' : 'initial');
      loadedOnce.current = true;
    }, [load]),
  );

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q) || t.number.toLowerCase().includes(q));
  }, [tasks, query]);

  const visible = useMemo(() => searched.filter((t) => matchesFilter(t, filter)), [searched, filter]);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.top}>
        <ScreenHeader title="My Tasks" subtitle={loading ? 'Loading…' : `${tasks.length} tasks`} />

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or number"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            accessibilityLabel="Search tasks"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsWrap}
        accessibilityRole="tablist"
      >
        {FILTERS.map((f) => {
          const selected = f.key === filter;
          const count = searched.filter((t) => matchesFilter(t, f.key)).length;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.chip, selected ? styles.chipOn : null]}
            >
              <AppText variant="label" color={selected ? colors.onDark : colors.text} style={styles.chipText}>
                {f.label}
                {loading ? '' : ` · ${count}`}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.list}>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
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
        <FlatList
          data={visible}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <TaskCard
              task={item}
              index={index}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: String(item.id) } })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} colors={[colors.pine600]} tintColor={colors.pine600} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={query ? 'search-outline' : 'checkmark-done-outline'}
              title={query ? 'No matching tasks' : 'Nothing here'}
              message={query ? `No task matches “${query}”.` : 'No tasks in this list right now.'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  top: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 48,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: space.xs },
  chipsWrap: { flexGrow: 0, marginTop: space.md },
  chips: { paddingHorizontal: space.lg, gap: space.xs },
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
  list: { padding: space.md, paddingBottom: space.xxl, gap: space.sm },
  fullWidth: { alignSelf: 'stretch', marginTop: space.sm },
});
