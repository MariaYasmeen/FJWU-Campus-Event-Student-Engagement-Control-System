import ManagerLayout from '../components/ManagerLayout.jsx';

export default function ManagerAnalytics() {
  return (
    <ManagerLayout current={'analytics'} onChange={() => {}}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold mb-3">Analytics</h1>
        <div className="text-sm text-gray-700">Event performance insights (coming soon).</div>
      </div>
    </ManagerLayout>
  );
}