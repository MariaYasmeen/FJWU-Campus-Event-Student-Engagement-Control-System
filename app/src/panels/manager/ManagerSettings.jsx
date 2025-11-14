import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout.jsx';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ManagerSettings() {
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [announcementsNotif, setAnnouncementsNotif] = useState(true);
  const [theme, setTheme] = useState('light');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.data() || {};
        setEmailNotif(!!data.emailNotif);
        setAnnouncementsNotif(!!data.announcementsNotif);
        setTheme(data.theme || (localStorage.getItem('theme') || 'light'));
        document.documentElement.classList.toggle('dark', (data.theme || localStorage.getItem('theme')) === 'dark');
      } catch {}
    };
    load();
  }, [user]);

  const handleSavePrefs = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        emailNotif,
        announcementsNotif,
        theme,
      });
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      setMessage('Settings saved');
    } catch (e) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPrefs = () => {
    setMessage('');
    setError('');
    const t = localStorage.getItem('theme') || 'light';
    setTheme(t);
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setMessage('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setError(e.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { deleted: true });
      await deleteUser(auth.currentUser);
      window.location.href = '/login';
    } catch (e) {
      setError(e.message || 'Failed to delete account');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <ManagerLayout current={'settings'} onChange={() => {}}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold mb-3">Settings</h1>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {message && <div className="text-sm text-green-700 mb-2">{message}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Notification Preferences</h2>
          <label className="flex items-center gap-2 mb-2 text-sm">
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif((v) => !v)} /> Email notifications
          </label>
          <label className="flex items-center gap-2 mb-2 text-sm">
            <input type="checkbox" checked={announcementsNotif} onChange={() => setAnnouncementsNotif((v) => !v)} /> Announcements alerts
          </label>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary" disabled={saving} onClick={handleSavePrefs}>Save</button>
            <button className="btn btn-secondary" onClick={handleCancelPrefs}>Cancel</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Theme</h2>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" checked={theme==='light'} onChange={() => setTheme('light')} /> Light
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" checked={theme==='dark'} onChange={() => setTheme('dark')} /> Dark
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary" disabled={saving} onClick={handleSavePrefs}>Save</button>
            <button className="btn btn-secondary" onClick={handleCancelPrefs}>Cancel</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Change Password</h2>
          <label className="block mb-2 text-sm">
            <span>Current password</span>
            <input className="input mt-1" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </label>
          <label className="block mb-2 text-sm">
            <span>New password</span>
            <input className="input mt-1" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary" disabled={saving || !currentPassword || !newPassword} onClick={handleChangePassword}>Update Password</button>
            <button className="btn btn-secondary" onClick={() => { setCurrentPassword(''); setNewPassword(''); }}>Cancel</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Delete Account</h2>
          <p className="text-sm text-gray-700">This action is permanent and cannot be undone.</p>
          <button className="btn btn-secondary mt-3" onClick={() => setShowConfirm(true)}>Delete Account</button>
        </div>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-sm w-full p-5 text-center">
              <h3 className="text-lg font-semibold">Delete Account</h3>
              <p className="text-sm text-gray-700 mt-2">This action is permanent and cannot be undone. Are you sure?</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving} onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}