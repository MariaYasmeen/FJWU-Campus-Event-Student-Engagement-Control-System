import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext.jsx';

export default function Index() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  if (loading) return <View><Text>Loading...</Text></View>;
  if (!profile) {
    router.replace('/login');
    return <View><Text>Redirecting…</Text></View>;
  }
  router.replace(profile.role === 'manager' ? '/manager' : '/student');
  return <View><Text>Redirecting…</Text></View>;
}