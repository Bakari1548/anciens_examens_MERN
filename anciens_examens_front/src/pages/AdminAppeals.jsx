import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import RequestsManagement from '../app/admin/components/RequestsManagement';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminAppealsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <RequestsManagement />
      </AdminLayout>
    </AdminProvider>
  );
}
