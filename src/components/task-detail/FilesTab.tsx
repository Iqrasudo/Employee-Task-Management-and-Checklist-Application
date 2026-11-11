import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { EmptyState } from '../ui/EmptyState';
import type { Attachment, FileKind, TaskDetail } from '../../types/task';
import { colors, radius, space } from '../../theme';
import { formatSize } from '../../utils/files';
import { timeAgo } from '../../utils/time';

const KIND: Record<FileKind, { label: string; fg: string; bg: string }> = {
  image: { label: 'IMG', fg: colors.info, bg: colors.infoBg },
  pdf: { label: 'PDF', fg: colors.danger, bg: colors.dangerBg },
  doc: { label: 'DOC', fg: colors.review, bg: colors.reviewBg },
  sheet: { label: 'XLS', fg: colors.pine600, bg: colors.pine100 },
  other: { label: 'FILE', fg: colors.neutral, bg: colors.neutralBg },
};

type Props = {
  task: TaskDetail;
  editable: boolean;
  busy: boolean;
  onAdd: () => void;
  onRemove: (attachmentId: number) => void;
};

export function FilesTab({ task, editable, busy, onAdd, onRemove }: Props) {
  const [preview, setPreview] = useState<Attachment | null>(null);

  function open(file: Attachment) {
    if (file.kind === 'image' && file.uri) {
      setPreview(file);
    } else {
      // Later: GET /api/attachments/{id} downloads the file after a permission check.
      Alert.alert(file.name, 'This file will open once the app is connected to the server.');
    }
  }

  function confirmRemove(file: Attachment) {
    Alert.alert('Remove file?', `${file.name} will be removed from this task.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemove(file.id) },
    ]);
  }

  return (
    <View style={styles.wrap}>
      {editable ? (
        <AppButton
          title={busy ? 'Uploading…' : 'Add file'}
          variant="secondary"
          loading={busy}
          onPress={onAdd}
          icon={<Ionicons name="attach" size={18} color={colors.pine600} />}
        />
      ) : null}

      {task.attachments.length === 0 ? (
        <EmptyState
          icon="document-attach-outline"
          title="No files yet"
          message={editable ? 'Add photos or documents as proof of your work.' : 'No files were added to this task.'}
        />
      ) : (
        task.attachments.map((file) => {
          const k = KIND[file.kind];
          return (
            <Pressable
              key={file.id}
              onPress={() => open(file)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${file.name}`}
              style={({ pressed }) => [styles.file, pressed ? styles.pressed : null]}
            >
              {file.kind === 'image' && file.uri ? (
                <Image source={{ uri: file.uri }} style={styles.thumb} />
              ) : (
                <View style={[styles.badge, { backgroundColor: k.bg }]}>
                  <AppText variant="caption" color={k.fg}>
                    {k.label}
                  </AppText>
                </View>
              )}
              <View style={styles.info}>
                <AppText variant="label" numberOfLines={1}>
                  {file.name}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {formatSize(file.sizeKb)} · {file.mine ? 'You' : file.uploadedBy} · {timeAgo(file.at)}
                </AppText>
              </View>
              {file.mine && editable ? (
                <Pressable onPress={() => confirmRemove(file)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Remove ${file.name}`}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              )}
            </Pressable>
          );
        })
      )}

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <SafeAreaView style={styles.previewRoot}>
          <View style={styles.previewHead}>
            <AppText variant="label" color={colors.onDark} numberOfLines={1} style={styles.info}>
              {preview?.name}
            </AppText>
            <Pressable onPress={() => setPreview(null)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close preview">
              <Ionicons name="close" size={26} color={colors.onDark} />
            </Pressable>
          </View>
          {preview?.uri ? <Image source={{ uri: preview.uri }} style={styles.previewImage} resizeMode="contain" /> : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  badge: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.line },
  info: { flex: 1, gap: 2 },
  previewRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  previewHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  previewImage: { flex: 1, width: '100%' },
});
