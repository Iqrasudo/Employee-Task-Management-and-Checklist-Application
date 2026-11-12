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
import { useLanguage } from '../../../i18n/LanguageProvider';
import { getPreferences, getProfile, Language, Preferences, Profile, updatePreferences } from '../../../services/profile';
import { colors, radius, space } from '../../../theme';
import { formatDate } from '../../../utils/date';
import { t, TKey } from '../../../i18n';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const { lang: appLang, changeLanguage } = useLanguage();
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
      setToast(t('common.saved'));
    } catch {
      setPrefs(before);
      Alert.alert(t('profile.notSaved'), t('common.checkInternet'));
    }
  }

  function chooseLanguage(next: Language) {
    if (next === appLang) return;
    updatePreferences({ language: next }).catch(() => {}); // later: saved on the server too
    changeLanguage(next); // redraws the app in the new language (and flips it right-to-left for Arabic)
  }

  function confirmLogout() {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
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
                {t(`role.${user?.role ?? 'Employee'}` as TKey)}
              </AppText>
            </View>
          </View>

          {profile ? (
            <View style={styles.facts}>
              <Fact label={t('common.department')} value={user?.department ?? ''} />
              <Fact label={t('profile.reportsTo')} value={profile.manager} />
              <Fact label={t('profile.branch')} value={profile.branch} />
              <Fact label={t('profile.employeeId')} value={profile.employeeCode} />
            </View>
          ) : (
            <View style={styles.facts}>
              <Skeleton height={36} style={styles.darkSkeleton} />
              <Skeleton height={36} style={styles.darkSkeleton} />
            </View>
          )}
        </View>

        {/* Contact */}
        <SettingGroup title={t('profile.contact')}>
          <SettingRow icon="mail-outline" title={t('profile.email')} subtitle={user?.email} />
          <SettingRow icon="call-outline" title={t('profile.phone')} subtitle={profile?.phone ?? '…'} />
          <SettingRow
            icon="calendar-outline"
            title={t('profile.joined')}
            subtitle={profile ? formatDate(new Date(profile.joined)) + ` ${new Date(profile.joined).getFullYear()}` : '…'}
            last
          />
        </SettingGroup>
        <AppText variant="caption" color={colors.muted} style={styles.note}>
          {t('profile.contactHr')}
        </AppText>

        {/* Language */}
        <SettingGroup title={t('profile.language')}>
          <View style={styles.langRow}>
            {prefs ? (
              <SegmentedTabs<Language>
                tabs={[
                  { key: 'en', label: 'English' },
                  { key: 'ar', label: 'عربي' },
                ]}
                value={appLang}
                onChange={chooseLanguage}
              />
            ) : (
              <Skeleton height={44} />
            )}
          </View>
        </SettingGroup>

        {/* Notifications */}
        <SettingGroup title={t('common.notifications')}>
          <SettingRow
            icon="notifications-outline"
            title={t('profile.push')}
            subtitle={t('profile.pushSub')}
            toggle={prefs ? { value: prefs.push, onChange: (v) => setPref('push', v) } : undefined}
          />
          <SettingRow
            icon="mail-unread-outline"
            title={t('profile.emailNew')}
            toggle={prefs ? { value: prefs.emailNewTask, onChange: (v) => setPref('emailNewTask', v) } : undefined}
          />
          <SettingRow
            icon="create-outline"
            title={t('profile.emailFix')}
            toggle={prefs ? { value: prefs.emailCorrections, onChange: (v) => setPref('emailCorrections', v) } : undefined}
          />
          <SettingRow
            icon="checkmark-done-outline"
            title={t('profile.emailApproved')}
            toggle={prefs ? { value: prefs.emailApprovals, onChange: (v) => setPref('emailApprovals', v) } : undefined}
          />
          <SettingRow
            icon="alarm-outline"
            title={t('profile.emailReminders')}
            toggle={prefs ? { value: prefs.emailReminders, onChange: (v) => setPref('emailReminders', v) } : undefined}
          />
          <SettingRow
            icon="today-outline"
            title={t('profile.daily')}
            subtitle={t('profile.dailySub')}
            toggle={prefs ? { value: prefs.dailySummary, onChange: (v) => setPref('dailySummary', v) } : undefined}
            last
          />
        </SettingGroup>
        {pushOff ? (
          <AppText variant="caption" color={colors.warning} style={styles.note}>
            {t('profile.pushOff')}
          </AppText>
        ) : null}

        {/* Account */}
        <SettingGroup title={t('profile.account')}>
          <SettingRow icon="key-outline" title={t('cpw.title')} onPress={() => router.push('/change-password')} />
          <SettingRow
            icon="people-outline"
            title={t('profile.delegation')}
            subtitle={profile?.delegate ? t('profile.delegateUntil', { name: profile.delegate.name, date: formatDate(new Date(profile.delegate.until)) }) : t('profile.noDelegate')}
          />
          <SettingRow
            icon="help-circle-outline"
            title={t('profile.help')}
            onPress={() => Alert.alert(t('profile.help'), t('profile.helpMsg'))}
            last
          />
        </SettingGroup>

        <SettingGroup title={t('profile.session')}>
          <SettingRow icon="log-out-outline" title={t('profile.logout')} danger onPress={confirmLogout} last />
        </SettingGroup>

        <AppText variant="caption" color={colors.muted} align="center">
          {t('profile.version', { v: Constants.expoConfig?.version ?? '1.0.0' })}
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
