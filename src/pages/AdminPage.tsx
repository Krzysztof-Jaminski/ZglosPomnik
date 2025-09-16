import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Users, TreePine, UserCheck, Crown, Mail, Calendar, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { Tree } from '../types';
import { adminService, AdminUser, AdminStats } from '../services/adminService';
import { motion } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';


export const AdminPage: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'trees' | 'users'>('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAction, setDeleteAction] = useState<{ type: 'post' | 'comment' | 'user', id: string, postId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load essential data only
        const [treesData, usersData] = await Promise.all([
          adminService.getAllTrees(),
          adminService.getAllUsers()
        ]);
        
        setTrees(treesData);
        setUsers(usersData);
        
        // Calculate stats from real data
        const totalComments = treesData.reduce((sum, tree) => sum + (tree.commentCount || 0), 0);
        const statsData = {
          totalUsers: usersData.length,
          totalTrees: treesData.length,
          totalComments: totalComments,
          pendingTrees: treesData.filter(tree => tree.status === 'pending').length,
          activeUsers: usersData.filter(user => user.status === 'active').length
        };
        setStats(statsData);
        
        
      } catch (error) {
        console.error('Error loading admin data:', error);
        setError(error instanceof Error ? error.message : 'Błąd podczas ładowania danych');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);



  const handleDeletePost = (postId: string) => {
    setDeleteAction({ type: 'post', id: postId });
    setShowPasswordModal(true);
  };


  const handleDeleteUser = (userId: string) => {
    setDeleteAction({ type: 'user', id: userId });
    setShowPasswordModal(true);
  };



  const confirmDelete = async () => {
    if (!deletePassword || !deleteAction) return;

    try {
      // Mock password verification (w prawdziwej aplikacji sprawdź hasło przez API)
    if (deletePassword === 'admin123') {
      if (deleteAction?.type === 'post') {
          await adminService.deleteTree(deleteAction.id);
        setTrees(prev => prev.filter(tree => tree.id !== deleteAction.id));
          alert('Zgłoszenie drzewa zostało usunięte!');
      } else if (deleteAction?.type === 'user') {
          await adminService.deleteUser(deleteAction.id);
        setUsers(prev => prev.filter(user => user.id !== deleteAction.id));
          alert('Użytkownik został usunięty!');
      }

      setShowPasswordModal(false);
      setDeletePassword('');
      setDeleteAction(null);
    } else {
        alert('Nieprawidłowe hasło administratora');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`Błąd podczas usuwania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    }
  };

  const cancelDelete = () => {
    setShowPasswordModal(false);
    setDeletePassword('');
    setDeleteAction(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Ładowanie panelu administratora...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Błąd ładowania</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <GlassButton
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
          >
            Spróbuj ponownie
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 sm:mb-4"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
            <h1 className="text-lg sm:text-3xl font-bold text-green-900 dark:text-white">
              Panel administratora
            </h1>
          </div>
          <p className="text-green-800 dark:text-gray-400 text-base sm:text-xl">
            Zarządzaj zgłoszeniami i moderuj zawartość
          </p>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <GlassButton
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'primary' : 'secondary'}
            size="md"
            icon={BarChart3}
            className="w-full"
          >
            <span className="text-sm sm:text-base">Statystyki</span>
          </GlassButton>
          
          <GlassButton
            onClick={() => setActiveTab('trees')}
            variant={activeTab === 'trees' ? 'primary' : 'secondary'}
            size="md"
            icon={TreePine}
            className="w-full"
          >
            <span className="text-sm sm:text-base">Drzewa ({trees.length})</span>
          </GlassButton>
          
          <GlassButton
            onClick={() => setActiveTab('users')}
            variant={activeTab === 'users' ? 'primary' : 'secondary'}
            size="md"
            icon={Users}
            className="w-full"
          >
            <span className="text-sm sm:text-base">Użytkownicy ({users.length})</span>
          </GlassButton>
          </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Statystyki systemu
                </h3>
                
                {stats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Użytkownicy</p>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                        </div>
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Drzewa</p>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTrees}</p>
                        </div>
                        <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Komentarze</p>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalComments}</p>
                        </div>
                                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Oczekujące</p>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTrees}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Brak danych statystycznych</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trees' && (
              <div className="space-y-4">
                {trees.length === 0 ? (
                  <div className="text-center py-8">
                    <TreePine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Brak zgłoszeń drzew</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {trees.map((tree, index) => (
                  <motion.div
                    key={tree.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                              {tree.species}
                        </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {tree.speciesLatin}
                            </p>
                            <div className="flex items-center space-x-4 text-gray-500 text-sm">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{tree.userData?.userName || 'Nieznany'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(tree.submissionDate).toLocaleDateString('pl-PL')}</span>
                              </div>
                            </div>
                      </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tree.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        tree.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {tree.status === 'approved' ? 'Zatwierdzone' : tree.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                      </span>
                    </div>
                    
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-gray-500 text-sm">
                              <span>Komentarze: {tree.commentCount || 0}</span>
                              <span>Polubienia: {tree.votes?.like || 0}</span>
                      </div>
                      <GlassButton 
                              size="sm" 
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleDeletePost(tree.id)}
                              title="Usuń drzewo i wszystkie komentarze"
                      >
                              <span className="text-xs">Usuń</span>
                      </GlassButton>
                          </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
              </div>
            )}


            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Brak użytkowników</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
                  >
                        <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {user.name}
                        </h3>
                        {user.role === 'admin' && (
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                        )}
                        {user.role === 'ecologist' && (
                          <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {user.status === 'active' ? 'Aktywny' : user.status === 'suspended' ? 'Zawieszony' : 'Zablokowany'}
                      </span>
                    </div>
                    
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {user.email}
                          </span>
                        </div>
                          <div className="flex items-center space-x-2">
                            <TreePine className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            {user.reportsCount} zgłoszeń
                          </span>
                        </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                              Dołączył: {new Date(user.registeredAt).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>
                      
                        <div className="flex space-x-2">
                          <GlassButton 
                            size="sm" 
                            variant="secondary" 
                            icon={user.status === 'active' ? AlertCircle : CheckCircle}
                            onClick={async () => {
                              try {
                                const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                await adminService.toggleUserStatus(user.id, newStatus);
                                setUsers(prev => prev.map(u => 
                                  u.id === user.id ? { ...u, status: newStatus } : u
                                ));
                                alert(`Użytkownik ${newStatus === 'suspended' ? 'zawieszony' : 'aktywowany'}!`);
                              } catch (error) {
                                console.error('Error toggling user status:', error);
                                alert('Błąd podczas zmiany statusu użytkownika');
                              }
                            }}
                            title={user.status === 'active' ? 'Zawieś użytkownika' : 'Aktywuj użytkownika'}
                            className="flex-1"
                          >
                            <span className="text-xs">
                              {user.status === 'active' ? 'Zawieś' : 'Aktywuj'}
                            </span>
                          </GlassButton>
                      <GlassButton 
                            size="sm" 
                        variant="danger" 
                        icon={Trash2}
                        onClick={() => handleDeleteUser(user.id)}
                        title="Usuń użytkownika"
                            className="flex-1"
                      >
                            <span className="text-xs">Usuń</span>
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
            )}

        </div>

        {/* Password Confirmation Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                Potwierdź usunięcie
              </h3>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4">
                Wprowadź hasło administratora aby potwierdzić usunięcie.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Hasło administratora"
                className="w-full px-4 py-3 text-base sm:text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
              />
              <div className="flex space-x-3">
                <GlassButton
                  onClick={cancelDelete}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <span className="text-sm sm:text-base">Anuluj</span>
                </GlassButton>
                <GlassButton
                  onClick={confirmDelete}
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  disabled={!deletePassword}
                >
                  <span className="text-sm sm:text-base">Usuń</span>
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};