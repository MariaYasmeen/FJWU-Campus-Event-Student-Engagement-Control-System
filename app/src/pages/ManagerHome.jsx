import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import EventFeed from '../components/EventFeed.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export default function ManagerHome() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalRsvps: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (profile && profile.role === 'manager' && !profile.profileComplete) {
      // Prompt to create profile
    }
  }, [profile]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.createdBy === user.uid);

      const totalEvents = rows.length;
      const now = Date.now();
      const upcomingEvents = rows.filter((e) => {
        if (e.startDate?.seconds) return e.startDate.seconds * 1000 > now && e.status !== 'Cancelled';
        if (e.dateTime) return Date.parse(e.dateTime) > now && e.status !== 'Cancelled';
        return false;
      }).length;
      const totalRsvps = rows.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);
      setStats({ totalEvents, upcomingEvents, totalRsvps });

      setRecent(rows.slice(0, 5));
    };
    loadStats();
  }, [user]);

  const handleSidebarChange = (key) => {
    if (key === 'manager_profile') return navigate('/manager/profile');
    if (key === 'create_event') {
      if (!profile?.profileComplete) {
        alert('Please create your society profile before creating events.');
        return;
      }
      return navigate('/manager/create-event');
    }
    if (key === 'manager_events') return setFilter('manager_events');
    if (key === 'analytics') return navigate('/manager/analytics');
    if (key === 'announcements') return navigate('/manager/announcements');
    if (key === 'settings') return navigate('/manager/settings');
    setFilter(key);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={setSearch} />
      <div className="flex items-center justify-between px-6 pt-3">
        {!profile?.profileComplete ? (
          <button className="btn btn-primary" onClick={() => navigate('/manager/profile')}>Start Creating Your Society Profile</button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary"
            disabled={!profile?.profileComplete}
            title={!profile?.profileComplete ? 'Please create your society profile before creating events.' : ''}
            onClick={() => navigate('/manager/create-event')}
          >
            Create New Event
          </button>
          {!profile?.profileComplete && (
            <div className="text-sm text-gray-600">Please create your society profile before creating events.</div>
          )}
        </div>
      </div>
      <div className="flex flex-1">
        <Sidebar role="manager" managerProfileComplete={!!profile?.profileComplete} current={filter} onChange={handleSidebarChange} />
        <main className="flex-1 p-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total Events Created</div>
              <div className="mt-1 text-2xl font-semibold text-fjwuGreen">{stats.totalEvents}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Upcoming Events</div>
              <div className="mt-1 text-2xl font-semibold text-fjwuGreen">{stats.upcomingEvents}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total RSVPs</div>
              <div className="mt-1 text-2xl font-semibold text-fjwuGreen">{stats.totalRsvps}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <button className="btn btn-secondary" onClick={() => setFilter('manager_events')}>View All</button>
              </div>
              <ul className="mt-3 space-y-2">
                {recent.map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-gray-600">{e.status || 'Published'} · {new Date(e.createdAt?.seconds ? e.createdAt.seconds * 1000 : Date.parse(e.createdAt || e.dateTime || Date.now())).toLocaleString()}</div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate(`/events/${e.id}`)}>Open</button>
                  </li>
                ))}
                {!recent.length && <li className="text-sm text-gray-600">No recent events</li>}
              </ul>
            </div>
            <div className="card p-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>New RSVPs and comments will appear here.</li>
                <li className="text-gray-500">(Coming soon: per-event updates)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Your Events</h3>
            <EventFeed filter={'manager_events'} search={search} />
          </div>
        </main>
      </div>
    </div>
  );
}