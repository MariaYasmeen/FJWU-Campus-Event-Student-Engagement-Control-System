import { Slot } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext.jsx';

export default function RootLayout() {
  return <AuthProvider><Slot /></AuthProvider>;
}