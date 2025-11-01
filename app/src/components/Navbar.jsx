import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

export default function Navbar({ onSearch }) {
  const { profile, logout } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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
        <div className="flex items-center gap-3">
          {/* Icons simplified as letters for minimal build */}
          <button className="btn btn-secondary" title="Notifications">🔔</button>
          <button className="btn btn-secondary" title="Bookmarks" onClick={() => navigate(profile?.role === 'manager' ? '/manager/favourites' : '/student/favourites')}>🔖</button>
          {profile?.role === 'manager' && (
            <button className="btn btn-primary" title="Create Event" onClick={() => navigate('/manager/create-event')}>＋</button>
          )}
          <button className="btn btn-secondary" title="Profile" onClick={() => navigate(profile?.role === 'manager' ? '/manager/profile' : '/student')}>👤</button>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}