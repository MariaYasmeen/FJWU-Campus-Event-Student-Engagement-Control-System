import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout.jsx';

export default function StudentSocieties() {
  const [societies, setSocieties] = useState([]);
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
        setSocieties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setError(e.message || 'Failed to load societies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-semibold mb-4">All Societies</h1>
        {loading && <div>Loading societies…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !societies.length && (
          <div className="text-sm text-gray-600">No societies found.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {societies.map((s) => (
            <div
              key={s.id}
              className="card cursor-pointer text-center p-4 hover:shadow-md"
              onClick={() => navigate(`/society/${s.id}`)}
            >
              <div className="mx-auto w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {s.logo ? (
                  <img src={s.logo} alt={s.societyName || s.organizerName || 'Society'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🏛️</span>
                )}
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold text-fjwuGreen">{s.societyName || s.organizerName || 'Unnamed Society'}</div>
                <div className="text-xs text-gray-600">{s.description || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}