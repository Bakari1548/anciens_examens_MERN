import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import EmailManagement from '../app/admin/components/EmailManagement';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminEmailsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <EmailManagement />
      </AdminLayout>
    </AdminProvider>
  );
}
