import StudentLayout from '../components/StudentLayout.jsx';
import EventFeed from '../components/EventFeed.jsx';
import { useState } from 'react';

export default function StudentEvents() {
  const [search, setSearch] = useState('');
  return (
    <StudentLayout>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">All Events</h1>
        <input className="input w-64" placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <EventFeed filter={'student_all'} search={search} />
    </StudentLayout>
  );
}