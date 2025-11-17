import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4qZd1Y4ScfVg30vaAnWWWHI5qt5WoPE0",
  authDomain: "fjwu-events.firebaseapp.com",
  projectId: "fjwu-events",
  storageBucket: "fjwu-events.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
export const storage = getStorage(app);