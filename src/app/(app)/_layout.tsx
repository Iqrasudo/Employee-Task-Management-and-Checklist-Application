import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Every screen inside (app) needs a logged-in user.
export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
