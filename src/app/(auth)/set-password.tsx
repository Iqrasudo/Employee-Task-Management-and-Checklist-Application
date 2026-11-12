import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';
import { AppText } from '../../components/ui/AppText';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { activateAccount, AuthError } from '../../services/auth';
import { colors, radius, space } from '../../theme';
import { isStrongPassword, passwordRules } from '../../utils/password';
import { t } from '../../i18n';

// Opened from the activation email: /set-password?email=...&token=...
export default function SetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const email = params.email ?? '';
  const token = params.token ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  async function handleSave() {
    setFormError(null);
    const next: typeof errors = {};
    if (!isStrongPassword(password)) next.password = t('setpw.weak');
    if (confirm !== password) next.confirm = t('setpw.mismatch');
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await activateAccount(email, token, password);
      setDone(true);
    } catch (e) {
      setFormError(e instanceof AuthError ? e.message : t('common.noConnection'));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.doneWrap}>
          <EmptyState
            icon="checkmark-circle-outline"
            title={t('setpw.doneTitle')}
            message={t('setpw.doneMessage')}
            action={<AppButton title={t('setpw.goToSignIn')} onPress={() => router.replace('/login')} style={styles.fullWidth} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader title={t('setpw.title')} subtitle={t('setpw.subtitle')} showBack />

          <View style={styles.emailBox}>
            <Ionicons name="mail-outline" size={18} color={colors.pine600} />
            <AppText variant="small" style={styles.flex}>
              {email || t('setpw.emailFallback')}
            </AppText>
          </View>

          {formError ? (
            <View style={styles.alert} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <AppText variant="small" color={colors.danger} style={styles.flex}>
                {formError}
              </AppText>
            </View>
          ) : null}

          <AppTextInput
            label={t('auth.newPassword')}
            placeholder={t('setpw.newPlaceholder')}
            leftIcon="lock-closed-outline"
            password
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            editable={!loading}
          />

          <View style={styles.rules} accessibilityLabel={t('auth.rulesLabel')}>
            {passwordRules.map((rule) => {
              const ok = rule.test(password);
              return (
                <View key={rule.id} style={styles.ruleRow}>
                  <Ionicons
                    name={ok ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={ok ? colors.pine600 : colors.lineStrong}
                  />
                  <AppText variant="small" color={ok ? colors.pine600 : colors.muted}>
                    {rule.label}
                  </AppText>
                </View>
              );
            })}
          </View>

          <AppTextInput
            ref={confirmRef}
            label={t('setpw.confirm')}
            placeholder={t('setpw.confirmPlaceholder')}
            leftIcon="lock-closed-outline"
            password
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
            }}
            error={errors.confirm}
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={handleSave}
            editable={!loading}
          />

          <AppButton title={t('setpw.save')} onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  fullWidth: { alignSelf: 'stretch', marginTop: space.sm },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  doneWrap: { flex: 1, justifyContent: 'center', padding: space.lg },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    padding: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.pine100,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    padding: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
  },
  rules: {
    gap: space.xs,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});
