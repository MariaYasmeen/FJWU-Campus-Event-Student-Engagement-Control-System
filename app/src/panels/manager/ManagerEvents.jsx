import { useState } from 'react';
import ManagerLayout from './ManagerLayout.jsx';
import EventFeed from '../../components/EventFeed.jsx';

export default function ManagerEvents() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('upcoming');
  return (
    <ManagerLayout current={'all_events'} onChange={() => {}}>
        <div className="flex items-center justify-between mb-3">
         </div>
      <div className="mb-4 flex items-center gap-2">
        <button
          className={`px-3 py-1 border rounded-none ${tab==='upcoming'?'bg-fjwuGreen text-white border-fjwuGreen':'bg-white text-gray-700 border-gray-300'}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button
          className={`px-3 py-1 border rounded-none ${tab==='past'?'bg-fjwuGreen text-white border-fjwuGreen':'bg-white text-gray-700 border-gray-300'}`}
          onClick={() => setTab('past')}
        >
          Past Events
        </button>
      </div>
      <EventFeed filter={tab==='upcoming' ? 'manager_upcoming' : 'manager_past'} search={search} />
    </ManagerLayout>
  );
}