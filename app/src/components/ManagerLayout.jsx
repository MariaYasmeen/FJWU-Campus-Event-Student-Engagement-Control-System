import Navbar from './Navbar.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import AnnouncementsPanel from './AnnouncementsPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ManagerLayout({ children, current = 'all', onChange }) {
  const { profile } = useAuth();
  const isManager = profile?.role === 'manager';
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={onChange && ((q) => onChange('search:' + q))} />
      <LeftSidebar
        role={isManager ? 'manager' : 'student'}
        managerProfileComplete={!!profile?.profileComplete}
        current={current}
        onChange={onChange}
      />
      <AnnouncementsPanel />
      <main className="pt-14 pl-64 pr-80 h-screen overflow-y-auto p-6">{children}</main>
    </div>
  );
}