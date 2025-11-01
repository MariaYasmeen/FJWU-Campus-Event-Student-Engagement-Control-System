import ManagerLayout from '../components/ManagerLayout.jsx';

export default function ManagerSettings() {
  return (
    <ManagerLayout current={'settings'} onChange={() => {}}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold mb-3">Settings</h1>
        <ul className="space-y-2 text-sm">
          <li>Notification preferences (coming soon)</li>
          <li>Theme (light/dark) (coming soon)</li>
          <li>Team members (coming soon)</li>
        </ul>
      </div>
    </ManagerLayout>
  );
}