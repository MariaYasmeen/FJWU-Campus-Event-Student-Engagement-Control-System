import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import StudentLayout from '../components/StudentLayout.jsx';
import ManagerLayout from '../components/ManagerLayout.jsx';
import EventCard from '../components/EventCard.jsx';

export default function SocietyProfile() {
  const { uid } = useParams();
  const { profile } = useAuth();
  const isManager = profile?.role === 'manager';
  const [society, setSociety] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setEvents(eSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  return (
    <Wrap>
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 pt-8 pb-4 text-center bg-fjwuGreen/5 rounded-t-2xl">
            <div className="mx-auto w-28 h-28 rounded-full ring-4 ring-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-100">
              {society?.logo || society?.photoURL ? (
                <img src={society.logo || society.photoURL} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🏛️</span>
              )}
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-2xl font-semibold text-fjwuGreen">{society?.societyName || society?.organizerName || 'Society'}</div>
              <div className="text-sm text-gray-700">{society?.category || 'Category'}</div>
              <div className="text-sm">{society?.description || 'No description'}</div>
            </div>
          </div>
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold mb-3">Events</h2>
            <div className="space-y-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
              {!events.length && (
                <div className="text-sm text-gray-600">No events yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}