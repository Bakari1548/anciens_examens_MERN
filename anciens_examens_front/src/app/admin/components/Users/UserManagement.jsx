import { useEffect, useState } from 'react';
import { Search, Filter, Download, MoreVertical, ChevronLeft, ChevronRight, Eye, Edit2, Ban, Shield } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdmin.users';
import { useTheme } from '../../context/ThemeContext';
import DetailUser from './DetailUser';
import EditUser from './EditUser';

export default function UserManagement() {
  const { isDark } = useTheme();
  const { users, 
    fetchUsers, 
    updateUser, 
    deleteUser, 
    activateUser, 
    desactivateUser, 
    banUser, 
    unbanUser, 
    loading,
    addNotification 
  } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showUserModal, setShowUserModal] = useState(null);
  const [showBanModal, setShowBanModal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    fetchUsers({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      role: filterRole,
      status: filterStatus
    });
  }, [currentPage, pageSize, searchTerm, filterRole, filterStatus]);

  // Réinitialiser la page quand la taille change
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleBan = async (userId, duration, reason) => {
    await banUser(userId, duration, reason);
    setShowBanModal(null);
  };

  const handleBulkUnban = async () => {
    await bulkUnban(selectedUsers);
    setSelectedUsers([]);
  };

  const handleExportUsers = (format) => {
    if (format === 'csv') {
      const headers = ['Nom', 'Prénom', 'Email', 'Rôle', 'Statut', 'Date de création'];
      const rows = users.map(user => [
        user.lastName,
        user.firstName,
        user.email,
        user.role,
        user.status,
        new Date(user.createdAt).toLocaleDateString('fr-FR')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `utilisateurs_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const headers = ['Nom', 'Prénom', 'Email', 'Rôle', 'Statut', 'Date de création'];
      const rows = users.map(user => [
        user.lastName,
        user.firstName,
        user.email,
        user.role,
        user.status,
        new Date(user.createdAt).toLocaleDateString('fr-FR')
      ]);

      const tableContent = `
        <html>
          <head>
            <title>Export Utilisateurs</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #494949; padding: 8px; text-align: left; }
              th { background-color: #4CAF50; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Export des Utilisateurs</h1>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            <table>
              <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(tableContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    await updateUser(userId, { role: newRole });
  };


  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || (filterStatus === 'active') || 
                         (filterStatus === 'inactive') ||
                         (filterStatus === 'banned');
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (user) => {
    if (user.status === 'banned') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">Banni</span>;
    }
    if (user.status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">Actif</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">Inactif</span>;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      moderator: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      user: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium ${colors[role]} rounded-full`}>
        {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{users.length} utilisateurs au total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => document.getElementById('export-dropdown').classList.toggle('hidden')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Exporter
            </button>
            <div id="export-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportUsers('csv')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Exporter en CSV
                </button>
                <button
                  onClick={() => handleExportUsers('pdf')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Exporter en PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Modérateur</option>
            <option value="user">Utilisateur</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="banned">Banni</option>
          </select>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 dark:text-blue-300">
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                onClick={() => selectedUsers.forEach(userId => activateUser(userId))}
              >
                Activer
              </button>
              <button 
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                onClick={() => selectedUsers.forEach(userId => desactivateUser(userId))}
              >
                Désactiver
              </button>
              <button 
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                onClick={() => selectedUsers.forEach(userId => banUser(userId, 30, 'Bannissement massif'))}
              >
                Bannir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.examCount || 0} examens partagés
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="moderator">Modérateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === user._id ? null : user._id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {showActionMenu === user._id && (
                        <div className="absolute z-20 right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowDetailModal(user);
                                setShowActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye size={16} />
                              Voir les détails
                            </button>
                            <button
                              onClick={() => {
                                setShowEditModal(user);
                                setShowActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit2 size={16} />
                              Modifier
                            </button>
                            {user.status === 'banned' ? (
                              <button
                                onClick={() => {
                                  handleUnban(user._id);
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Shield size={16} />
                                Débannir
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowBanModal(user);
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Ban size={16} />
                                Bannir
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="relative z-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * 20 + 1} à {Math.min(currentPage * 20, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredUsers.length < 20}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Modal de détail utilisateur */}
        {showDetailModal && (
          <DetailUser
            user={showDetailModal}
            onClose={() => setShowDetailModal(null)}
            onEdit={() => {
              setShowEditModal(showDetailModal);
              setShowDetailModal(null);
            }}
          />
        )}

        {/* Modal d'édition utilisateur */}
        {showEditModal && (
          <EditUser
            user={showEditModal}
            onClose={() => setShowEditModal(null)}
            onSave={async (userId, userData) => {
              await updateUser(userId, userData);
              setShowEditModal(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
