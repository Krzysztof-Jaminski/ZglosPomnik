import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Users, TreePine, Calendar, BarChart3, AlertCircle, Plus, Edit, MessageSquare, Leaf } from 'lucide-react';
import { Tree, Species, Comment } from '../types';
import { adminService, AdminUser, AdminStats, SpeciesFormData } from '../services/adminService';
import { motion } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';

export const AdminPage: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'trees' | 'users' | 'species' | 'comments'>('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAction, setDeleteAction] = useState<{ type: 'post' | 'comment' | 'user' | 'species', id: string, postId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);
  const [speciesFormData, setSpeciesFormData] = useState<SpeciesFormData>({
    polishName: '',
    latinName: '',
    family: '',
    description: '',
    identificationGuide: [],
    seasonalChanges: {
      spring: '',
      summer: '',
      autumn: '',
      winter: ''
    },
    traits: {
      maxHeight: 0,
      lifespan: '',
      nativeToPoland: false
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load all data with mock data for now
        const [treesData, usersData] = await Promise.all([
          adminService.getAllTrees(),
          adminService.getAllUsers()
        ]);
        
        // Use mock data for species and comments
        const speciesData: Species[] = [
          {
            id: '1',
            polishName: 'Dąb szypułkowy',
            latinName: 'Quercus robur',
            family: 'Bukowate',
            description: 'Duże drzewo liściaste',
            identificationGuide: ['Kora szara i spękana', 'Liście klapowane'],
            seasonalChanges: {
              spring: 'Pąki pęcznieją',
              summer: 'Pełne ulistnienie',
              autumn: 'Żółte liście',
              winter: 'Bez liści'
            },
            images: [],
            traits: {
              maxHeight: 40,
              lifespan: '500+ lat',
              nativeToPoland: true
            }
          }
        ];
        
        const commentsData: Comment[] = [
          {
            id: '1',
            treeSubmissionId: '1',
            treePolishName: 'Dąb szypułkowy',
            userId: '1',
            userData: {
              userName: 'Test User',
              avatar: ''
            },
            content: 'To jest testowy komentarz',
            datePosted: new Date().toISOString(),
            isLegend: false,
            votes: { like: 0, dislike: 0 },
            userVote: null
          }
        ];
        
        setTrees(treesData);
        setUsers(usersData);
        setSpecies(speciesData);
        setComments(commentsData);
        
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
        // Clear any existing data on error
        setTrees([]);
        setUsers([]);
        setSpecies([]);
        setComments([]);
        setStats(null);
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

  const handleDeleteSpecies = (speciesId: string) => {
    setDeleteAction({ type: 'species', id: speciesId });
    setShowPasswordModal(true);
  };

  const handleDeleteComment = (commentId: string) => {
    setDeleteAction({ type: 'comment', id: commentId });
    setShowPasswordModal(true);
  };

  const handleEditSpecies = (species: Species) => {
    setEditingSpecies(species);
    setSpeciesFormData({
      polishName: species.polishName,
      latinName: species.latinName,
      family: species.family,
      description: species.description,
      identificationGuide: species.identificationGuide,
      seasonalChanges: species.seasonalChanges,
      traits: species.traits
    });
    setShowSpeciesModal(true);
  };

  const handleAddSpecies = () => {
    setEditingSpecies(null);
    setSpeciesFormData({
      polishName: '',
      latinName: '',
      family: '',
      description: '',
      identificationGuide: [],
      seasonalChanges: {
        spring: '',
        summer: '',
        autumn: '',
        winter: ''
      },
      traits: {
        maxHeight: 0,
        lifespan: '',
        nativeToPoland: false
      }
    });
    setShowSpeciesModal(true);
  };

  const confirmDelete = async () => {
    if (!deletePassword || !deleteAction) return;

    try {
      // Password verification through API
      const isValidPassword = await adminService.verifyAdminPassword(deletePassword);
      if (isValidPassword) {
        if (deleteAction?.type === 'post') {
          await adminService.deleteTree(deleteAction.id);
          setTrees(prev => prev.filter(tree => tree.id !== deleteAction.id));
          alert('Zgłoszenie drzewa zostało usunięte!');
        } else if (deleteAction?.type === 'user') {
          await adminService.deleteUser(deleteAction.id);
          setUsers(prev => prev.filter(user => user.id !== deleteAction.id));
          alert('Użytkownik został usunięty!');
        } else if (deleteAction?.type === 'species') {
          await adminService.deleteSpecies(deleteAction.id);
          setSpecies(prev => prev.filter(species => species.id !== deleteAction.id));
          alert('Gatunek został usunięty!');
        } else if (deleteAction?.type === 'comment') {
          await adminService.deleteComment(deleteAction.id);
          setComments(prev => prev.filter(comment => comment.id !== deleteAction.id));
          alert('Komentarz został usunięty!');
        }
        setShowPasswordModal(false);
        setDeletePassword('');
        setDeleteAction(null);
      } else {
        alert('Nieprawidłowe hasło!');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Błąd podczas usuwania!');
    }
  };

  const cancelDelete = () => {
    setShowPasswordModal(false);
    setDeletePassword('');
    setDeleteAction(null);
  };

  const handleSpeciesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSpecies) {
        await adminService.updateSpecies(editingSpecies.id, speciesFormData);
        setSpecies(prev => prev.map(species => 
          species.id === editingSpecies.id 
            ? { ...species, ...speciesFormData }
            : species
        ));
        alert('Gatunek został zaktualizowany!');
      } else {
        const newSpecies = await adminService.createSpecies(speciesFormData);
        setSpecies(prev => [...prev, newSpecies]);
        alert('Gatunek został dodany!');
      }
      setShowSpeciesModal(false);
      setEditingSpecies(null);
    } catch (error) {
      console.error('Error saving species:', error);
      alert('Błąd podczas zapisywania gatunku!');
    }
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
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-green-900 dark:text-white">
              Panel administratora
            </h1>
          </div>
          <p className="text-base sm:text-lg text-green-800 dark:text-gray-400">
            Zarządzaj zgłoszeniami i moderuj zawartość
          </p>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Nawigacja
              </h3>
            </div>
            <div className="space-y-3">
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
                <span className="text-sm sm:text-base">Drzewa {trees.length > 0 && `(${trees.length})`}</span>
          </GlassButton>
          
          <GlassButton
            onClick={() => setActiveTab('users')}
            variant={activeTab === 'users' ? 'primary' : 'secondary'}
            size="md"
            icon={Users}
            className="w-full"
          >
                <span className="text-sm sm:text-base">Użytkownicy {users.length > 0 && `(${users.length})`}</span>
          </GlassButton>

          <GlassButton
            onClick={() => setActiveTab('species')}
            variant={activeTab === 'species' ? 'primary' : 'secondary'}
            size="md"
            icon={Leaf}
            className="w-full"
          >
                <span className="text-sm sm:text-base">Gatunki {species.length > 0 && `(${species.length})`}</span>
          </GlassButton>

          <GlassButton
            onClick={() => setActiveTab('comments')}
            variant={activeTab === 'comments' ? 'primary' : 'secondary'}
            size="md"
            icon={MessageSquare}
            className="w-full"
          >
                <span className="text-sm sm:text-base">Komentarze {comments.length > 0 && `(${comments.length})`}</span>
          </GlassButton>
            </div>
          </div>
          </div>

        {/* Content */}
            {activeTab === 'stats' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Statystyki systemu
                </h3>
              </div>
                
                {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Użytkownicy
                        </div>
                      </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalTrees}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Drzewa
                    </div>
                        </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalComments}
                      </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Komentarze
                        </div>
                      </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.pendingTrees}
                        </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Oczekujące
                      </div>
                  </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Brak danych statystycznych</p>
                  </div>
                )}
            </div>
              </div>
            )}

            {activeTab === 'trees' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TreePine className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Zgłoszenia drzew
                </h3>
              </div>
              
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
              </div>
            )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Użytkownicy
                </h3>
              </div>
              
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
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {user.name}
                        </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Dołączył: {new Date(user.registeredAt).toLocaleDateString('pl-PL')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <BarChart3 className="w-4 h-4" />
                          <span>Zgłoszeń: {user.reportsCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {user.status === 'active' ? 'Aktywny' : user.status === 'banned' ? 'Zablokowany' : 'Nieaktywny'}
                            </span>
                      <GlassButton 
                            size="sm" 
                        variant="danger" 
                        icon={Trash2}
                        onClick={() => handleDeleteUser(user.id)}
                        title="Usuń użytkownika"
                      >
                            <span className="text-xs">Usuń</span>
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </div>
          </div>
            )}

        {/* Species Management Tab */}
        {activeTab === 'species' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    Zarządzanie gatunkami
                  </h3>
                </div>
                <GlassButton
                  onClick={handleAddSpecies}
                  variant="primary"
                  size="sm"
                  icon={Plus}
                >
                  <span className="text-sm">Dodaj gatunek</span>
                </GlassButton>
              </div>
              
              {species.length === 0 ? (
                <div className="text-center py-8">
                  <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Brak gatunków</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {species.map((spec, index) => (
                    <motion.div
                      key={spec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {spec.polishName}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {spec.latinName}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Rodzina: {spec.family}
                          </p>
                        </div>
                      </div>
                      
                      {spec.description && (
                        <div className="mb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                            {spec.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>Wysokość: {spec.traits.maxHeight}m</span>
                        </div>
                        <div className="flex space-x-2">
                          <GlassButton 
                            size="sm" 
                            variant="secondary"
                            icon={Edit}
                            onClick={() => handleEditSpecies(spec)}
                            title="Edytuj gatunek"
                          >
                            <span className="text-xs">Edytuj</span>
                          </GlassButton>
                          <GlassButton 
                            size="sm" 
                            variant="danger"
                            icon={Trash2}
                            onClick={() => handleDeleteSpecies(spec.id)}
                            title="Usuń gatunek"
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
          </div>
        )}

        {/* Comments Management Tab */}
        {activeTab === 'comments' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Zarządzanie komentarzami
                </h3>
              </div>
              
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Brak komentarzy</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {comment.userData.userName}
                              </h4>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {comment.treePolishName}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                            {comment.content}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{new Date(comment.datePosted).toLocaleDateString('pl-PL')}</span>
                            <span>Polubienia: {comment.votes.like}</span>
                            <span>Niepolubienia: {comment.votes.dislike}</span>
                            {comment.isLegend && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                Legenda
                              </span>
                            )}
                          </div>
                        </div>
                        <GlassButton 
                          size="sm" 
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Usuń komentarz"
                        >
                          <span className="text-xs">Usuń</span>
                        </GlassButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Species Form Modal */}
        {showSpeciesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingSpecies ? 'Edytuj gatunek' : 'Dodaj nowy gatunek'}
              </h3>
              
              <form onSubmit={handleSpeciesSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nazwa polska *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.polishName}
                      onChange={(e) => setSpeciesFormData(prev => ({ ...prev, polishName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nazwa łacińska *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.latinName}
                      onChange={(e) => setSpeciesFormData(prev => ({ ...prev, latinName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rodzina *
                  </label>
                  <input
                    type="text"
                    value={speciesFormData.family}
                    onChange={(e) => setSpeciesFormData(prev => ({ ...prev, family: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opis
                  </label>
                  <textarea
                    value={speciesFormData.description}
                    onChange={(e) => setSpeciesFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Przewodnik identyfikacji
                  </label>
                  <textarea
                    value={speciesFormData.identificationGuide?.join('\n') || ''}
                    onChange={(e) => setSpeciesFormData(prev => ({ 
                      ...prev, 
                      identificationGuide: e.target.value.split('\n').filter(line => line.trim()) 
                    }))}
                    rows={3}
                    placeholder="Każda linia to osobny punkt przewodnika"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Wiosna *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.seasonalChanges.spring}
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        seasonalChanges: { ...prev.seasonalChanges, spring: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lato *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.seasonalChanges.summer}
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        seasonalChanges: { ...prev.seasonalChanges, summer: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jesień *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.seasonalChanges.autumn}
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        seasonalChanges: { ...prev.seasonalChanges, autumn: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zima *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.seasonalChanges.winter}
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        seasonalChanges: { ...prev.seasonalChanges, winter: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maksymalna wysokość (m)
                    </label>
                    <input
                      type="number"
                      value={speciesFormData.traits.maxHeight || ''}
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        traits: { ...prev.traits, maxHeight: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Długość życia
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.traits.lifespan || ''}
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        traits: { ...prev.traits, lifespan: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={speciesFormData.traits.nativeToPoland || false}
                        onChange={(e) => setSpeciesFormData(prev => ({ 
                          ...prev, 
                          traits: { ...prev.traits, nativeToPoland: e.target.checked }
                        }))}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rodzimy dla Polski
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zdjęcie drzewa
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        treeImage: e.target.files?.[0]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zdjęcie liścia
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        leafImage: e.target.files?.[0]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zdjęcie kory
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        barkImage: e.target.files?.[0]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zdjęcie owocu
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSpeciesFormData(prev => ({ 
                        ...prev, 
                        fruitImage: e.target.files?.[0]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <GlassButton
                    type="button"
                    onClick={() => setShowSpeciesModal(false)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <span className="text-sm">Anuluj</span>
                  </GlassButton>
                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    <span className="text-sm">{editingSpecies ? 'Zaktualizuj' : 'Dodaj'}</span>
                  </GlassButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};