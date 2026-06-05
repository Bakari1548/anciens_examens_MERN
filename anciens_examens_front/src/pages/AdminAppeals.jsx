import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import AppealsManagement from '../app/admin/components/AppealsManagement';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminAppealsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <AppealsManagement />
      </AdminLayout>
    </AdminProvider>
  );
}
