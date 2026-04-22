import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import UserManagement from '../app/admin/components/Users/UserManagement';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminUsersPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <UserManagement />
      </AdminLayout>
    </AdminProvider>
  );
}
