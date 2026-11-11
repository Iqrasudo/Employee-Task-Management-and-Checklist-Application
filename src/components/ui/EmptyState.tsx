import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, motion, radius, space } from '../../theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, message, action }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: motion.slow, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.box,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.pine600} />
      </View>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      <AppText variant="small" color={colors.muted} align="center">
        {message}
      </AppText>
      {action}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.pine100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
});
