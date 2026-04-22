import PostExam from "../app/exam/components/PostExam";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PostExamPage() {
    return (
        <ProtectedRoute>
            <PostExam />
        </ProtectedRoute>
    );
}