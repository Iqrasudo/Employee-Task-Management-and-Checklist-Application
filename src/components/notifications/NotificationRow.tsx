import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import type { AppNotification, NotificationType } from '../../types/notification';
import { colors, motion, radius, space } from '../../theme';
import { timeAgo } from '../../utils/time';

// Icon and colours for each kind of notification.
const LOOK: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string }> = {
  assigned: { icon: 'add-circle-outline', fg: colors.info, bg: colors.infoBg },
  corrections: { icon: 'create-outline', fg: colors.warning, bg: colors.warningBg },
  approved: { icon: 'checkmark-circle-outline', fg: colors.pine600, bg: colors.pine100 },
  rejected: { icon: 'close-circle-outline', fg: colors.danger, bg: colors.dangerBg },
  reminder: { icon: 'alarm-outline', fg: colors.review, bg: colors.reviewBg },
  overdue: { icon: 'alert-circle-outline', fg: colors.danger, bg: colors.dangerBg },
  comment: { icon: 'chatbubble-ellipses-outline', fg: colors.neutral, bg: colors.neutralBg },
  reassigned: { icon: 'swap-horizontal-outline', fg: colors.review, bg: colors.reviewBg },
};

type Props = { item: AppNotification; index: number; onPress: () => void };

export function NotificationRow({ item, index, onPress }: Props) {
  const look = LOOK[item.type];
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: motion.slow,
      delay: Math.min(index, 8) * 50,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.read ? '' : 'Unread. '}${item.title}. ${item.body}`}
        style={({ pressed }) => [styles.row, !item.read ? styles.unread : null, pressed ? styles.pressed : null]}
      >
        <View style={[styles.icon, { backgroundColor: look.bg }]}>
          <Ionicons name={look.icon} size={22} color={look.fg} />
        </View>

        <View style={styles.body}>
          <AppText variant={item.read ? 'small' : 'label'} color={colors.text} numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText variant="small" color={colors.muted} numberOfLines={2}>
            {item.body}
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            {timeAgo(item.at)}
          </AppText>
        </View>

        {!item.read ? <View style={styles.dot} accessibilityElementsHidden /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  unread: { backgroundColor: '#FFFDF7', borderColor: '#F3E4C4' },
  pressed: { opacity: 0.7 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.saffron, marginTop: 6 },
});
