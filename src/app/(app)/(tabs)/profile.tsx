import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { AppText } from '../../../components/ui/AppText';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { SettingGroup, SettingRow } from '../../../components/ui/SettingRow';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Toast } from '../../../components/ui/Toast';
import { useAuth } from '../../../context/AuthContext';
import { getPreferences, getProfile, Language, Preferences, Profile, updatePreferences } from '../../../services/profile';
import { colors, radius, space } from '../../../theme';
import { formatDate } from '../../../utils/date';

const ROLE_LABEL: Record<string, string> = {
  Employee: 'Employee',
  Supervisor: 'Supervisor',
  AssistantManager: 'Assistant Manager',
  Manager: 'Manager',
  HR: 'HR',
  Admin: 'Admin',
};

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    getProfile().then(setProfile);
    getPreferences().then(setPrefs);
  }, []);

  // Change the switch straight away, then save. If saving fails, put it back.
  async function setPref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    if (!prefs) return;
    const before = prefs;
    setPrefs({ ...prefs, [key]: value });
    try {
      await updatePreferences({ [key]: value } as Partial<Preferences>);
      setToast('Saved');
    } catch {
      setPrefs(before);
      Alert.alert('Not saved', 'Check your internet and try again.');
    }
  }

  function chooseLanguage(lang: Language) {
    if (!prefs || lang === prefs.language) return;
    setPref('language', lang);
    if (lang === 'ar') {
      Alert.alert('عربي', 'Your choice is saved. Arabic screens (right-to-left) are added in the translation step, so the app stays in English for now.');
    }
  }

  function confirmLogout() {
    Alert.alert('Log out?', 'You will need your email and password to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          signOut(); // later: POST /api/auth/logout + forget this phone's push token
          router.replace('/login');
        },
      },
    ]);
  }

  const initials = (user?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  const pushOff = prefs ? !prefs.push : false;

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <Toast message={toast} onHide={hideToast} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <AppText variant="h2" color={colors.pine900}>
                {initials}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="h2" color={colors.onDark}>
                {user?.name}
              </AppText>
              <AppText variant="small" color={colors.onDarkMuted}>
                {profile ? profile.position : ' '}
              </AppText>
            </View>
            <View style={styles.roleBadge}>
              <AppText variant="caption" color={colors.pine900}>
                {ROLE_LABEL[user?.role ?? 'Employee']}
              </AppText>
            </View>
          </View>

          {profile ? (
            <View style={styles.facts}>
              <Fact label="Department" value={user?.department ?? ''} />
              <Fact label="Reports to" value={profile.manager} />
              <Fact label="Branch" value={profile.branch} />
              <Fact label="Employee ID" value={profile.employeeCode} />
            </View>
          ) : (
            <View style={styles.facts}>
              <Skeleton height={36} style={styles.darkSkeleton} />
              <Skeleton height={36} style={styles.darkSkeleton} />
            </View>
          )}
        </View>

        {/* Contact */}
        <SettingGroup title="Contact">
          <SettingRow icon="mail-outline" title="Email" subtitle={user?.email} />
          <SettingRow icon="call-outline" title="Phone" subtitle={profile?.phone ?? '…'} />
          <SettingRow
            icon="calendar-outline"
            title="Joined"
            subtitle={profile ? formatDate(new Date(profile.joined)) + ` ${new Date(profile.joined).getFullYear()}` : '…'}
            last
          />
        </SettingGroup>
        <AppText variant="caption" color={colors.muted} style={styles.note}>
          To change these details, contact HR.
        </AppText>

        {/* Language */}
        <SettingGroup title="Language">
          <View style={styles.langRow}>
            {prefs ? (
              <SegmentedTabs<Language>
                tabs={[
                  { key: 'en', label: 'English' },
                  { key: 'ar', label: 'عربي' },
                ]}
                value={prefs.language}
                onChange={chooseLanguage}
              />
            ) : (
              <Skeleton height={44} />
            )}
          </View>
        </SettingGroup>

        {/* Notifications */}
        <SettingGroup title="Notifications">
          <SettingRow
            icon="notifications-outline"
            title="Phone notifications"
            subtitle="New tasks, approvals and reminders on this phone"
            toggle={prefs ? { value: prefs.push, onChange: (v) => setPref('push', v) } : undefined}
          />
          <SettingRow
            icon="mail-unread-outline"
            title="Email me about new tasks"
            toggle={prefs ? { value: prefs.emailNewTask, onChange: (v) => setPref('emailNewTask', v) } : undefined}
          />
          <SettingRow
            icon="create-outline"
            title="Email me when corrections are asked"
            toggle={prefs ? { value: prefs.emailCorrections, onChange: (v) => setPref('emailCorrections', v) } : undefined}
          />
          <SettingRow
            icon="checkmark-done-outline"
            title="Email me when a task is approved"
            toggle={prefs ? { value: prefs.emailApprovals, onChange: (v) => setPref('emailApprovals', v) } : undefined}
          />
          <SettingRow
            icon="alarm-outline"
            title="Email deadline reminders"
            toggle={prefs ? { value: prefs.emailReminders, onChange: (v) => setPref('emailReminders', v) } : undefined}
          />
          <SettingRow
            icon="today-outline"
            title="Daily summary at 9:00 AM"
            subtitle="One email with everything due that day"
            toggle={prefs ? { value: prefs.dailySummary, onChange: (v) => setPref('dailySummary', v) } : undefined}
            last
          />
        </SettingGroup>
        {pushOff ? (
          <AppText variant="caption" color={colors.warning} style={styles.note}>
            Phone notifications are off. You will only see alerts inside the app.
          </AppText>
        ) : null}

        {/* Account */}
        <SettingGroup title="Account">
          <SettingRow icon="key-outline" title="Change password" onPress={() => router.push('/change-password')} />
          <SettingRow
            icon="people-outline"
            title="Delegation"
            subtitle={profile?.delegate ? `${profile.delegate.name} covers you until ${formatDate(new Date(profile.delegate.until))}` : 'Nobody is covering for you'}
          />
          <SettingRow
            icon="help-circle-outline"
            title="Help"
            onPress={() => Alert.alert('Help', 'For problems with a task, ask your supervisor. For account problems, contact HR.')}
            last
          />
        </SettingGroup>

        <SettingGroup title="Session">
          <SettingRow icon="log-out-outline" title="Log out" danger onPress={confirmLogout} last />
        </SettingGroup>

        <AppText variant="caption" color={colors.muted} align="center">
          Amal · version {Constants.expoConfig?.version ?? '1.0.0'}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <AppText variant="caption" color={colors.onDarkMuted}>
        {label}
      </AppText>
      <AppText variant="label" color={colors.onDark} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { padding: space.md, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.md },
  card: { padding: space.md, borderRadius: radius.lg, backgroundColor: colors.pine900, gap: space.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.saffron, alignSelf: 'flex-start' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm },
  fact: { width: '50%', gap: 2, paddingRight: space.xs },
  darkSkeleton: { backgroundColor: colors.pine700, width: '48%' },
  note: { paddingHorizontal: space.xs, marginTop: -space.xs },
  langRow: { paddingVertical: space.sm },
});
