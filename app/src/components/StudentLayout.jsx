import Navbar from './Navbar.jsx';
import LeftSidebar from './LeftSidebar.jsx';

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LeftSidebar role="student" />
      <main className="pt-14 pl-64 h-screen overflow-y-auto p-6">{children}</main>
    </div>
  );
}