import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentSidebar() {
  const { logout } = useAuth();
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="p-4">
        <ul className="space-y-2">
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student">🏠 Dashboard / Home</Link></li>
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student/events">🎉 All Events</Link></li>
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student/favourites">⭐ Saved Events</Link></li>
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student/registrations">🗓️ My Registrations</Link></li>
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student/community">💬 Community</Link></li>
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student/profile">👤 Profile</Link></li>
          <li><Link className="block px-3 py-2 rounded-md hover:bg-gray-50" to="/student/settings">⚙️ Settings</Link></li>
        </ul>
      </div>
      <div className="p-4 border-t text-sm">
        <button className="btn btn-secondary w-full" onClick={logout}>🚪 Logout</button>
      </div>
    </aside>
  );
}