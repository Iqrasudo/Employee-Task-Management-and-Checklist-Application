import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  progress: number; // 0 to 1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  labelColor?: string;
};

// The employee's work progress (checklist). Fills with an animation.
export function ProgressRing({
  progress,
  size = 46,
  stroke = 4,
  color = colors.pine600,
  track = colors.line,
  labelColor = colors.text,
}: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, progress]);

  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] });
  const pct = Math.round(progress * 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`${pct} percent done`}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {progress > 0 ? (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        ) : null}
      </Svg>
      <Text style={{ fontFamily: fonts.semibold, fontSize: size < 50 ? 11 : 13, color: labelColor }}>{pct}%</Text>
    </View>
  );
}
