import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import StudentLayout from '../components/StudentLayout.jsx';
import EventCard from '../components/EventCard.jsx';

export default function StudentSearch() {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState('Upcoming');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [location, setLocation] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggle = (arr, setter, val) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      // Apply Firestore-side filters where feasible
      if (selectedTypes.length === 1) {
        q = query(q, where('eventType', '==', selectedTypes[0]));
      }
      if (selectedCategories.length === 1) {
        q = query(q, where('eventCategory', '==', selectedCategories[0]));
      }
      // Status: Published only
      q = query(q, where('status', '==', 'Published'));

      const snap = await getDocs(q);
      let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Client-side filters for multi-selects and ranges
      if (selectedDepartments.length) {
        rows = rows.filter((e) => selectedDepartments.includes(e.organizerDepartment));
      }
      if (selectedTypes.length > 1) {
        rows = rows.filter((e) => selectedTypes.includes(e.eventType));
      }
      if (selectedCategories.length > 1) {
        rows = rows.filter((e) => selectedCategories.includes(e.eventCategory));
      }
      if (location) {
        const term = location.toLowerCase();
        rows = rows.filter((e) => (e.venue || '').toLowerCase().includes(term) || (e.campus || '').toLowerCase().includes(term));
      }
      const toMs = toDate ? Date.parse(toDate) : null;
      const fromMs = fromDate ? Date.parse(fromDate) : null;
      rows = rows.filter((e) => {
        const dateMs = e.eventDate?.seconds ? e.eventDate.seconds * 1000 : (e.dateTime ? Date.parse(e.dateTime) : null);
        if (fromMs && dateMs && dateMs < fromMs) return false;
        if (toMs && dateMs && dateMs > toMs) return false;
        const now = Date.now();
        const isUpcoming = dateMs ? dateMs > now : true;
        const isPast = dateMs ? dateMs < now : false;
        if (status === 'Upcoming') return isUpcoming;
        if (status === 'Past') return isPast;
        return true; // Ongoing/All fallback
      });

      setEvents(rows);
      setLoading(false);
    };
    load();
  }, [selectedDepartments, selectedTypes, selectedCategories, status, fromDate, toDate, location]);

  const cats = ['Seminar', 'Workshop', 'Sports', 'Cultural', 'Academic', 'Competition'];
  const types = ['Online', 'Offline', 'Hybrid'];
  const depts = ['Computer Science', 'Economics', 'Literature', 'Business', 'Mathematics'];

  return (
    <StudentLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <aside className="bg-white rounded-lg border border-gray-200 p-4 lg:col-span-1">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Department</h3>
              <div className="mt-2 space-y-1">
                {depts.map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedDepartments.includes(d)} onChange={() => toggle(selectedDepartments, setSelectedDepartments, d)} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Event Type</h3>
              <div className="mt-2 space-y-1">
                {types.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggle(selectedTypes, setSelectedTypes, t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Category</h3>
              <div className="mt-2 space-y-1">
                {cats.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedCategories.includes(c)} onChange={() => toggle(selectedCategories, setSelectedCategories, c)} />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Date Range</h3>
              <div className="mt-2 flex items-center gap-2">
                <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <span className="text-sm">to</span>
                <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Location</h3>
              <input className="input mt-2" placeholder="Campus or Venue" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Status</h3>
              <select className="input mt-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Past</option>
                <option>All</option>
              </select>
            </div>
          </div>
        </aside>
        <main className="lg:col-span-3">
          <h1 className="text-xl font-semibold mb-3">Search & Filter</h1>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
              {!events.length && <div className="text-sm text-gray-600">No events match your filters.</div>}
            </div>
          )}
        </main>
      </div>
    </StudentLayout>
  );
}