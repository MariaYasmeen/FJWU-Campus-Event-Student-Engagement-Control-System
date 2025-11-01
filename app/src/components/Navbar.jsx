import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { Bell, Bookmark, User, Search } from 'lucide-react';

export default function Navbar({ onSearch }) {
  const { profile, logout } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-fjwuGreen font-semibold">airelpier</Link>
        <div className="flex-1">
          <input
            className="input"
            placeholder="Search events..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center gap-3 relative">
          <button className="btn btn-secondary" title="Search" onClick={() => navigate('/student/search')}>
            <Search className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary" title="Notifications" onClick={() => setShowNotif((s) => !s)}>
            <Bell className="w-4 h-4" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="p-3 text-sm text-gray-700">No notifications yet.</div>
            </div>
          )}
          <button className="btn btn-secondary" title="Bookmarks" onClick={() => navigate(profile?.role === 'manager' ? '/manager/favourites' : '/student/favourites')}>
            <Bookmark className="w-4 h-4" />
          </button>
          {profile?.role === 'manager' && (
            <button className="btn btn-primary" title="Create Event" onClick={() => navigate('/manager/create-event')}>＋</button>
          )}
          <button className="btn btn-secondary" title="Profile" onClick={() => navigate(profile?.role === 'manager' ? '/manager/profile' : '/student/profile')}>
            <User className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}