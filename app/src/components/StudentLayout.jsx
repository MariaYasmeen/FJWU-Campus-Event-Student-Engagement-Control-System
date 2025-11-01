import Navbar from './Navbar.jsx';
import StudentSidebar from './StudentSidebar.jsx';

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}