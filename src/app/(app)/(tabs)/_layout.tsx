import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUnreadCount } from '../../../hooks/useUnreadCount';
import { colors, fonts } from '../../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Active tab gets a soft pine pill behind its icon, like the design.
function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  return (
    <View style={[styles.pill, focused ? styles.pillActive : null]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function EmployeeTabs() {
  const unread = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pine600,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 68, paddingTop: 6 },
        tabBarBadgeStyle: { backgroundColor: colors.saffron, color: colors.pine900, fontFamily: fonts.semibold, fontSize: 11 },
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-tasks"
        options={{
          title: 'My Tasks',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'checkbox' : 'checkbox-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarBadge: unread > 0 ? unread : undefined, // hidden when everything is read
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'notifications' : 'notifications-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.pine100 },
});
