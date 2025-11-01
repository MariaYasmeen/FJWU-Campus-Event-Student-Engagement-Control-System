import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout.jsx';

export default function ManagerProfile() {
  const { user, profile } = useAuth();
  const [societyName, setSocietyName] = useState(profile?.societyName || profile?.organizerName || '');
  const [description, setDescription] = useState(profile?.description || profile?.bio || '');
  const [email, setEmail] = useState(profile?.contactEmail || profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [category, setCategory] = useState(profile?.category || 'Cultural');
  const [foundedYear, setFoundedYear] = useState(profile?.foundedYear || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(profile?.logo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [existing, setExisting] = useState(!!profile?.profileComplete);
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setExisting(!!snap.data().profileComplete);
        }
      } catch {}
    };
    if (user) checkExisting();
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        societyName,
        organizerName: societyName,
        description,
        logo: logoUrl || null,
        contactEmail: email,
        phone,
        category,
        foundedYear: foundedYear ? Number(foundedYear) : null,
        profileComplete: true,
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      });
      navigate('/manager');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagerLayout current={'manager_profile'} onChange={() => {}}>
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 pt-8 pb-4 text-center bg-fjwuGreen/5 rounded-t-2xl">
              <div className="mx-auto w-28 h-28 rounded-full ring-4 ring-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-100">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏛️</span>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-2xl font-semibold text-fjwuGreen">{societyName || 'Your Society Name'}</div>
                <div className="text-sm text-gray-700">{category || 'Category'}</div>
                <div className="text-sm text-gray-700">{email || user?.email || ''}</div>
                <div className="text-sm">{description || 'Your description or tagline'}</div>
              </div>
            </div>

            <div className="px-6 py-6">
              <h2 className="text-lg font-semibold mb-3">Edit Profile</h2>
              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="text-sm">Logo URL</span>
                  <input className="input mt-1" placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm">Society Name</span>
                  <input className="input mt-1" value={societyName} onChange={(e) => setSocietyName(e.target.value)} required />
                </label>
                <label className="block">
                  <span className="text-sm">Category</span>
                  <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {['Cultural','Technical','Literary','Sports','Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm">Description / Mission</span>
                  <textarea className="input mt-1" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm">Official Email</span>
                  <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm">Phone (optional)</span>
                  <input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm">Founded Year (optional)</span>
                  <input type="number" className="input mt-1" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} />
                </label>
                <div className="md:col-span-2">
                  <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}