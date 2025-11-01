import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ManagerLayout({ children, current = 'all', onChange }) {
  const { profile } = useAuth();
  const isManager = profile?.role === 'manager';
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={onChange && ((q) => onChange('search:' + q))} />
      <div className="flex flex-1">
        <Sidebar
          role={isManager ? 'manager' : 'student'}
          managerProfileComplete={!!profile?.profileComplete}
          current={current}
          onChange={onChange}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}