import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { Tree, Species, Comment } from '../types';
import { adminService, AdminUser, AdminStats, SpeciesFormData } from '../services/adminService';
import { motion } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { AdminNavigation } from '../components/Admin/AdminNavigation';
import { AdminStats as AdminStatsComponent } from '../components/Admin/AdminStats';
import { AdminTrees } from '../components/Admin/AdminTrees';
import { AdminUsers } from '../components/Admin/AdminUsers';
import { AdminSpecies } from '../components/Admin/AdminSpecies';
import { AdminComments } from '../components/Admin/AdminComments';
import { AdminModals } from '../components/Admin/AdminModals';

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
            ? { 
                ...species, 
                ...speciesFormData,
                traits: {
                  ...species.traits,
                  ...speciesFormData.traits,
                  maxHeight: speciesFormData.traits.maxHeight || 0
                }
              }
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

  const closeSpeciesModal = () => {
    setShowSpeciesModal(false);
    setEditingSpecies(null);
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

        {/* Navigation */}
        <AdminNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            trees: trees.length,
            users: users.length,
            species: species.length,
            comments: comments.length
          }}
        />

        {/* Content */}
        {activeTab === 'stats' && (
          <AdminStatsComponent stats={stats} />
        )}

        {activeTab === 'trees' && (
          <AdminTrees trees={trees} onDeleteTree={handleDeletePost} />
        )}

        {activeTab === 'users' && (
          <AdminUsers users={users} onDeleteUser={handleDeleteUser} />
        )}

        {activeTab === 'species' && (
          <AdminSpecies 
            species={species} 
            onDeleteSpecies={handleDeleteSpecies}
            onEditSpecies={handleEditSpecies}
            onAddSpecies={handleAddSpecies}
          />
        )}

        {activeTab === 'comments' && (
          <AdminComments comments={comments} onDeleteComment={handleDeleteComment} />
        )}

        {/* Modals */}
        <AdminModals
          showPasswordModal={showPasswordModal}
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          confirmDelete={confirmDelete}
          cancelDelete={cancelDelete}
          deleteAction={deleteAction}
          showSpeciesModal={showSpeciesModal}
          editingSpecies={editingSpecies}
          speciesFormData={speciesFormData}
          setSpeciesFormData={setSpeciesFormData}
          handleSpeciesSubmit={handleSpeciesSubmit}
          closeSpeciesModal={closeSpeciesModal}
        />
      </div>
    </div>
  );
};