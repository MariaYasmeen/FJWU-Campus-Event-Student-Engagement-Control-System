import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import ManagerLayout from '../components/ManagerLayout.jsx';
import EventCard from '../components/EventCard.jsx';

export default function Favourites() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const base = collection(db, 'favourites', user.uid, 'savedPosts');
      const q = query(base);
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Map saved post snapshot to EventCard-friendly shape
      const events = docs.map((d) => ({
        id: d.eventId || d.id,
        title: d.eventTitle,
        posterURL: d.eventImage,
        venue: d.venue,
        campus: d.campus,
        dateTime: d.dateTime,
        startTime: d.startTime,
        endTime: d.endTime,
        organizerName: d.organizerName,
      }));
      setItems(events);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <ManagerLayout current={'favorites'} onChange={() => {}}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Saved Posts</h1>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {!items.length && (
              <div className="text-sm text-gray-600">No saved posts yet.</div>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}