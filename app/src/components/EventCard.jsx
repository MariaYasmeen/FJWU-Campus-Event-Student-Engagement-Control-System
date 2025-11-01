import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      const likesCol = collection(db, 'events', event.id, 'likes');
      const likesSnap = await getDocs(likesCol);
      setLikesCount(likesSnap.size);

      const myLike = await getDoc(doc(db, 'events', event.id, 'likes', user.uid));
      setLiked(myLike.exists());

      const myFav = await getDoc(doc(db, 'favourites', user.uid, 'savedPosts', event.id));
      setSaved(myFav.exists());
    };
    if (user) loadCounts();
  }, [user, event.id]);

  const toggleLike = async () => {
    const likeRef = doc(db, 'events', event.id, 'likes', user.uid);
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      await deleteDoc(likeRef);
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      await setDoc(likeRef, { uid: user.uid });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const toggleSave = async () => {
    const favRef = doc(db, 'favourites', user.uid, 'savedPosts', event.id);
    const snap = await getDoc(favRef);
    if (snap.exists()) {
      await deleteDoc(favRef);
      setSaved(false);
    } else {
      const dateIso = event.dateTime || (event.eventDate?.seconds ? new Date(event.eventDate.seconds*1000).toISOString() : (event.eventDate || null));
      await setDoc(favRef, {
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.posterURL || null,
        venue: event.venue || null,
        campus: event.campus || null,
        dateTime: dateIso,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        organizerName: event.organizerName || null,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    }
  };

  const dateStr = event.eventDate?.seconds
    ? new Date(event.eventDate.seconds * 1000).toLocaleDateString()
    : (event.eventDate ? new Date(event.eventDate).toLocaleDateString() : (event.dateTime ? new Date(event.dateTime).toLocaleString() : ''));

  return (
    <article className="border border-gray-200 rounded-none shadow-none overflow-hidden">
      {event.posterURL && (
        <img src={event.posterURL} alt="Poster" className="w-full object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-fjwuGreen">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.description?.slice(0, 140)}{event.description?.length > 140 ? '…' : ''}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate(`/events/${event.id}`)}>Open</button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="font-medium">Date:</span> {dateStr || '—'}</div>
          <div><span className="font-medium">Time:</span> {event.startTime || '—'}{event.endTime ? ` – ${event.endTime}` : ''}</div>
          <div><span className="font-medium">Venue:</span> {event.venue || '—'}</div>
          <div><span className="font-medium">Organizer:</span> {event.organizerName || '—'}</div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <button className={`btn ${liked ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleLike}>Like ({likesCount})</button>
          <button className="btn btn-secondary" title="Comment">Comment</button>
          <button className="btn btn-secondary" onClick={() => navigator.share ? navigator.share({ title: event.title, url: location.origin + `/events/${event.id}` }) : navigator.clipboard.writeText(location.origin + `/events/${event.id}`)}>Share</button>
          <button className={`btn ${saved ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleSave}>{saved ? 'Saved' : 'Save'}</button>
        </div>
      </div>
    </article>
  );
}