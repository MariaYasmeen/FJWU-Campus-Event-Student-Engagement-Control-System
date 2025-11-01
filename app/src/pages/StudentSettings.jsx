import StudentLayout from '../components/StudentLayout.jsx';

export default function StudentSettings() {
  return (
    <StudentLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold mb-3">Settings</h1>
        <ul className="space-y-2 text-sm">
          <li>Notification preferences (coming soon)</li>
          <li>Theme (light/dark) (coming soon)</li>
          <li>Password management (coming soon)</li>
        </ul>
      </div>
    </StudentLayout>
  );
}