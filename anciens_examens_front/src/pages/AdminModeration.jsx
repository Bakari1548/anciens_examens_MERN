import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import ModerationPanel from '../app/admin/components/Moderation/ModerationPanel';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminModerationPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <ModerationPanel />
      </AdminLayout>
    </AdminProvider>
  );
}
