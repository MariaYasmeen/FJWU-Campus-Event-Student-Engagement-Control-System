import { View, Text } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext.jsx';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (loading) return <View><Text>Loading...</Text></View>;
  if (!user) {
    router.replace('/login');
    return <View><Text>Redirecting…</Text></View>;
  }
  return <Slot />;
}