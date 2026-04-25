import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import NotificationsPanel from '../app/admin/components/Notifications/NotificationsPanel';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminNotificationsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <NotificationsPanel />
      </AdminLayout>
    </AdminProvider>
  );
}
