import ManagerLayout from '../components/ManagerLayout.jsx';

export default function ManagerAnnouncements() {
  return (
    <ManagerLayout current={'announcements'} onChange={() => {}}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold mb-3">Announcements</h1>
        <div className="text-sm text-gray-700">The announcements panel is fixed on the right.</div>
        <div className="text-sm text-gray-500 mt-2">Add and manage announcements here (coming soon).</div>
      </div>
    </ManagerLayout>
  );
}