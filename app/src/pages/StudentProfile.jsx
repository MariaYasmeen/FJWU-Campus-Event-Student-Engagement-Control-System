import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db, storage } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import StudentLayout from '../components/StudentLayout.jsx';

export default function StudentProfile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [status, setStatus] = useState('Active');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
          setEmail(data.email || user.email || '');
          setPhone(data.phone || '');
          setRollNumber(data.rollNumber || '');
          setStatus(data.status || 'Active');
          setPhotoURL(data.photoURL || '');
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
    setError('');
    try {
      const refDoc = doc(db, 'users', user.uid);
      try {
        await updateDoc(refDoc, {
          name,
          department,
          email,
          phone,
          rollNumber,
          status,
          photoURL: photoURL || null,
        });
      } catch (err) {
        // if doc doesn't exist, create it
        await setDoc(refDoc, {
          name,
          department,
          email,
          phone,
          rollNumber,
          status,
          photoURL: photoURL || null,
        }, { merge: true });
      }
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError('');
    try {
      const imageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setPhotoURL(url);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 pt-8 pb-4 text-center bg-fjwuGreen/5 rounded-t-2xl">
              <div className="mx-auto w-28 h-28 rounded-full ring-4 ring-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-100">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </button>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-2xl font-semibold text-fjwuGreen">{name || 'Your Name'}</div>
                <div className="text-sm text-gray-700">{department || 'Department'}</div>
                <div className="text-sm text-gray-700">{rollNumber || 'Roll Number / Student ID'}</div>
                <div className="text-sm text-gray-700">{email || user?.email || ''}</div>
                <div className="text-sm"><span className="font-medium">Status:</span> {status}</div>
              </div>
            </div>

            <div className="px-6 py-6">
              <h2 className="text-lg font-semibold mb-3">Edit Profile</h2>
              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
              {loading ? (
                <div>Loading...</div>
              ) : (
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm">Full Name</span>
                    <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm">Department</span>
                    <input className="input mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm">Roll Number / Student ID</span>
                    <input className="input mt-1" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm">Email Address</span>
                    <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm">Phone</span>
                    <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-sm">Status</span>
                    <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option>Active</option>
                      <option>Alumni</option>
                      <option>Suspended</option>
                    </select>
                  </label>

                  <div className="md:col-span-2 flex gap-2 mt-2">
                    <button className="btn btn-primary" type="submit">Save</button>
                    {saved && <div className="text-sm text-green-700">Saved</div>}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}