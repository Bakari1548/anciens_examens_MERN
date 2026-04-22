import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import AdminDashboard from '../app/admin/components/Dashboard/AdminDashboard';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminDashboardPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminProvider>
  );
}
