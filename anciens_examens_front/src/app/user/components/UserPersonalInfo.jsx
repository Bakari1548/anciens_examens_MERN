import { User, Mail, GraduationCap, Calendar, Edit } from 'lucide-react';

export default function UserPersonalInfo({ 
  user, 
  isEditing, 
  editForm, 
  setEditForm, 
  handleEditSubmit, 
  setIsEditing 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informations personnelles</h1>
          <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit size={18} />
            Modifier
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UFR
              </label>
              <input
                type="text"
                value={editForm.ufr}
                onChange={(e) => setEditForm({ ...editForm, ufr: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filière
              </label>
              <input
                type="text"
                value={editForm.filiere}
                onChange={(e) => setEditForm({ ...editForm, filiere: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  firstName: user?.firstName || '',
                  lastName: user?.lastName || '',
                  ufr: user?.ufr || '',
                  filiere: user?.filiere || ''
                });
              }}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-indigo-600" size={20} />
                <span className="text-sm text-gray-500">Prénom</span>
              </div>
              <p className="font-semibold text-gray-900">{user?.firstName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-indigo-600" size={20} />
                <span className="text-sm text-gray-500">Nom</span>
              </div>
              <p className="font-semibold text-gray-900">{user?.lastName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="text-indigo-600" size={20} />
                <span className="text-sm text-gray-500">Email</span>
              </div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="text-indigo-600" size={20} />
                <span className="text-sm text-gray-500">UFR</span>
              </div>
              <p className="font-semibold text-gray-900">{user?.ufr || 'Non renseigné'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="text-indigo-600" size={20} />
                <span className="text-sm text-gray-500">Filière</span>
              </div>
              <p className="font-semibold text-gray-900">{user?.filiere || 'Non renseigné'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-indigo-600" size={20} />
                <span className="text-sm text-gray-500">Membre depuis</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
