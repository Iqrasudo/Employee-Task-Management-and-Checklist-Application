import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppButton } from '../../components/ui/AppButton';
import { AppText } from '../../components/ui/AppText';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { requestPasswordReset } from '../../services/auth';
import { colors, space } from '../../theme';
import { EMAIL_RE } from '../../utils/password';
import { t } from '../../i18n';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email.trim()) return setError(t('auth.emailRequired'));
    if (!EMAIL_RE.test(email.trim())) return setError(t('auth.emailInvalid'));

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setError(t('common.noConnection'));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.doneWrap}>
          <EmptyState
            icon="mail-unread-outline"
            title={t('forgot.sentTitle')}
            message={t('forgot.sentMessage', { email: email.trim() })}
            action={
              <View style={styles.actions}>
                <AppButton title={t('forgot.back')} onPress={() => router.replace('/login')} />
                <AppButton title={t('forgot.again')} variant="ghost" onPress={() => setSent(false)} />
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader title={t('forgot.title')} subtitle={t('forgot.subtitle')} showBack />
          <AppText variant="small" color={colors.muted}>
            {t('forgot.intro')}
          </AppText>

          <AppTextInput
            label={t('auth.workEmail')}
            placeholder="name@company.com"
            leftIcon="mail-outline"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) setError(undefined);
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!loading}
          />

          <AppButton title={t('forgot.send')} onPress={handleSend} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { padding: space.lg, gap: space.md },
  doneWrap: { flex: 1, justifyContent: 'center', padding: space.lg },
  actions: { alignSelf: 'stretch', gap: space.xs, marginTop: space.sm },
});
