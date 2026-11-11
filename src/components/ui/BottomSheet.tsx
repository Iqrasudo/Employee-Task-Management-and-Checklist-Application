import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { colors, motion, radius, space } from '../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

// Panel that slides up from the bottom, over a dimmed background.
export function BottomSheet({ visible, onClose, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: motion.base, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, anim]);

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
          <Pressable style={styles.flex} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { paddingBottom: space.lg + insets.bottom },
            { transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.head}>
            <AppText variant="h2">{title}</AppText>
            {subtitle ? (
              <AppText variant="small" color={colors.muted}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  flex: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(14,42,35,0.45)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.xs,
    gap: space.md,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  head: { gap: space.xxs },
});
