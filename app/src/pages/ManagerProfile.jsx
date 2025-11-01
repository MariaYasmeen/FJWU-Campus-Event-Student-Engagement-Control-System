import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../utils/storage';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

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
      let finalLogo = logoUrl;
      if (logoFile) {
        const { url } = await uploadFile({ file: logoFile, pathPrefix: 'society_logos', uid: user.uid });
        finalLogo = url;
      }
      await updateDoc(doc(db, 'users', user.uid), {
        societyName,
        organizerName: societyName,
        description,
        logo: finalLogo,
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="manager" managerProfileComplete={!!profile?.profileComplete} current={'manager_profile'} onChange={() => {}} />
        <main className="flex-1 p-6">
      <div className="w-full max-w-3xl mx-auto border border-gray-200 p-6 rounded-none shadow-none">
        <h1 className="text-xl font-semibold text-fjwuGreen mb-1">Society / Club Profile</h1>
        <div className="text-sm text-gray-600 mb-4">{existing ? 'Update your society information' : 'Create your society profile to unlock event management features.'}</div>
        {existing && (
          <div className="border border-gray-200 p-4 mb-4 rounded-none shadow-none">
            <h2 className="text-lg font-semibold">Current Profile</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">Society Name:</span> {societyName || profile?.organizerName}</div>
              <div><span className="font-medium">Category:</span> {category || profile?.category}</div>
              <div className="md:col-span-2"><span className="font-medium">Description:</span> {description || profile?.description || profile?.bio}</div>
              <div><span className="font-medium">Email:</span> {email || profile?.contactEmail || profile?.email}</div>
              <div><span className="font-medium">Phone:</span> {phone || profile?.phone || '-'}</div>
              <div><span className="font-medium">Founded Year:</span> {foundedYear || profile?.foundedYear || '-'}</div>
            </div>
            {logoUrl && (
              <div className="mt-3">
                <img src={logoUrl} alt="Logo" className="h-16 border border-gray-200" />
              </div>
            )}
          </div>
        )}
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block md:col-span-2">
            <span className="text-sm">Logo</span>
            <input type="file" accept="image/*" className="input mt-1" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            {logoUrl && <img src={logoUrl} alt="Logo" className="mt-3 h-16 rounded" />}
          </label>
          <div className="md:col-span-2">
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
        </main>
      </div>
    </div>
  );
}