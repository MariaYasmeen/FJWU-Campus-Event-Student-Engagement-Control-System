import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ManagerLayout from '../components/ManagerLayout.jsx';
import { useNavigate } from 'react-router-dom';

export default function ManagerSocieties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'manager'));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
      } catch (e) {
        setError(e.message || 'Failed to load societies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ManagerLayout current={'societies'} onChange={() => {}}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-semibold mb-3">All Societies</h1>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading societies…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((s) => (
              <button
                key={s.id}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-sm"
                onClick={() => navigate(`/society/${s.id}`)}
              >
                <div className="mx-auto w-24 h-24 rounded-full ring-4 ring-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-100">
                  {s.logo ? (
                    <img src={s.logo} alt={s.societyName || s.organizerName || s.name || 'Society'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🏛️</span>
                  )}
                </div>
                <div className="mt-3 text-fjwuGreen font-medium">
                  {s.societyName || s.organizerName || s.name || 'Unnamed Society'}
                </div>
                <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {s.description || 'No description provided.'}
                </div>
              </button>
            ))}
            {!items.length && (
              <div className="text-sm text-gray-600">No societies found.</div>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}