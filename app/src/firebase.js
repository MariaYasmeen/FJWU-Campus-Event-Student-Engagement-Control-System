import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config (values provided by spec; projectId inferred from Project ID)
const firebaseConfig = {
  apiKey: "AIzaSyA4qZd1Y4ScfVg30vaAnWWWHI5qt5WoPE0",
  authDomain: "fjwu-events.firebaseapp.com",
  projectId: "fjwu-events",
  storageBucket: "fjwu-events.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Optional: export rtdb in future if needed
// import { getDatabase } from 'firebase/database';
// export const rtdb = getDatabase(app);