import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import AnalyticsPanel from '../app/admin/components/Analytics/AnalyticsPanel';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminAnalyticsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <AnalyticsPanel />
      </AdminLayout>
    </AdminProvider>
  );
}
