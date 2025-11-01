import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import EventFeed from '../components/EventFeed.jsx';

export default function StudentHome() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={setSearch} />
      <div className="flex flex-1">
        <Sidebar current={filter} onChange={setFilter} />
        <main className="flex-1 p-6">
          <EventFeed filter={filter} search={search} />
        </main>
      </div>
    </div>
  );
}