import React from 'react';
import { motion } from 'framer-motion';
import { Species, SpeciesFormData } from '../../services/adminService';
import { GlassButton } from '../UI/GlassButton';

interface AdminModalsProps {
  showPasswordModal: boolean;
  deletePassword: string;
  setDeletePassword: (password: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  deleteAction: { type: 'post' | 'comment' | 'user' | 'species', id: string, postId?: string } | null;
  
  showSpeciesModal: boolean;
  editingSpecies: Species | null;
  speciesFormData: SpeciesFormData;
  setSpeciesFormData: (data: SpeciesFormData) => void;
  handleSpeciesSubmit: (e: React.FormEvent) => void;
  closeSpeciesModal: () => void;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
  showPasswordModal,
  deletePassword,
  setDeletePassword,
  confirmDelete,
  cancelDelete,
  deleteAction,
  showSpeciesModal,
  editingSpecies,
  speciesFormData,
  setSpeciesFormData,
  handleSpeciesSubmit,
  closeSpeciesModal
}) => {
  return (
    <>
      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full"
          >
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
          </motion.div>
        </div>
      )}

      {/* Species Form Modal */}
      {showSpeciesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
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
                    onChange={(e) => setSpeciesFormData({ ...speciesFormData, polishName: e.target.value })}
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
                    onChange={(e) => setSpeciesFormData({ ...speciesFormData, latinName: e.target.value })}
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
                  onChange={(e) => setSpeciesFormData({ ...speciesFormData, family: e.target.value })}
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
                  onChange={(e) => setSpeciesFormData({ ...speciesFormData, description: e.target.value })}
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
                  onChange={(e) => setSpeciesFormData({ 
                    ...speciesFormData, 
                    identificationGuide: e.target.value.split('\n').filter(line => line.trim()) 
                  })}
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
                    onChange={(e) => setSpeciesFormData({ 
                      ...speciesFormData, 
                      seasonalChanges: { ...speciesFormData.seasonalChanges, spring: e.target.value }
                    })}
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
                    onChange={(e) => setSpeciesFormData({ 
                      ...speciesFormData, 
                      seasonalChanges: { ...speciesFormData.seasonalChanges, summer: e.target.value }
                    })}
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
                    onChange={(e) => setSpeciesFormData({ 
                      ...speciesFormData, 
                      seasonalChanges: { ...speciesFormData.seasonalChanges, autumn: e.target.value }
                    })}
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
                    onChange={(e) => setSpeciesFormData({ 
                      ...speciesFormData, 
                      seasonalChanges: { ...speciesFormData.seasonalChanges, winter: e.target.value }
                    })}
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
                    onChange={(e) => setSpeciesFormData({ 
                      ...speciesFormData, 
                      traits: { ...speciesFormData.traits, maxHeight: parseInt(e.target.value) || 0 }
                    })}
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
                    onChange={(e) => setSpeciesFormData({ 
                      ...speciesFormData, 
                      traits: { ...speciesFormData.traits, lifespan: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={speciesFormData.traits.nativeToPoland || false}
                      onChange={(e) => setSpeciesFormData({ 
                        ...speciesFormData, 
                        traits: { ...speciesFormData.traits, nativeToPoland: e.target.checked }
                      })}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rodzimy dla Polski
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <GlassButton
                  type="button"
                  onClick={closeSpeciesModal}
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
          </motion.div>
        </div>
      )}
    </>
  );
};
