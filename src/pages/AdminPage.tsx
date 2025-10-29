import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Species, Tree } from '../types';
import { adminService, AdminUser, SpeciesFormData } from '../services/adminService';
import { AdminUsers } from '../components/Admin/AdminUsers';
import { AdminSpecies } from '../components/Admin/AdminSpecies';
import { AdminTrees } from '../components/Admin/AdminTrees';
import { AdminModals } from '../components/Admin/AdminModals';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAction, setDeleteAction] = useState<{ type: 'user' | 'species' | 'tree', id: string } | null>(null);
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
        
        const [usersData, speciesData, treesData] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllSpecies(),
          adminService.getAllTrees()
        ]);
        
        setUsers(usersData);
        setSpecies(speciesData);
        setTrees(treesData);
        
      } catch (error) {
        console.error('Error loading admin data:', error);
        setError(error instanceof Error ? error.message : 'Błąd podczas ładowania danych');
        setUsers([]);
        setSpecies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteUser = (userId: string) => {
    setDeleteAction({ type: 'user', id: userId });
    setShowPasswordModal(true);
  };

  const handleDeleteSpecies = (speciesId: string) => {
    setDeleteAction({ type: 'species', id: speciesId });
    setShowPasswordModal(true);
  };

  const handleDeleteTree = (treeId: string) => {
    setDeleteAction({ type: 'tree', id: treeId });
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
      const isValidPassword = await adminService.verifyAdminPassword(deletePassword);
      if (isValidPassword) {
        if (deleteAction?.type === 'user') {
          await adminService.deleteUser(deleteAction.id);
          setUsers(prev => prev.filter(user => user.id !== deleteAction.id));
          alert('Użytkownik został usunięty!');
        } else if (deleteAction?.type === 'species') {
          await adminService.deleteSpecies(deleteAction.id);
          setSpecies(prev => prev.filter(species => species.id !== deleteAction.id));
          alert('Gatunek został usunięty!');
        } else if (deleteAction?.type === 'tree') {
          await adminService.deleteTree(deleteAction.id);
          setTrees(prev => prev.filter(tree => tree.id !== deleteAction.id));
          alert('Drzewo zostało usunięte!');
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
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Ładowanie panelu administratora...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Błąd ładowania</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 overflow-y-auto">
      <div className="w-full px-3 sm:px-4">
        <div className="space-y-2 sm:space-y-3">
          <AdminUsers users={users} onDeleteUser={handleDeleteUser} />
          <AdminSpecies 
            species={species} 
            onDeleteSpecies={handleDeleteSpecies}
            onEditSpecies={handleEditSpecies}
            onAddSpecies={handleAddSpecies}
          />
          <AdminTrees trees={trees} onDeleteTree={handleDeleteTree} />
        </div>

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
