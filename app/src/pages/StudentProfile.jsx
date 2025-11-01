import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import StudentLayout from '../components/StudentLayout.jsx';

export default function StudentProfile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setDepartment(data.department || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        department,
        email,
        phone,
      });
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    }
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold mb-3">My Profile</h1>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm">Name</span>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm">Department</span>
              <input className="input mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm">Email</span>
              <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm">Phone</span>
              <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <div className="md:col-span-2 flex gap-2">
              <button className="btn btn-primary" type="submit">Save</button>
              {saved && <div className="text-sm text-green-700">Saved</div>}
            </div>
          </form>
        )}
      </div>
    </StudentLayout>
  );
}