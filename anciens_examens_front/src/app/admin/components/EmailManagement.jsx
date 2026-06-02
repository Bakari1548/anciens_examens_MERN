import { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Inbox,
  ArrowLeft
} from 'lucide-react';
import { emailApi } from '../services/email.api';
import { useAdmin } from '../context/AdminContext';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';

export default function EmailManagement() {
  const { isDark } = useTheme();
  const { users, fetchUsers } = useAdmin();
  const [activeTab, setActiveTab] = useState('compose');
  const [recipientType, setRecipientType] = useState('all');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailHistory, setEmailHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [receivedEmails, setReceivedEmails] = useState([]);
  const [receivedEmailsLoading, setReceivedEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchUsers({ page: 1, limit: 100 });
    fetchEmailHistory();
    fetchReceivedEmails();
  }, []);

  const fetchReceivedEmails = async () => {
    try {
      setReceivedEmailsLoading(true);
      const response = await emailApi.getReceivedEmails();
      setReceivedEmails(response.emails || []);
    } catch (error) {
      console.error('Erreur lors du chargement des emails reçus:', error);
    } finally {
      setReceivedEmailsLoading(false);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await emailApi.getEmailHistory({ page: 1, limit: 20 });
      setEmailHistory(response.emails || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    if (recipientType === 'specific' && selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (recipientType === 'all') {
        response = await emailApi.sendEmailToAll({ subject, message });
      } else if (recipientType === 'role') {
        response = await emailApi.sendEmailByRole({ role: selectedRole, subject, message });
      } else {
        response = await emailApi.sendEmailToUsers({ userIds: selectedUsers, subject, message });
      }

      toast.success('Email envoyé avec succès');
      setSubject('');
      setMessage('');
      setSelectedUsers([]);
      fetchEmailHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientCount = () => {
    if (recipientType === 'all') return users.length;
    if (recipientType === 'role') return users.filter(u => u.role === selectedRole).length;
    return selectedUsers.length;
  };

  const getRecipientLabel = () => {
    if (recipientType === 'all') return 'Tous les utilisateurs';
    if (recipientType === 'role') {
      const roleLabels = { admin: 'Administrateurs', moderator: 'Modérateurs', user: 'Utilisateurs' };
      return roleLabels[selectedRole] || selectedRole;
    }
    return `${selectedUsers.length} utilisateur(s) sélectionné(s)`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des emails</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Envoyez des emails aux utilisateurs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'compose'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Mail size={20} />
              <span>Composer un email</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Clock size={20} />
              <span>Historique</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'received'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Inbox size={20} />
              <span>Emails reçus</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'compose' && (
        <div className="space-y-6">
          {/* Recipient Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Destinataires</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => {
                  setRecipientType('all');
                  setSelectedUsers([]);
                  setSelectedRole('');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === 'all'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Users className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={32} />
                <p className="font-medium text-gray-900 dark:text-white text-center">Tous les utilisateurs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{users.length} utilisateurs</p>
              </button>

              <button
                onClick={() => {
                  setRecipientType('role');
                  setSelectedUsers([]);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === 'role'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <UserCheck className="mx-auto mb-2 text-green-600 dark:text-green-400" size={32} />
                <p className="font-medium text-gray-900 dark:text-white text-center">Par rôle</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Admins, Modérateurs, Users</p>
              </button>

              <button
                onClick={() => {
                  setRecipientType('specific');
                  setSelectedRole('');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === 'specific'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Mail className="mx-auto mb-2 text-purple-600 dark:text-purple-400" size={32} />
                <p className="font-medium text-gray-900 dark:text-white text-center">Utilisateurs spécifiques</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Sélection manuelle</p>
              </button>
            </div>

            {recipientType === 'role' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sélectionner le rôle
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="admin">Administrateurs</option>
                  <option value="moderator">Modérateurs</option>
                  <option value="user">Utilisateurs</option>
                </select>
              </div>
            )}

            {recipientType === 'specific' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
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
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les rôles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Modérateur</option>
                    <option value="user">Utilisateur</option>
                  </select>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                  <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAllUsers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sélectionner tout ({filteredUsers.length})
                    </span>
                  </div>
                  <div className="divide-y dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <div key={user._id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserToggle(user._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Destinataires:</strong> {getRecipientLabel()} ({getRecipientCount()})
              </p>
            </div>
          </div>

          {/* Email Composition */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contenu de l'email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet de l'email..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Écrivez votre message ici..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Eye size={18} />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </button>
              </div>

              {showPreview && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{subject || 'Sujet vide'}</h3>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message || 'Message vide'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendEmail}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Envoyer l'email
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {historyLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : emailHistory.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun email envoyé</h3>
              <p className="text-gray-500 dark:text-gray-400">L'historique des emails envoyés apparaîtra ici.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sujet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Destinataires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date d'envoi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {emailHistory.map((email) => (
                    <tr key={email._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{email.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{email.recipientCount} destinataire(s)</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{email.recipientType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(email.sentAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {email.status === 'sent' ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle size={16} />
                            Envoyé
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <XCircle size={16} />
                            Échoué
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {receivedEmailsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !selectedEmail ? (
            <>
              {receivedEmails.length === 0 ? (
                <div className="p-12 text-center">
                  <Inbox className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun email reçu</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Les emails reçus sur onboarding@anciensexamensuidt.app apparaîtront ici.
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Configurez le webhook Resend pour recevoir les emails automatiquement.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          De
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Sujet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date de réception
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {receivedEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{email.from}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{email.subject}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(email.receivedAt).toLocaleDateString('fr-FR')} à {new Date(email.receivedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedEmail(email)}
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <Eye size={16} />
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="border-b dark:border-gray-700 px-6 py-4">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft size={20} />
                  Retour à la liste
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEmail.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    De: {selectedEmail.from} | À: {selectedEmail.to}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Reçu le: {new Date(selectedEmail.receivedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedEmail.text || selectedEmail.html}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
