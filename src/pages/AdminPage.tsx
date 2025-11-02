import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { adminService, AdminUser } from '../services/adminService';
import { AdminUsers } from '../components/Admin/AdminUsers';
import { AdminModals } from '../components/Admin/AdminModals';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { isModerator } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAction, setDeleteAction] = useState<{ type: 'user' | 'species' | 'tree', id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    if (!isModerator) {
      navigate('/map');
      return;
    }
  }, [isModerator, navigate]);

  useEffect(() => {
    if (!isModerator) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const usersData = await adminService.getAllUsers();
        setUsers(usersData);
        
      } catch (error) {
        console.error('Error loading admin data:', error);
        setError(error instanceof Error ? error.message : 'Błąd podczas ładowania danych');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isModerator]);

  const handleDeleteUser = (userId: string) => {
    setDeleteAction({ type: 'user', id: userId });
    setShowPasswordModal(true);
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

  

  if (!isModerator) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Brak dostępu</h2>
          <p className="text-gray-600 dark:text-gray-300">Nie masz uprawnień do panelu administratora.</p>
        </div>
      </div>
    );
  }

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
          {/* Zarządzanie gatunkami i drzewami przeniesione do encyklopedii i feedu */}
        </div>

        <AdminModals
          showPasswordModal={showPasswordModal}
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          confirmDelete={confirmDelete}
          cancelDelete={cancelDelete}
          deleteAction={deleteAction}
          showSpeciesModal={false}
          editingSpecies={null}
          speciesFormData={{
            polishName: '', latinName: '', family: '', description: '', identificationGuide: [],
            seasonalChanges: { spring: '', summer: '', autumn: '', winter: '' }, traits: { maxHeight: 0, lifespan: '', nativeToPoland: false }
          }}
          setSpeciesFormData={() => {}}
          handleSpeciesSubmit={() => {}}
          closeSpeciesModal={() => {}}
        />
      </div>
    </div>
  );
};
