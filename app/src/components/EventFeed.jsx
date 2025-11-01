import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from './EventCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventFeed({ filter = 'all', search = '' }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      // Basic search by title contains
      const allSnap = await getDocs(q);
      let rows = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (search) {
        const term = search.toLowerCase();
        rows = rows.filter((e) => (e.title || '').toLowerCase().includes(term) || (e.description || '').toLowerCase().includes(term));
      }

      if (filter === 'manager_events' && user) {
        rows = rows.filter((e) => e.createdBy === user.uid);
      } else if (filter === 'attended') {
        // naive filter: show events where attendeesCount > 0; more accurate would need subcollection check
        rows = rows.filter((e) => e.attendeesCount && e.attendeesCount > 0);
      } else if (filter === 'favorites' && user) {
        // optionally, could fetch favorites subcollection; keeping simple for initial build
      } else if (filter === 'societies') {
        // placeholder for societies listing
      } else if (filter === 'student_all') {
        const now = Date.now();
        rows = rows.filter((e) => {
          const dateMs = e.eventDate?.seconds ? e.eventDate.seconds * 1000 : (e.dateTime ? Date.parse(e.dateTime) : Date.parse(e.startDate || 0));
          const upcoming = dateMs ? dateMs >= now : true;
          const statusOk = (e.status || 'Published').toLowerCase() === 'published';
          const approvalOk = (e.approvalStatus || 'approved') !== 'rejected';
          return upcoming && statusOk && approvalOk;
        });
      }
      setEvents(rows);
      setLoading(false);
    };
    load();
  }, [filter, search, user]);

  if (loading) return <div className="p-4">Loading events...</div>;
  if (!events.length) return <div className="p-4">No events found.</div>;

  return (
    <div className="space-y-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}