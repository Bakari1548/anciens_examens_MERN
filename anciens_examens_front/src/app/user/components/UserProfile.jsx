import { useState, useEffect } from 'react';
import { User, Settings, ChevronRight, Shield, BookOpen, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router';
import { tokenStorage } from '@/utils/tokenStorage';
import UserExams from './UserExams';
import UserSecurity from './UserSecurity';
import UserPersonalInfo from './UserPersonalInfo';

export default function UserProfile() {
  const { user, userExams, loading, updateProfile, changePassword, fetchUserExams } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    ufr: user?.ufr || '',
    filiere: user?.filiere || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserExams();
  }, [fetchUserExams]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = () => {
    tokenStorage.clear();
    navigate('/connexion');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'exams', label: 'Mes Examens', icon: BookOpen, count: userExams.length },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <span className="font-semibold text-gray-900">Mon Profil</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              {/* Profile Card */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{userExams.length}</p>
                  <p className="text-xs text-indigo-600">Examens</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {new Date(user?.createdAt).toLocaleDateString('fr-FR', { month: 'short' })}
                  </p>
                  <p className="text-xs text-purple-600">Depuis</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tab.count !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activeTab === tab.id
                              ? 'bg-indigo-200 text-indigo-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                        <ChevronRight size={16} className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <UserPersonalInfo
                user={user}
                isEditing={isEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                handleEditSubmit={handleEditSubmit}
                setIsEditing={setIsEditing}
              />
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && <UserExams userExams={userExams} />}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <UserSecurity
                isChangingPassword={isChangingPassword}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                handlePasswordSubmit={handlePasswordSubmit}
                handleLogout={handleLogout}
                setIsChangingPassword={setIsChangingPassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
