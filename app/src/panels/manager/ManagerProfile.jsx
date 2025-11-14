import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { doc, updateDoc, getDoc, serverTimestamp, collection, getDocs, query, where, setDoc, deleteDoc, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from './ManagerLayout.jsx';

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
  const [eventCount, setEventCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [events, setEvents] = useState([]);
  const [liking, setLiking] = useState(null);

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

  useEffect(() => {
    const loadEventCount = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'events'), where('createdBy', '==', user.uid));
        const snap = await getDocs(q);
        setEventCount(snap.size);
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {}
    };
    loadEventCount();
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 relative">
            <div className="px-6 pt-8 pb-6 text-center bg-fjwuGreen/5 rounded-t-2xl">
              <div className="mx-auto w-28 h-28 rounded-full ring-4 ring-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-100">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏛️</span>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-2xl font-semibold text-fjwuGreen">{societyName || 'Your Society Name'}</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{description || 'Your description or tagline'}</div>
                <div className="text-sm text-gray-700">{email || user?.email || ''}</div>
                <div className="text-sm text-gray-600">{category || 'Category'} · {eventCount} events conducted</div>
              </div>
              {/* Edit/Share menu */}
              <div className="absolute right-4 top-4">
                <button
                  className="btn btn-secondary flex items-center gap-1"
                  title="Options"
                  onClick={() => setShowMenu((s) => !s)}
                >
                  ✏️
                </button>
                {showMenu && (
                  <div className="mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg text-left">
                    <button className="block w-full px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setEditing(true); setShowMenu(false); }}>
                      Edit Profile
                    </button>
                    <button className="block w-full px-3 py-2 text-sm hover:bg-gray-50" onClick={() => {
                      const url = `${location.origin}/society/${user.uid}`;
                      navigator.clipboard?.writeText(url);
                      alert('Profile link copied to clipboard');
                      setShowMenu(false);
                    }}>
                      Share Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
            {editing && (
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
                  <div className="md:col-span-2 flex items-center gap-2">
                    <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
      </div>
          {/* Events Grid */}
          <div className="px-6 pb-8">
            <h3 className="text-lg font-semibold text-fjwuGreen mb-3">Events by this society</h3>
            {!events.length && (
              <div className="text-sm text-gray-600">No events yet.</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {events.map((ev) => (
                <div key={ev.id} className="relative group cursor-pointer" onClick={() => navigate(`/events/${ev.id}`)}>
                  {ev.posterURL ? (
                    <img src={ev.posterURL} alt={ev.title || 'Event'} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  {/* Overlay with like/comment/share counts */}
                  <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40 text-white gap-6">
                    <button
                      className={`flex items-center gap-1 ${liking === ev.id ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) return;
                        setLiking(ev.id);
                        const likeRef = doc(db, 'events', ev.id, 'likes', user.uid);
                        const snap = await getDoc(likeRef);
                        try {
                          if (snap.exists()) {
                            await deleteDoc(likeRef);
                            try { await updateDoc(doc(db, 'events', ev.id), { likesCount: increment(-1) }); } catch {}
                          } else {
                            await setDoc(likeRef, { uid: user.uid });
                            try { await updateDoc(doc(db, 'events', ev.id), { likesCount: increment(1) }); } catch {}
                          }
                        } finally {
                          setLiking(null);
                        }
                      }}
                      title="Like"
                    >
                      <svg className={`w-5 h-5 ${ev.likesCount > 0 ? 'fill-current' : ''}`} viewBox="0 0 24 24"><path fill="currentColor" d="M12.1 21.35l-1.1-.99C5.14 15.36 2 12.28 2 8.5 2 6.01 4.01 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.59 4.81 14.26 4 16 4c2.49 0 4.5 2.01 4.5 4.5 0 3.78-3.14 6.86-8.9 11.86l-1.5 1.36z"/></svg>
                      <span>{typeof ev.likesCount === 'number' ? ev.likesCount : 0}</span>
                    </button>
                    <div className="flex items-center gap-1" title="Comments">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M20 17.17V4H4v12h12.17L20 20l.01-2.83zM4 2h16a2 2 0 0 1 2 2v20l-6-6H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg>
                      <span>{typeof ev.commentsCount === 'number' ? ev.commentsCount : 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Shares">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7.02-4.11A3 3 0 1 0 15 5a3 3 0 0 0 .04.49L8.03 9.6A3 3 0 1 0 9 15a3 3 0 0 0-.04-.49l7.01-4.11c.53.5 1.23.82 2.03.82a3 3 0 1 0 0-6 3 3 0 0 0-3 3c0 .17.02.33.04.49L8.03 9.6A3 3 0 1 0 9 15a3 3 0 0 0-.04-.49l7.01-4.11c.53.5 1.23.82 2.03.82a3 3 0 1 0 0-6z"/></svg>
                      <span>{typeof ev.sharesCount === 'number' ? ev.sharesCount : 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}