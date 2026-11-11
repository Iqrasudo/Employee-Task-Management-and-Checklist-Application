import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function Logo({ size = 52 }: { size?: number }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Amal logo"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: colors.pine600,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="checkmark-done" size={size * 0.56} color={colors.saffron} />
    </View>
  );
}
