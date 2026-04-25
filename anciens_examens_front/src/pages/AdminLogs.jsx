import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import LogsPanel from '../app/admin/components/Logs/LogsPanel';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminLogsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <LogsPanel />
      </AdminLayout>
    </AdminProvider>
  );
}
