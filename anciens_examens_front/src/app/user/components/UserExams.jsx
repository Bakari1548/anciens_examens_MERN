import { FileText, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function UserExams({ userExams }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes examens partagés</h1>
          <p className="text-gray-500 mt-1">Consultez les examens que vous avez partagés</p>
        </div>
        <button
          onClick={() => navigate('/partager-examen')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FileText size={18} />
          Partager
        </button>
      </div>
      
      {userExams.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun examen partagé</h3>
          <p className="text-gray-500 mb-6">Commencez par partager votre premier examen</p>
          <button
            onClick={() => navigate('/partager-examen')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Partager un examen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {userExams.map((exam) => (
            <div
              key={exam._id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-gray-500">{exam.matiere} • {exam.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  exam.status === 'approved' ? 'bg-green-100 text-green-700' :
                  exam.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {exam.status === 'approved' ? 'Approuvé' :
                   exam.status === 'rejected' ? 'Rejeté' : 'En attente'}
                </span>
                <button
                  onClick={() => navigate(`/examen/${exam.slug}`)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Eye size={16} />
                  Détail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
