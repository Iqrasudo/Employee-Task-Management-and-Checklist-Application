import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { colors, space } from '../../../theme';

export default function CalendarTab() {
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScreenHeader title="Calendar" subtitle="Deadlines" />
      <EmptyState
        icon="calendar-outline"
        title="Calendar comes in step 9"
        message="Your task deadlines by day, week and month."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper, padding: space.lg, gap: space.lg },
});
