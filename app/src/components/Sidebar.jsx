import { Link } from 'react-router-dom';

export default function Sidebar({ current, onChange, role = 'student', managerProfileComplete = true }) {
  const baseItems = [
    { key: 'all', label: 'All Events' },
    { key: 'societies', label: 'All Societies' },
    { key: 'attended', label: 'My Attended Events' },
    { key: 'favorites', label: 'My Favorites' },
  ];
  const managerItems = [
    { key: 'manager_profile', label: 'Your Profile' },
    { key: 'manager_events', label: 'Your Events' },
    { key: 'create_event', label: 'Create Event' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'settings', label: 'Settings' },
  ];

  const items = role === 'manager' ? [...baseItems, ...managerItems] : baseItems;

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="p-4">
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.key}>
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${current === it.key ? 'bg-gray-100 text-fjwuGreen' : 'hover:bg-gray-50'}`}
                onClick={() => onChange?.(it.key)}
              >
                {it.label}
                {it.key === 'manager_profile' && !managerProfileComplete && (
                  <span className="ml-2 text-xs text-red-600">(complete)</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 text-xs text-gray-500">
        <Link to="/manager/create-event" className="underline">Create Event</Link> (managers)
      </div>
    </aside>
  );
}