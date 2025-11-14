import { useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import EventFeed from '../components/EventFeed.jsx';

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">All Events</h1>
        <input className="input w-64" placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <EventFeed filter={'student_all'} search={search} />
    </AdminLayout>
  );
}