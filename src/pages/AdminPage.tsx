import React, { useState, useEffect } from 'react';
import { Shield, Trash2, MessageSquare, Users, TreePine, ThumbsUp, ThumbsDown, UserCheck, Crown, Mail, Calendar } from 'lucide-react';
import { Tree, TreePost } from '../types';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ecologist' | 'citizen';
  registeredAt: string;
  lastActive: string;
  reportsCount: number;
  status: 'active' | 'suspended' | 'banned';
}

export const AdminPage: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [posts, setPosts] = useState<TreePost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'comments' | 'users'>('reports');
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAction, setDeleteAction] = useState<{ type: 'post' | 'comment' | 'user', id: string, postId?: string } | null>(null);


  useEffect(() => {
    const loadData = async () => {
      try {
        const treesData = await api.getTrees();
        setTrees(treesData);
        
        // Convert trees to posts with social features for admin management
        const postsData: TreePost[] = treesData.map(tree => ({
          ...tree,
          likes: Math.floor(Math.random() * 50),
          dislikes: Math.floor(Math.random() * 10),
          userVote: null,
          comments: generateMockComments(tree.id),
          legendComment: Math.random() > 0.6 ? generateLegendComment(tree.id) : undefined
        }));
        setPosts(postsData);
        
        // Generate mock users data
        const usersData: AdminUser[] = [
          {
            id: '1',
            name: 'Anna Kowalska',
            email: 'anna.kowalska@example.com',
            role: 'ecologist',
            registeredAt: '2024-01-15T10:00:00Z',
            lastActive: '2024-01-20T14:30:00Z',
            reportsCount: 12,
            status: 'active'
          },
          {
            id: '2',
            name: 'Jan Nowak',
            email: 'jan.nowak@example.com',
            role: 'citizen',
            registeredAt: '2024-01-10T09:00:00Z',
            lastActive: '2024-01-19T16:45:00Z',
            reportsCount: 5,
            status: 'active'
          }
        ];
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const generateMockComments = (treeId: string) => {
    const commentTexts = [
      'Piękne drzewo! Zdecydowanie zasługuje na ochronę.',
      'Widziałem to drzewo wczoraj, rzeczywiście imponujące.',
      'Czy ktoś wie ile ma lat?',
      'Świetne zdjęcia! Gdzie dokładnie się znajduje?'
    ];

    const numComments = Math.floor(Math.random() * 5);
    return Array.from({ length: numComments }, (_, index) => ({
      id: `${treeId}-comment-${index}`,
      treeId,
      userId: `user-${index}`,
      userName: `Użytkownik ${index + 1}`,
      content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 20),
      dislikes: Math.floor(Math.random() * 5),
      userVote: null
    }));
  };

  const generateLegendComment = (treeId: string) => ({
    id: `${treeId}-legend`,
    treeId,
    userId: 'expert-user',
    userName: 'Ekspert Dendrologiczny',
    content: 'To drzewo ma szczególne znaczenie historyczne dla naszej społeczności.',
    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    likes: Math.floor(Math.random() * 100) + 50,
    dislikes: Math.floor(Math.random() * 10),
    userVote: null
  });

  const tabs = [
    { id: 'reports', label: 'Zgłoszenia', icon: TreePine, count: trees.length },
    { id: 'comments', label: 'Komentarze', icon: MessageSquare, count: posts.reduce((acc, post) => acc + post.comments.length, 0) },
    { id: 'users', label: 'Użytkownicy', icon: Users, count: users.length }
  ];

  const handleDeletePost = (postId: string) => {
    setDeleteAction({ type: 'post', id: postId });
    setShowPasswordModal(true);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setDeleteAction({ type: 'comment', id: commentId, postId });
    setShowPasswordModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteAction({ type: 'user', id: userId });
    setShowPasswordModal(true);
  };



  const confirmDelete = () => {
    if (!deletePassword || !deleteAction) return;

    // Mock password verification
    if (deletePassword === 'admin123') {
      if (deleteAction?.type === 'post') {
        setPosts(prev => prev.filter(post => post.id !== deleteAction.id));
        setTrees(prev => prev.filter(tree => tree.id !== deleteAction.id));
      } else if (deleteAction?.type === 'comment' && deleteAction.postId) {
        setPosts(prev => prev.map(post => 
          post.id === deleteAction.postId 
            ? { ...post, comments: post.comments.filter(comment => comment.id !== deleteAction.id) }
            : post
        ));
      } else if (deleteAction?.type === 'user') {
        setUsers(prev => prev.filter(user => user.id !== deleteAction.id));
      }

      setShowPasswordModal(false);
      setDeletePassword('');
      setDeleteAction(null);

    } else {
      alert('Nieprawidłowe hasło');
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

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-5xl sm:max-w-none mx-auto px-4 sm:px-6">
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

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-2 sm:mb-4">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-2 sm:space-x-6 px-2 sm:px-4">
              {tabs.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-2 sm:py-3 border-b-2 font-medium transition-colors ${
                    activeTab === id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-lg">{label}</span>
                  {count > 0 && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-2 py-1 rounded-full text-xs sm:text-base">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-2 sm:p-6">
            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {trees.map((tree, index) => (
                  <motion.div
                    key={tree.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {tree.commonName}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                          {tree.species}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        tree.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        tree.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {tree.status === 'approved' ? 'Zatwierdzone' : tree.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            {tree.reportedBy}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            {new Date(tree.reportedAt).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>
                      
                      <GlassButton 
                        size="xs" 
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleDeletePost(tree.id)}
                        title="Usuń zgłoszenie"
                      >
                        <span className="sr-only">Usuń</span>
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-2 sm:space-y-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={`comments-${post.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4"
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-lg">
                        {post.commonName} - Komentarze ({post.comments.length})
                      </h4>
                    </div>
                    
                    {post.comments.length === 0 ? (
                      <p className="text-gray-500 text-sm sm:text-lg">Brak komentarzy</p>
                    ) : (
                      <div className="space-y-2">
                        {post.comments
                          .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
                          .map((comment) => (
                          <div key={comment.id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {comment.userName}
                                  </span>
                                  <span className="text-gray-500 text-xs sm:text-sm">
                                    {new Date(comment.createdAt).toLocaleDateString('pl-PL')}
                                  </span>
                                  {comment.id.includes('legend') && (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs sm:text-sm">
                                      Legenda
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-2 text-xs sm:text-sm">
                                  {comment.content}
                                </p>
                                <div className="flex items-center space-x-3 text-gray-500 text-xs sm:text-sm">
                                  <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span>{comment.likes}</span>
                                  <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span>{comment.dislikes}</span>
                                </div>
                              </div>
                              <GlassButton 
                                size="xs" 
                                variant="danger" 
                                icon={Trash2}
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                              >
                                <span className="sr-only">Usuń komentarz</span>
                              </GlassButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
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
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TreePine className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            {user.reportsCount} zgłoszeń
                          </span>
                        </div>
                      </div>
                      
                      <GlassButton 
                        size="xs" 
                        variant="danger" 
                        icon={Trash2}
                        onClick={() => handleDeleteUser(user.id)}
                        title="Usuń użytkownika"
                      >
                        <span className="sr-only">Usuń</span>
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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