import Navbar from './Navbar.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import AnnouncementsPanel from './AnnouncementsPanel.jsx';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LeftSidebar role="manager" />
      <AnnouncementsPanel />
      <main className="pt-14 pl-64 pr-80 h-screen overflow-y-auto p-6">{children}</main>
    </div>
  );
}