import AdminLayout from '../app/admin/components/Layout/AdminLayout';
import ExamManagement from '../app/admin/components/Exams/ExamManagement';
import { AdminProvider } from '../app/admin/context/AdminContext';

export default function AdminExamsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <ExamManagement />
      </AdminLayout>
    </AdminProvider>
  );
}
