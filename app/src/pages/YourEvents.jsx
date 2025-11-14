import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout.jsx';

export default function YourEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all'); // all | upcoming | past | drafts
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.createdBy === user.uid);
      const now = Date.now();
      let filtered = all;
      if (filter === 'upcoming') filtered = all.filter((e) => (e.startDate?.seconds ? e.startDate.seconds * 1000 : Date.parse(e.dateTime || 0)) > now);
      if (filter === 'past') filtered = all.filter((e) => (e.startDate?.seconds ? e.startDate.seconds * 1000 : Date.parse(e.dateTime || 0)) <= now);
      if (filter === 'drafts') filtered = all.filter((e) => (e.status || '').toLowerCase() === 'draft');
      setRows(filtered);
      setLoading(false);
    };
    load();
  }, [user, filter]);

  const onDelete = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'events', id));
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <ManagerLayout current={'manager_events'} onChange={() => {}}>
      <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Your Events</h1>
        <button className="btn btn-primary" onClick={() => navigate('/manager/create-event')}>Create Event</button>
      </div>
      <div className="flex gap-2 mb-3">
        {['all','upcoming','past','drafts'].map((k) => (
          <button key={k} className={`btn ${filter===k?'btn-primary':'btn-secondary'}`} onClick={() => setFilter(k)}>{k[0].toUpperCase()+k.slice(1)}</button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-2">{e.title}</td>
                  <td className="px-4 py-2">{e.startDate?.seconds ? new Date(e.startDate.seconds*1000).toLocaleString() : e.dateTime}</td>
                  <td className="px-4 py-2">{e.status || 'Published'}</td>
                  <td className="px-4 py-2 relative">
                    <KebabMenu
                      onView={() => navigate(`/events/${e.id}`)}
                      onEdit={() => navigate(`/manager/events/${e.id}/edit`)}
                      onDelete={() => onDelete(e.id)}
                    />
                  </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </ManagerLayout>
  );
}

function KebabMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="inline-block text-left">
      <button
        className="w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-4 mt-2 w-36 origin-top-right rounded-xl bg-white shadow-md border border-gray-200 transition-all">
          <div className="py-2 text-sm">
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); onView(); }}>View</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); onEdit(); }}>Edit</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600" onClick={() => { setOpen(false); onDelete(); }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}