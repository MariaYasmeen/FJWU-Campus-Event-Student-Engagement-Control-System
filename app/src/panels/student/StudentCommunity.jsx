import StudentLayout from './StudentLayout.jsx';

export default function StudentCommunity() {
  return (
    <StudentLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold mb-3">Community / Discussions</h1>
        <div className="text-sm text-gray-700">This section will host discussions and feedback on events.</div>
        <div className="text-sm text-gray-500 mt-2">(Optional feature — coming soon)</div>
      </div>
    </StudentLayout>
  );
}