import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, serverTimestamp, updateDoc, increment, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const loadCounts = async () => {
      // Prefer persisted likesCount on event doc; fallback to counting subcollection
      let initialLikes = typeof event.likesCount === 'number' ? event.likesCount : null;
      if (initialLikes == null) {
        const likesCol = collection(db, 'events', event.id, 'likes');
        const likesSnap = await getDocs(likesCol);
        initialLikes = likesSnap.size;
      }
      setLikesCount(initialLikes || 0);

      const myLike = await getDoc(doc(db, 'events', event.id, 'likes', user.uid));
      setLiked(myLike.exists());

      const myFav = await getDoc(doc(db, 'favourites', user.uid, 'savedPosts', event.id));
      setSaved(myFav.exists());
    };
    if (user) loadCounts();
  }, [user, event.id, event.likesCount]);

  const toggleLike = async () => {
    const likeRef = doc(db, 'events', event.id, 'likes', user.uid);
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      await deleteDoc(likeRef);
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
      try { await updateDoc(doc(db, 'events', event.id), { likesCount: increment(-1) }); } catch {}
    } else {
      await setDoc(likeRef, { uid: user.uid });
      setLiked(true);
      setLikesCount((c) => c + 1);
      try { await updateDoc(doc(db, 'events', event.id), { likesCount: increment(1) }); } catch {}
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

  const register = async () => {
    if (!user) return;
    setRegistering(true);
    setToast('');
    try {
      await addDoc(collection(db, 'events', event.id, 'attendees'), { uid: user.uid, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'events', event.id), { attendeesCount: increment(1) });
      const dateIso = event.dateTime || (event.eventDate?.seconds ? new Date(event.eventDate.seconds*1000).toISOString() : (event.eventDate || null));
      await setDoc(doc(db, 'registrations', user.uid, 'events', event.id), {
        eventId: event.id,
        eventTitle: event.title || '',
        eventImage: event.posterURL || null,
        venue: event.venue || null,
        campus: event.campus || null,
        dateTime: dateIso,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        organizerName: event.organizerName || null,
        createdAt: serverTimestamp(),
      });
      setToast('Registered successfully');
      setTimeout(() => setToast(''), 2000);
    } catch (e) {
      setToast(e.message || 'Failed to register');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setRegistering(false);
    }
  };

  const dateStr = event.dateTime
    ? new Date(event.dateTime).toLocaleString()
    : (event.eventDate?.seconds
      ? new Date(event.eventDate.seconds * 1000).toLocaleString()
      : (event.eventDate ? new Date(event.eventDate).toLocaleString() : ''));

  return (
    <article className="max-w-md mx-auto border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
      {event.posterURL && (
        <img src={event.posterURL} alt="Poster" className="w-full object-cover" />
      )}
      {/* Interaction bar below image */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-4 text-sm">
          <button className={`flex items-center gap-1 hover:text-fjwuGreen ${liked ? 'text-fjwuGreen' : 'text-gray-700'}`} onClick={toggleLike} title="Like">
            <Heart className={`w-4 h-4 ${liked ? 'fill-fjwuGreen text-fjwuGreen' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <button className="text-gray-700 hover:text-fjwuGreen" title="Comment" onClick={() => navigate(`/events/${event.id}`)}>
            <MessageCircle className="w-4 h-4" />
          </button>
          <div className="relative">
            <button className="text-gray-700 hover:text-fjwuGreen" title="Share" onClick={() => setShowShare((s) => !s)}>
              <Share2 className="w-4 h-4" />
            </button>
            {showShare && (
              <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => { navigator.clipboard.writeText(location.origin + `/events/${event.id}`); setShowShare(false); }}
                >Copy Event Link</button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: location.origin + `/events/${event.id}` }); setShowShare(false); }}
                >Share via…</button>
              </div>
            )}
          </div>
          <button className={`text-gray-700 hover:text-fjwuGreen ${saved ? 'text-fjwuGreen' : ''}`} title="Save" onClick={toggleSave}>
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-fjwuGreen text-fjwuGreen' : ''}`} />
          </button>
          <button className="ml-auto btn btn-primary" disabled={registering} onClick={register}>{registering ? 'Registering…' : 'Register'}</button>
        </div>
      </div>
      {/* Title and description */}
      <div className="px-4 pb-4">
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-fjwuGreen">{event.title}</h3>
            <p className="text-sm text-gray-700 mt-1">{event.description?.slice(0, 160)}{event.description?.length > 160 ? '…' : ''}</p>
            <div className="text-xs text-gray-500 mt-1">{dateStr}</div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate(`/events/${event.id}`)}>Open</button>
        </div>
        {toast && <div className="mt-2 text-sm text-green-700">{toast}</div>}
      </div>
    </article>
  );
}