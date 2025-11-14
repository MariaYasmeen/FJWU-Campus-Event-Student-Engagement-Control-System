import Navbar from '../../components/Navbar.jsx';
import LeftSidebar from '../../components/LeftSidebar.jsx';
import AnnouncementsPanel from '../../components/AnnouncementsPanel.jsx';

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <LeftSidebar role="student" />
      <AnnouncementsPanel />
      <main className="pt-14 pl-64 pr-80 h-screen overflow-y-auto p-6 text-gray-900 dark:text-gray-100">{children}</main>
    </div>
  );
}