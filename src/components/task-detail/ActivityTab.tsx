import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import type { TaskDetail } from '../../types/task';
import { colors, fonts, radius, space } from '../../theme';
import { timeAgo } from '../../utils/time';

type Props = {
  task: TaskDetail;
  sending: boolean;
  onSend: (body: string) => Promise<boolean>; // true when sent
};

type Entry =
  | { type: 'comment'; at: string; key: string; author: string; role: string; body: string; mine: boolean }
  | { type: 'event'; at: string; key: string; text: string };

// Comments and history in one timeline, newest first.
export function ActivityTab({ task, sending, onSend }: Props) {
  const [draft, setDraft] = useState('');

  const entries: Entry[] = [
    ...task.comments.map((c) => ({ type: 'comment' as const, at: c.at, key: `c${c.id}`, author: c.author, role: c.role, body: c.body, mine: c.mine })),
    ...task.activity.map((a) => ({ type: 'event' as const, at: a.at, key: `a${a.id}`, text: a.text })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  async function send() {
    if (!draft.trim() || sending) return;
    const ok = await onSend(draft);
    if (ok) setDraft('');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a comment…"
          placeholderTextColor={colors.muted}
          multiline
          style={styles.input}
          accessibilityLabel="Write a comment"
          editable={!sending}
        />
        <Pressable
          onPress={send}
          disabled={!draft.trim() || sending}
          style={[styles.send, !draft.trim() ? styles.sendOff : null]}
          accessibilityRole="button"
          accessibilityLabel="Send comment"
        >
          {sending ? <ActivityIndicator color={colors.onDark} /> : <Ionicons name="send" size={18} color={colors.onDark} />}
        </Pressable>
      </View>

      {entries.map((e) =>
        e.type === 'comment' ? (
          <View key={e.key} style={[styles.bubble, e.mine ? styles.mine : null]}>
            <View style={styles.bubbleHead}>
              <AppText variant="label">{e.mine ? 'You' : e.author}</AppText>
              <AppText variant="caption" color={colors.muted}>
                {e.mine ? '' : `${e.role} · `}
                {timeAgo(e.at)}
              </AppText>
            </View>
            <AppText variant="small">{e.body}</AppText>
          </View>
        ) : (
          <View key={e.key} style={styles.event}>
            <View style={styles.dot} />
            <AppText variant="small" color={colors.muted} style={styles.flex}>
              {e.text}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {timeAgo(e.at)}
            </AppText>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  flex: { flex: 1 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: space.xs, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  send: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.pine600, alignItems: 'center', justifyContent: 'center' },
  sendOff: { backgroundColor: colors.lineStrong },
  bubble: { gap: 4, padding: space.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginRight: space.xl },
  mine: { backgroundColor: colors.pine100, borderColor: colors.pine100, marginRight: 0, marginLeft: space.xl },
  bubbleHead: { flexDirection: 'row', justifyContent: 'space-between', gap: space.xs },
  event: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lineStrong },
});
