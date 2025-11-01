import { useState } from 'react';
import EventFeed from '../components/EventFeed.jsx';
import StudentLayout from '../components/StudentLayout.jsx';

export default function StudentHome() {
  const [search, setSearch] = useState('');
  return (
    <StudentLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
          <EventFeed filter={'student_all'} search={search} />
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold">Announcements</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li>No announcements yet.</li>
          </ul>
          <div className="mt-3 text-sm text-gray-500">(Coming soon)</div>
        </div>
      </div>
    </StudentLayout>
  );
}