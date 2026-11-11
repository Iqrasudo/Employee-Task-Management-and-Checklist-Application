import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';
import { AppText } from '../../components/ui/AppText';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { AuthError, login } from '../../services/auth';
import { colors, fonts, motion, radius, space } from '../../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { email?: string; password?: string };

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  // Entrance animation: brand fades down, card slides up
  const brandAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(brandAnim, { toValue: 1, duration: motion.slow, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: motion.slow + 100, useNativeDriver: true }),
    ]).start();
  }, [brandAnim, cardAnim]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Enter your work email.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'This email does not look right.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      signIn(user);
      router.replace('/home');
    } catch (e) {
      setFormError(
        e instanceof AuthError ? e.message : 'Could not connect. Check your internet and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={styles.top}>
        <Animated.View
          style={[
            styles.brand,
            {
              opacity: brandAnim,
              transform: [{ translateY: brandAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            },
          ]}
        >
          <View style={styles.topRow}>
            <Logo size={52} />
            <Pressable
              style={styles.lang}
              accessibilityRole="button"
              accessibilityLabel="Switch to Arabic"
              onPress={() => Alert.alert('Arabic', 'Arabic language will be added in a later step.')}
            >
              <AppText variant="label" color={colors.onDark} style={{ fontFamily: fonts.arabicBold }}>
                عربي
              </AppText>
            </Pressable>
          </View>
          <AppText variant="display" color={colors.onDark}>
            Amal
          </AppText>
          <AppText variant="small" color={colors.onDarkMuted}>
            Tasks, checklists and approvals in one place.
          </AppText>
        </Animated.View>
      </SafeAreaView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardAnim,
              transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.cardContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heading}>
              <AppText variant="h1">Sign in</AppText>
              <AppText variant="small" color={colors.muted}>
                Use the work email HR registered for you.
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
              label="Work email"
              placeholder="name@company.com"
              leftIcon="mail-outline"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />

            <AppTextInput
              ref={passwordRef}
              label="Password"
              placeholder="Your password"
              leftIcon="lock-closed-outline"
              password
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              editable={!loading}
            />

            <Pressable
              onPress={() => router.push('/forgot-password')}
              hitSlop={8}
              style={styles.forgot}
              accessibilityRole="link"
            >
              <AppText variant="label" color={colors.pine600}>
                Forgot password?
              </AppText>
            </Pressable>

            <AppButton title="Sign in" onPress={handleLogin} loading={loading} />

            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
              <AppText variant="caption" color={colors.muted} style={styles.flex}>
                No account? Accounts are created by HR. Check your email for the activation link.
              </AppText>
            </View>

            {/* DEMO ONLY: in the real app this screen opens from the link in the activation email. */}
            <Pressable
              onPress={() =>
                router.push({ pathname: '/set-password', params: { email: 'ayesha@company.com', token: 'demo' } })
              }
              hitSlop={8}
              style={styles.demoLink}
              accessibilityRole="link"
            >
              <AppText variant="caption" color={colors.pine600}>
                Demo: open the activation link screen
              </AppText>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pine900 },
  flex: { flex: 1 },
  top: { paddingHorizontal: space.lg, paddingBottom: space.xl + space.md },
  brand: { gap: space.xs, paddingTop: space.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  lang: {
    minWidth: 56,
    height: 44,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.pine700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    marginTop: -space.md,
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  cardContent: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
  heading: { gap: space.xxs, marginBottom: space.xs },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    padding: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
  },
  forgot: { alignSelf: 'flex-end', paddingVertical: space.xxs },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, marginTop: space.xs },
  demoLink: { alignSelf: 'center', paddingVertical: space.xs },
});
