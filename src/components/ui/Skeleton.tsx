import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, space } from '../../theme';

type Props = { width?: DimensionValue; height?: number; rounded?: number; style?: ViewStyle };

// Grey placeholder that gently pulses while data loads.
export function Skeleton({ width = '100%', height = 14, rounded = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[{ width, height, borderRadius: rounded, backgroundColor: '#E7E5DE', opacity }, style]} />;
}

// Same shape as a TaskCard, shown while tasks load.
export function TaskCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={46} height={46} rounded={23} />
      <View style={styles.lines}>
        <Skeleton width="80%" />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  lines: { flex: 1, gap: space.xs },
});
