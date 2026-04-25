import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import SettingsPanel from '../app/admin/components/Settings/SettingsPanel';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminSettingsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <SettingsPanel />
      </AdminLayout>
    </AdminProvider>
  );
}
