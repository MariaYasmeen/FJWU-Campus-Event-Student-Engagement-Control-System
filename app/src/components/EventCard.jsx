import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, serverTimestamp, updateDoc, increment, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical } from 'lucide-react';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState('');
  const [organizerLogo, setOrganizerLogo] = useState('');
  const [showManagerMenu, setShowManagerMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const organizerId = event.organizerId || event.createdBy || null;
  const organizerName = event.organizerName || '';

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

  useEffect(() => {
    const loadOrganizer = async () => {
      if (!organizerId) return;
      try {
        const snap = await getDoc(doc(db, 'users', organizerId));
        if (snap.exists()) {
          const data = snap.data();
          setOrganizerLogo(data.logo || data.photoURL || '');
        }
      } catch {}
    };
    loadOrganizer();
  }, [organizerId]);

  const toggleLike = async (e) => {
    e?.stopPropagation?.();
    if (!user) return;
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
    // Ensure sync with Firestore after toggle
    try {
      const evSnap = await getDoc(doc(db, 'events', event.id));
      if (evSnap.exists()) {
        const val = evSnap.data().likesCount;
        if (typeof val === 'number') setLikesCount(val);
      }
    } catch {}
  };

  const toggleSave = async (e) => {
    e?.stopPropagation?.();
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

  const createdMs = (event.createdAt?.seconds ? event.createdAt.seconds * 1000 : (event.createdAt ? Date.parse(event.createdAt) : null))
    || (event.dateTime ? Date.parse(event.dateTime) : null)
    || (event.eventDate?.seconds ? event.eventDate.seconds * 1000 : (event.eventDate ? Date.parse(event.eventDate) : null));
  const postedAgo = (() => {
    if (!createdMs) return '';
    const diff = Date.now() - createdMs;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  })();

  const canManage = profile?.role === 'manager' && user?.uid && (event.createdBy === user.uid);

  const handleDelete = async (e) => {
    e?.stopPropagation?.();
    if (!canManage) return;
    const ok = confirm('Are you sure you want to delete this post?');
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'events', event.id));
      setDeleted(true);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleEdit = (e) => {
    e?.stopPropagation?.();
    if (!canManage) return;
    navigate(`/manager/events/${event.id}/edit`);
  };

  return (
    deleted ? null : (
    <article
      className="max-w-md mx-auto border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Header row: organizer left, manager menu right */}
      <div className="px-4 pt-3 flex items-center justify-between">
        {(organizerId || organizerName) && (
          <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); if (organizerId) navigate(`/society/${organizerId}`); }}>
            {organizerLogo ? (
              <img src={organizerLogo} alt="Logo" className="w-6 h-6 rounded-full border border-gray-200" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">🏛️</div>
            )}
            <button className="text-sm text-fjwuGreen hover:underline" onClick={(e) => { e.stopPropagation(); if (organizerId) navigate(`/society/${organizerId}`); }}>
              {organizerName || 'Society'}
            </button>
          </div>
        )}
        {canManage && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button className="text-gray-700 hover:text-fjwuGreen" onClick={() => setShowManagerMenu((s) => !s)} title="Manage">
              <MoreVertical className="w-4 h-4" />
            </button>
            {showManagerMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={handleEdit}>Edit Post</button>
                <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={handleDelete}>Delete Post</button>
              </div>
            )}
          </div>
        )}
      </div>
      {event.posterURL && (
        <img src={event.posterURL} alt="Poster" className="w-full object-cover" />
      )}
      {/* Interaction bar below image */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-around text-sm w-full">
          <button className={`flex items-center gap-1 hover:text-fjwuGreen ${liked ? 'text-fjwuGreen' : 'text-gray-700'}`} onClick={(e) => toggleLike(e)} title="Like">
            <Heart className={`w-4 h-4 ${liked ? 'fill-fjwuGreen text-fjwuGreen' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <button className="text-gray-700 hover:text-fjwuGreen" title="Comment" onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}>
            <MessageCircle className="w-4 h-4" />
          </button>
          <div className="relative">
            <button className="text-gray-700 hover:text-fjwuGreen" title="Share" onClick={(e) => { e.stopPropagation(); setShowShare((s) => !s); }}>
              <Share2 className="w-4 h-4" />
            </button>
            {showShare && (
              <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg" onClick={(e) => e.stopPropagation()}>
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
          <button className={`text-gray-700 hover:text-fjwuGreen ${saved ? 'text-fjwuGreen' : ''}`} title="Save" onClick={(e) => toggleSave(e)}>
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-fjwuGreen text-fjwuGreen' : ''}`} />
          </button>
        </div>
      </div>
      {/* Title and description */}
      <div className="px-4 pb-4">
        <div className="mt-2">
          <h3 className="text-base font-semibold text-fjwuGreen">{event.title}</h3>
          <p className="text-sm text-gray-700 mt-1">{event.description?.slice(0, 160)}{event.description?.length > 160 ? '…' : ''}</p>
          <div className="text-xs text-gray-500 mt-1">{dateStr}</div>
          {postedAgo && <div className="text-xs text-gray-500 mt-1">{postedAgo}</div>}
        </div>
        {toast && <div className="mt-2 text-sm text-green-700">{toast}</div>}
      </div>
    </article>
    )
  );
}