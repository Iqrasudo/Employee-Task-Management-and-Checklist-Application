import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';
import { AppText } from '../../components/ui/AppText';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { AuthError, changePassword } from '../../services/auth';
import { colors, radius, space } from '../../theme';
import { isStrongPassword, passwordRules } from '../../utils/password';

type Errors = { current?: string; next?: string; confirm?: string };

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  async function save() {
    setFormError(null);
    const e: Errors = {};
    if (!current) e.current = 'Enter your current password.';
    if (!isStrongPassword(next)) e.next = 'The new password does not meet all the rules below.';
    if (confirm !== next) e.confirm = 'The two new passwords do not match.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await changePassword(current, next);
      setDone(true);
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : 'Could not connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.doneWrap}>
          <EmptyState
            icon="shield-checkmark-outline"
            title="Password changed"
            message="Use your new password the next time you sign in. Other phones signed in to your account are signed out."
            action={<AppButton title="Back to profile" onPress={() => router.back()} style={styles.fullWidth} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const clear = (key: keyof Errors) => errors[key] && setErrors((e) => ({ ...e, [key]: undefined }));

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Change password" subtitle="Account" showBack />

          {formError ? (
            <View style={styles.alert} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <AppText variant="small" color={colors.danger} style={styles.flex}>
                {formError}
              </AppText>
            </View>
          ) : null}

          <AppTextInput
            label="Current password"
            leftIcon="lock-closed-outline"
            password
            value={current}
            onChangeText={(t) => {
              setCurrent(t);
              clear('current');
            }}
            error={errors.current}
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="next"
            onSubmitEditing={() => nextRef.current?.focus()}
            editable={!loading}
          />

          <AppTextInput
            ref={nextRef}
            label="New password"
            leftIcon="key-outline"
            password
            value={next}
            onChangeText={(t) => {
              setNext(t);
              clear('next');
            }}
            error={errors.next}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            editable={!loading}
          />

          <View style={styles.rules}>
            {passwordRules.map((rule) => {
              const ok = rule.test(next);
              return (
                <View key={rule.id} style={styles.ruleRow}>
                  <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={ok ? colors.pine600 : colors.lineStrong} />
                  <AppText variant="small" color={ok ? colors.pine600 : colors.muted}>
                    {rule.label}
                  </AppText>
                </View>
              );
            })}
          </View>

          <AppTextInput
            ref={confirmRef}
            label="Confirm new password"
            leftIcon="key-outline"
            password
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              clear('confirm');
            }}
            error={errors.confirm}
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={save}
            editable={!loading}
          />

          <AppButton title="Save new password" onPress={save} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  doneWrap: { flex: 1, justifyContent: 'center', padding: space.lg },
  fullWidth: { alignSelf: 'stretch', marginTop: space.sm },
  alert: { flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: space.sm, borderRadius: radius.sm, backgroundColor: colors.dangerBg },
  rules: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});
