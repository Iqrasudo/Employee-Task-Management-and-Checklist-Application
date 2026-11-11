import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { useAuth } from '../../../context/AuthContext';
import { colors, radius, space } from '../../../theme';

// Step 10 adds language, notification settings and change password.
export default function ProfileTab() {
  const { user, signOut } = useAuth();

  const rows: [string, string][] = [
    ['Name', user?.name ?? ''],
    ['Email', user?.email ?? ''],
    ['Role', user?.role ?? ''],
    ['Department', user?.department ?? ''],
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScreenHeader title="Profile" subtitle="Account" />

      <View style={styles.card}>
        {rows.map(([label, value], i) => (
          <View key={label} style={[styles.row, i < rows.length - 1 ? styles.rowLine : null]}>
            <AppText variant="small" color={colors.muted}>
              {label}
            </AppText>
            <AppText variant="label">{value}</AppText>
          </View>
        ))}
      </View>

      <AppButton
        title="Log out"
        variant="secondary"
        onPress={() => {
          signOut();
          router.replace('/login');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper, padding: space.lg, gap: space.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm, gap: space.sm },
  rowLine: { borderBottomWidth: 1, borderBottomColor: '#F0EEE7' },
});
