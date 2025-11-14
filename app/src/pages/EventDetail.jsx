import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import ManagerLayout from '../panels/manager/ManagerLayout.jsx';
import StudentLayout from '../panels/student/StudentLayout.jsx';
import PostDescription from '../components/PostDescription.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const isManager = profile?.role === 'manager';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'events', id));
        if (!snap.exists()) {
          setError('Event not found');
          setEvent(null);
        } else {
          setEvent({ id, ...snap.data() });
        }
        const cQuery = query(collection(db, 'events', id, 'comments'), orderBy('createdAt', 'desc'));
        const cSnap = await getDocs(cQuery);
        setComments(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setError(e.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addToCalendarUrl = useMemo(() => {
    let startSource = event?.dateTime;
    if (!startSource && event?.eventDate) {
      const base = new Date(event.eventDate?.seconds ? event.eventDate.seconds * 1000 : event.eventDate);
      if (event?.startTime) {
        const [hh, mm] = String(event.startTime).split(':').map(Number);
        base.setHours(hh || 0, mm || 0, 0, 0);
      }
      startSource = base.toISOString();
    }
    if (!startSource) return '#';

    const start = new Date(startSource);
    const pad = (n) => String(n).padStart(2, '0');
    const y = start.getFullYear();
    const m = pad(start.getMonth() + 1);
    const d = pad(start.getDate());
    const hh = pad(start.getHours());
    const mm = pad(start.getMinutes());
    const ss = '00';
    const startStr = `${y}${m}${d}T${hh}${mm}${ss}`;
    const endObj = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ye = endObj.getFullYear();
    const me = pad(endObj.getMonth() + 1);
    const de = pad(endObj.getDate());
    const hhe = pad(endObj.getHours());
    const mme = pad(endObj.getMinutes());
    const endStr = `${ye}${me}${de}T${hhe}${mme}${ss}`;
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: event.title || 'Event',
      details: event.description || '',
      location: event.venue || '',
      dates: `${startStr}/${endStr}`,
    });
    return `${base}&${params.toString()}`;
  }, [event]);

  const rsvp = async () => {
    try {
      await addDoc(collection(db, 'events', id, 'attendees'), {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'events', id), {
        attendeesCount: increment(1),
      });
      // Index in user's registrations for student panel
      await setDoc(doc(db, 'registrations', user.uid, 'events', id), {
        eventId: id,
        eventTitle: event?.title || '',
        eventImage: event?.posterURL || null,
        venue: event?.venue || null,
        campus: event?.campus || null,
        dateTime: event?.dateTime || (event?.eventDate?.seconds ? new Date(event.eventDate.seconds*1000).toISOString() : (event?.eventDate || null)),
        startTime: event?.startTime || null,
        endTime: event?.endTime || null,
        organizerName: event?.organizerName || null,
        createdAt: serverTimestamp(),
      });
      alert('RSVP confirmed!');
    } catch (e) {
      alert(e.message || 'Failed to RSVP');
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await addDoc(collection(db, 'events', id, 'comments'), {
        uid: user.uid,
        text: comment.trim(),
        createdAt: serverTimestamp(),
      });
      // increment aggregated counter on event doc
      try { await updateDoc(doc(db, 'events', id), { commentsCount: increment(1) }); } catch {}
      setComment('');
      const cQuery = query(collection(db, 'events', id, 'comments'), orderBy('createdAt', 'desc'));
      const cSnap = await getDocs(cQuery);
      setComments(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      alert(e.message || 'Failed to comment');
    }
  };

  if (loading) {
    const Wrap = isManager ? ManagerLayout : StudentLayout;
    return (
      <Wrap current={'all'} onChange={() => {}}>
        <div>Loading event...</div>
      </Wrap>
    );
  }

  if (error) {
    const Wrap = isManager ? ManagerLayout : StudentLayout;
    return (
      <Wrap current={'all'} onChange={() => {}}>
        <div className="text-red-600">{error}</div>
      </Wrap>
    );
  }

  if (!event) return null;

  const Wrap = isManager ? ManagerLayout : StudentLayout;
  return (
    <Wrap current={'all'} onChange={() => {}}>
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Post Card */}
        <article className="border border-gray-200 rounded-none shadow-none overflow-hidden">
          {event.posterURL && (
            <div className="w-full">
              <img src={event.posterURL} alt="Poster" className="w-full object-cover" />
            </div>
          )}
          <PostDescription event={event} />
          <div className="p-6">
            <div className="mt-4 flex gap-3">
              <button className="btn btn-primary" onClick={rsvp}>RSVP / Register</button>
              <a href={addToCalendarUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">Add to Calendar</a>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  try {
                    const shareUrl = location.origin + `/events/${id}`;
                    if (navigator.share) {
                      await navigator.share({ title: event?.title || 'Event', url: shareUrl });
                    } else {
                      await navigator.clipboard.writeText(shareUrl);
                      alert('Event link copied to clipboard');
                    }
                  } finally {
                    try { await updateDoc(doc(db, 'events', id), { sharesCount: increment(1) }); } catch {}
                  }
                }}
              >Share</button>
              <a href={`mailto:${event.organizerEmail || ''}`} className="btn btn-secondary">Contact Organizer</a>
            </div>
          </div>
        </article>

        {/* Comments Card */}
        <section className="border border-gray-200 rounded-none shadow-none p-6">
          <h2 className="text-lg font-semibold text-fjwuGreen mb-2">Comments</h2>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary">Post</button>
          </form>
          <div className="mt-3 space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="border border-gray-200 p-2">
                <div className="text-sm">{c.text}</div>
                <div className="text-xs text-gray-500">by {c.uid}</div>
              </div>
            ))}
            {!comments.length && <div className="text-sm text-gray-600">No comments yet.</div>}
          </div>
        </section>
      </div>
    </Wrap>
  );
}
