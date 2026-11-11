import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { colors, space } from '../../../theme';

export default function AlertsTab() {
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScreenHeader title="Alerts" subtitle="Notifications" />
      <EmptyState
        icon="notifications-outline"
        title="Notifications come in step 8"
        message="New tasks, corrections, approvals and deadline reminders."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper, padding: space.lg, gap: space.lg },
});
