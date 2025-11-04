import { Link } from 'react-router-dom';

export default function Sidebar({ role = 'student', managerProfileComplete = true }) {
  const studentLinks = [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/events', label: 'Events' },
    { to: '/student/societies', label: 'All Societies' },
    { to: '/student/favourites', label: 'Favourites' },
    { to: '/student/registrations', label: 'My Registrations' },
    { to: '/student/community', label: 'Community' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/settings', label: 'Settings' },
  ];

  const managerLinks = [
    { to: '/manager', label: 'Dashboard' },
    { to: '/manager/your-events', label: 'Your Events' },
    { to: '/manager/create-event', label: 'Create Event' },
    { to: '/manager/favourites', label: 'Favourites' },
    { to: '/manager/analytics', label: 'Analytics' },
    { to: '/manager/announcements', label: 'Announcements' },
    { to: '/manager/settings', label: 'Settings' },
    { to: '/manager/profile', label: 'Your Profile' },
  ];

  const links = role === 'manager' ? managerLinks : studentLinks;

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-64 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block w-full px-3 py-2 rounded-md hover:bg-gray-50"
              >
                {l.label}
                {l.to === '/manager/profile' && role === 'manager' && !managerProfileComplete && (
                  <span className="ml-2 text-xs text-red-600">(complete)</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}