import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import type { Task } from '../../types/task';
import { colors, motion, radius, space, statusColors } from '../../theme';
import { dateKey, monthMatrix } from '../../utils/calendar';
import { isOverdue } from '../../utils/date';
import { monthName, t, tn, weekdaysShort } from '../../i18n';

type Props = {
  year: number;
  month: number; // 0 = January
  selectedKey: string;
  tasksByDay: Record<string, Task[]>;
  onSelect: (day: Date) => void;
  direction: 1 | -1; // which way the month slid, for the animation
};

// Colour of a task's dot: same colours as the status badges.
function dotColor(t: Task): string {
  if (t.isNew) return colors.saffron;
  if (isOverdue(t)) return colors.danger;
  return statusColors[t.status].fg;
}

export function MonthGrid({ year, month, selectedKey, tasksByDay, onSelect, direction }: Props) {
  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);
  const todayKey = dateKey(new Date());

  // Slide + fade in each time the month changes.
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: motion.slow, useNativeDriver: true }).start();
  }, [year, month, anim]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {weekdaysShort().map((d) => (
          <View key={d} style={styles.cell}>
            <AppText variant="caption" color={colors.muted}>
              {d}
            </AppText>
          </View>
        ))}
      </View>

      <Animated.View
        style={{
          opacity: anim,
          transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [24 * direction, 0] }) }],
        }}
      >
        {weeks.map((week) => (
          <View key={dateKey(week[0])} style={styles.row}>
            {week.map((day) => {
              const key = dateKey(day);
              const inMonth = day.getMonth() === month;
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              const tasks = tasksByDay[key] ?? [];

              return (
                <Pressable
                  key={key}
                  onPress={() => onSelect(day)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${day.getDate()} ${monthName(day.getMonth())}${isToday ? t('cal.todayA11y') : ''}, ${
                    tasks.length ? tn('count.tasks', tasks.length) : t('cal.noTasks')
                  }`}
                  style={[styles.cell, styles.dayCell, isSelected ? styles.selected : null]}
                >
                  <View style={[styles.num, isToday ? styles.today : null]}>
                    <AppText
                      variant={isToday || isSelected ? 'label' : 'small'}
                      color={isToday ? colors.onDark : inMonth ? colors.text : '#A3A8A5'}
                    >
                      {day.getDate()}
                    </AppText>
                  </View>
                  <View style={styles.dots}>
                    {tasks.slice(0, 3).map((t) => (
                      <View key={t.id} style={[styles.dot, { backgroundColor: dotColor(t) }]} />
                    ))}
                    {tasks.length > 3 ? (
                      <AppText variant="caption" color={colors.muted} style={styles.more}>
                        +
                      </AppText>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: space.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  dayCell: { minHeight: 52, borderRadius: radius.sm, gap: 3 },
  selected: { backgroundColor: colors.pine100 },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: colors.pine600 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  more: { fontSize: 10, lineHeight: 10 },
});
