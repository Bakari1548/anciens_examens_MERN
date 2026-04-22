import ExamDetail from "../app/exam/components/DetailExam";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DetailExamPage() {
    return (
        <ProtectedRoute>
            <ExamDetail />
        </ProtectedRoute>
    );
}