import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../../components/ui/AppText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Toast } from '../../../components/ui/Toast';
import { ApprovalLadder } from '../../../components/tasks/ApprovalLadder';
import { PriorityBars } from '../../../components/tasks/PriorityBars';
import { ProgressRing } from '../../../components/tasks/ProgressRing';
import { StatusBadge } from '../../../components/tasks/StatusBadge';
import { ActionBar } from '../../../components/task-detail/ActionBar';
import { ActivityTab } from '../../../components/task-detail/ActivityTab';
import { ChecklistTab } from '../../../components/task-detail/ChecklistTab';
import { DetailsTab } from '../../../components/task-detail/DetailsTab';
import { FilesTab } from '../../../components/task-detail/FilesTab';
import { AttachSheet, DeclineSheet, SubmitSheet, WithdrawSheet } from '../../../components/task-detail/TaskSheets';
import {
  acceptTask,
  addAttachment,
  addComment,
  canEdit,
  declineTask,
  getTaskDetail,
  removeAttachment,
  submitTask,
  toggleChecklistItem,
  withdrawTask,
} from '../../../services/tasks';
import type { TaskDetail } from '../../../types/task';
import { colors, radius, space } from '../../../theme';
import { dueLabel, isOverdue } from '../../../utils/date';
import { FilePickError, pickDocument, pickFromGallery, PickedFile, takePhoto } from '../../../utils/files';

