import { SimplePage } from '@shared/components/SimplePage';
import { SystemDashboard } from './SystemDashboard';

export function DashboardPage() {
  return (
    <SimplePage
      title="Системный дашборд"
      contentComponent={<SystemDashboard />}
    />
  );
}
