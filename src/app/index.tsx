import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// App start: logged in → home, otherwise → login
export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/home' : '/login'} />;
}
