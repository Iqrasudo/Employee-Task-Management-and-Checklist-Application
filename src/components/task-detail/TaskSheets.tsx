import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { BottomSheet } from '../ui/BottomSheet';
import type { TaskDetail } from '../../types/task';
import { colors, fonts, radius, space } from '../../theme';
import { MAX_FILE_MB } from '../../utils/files';

// ---------- Decline ----------
export function DeclineSheet({
  visible,
  onClose,
  onConfirm,
  loading,
  assignedBy,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
  assignedBy: string;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setReason('');
      setError(null);
    }
  }, [visible]);

  function confirm() {
    if (reason.trim().length < 10) return setError('Please write at least 10 characters.');
    onConfirm(reason.trim());
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Decline this task?" subtitle={`${assignedBy} will see your reason and can give it to someone else.`}>
      <View style={styles.field}>
        <AppText variant="label">Reason *</AppText>
        <TextInput
          value={reason}
          onChangeText={(t) => {
            setReason(t);
            if (error) setError(null);
          }}
          placeholder="For example: I am on leave on that day"
          placeholderTextColor={colors.muted}
          multiline
          style={[styles.textArea, error ? styles.textAreaError : null]}
          accessibilityLabel="Reason for declining"
          editable={!loading}
        />
        {error ? (
          <AppText variant="caption" color={colors.danger}>
            {error}
          </AppText>
        ) : null}
      </View>
      <View style={styles.row}>
        <AppButton title="Cancel" variant="secondary" onPress={onClose} disabled={loading} style={styles.flex} />
        <AppButton title="Decline task" variant="danger" onPress={confirm} loading={loading} style={styles.flex} />
      </View>
    </BottomSheet>
  );
}

// ---------- Submit ----------
export function SubmitSheet({
  visible,
  onClose,
  onConfirm,
  loading,
  task,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  loading: boolean;
  task: TaskDetail;
}) {
  const [note, setNote] = useState('');
  useEffect(() => {
    if (visible) setNote('');
  }, [visible]);

  const done = task.checklist.filter((i) => i.done).length;
  const total = task.checklist.length;
  const first = task.approvals[0];
  const resubmit = task.status === 'corrections';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={resubmit ? 'Resubmit for review?' : 'Submit for review?'}
      subtitle={first ? `${first.name} (${first.role}) will review it first.` : undefined}
    >
      <View style={styles.summary}>
        <SummaryRow ok={done === total} text={`Checklist ${done} of ${total} done`} />
        <SummaryRow
          ok={task.attachments.length > 0}
          text={task.attachments.length > 0 ? `${task.attachments.length} file(s) attached` : 'No files attached. Add proof if this task needs it.'}
        />
      </View>
      <View style={styles.field}>
        <AppText variant="label">Note for the reviewer (optional)</AppText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={resubmit ? 'What did you fix?' : 'Anything the reviewer should know'}
          placeholderTextColor={colors.muted}
          multiline
          style={styles.textArea}
          accessibilityLabel="Note for the reviewer"
          editable={!loading}
        />
      </View>
      <View style={styles.row}>
        <AppButton title="Not yet" variant="secondary" onPress={onClose} disabled={loading} style={styles.flex} />
        <AppButton title={resubmit ? 'Resubmit' : 'Submit'} onPress={() => onConfirm(note)} loading={loading} style={styles.flex} />
      </View>
    </BottomSheet>
  );
}

function SummaryRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={20} color={ok ? colors.pine600 : colors.warning} />
      <AppText variant="small" color={ok ? colors.text : colors.warning} style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

// ---------- Withdraw ----------
export function WithdrawSheet({
  visible,
  onClose,
  onConfirm,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Withdraw your submission?"
      subtitle="The task comes back to you so you can change files or the checklist. Your supervisor will be told."
    >
      <View style={styles.row}>
        <AppButton title="Keep it submitted" variant="secondary" onPress={onClose} disabled={loading} style={styles.flex} />
        <AppButton title="Withdraw" variant="accent" onPress={onConfirm} loading={loading} style={styles.flex} />
      </View>
    </BottomSheet>
  );
}

// ---------- Attach ----------
type Source = 'camera' | 'gallery' | 'document';

export function AttachSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (source: Source) => void }) {
  const options: { key: Source; icon: keyof typeof Ionicons.glyphMap; title: string; hint: string }[] = [
    { key: 'camera', icon: 'camera-outline', title: 'Take a photo', hint: 'Use your camera' },
    { key: 'gallery', icon: 'images-outline', title: 'Choose from gallery', hint: 'Photos on your phone' },
    { key: 'document', icon: 'document-outline', title: 'Pick a document', hint: 'PDF, Word or Excel' },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add a file" subtitle={`Up to ${MAX_FILE_MB} MB per file.`}>
      <View style={styles.options}>
        {options.map((o) => (
          <Pressable
            key={o.key}
            onPress={() => onPick(o.key)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={o.icon} size={22} color={colors.pine600} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label">{o.title}</AppText>
              <AppText variant="caption" color={colors.muted}>
                {o.hint}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: space.xs },
  field: { gap: 6 },
  textArea: {
    minHeight: 96,
    maxHeight: 160,
    padding: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  textAreaError: { borderColor: colors.danger, backgroundColor: '#FFFBFA' },
  summary: { gap: space.xs, padding: space.sm, borderRadius: radius.md, backgroundColor: colors.paper },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  options: { gap: space.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  optionPressed: { backgroundColor: colors.paper },
  optionIcon: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.pine100, alignItems: 'center', justifyContent: 'center' },
});
