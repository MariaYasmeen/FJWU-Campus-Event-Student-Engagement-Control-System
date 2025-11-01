export default function AnnouncementsPanel() {
  return (
    <aside className="fixed top-14 right-0 bottom-0 w-80 border-l border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Announcements</h3>
        <div className="mt-2 text-sm text-gray-700">No announcements yet.</div>
        <div className="mt-2 text-sm text-gray-500">(Coming soon)</div>
      </div>
    </aside>
  );
}