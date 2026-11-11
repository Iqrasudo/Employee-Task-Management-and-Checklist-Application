import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, motion, radius, space } from '../../theme';

type Props = { message: string | null; onHide: () => void };

// Short confirmation at the top of the screen, e.g. "Task accepted". Hides itself after 2.5 s.
export function Toast({ message, onHide }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    Animated.timing(anim, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: motion.base, useNativeDriver: true }).start(() => onHide());
    }, 2500);
    return () => clearTimeout(timer);
  }, [message, anim, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
      ]}
    >
      <Ionicons name="checkmark-circle" size={20} color={colors.saffron} />
      <AppText variant="label" color={colors.onDark} style={styles.flex}>
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: space.sm,
    left: space.md,
    right: space.md,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.pine900,
    elevation: 6,
  },
  flex: { flex: 1 },
});
