import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase.js';
import { doc, getDoc, collection, getDocs, query, where, orderBy, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import StudentLayout from '../panels/student/StudentLayout.jsx';
import ManagerLayout from '../panels/manager/ManagerLayout.jsx';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

export default function SocietyProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isManager = profile?.role === 'manager';
  const [society, setSociety] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(null); // eventId currently toggling like

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sSnap = await getDoc(doc(db, 'users', uid));
        if (!sSnap.exists()) {
          setError('Society not found');
        } else {
          setSociety(sSnap.data());
        }
        const eQ = query(collection(db, 'events'), where('createdBy', '==', uid));
        const eSnap = await getDocs(eQ);
        const base = eSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Compute commentsCount for accuracy if not present
        const withCounts = await Promise.all(base.map(async (ev) => {
          try {
            const cSnap = await getDocs(collection(db, 'events', ev.id, 'comments'));
            return { ...ev, commentsCount: cSnap.size };
          } catch {
            return { ...ev, commentsCount: typeof ev.commentsCount === 'number' ? ev.commentsCount : 0 };
          }
        }));
        setEvents(withCounts);
      } catch (e) {
        setError(e.message || 'Failed to load society');
      } finally {
        setLoading(false);
      }
    };
    if (uid) load();
  }, [uid]);

  const Wrap = isManager ? ManagerLayout : StudentLayout;

  if (loading) return (
    <Wrap>
      <div className="p-6">Loading society…</div>
    </Wrap>
  );

  if (error) return (
    <Wrap>
      <div className="p-6 text-red-600">{error}</div>
    </Wrap>
  );

  const toggleLike = async (e, ev) => {
    e?.stopPropagation?.();
    if (!profile?.uid) return;
    setLiking(ev.id);
    try {
      const likeDocRef = doc(db, 'events', ev.id, 'likes', profile.uid);
      const snap = await getDoc(likeDocRef);
      if (snap.exists()) {
        await deleteDoc(likeDocRef);
        await updateDoc(doc(db, 'events', ev.id), { likesCount: increment(-1) });
        setEvents((rows) => rows.map((row) => row.id === ev.id ? { ...row, likesCount: Math.max(0, (row.likesCount || 0) - 1) } : row));
      } else {
        await setDoc(likeDocRef, { uid: profile.uid });
        await updateDoc(doc(db, 'events', ev.id), { likesCount: increment(1) });
        setEvents((rows) => rows.map((row) => row.id === ev.id ? { ...row, likesCount: (row.likesCount || 0) + 1 } : row));
      }
    } catch {}
    setLiking(null);
  };

  return (
    <Wrap>
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 pt-8 pb-6 text-center bg-fjwuGreen/5 rounded-t-2xl">
            <div className="mx-auto w-28 h-28 rounded-full ring-4 ring-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-100">
              {society?.logo || society?.photoURL ? (
                <img src={society.logo || society.photoURL} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🏛️</span>
              )}
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-2xl font-semibold text-fjwuGreen">{society?.societyName || society?.organizerName || 'Society'}</div>
              <div className="text-sm">{society?.description || 'No description'}</div>
              <div className="text-sm text-gray-700">{society?.category || 'Category'} · {events.length} events conducted</div>
            </div>
          </div>
          <div className="px-2 md:px-6 py-6">
            <h2 className="text-lg font-semibold mb-3">Events</h2>
            {!events.length && (
              <div className="px-4 text-sm text-gray-600">No events yet.</div>
            )}
            <div className="grid grid-cols-3 gap-[2px] md:gap-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="group relative bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  {ev.posterURL ? (
                    <img src={ev.posterURL} alt={ev.title || 'Event'} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-6 bg-black/40 text-white">
                    <button
                      className="flex items-center gap-1 hover:opacity-80"
                      onClick={(e) => toggleLike(e, ev)}
                      disabled={liking === ev.id}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">{typeof ev.likesCount === 'number' ? ev.likesCount : 0}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{typeof ev.commentsCount === 'number' ? ev.commentsCount : 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">{typeof ev.sharesCount === 'number' ? ev.sharesCount : 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}