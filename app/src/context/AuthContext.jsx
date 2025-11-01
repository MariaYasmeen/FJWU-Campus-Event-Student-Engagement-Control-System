import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { isValidFjwuEmail } from '../utils/validators';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // If not email verified, sign out and set message
        if (!u.emailVerified) {
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setMessage('Email not verified. Please check your inbox for the verification link.');
          setLoading(false);
          return;
        }

        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async ({ firstName, lastName, email, department, semester, password, role }) => {
    setMessage(null);
    if (!isValidFjwuEmail(email)) {
      throw new Error('University email must end with .fjwu.edu.pk');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Create Firestore user profile
    await setDoc(doc(db, 'users', uid), {
      uid,
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      department,
      semester,
      role: role === 'manager' ? 'manager' : 'student',
      createdAt: serverTimestamp(),
      profileComplete: role === 'manager' ? false : true,
    });

    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
    };
    await sendEmailVerification(cred.user, actionCodeSettings);
    await signOut(auth);
    setMessage('Verification email sent. Please verify before logging in.');
    return true;
  };

  const login = async ({ email, password, role }) => {
    setMessage(null);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Enforce verification
    if (!cred.user.emailVerified) {
      try {
        const actionCodeSettings = { url: `${window.location.origin}/login` };
        await sendEmailVerification(cred.user, actionCodeSettings);
      } catch (e) {
        console.error('Failed to send verification email on login', e);
      }
      await signOut(auth);
      throw new Error(`Verification email resent to ${email}. Please check inbox or spam.`);
    }
    // Enforce role selection matches stored role
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error('User profile not found. Contact support.');
    }
    const data = snap.data();
    if (data.role !== role) {
      await signOut(auth);
      throw new Error(`Role mismatch. You signed up as ${data.role}. Switch tab to ${data.role}.`);
    }
    return true;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, profile, loading, message, signup, login, logout }), [user, profile, loading, message]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}