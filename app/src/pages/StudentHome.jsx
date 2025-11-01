import { useState } from 'react';
import EventFeed from '../components/EventFeed.jsx';
import StudentLayout from '../components/StudentLayout.jsx';

export default function StudentHome() {
  const [search, setSearch] = useState('');
  return (
    <StudentLayout>
      <div>
        <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
        <EventFeed filter={'student_all'} search={search} />
      </div>
    </StudentLayout>
  );
}