type TabKey = 'details' | 'checklist' | 'files' | 'activity';
type SheetKey = 'decline' | 'submit' | 'withdraw' | 'attach' | null;

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Number(id);

  const [task, setTask] = useState<TaskDetail | null | undefined>(undefined); // undefined = loading
  const [tab, setTab] = useState<TabKey>('checklist');
  const [busy, setBusy] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [toast, setToast] = useState<string | null>(null);
  const hideToast = useCallback(() => setToast(null), []);

  const reload = useCallback(async () => {
    setTask(await getTaskDetail(taskId));
  }, [taskId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Runs an action, refreshes the task and shows a short message.
  async function run(key: string, action: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await action();
      setSheet(null);
      await reload();
      setToast(success);
    } catch (e) {
      Alert.alert('Could not do that', errorText(e));
    } finally {
      setBusy(null);
    }
  }

  // Tick or untick straight away, then save. If saving fails, undo the tick.
  async function toggleItem(itemId: number) {
    if (!task) return;
    const before = task;
    const checklist = task.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i));
    setTask({
      ...task,
      checklist,
      checklistDone: checklist.filter((i) => i.done).length,
      status: task.status === 'assigned' ? 'inProgress' : task.status,
    });
    try {
      await toggleChecklistItem(taskId, itemId);
    } catch (e) {
      setTask(before);
      Alert.alert('Could not update the checklist', errorText(e));
    }
  }

  async function decline(reason: string) {
    setBusy('decline');
    try {
      const assignedBy = await declineTask(taskId, reason);
      setSheet(null);
      router.back();
      Alert.alert('Task declined', `${assignedBy} has been told and can give it to someone else.`);
    } catch (e) {
      Alert.alert('Could not decline', errorText(e));
    } finally {
      setBusy(null);
    }
  }

  async function sendComment(body: string): Promise<boolean> {
    setBusy('comment');
    try {
      await addComment(taskId, body);
      await reload();
      return true;
    } catch (e) {
      Alert.alert('Comment not sent', errorText(e));
      return false;
    } finally {
      setBusy(null);
    }
  }

  function pick(source: 'camera' | 'gallery' | 'document') {
    setSheet(null);
    // Wait for the sheet to close before opening the phone's camera or file picker.
    setTimeout(async () => {
      try {
        const picker = source === 'camera' ? takePhoto : source === 'gallery' ? pickFromGallery : pickDocument;
        const file: PickedFile | null = await picker();
        if (!file) return; // user cancelled
        setTab('files');
        await run('attach', () => addAttachment(taskId, file), 'File added');
      } catch (e) {
        Alert.alert(e instanceof FilePickError ? 'File not added' : 'Could not open', errorText(e));
      }
    }, 350);
  }

  // ---------- Loading / not found ----------
  if (task === undefined) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Skeleton width={44} height={44} rounded={12} />
          <Skeleton width="40%" height={14} />
          <Skeleton width="85%" height={28} />
          <Skeleton height={110} rounded={16} />
          <Skeleton height={44} rounded={12} />
          <Skeleton height={220} rounded={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (task === null) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <BackButton />
          <EmptyState icon="alert-circle-outline" title="This task is not available" message="It may have been reassigned or removed." />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Task ----------
  const editable = canEdit(task);
  const overdue = isOverdue(task);
  const due = dueLabel(task);
  const progress = task.checklist.length ? task.checklistDone / task.checklist.length : 0;
  const reviewer = task.approvals.find((a) => a.decision === 'corrections');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'checklist', label: `Checklist ${task.checklistDone}/${task.checklist.length}` },
    { key: 'files', label: `Files ${task.attachments.length}` },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <Toast message={toast} onHide={hideToast} />

      <View style={styles.topBar}>
        <BackButton />
        <AppText variant="caption" color={colors.muted}>
          {task.number} · {task.department}
        </AppText>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.badges}>
          <StatusBadge status={task.isNew ? 'new' : overdue ? 'overdue' : task.status} />
          <PriorityBars priority={task.priority} />
          <AppText variant="caption" color={due.tone === 'danger' ? colors.danger : due.tone === 'warning' ? colors.warning : colors.muted}>
            {due.text}
          </AppText>
        </View>

        <AppText variant="h1">{task.title}</AppText>

        <View style={styles.hero}>
          <ProgressRing progress={progress} size={60} stroke={5} color={colors.saffron} track={colors.pine700} labelColor={colors.onDark} />
          <View style={styles.heroBody}>
            <AppText variant="caption" color={colors.onDarkMuted}>
              Approval ladder
            </AppText>
            <ApprovalLadder steps={task.approvals} />
          </View>
        </View>

        {task.isNew ? (
          <View style={[styles.banner, styles.bannerInfo]}>
            <Ionicons name="hand-left-outline" size={20} color={colors.info} />
            <AppText variant="small" color={colors.info} style={styles.flex}>
              {task.createdBy} gave you this task. Accept it to start, or decline with a reason.
            </AppText>
          </View>
        ) : null}

        {task.status === 'corrections' && task.reviewerNote ? (
          <View style={[styles.banner, styles.bannerWarn]}>
            <View style={styles.avatar}>
              <AppText variant="caption" color={colors.warning}>
                {(reviewer?.name ?? task.reviewerName ?? '?')
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="label" color="#5A3600">
                {reviewer?.name ?? task.reviewerName} · {reviewer?.role ?? 'Reviewer'}
              </AppText>
              <AppText variant="small" color="#5A3600">
                {task.reviewerNote}
              </AppText>
            </View>
          </View>
        ) : null}

        <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />

        {tab === 'details' ? <DetailsTab task={task} /> : null}
        {tab === 'checklist' ? <ChecklistTab task={task} editable={editable} onToggle={toggleItem} /> : null}
        {tab === 'files' ? (
          <FilesTab
            task={task}
            editable={editable}
            busy={busy === 'attach'}
            onAdd={() => setSheet('attach')}
            onRemove={(fileId) => run('remove', () => removeAttachment(taskId, fileId), 'File removed')}
          />
        ) : null}
        {tab === 'activity' ? <ActivityTab task={task} sending={busy === 'comment'} onSend={sendComment} /> : null}
      </ScrollView>

      <ActionBar
        task={task}
        busy={busy}
        onAccept={() => run('accept', () => acceptTask(taskId), 'Task accepted. You can start now.')}
        onDecline={() => setSheet('decline')}
        onSubmit={() => setSheet('submit')}
        onWithdraw={() => setSheet('withdraw')}
        onAttach={() => setSheet('attach')}
      />

      <DeclineSheet
        visible={sheet === 'decline'}
        onClose={() => setSheet(null)}
        onConfirm={decline}
        loading={busy === 'decline'}
        assignedBy={task.createdBy}
      />
      <SubmitSheet
        visible={sheet === 'submit'}
        onClose={() => setSheet(null)}
        loading={busy === 'submit'}
        task={task}
        onConfirm={(note) =>
          run('submit', () => submitTask(taskId, note), task.status === 'corrections' ? 'Resubmitted for review' : 'Submitted for review')
        }
      />
      <WithdrawSheet
        visible={sheet === 'withdraw'}
        onClose={() => setSheet(null)}
        loading={busy === 'withdraw'}
        onConfirm={() => run('withdraw', () => withdrawTask(taskId), 'Submission withdrawn')}
      />
      <AttachSheet visible={sheet === 'attach'} onClose={() => setSheet(null)} onPick={pick} />
    </SafeAreaView>
  );
}

function BackButton() {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      style={styles.back}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
    >
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  loading: { padding: space.lg, gap: space.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.xs },
  topSpacer: { width: 44 },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: space.md, paddingBottom: space.xxl, gap: space.md },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.pine900,
  },
  heroBody: { flex: 1, gap: space.xs },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.sm, borderRadius: radius.md },
  bannerInfo: { backgroundColor: colors.infoBg },
  bannerWarn: { backgroundColor: colors.warningBg },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
