import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Species } from '../../types';
import { SpeciesFormData } from '../../services/adminService';
import { GlassButton } from '../UI/GlassButton';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { X } from 'lucide-react';
import { logger } from '../../utils/logger';

interface AdminModalsProps {
  showPasswordModal: boolean;
  deletePassword: string;
  setDeletePassword: (password: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  deleteAction: { type: 'user' | 'species' | 'tree', id: string } | null;
  
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
  const treeImageInputRef = useRef<HTMLInputElement>(null);
  const leafImageInputRef = useRef<HTMLInputElement>(null);
  const barkImageInputRef = useRef<HTMLInputElement>(null);
  const fruitImageInputRef = useRef<HTMLInputElement>(null);

  const takePhotoForType = async (type: 'treeImage' | 'leafImage' | 'barkImage' | 'fruitImage') => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `${type}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        setSpeciesFormData({
          ...speciesFormData,
          [type]: file
        });
      }
    } catch (error) {
      logger.error('Error taking photo:', error);
    }
  };

  const selectFromGallery = (type: 'treeImage' | 'leafImage' | 'barkImage' | 'fruitImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSpeciesFormData({
          ...speciesFormData,
          [type]: file
        });
      }
    };
    
    input.click();
  };

  const removeImage = (type: 'treeImage' | 'leafImage' | 'barkImage' | 'fruitImage') => {
    setSpeciesFormData({
      ...speciesFormData,
      [type]: undefined
    });
  };

  const getImagePreview = (type: 'treeImage' | 'leafImage' | 'barkImage' | 'fruitImage') => {
    const file = speciesFormData[type];
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  const ImageSection = ({ 
    type, 
    label 
  }: { 
    type: 'treeImage' | 'leafImage' | 'barkImage' | 'fruitImage';
    label: string;
  }) => {
    const preview = getImagePreview(type);
    
    return (
      <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">{label}</span>
        </div>
        <div className="space-y-2">
          <div className="flex gap-1">
            <GlassButton
              onClick={() => takePhotoForType(type)}
              className="flex-1"
              size="xs"
              variant="primary"
            >
              <span className="text-xs">Zrób zdjęcie</span>
            </GlassButton>
            <GlassButton
              onClick={() => selectFromGallery(type)}
              className="flex-1"
              size="xs"
              variant="secondary"
            >
              <span className="text-xs">Wybierz zdjęcie</span>
            </GlassButton>
          </div>
          {preview && (
            <div className="relative aspect-square">
              <img
                src={preview}
                alt={label}
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => removeImage(type)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

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

      {/* Species Form Modal - styl ReportPage */}
      {showSpeciesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-xl p-2 sm:p-3 w-full max-w-2xl my-4"
          >
            <div className="relative rounded-xl p-1 shadow-lg mb-2 sm:mb-3" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
                <form onSubmit={handleSpeciesSubmit} className="space-y-1 sm:space-y-2 p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {editingSpecies ? 'Edytuj gatunek' : 'Dodaj nowy gatunek'}
                    </h3>
                    <button
                      type="button"
                      onClick={closeSpeciesModal}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nazwa polska *
                      </label>
                      <input
                        type="text"
                        value={speciesFormData.polishName}
                        onChange={(e) => setSpeciesFormData({ ...speciesFormData, polishName: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nazwa łacińska *
                      </label>
                      <input
                        type="text"
                        value={speciesFormData.latinName}
                        onChange={(e) => setSpeciesFormData({ ...speciesFormData, latinName: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rodzina *
                    </label>
                    <input
                      type="text"
                      value={speciesFormData.family}
                      onChange={(e) => setSpeciesFormData({ ...speciesFormData, family: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Opis
                    </label>
                    <textarea
                      value={speciesFormData.description || ''}
                      onChange={(e) => setSpeciesFormData({ ...speciesFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                    {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
                      <div key={season} className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {season === 'spring' ? 'Wiosna' : season === 'summer' ? 'Lato' : season === 'autumn' ? 'Jesień' : 'Zima'} *
                        </label>
                        <input
                          type="text"
                          value={speciesFormData.seasonalChanges[season]}
                          onChange={(e) => setSpeciesFormData({ 
                            ...speciesFormData, 
                            seasonalChanges: { ...speciesFormData.seasonalChanges, [season]: e.target.value }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2">
                    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maksymalna wysokość (m)
                      </label>
                      <input
                        type="number"
                        value={speciesFormData.traits.maxHeight || ''}
                        onChange={(e) => setSpeciesFormData({ 
                          ...speciesFormData, 
                          traits: { ...speciesFormData.traits, maxHeight: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Długość życia
                      </label>
                      <input
                        type="text"
                        value={speciesFormData.traits.lifespan || ''}
                        onChange={(e) => setSpeciesFormData({ 
                          ...speciesFormData, 
                          traits: { ...speciesFormData.traits, lifespan: e.target.value }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 flex items-center">
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
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Rodzimy dla Polski
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Zdjęcia */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                    <ImageSection type="treeImage" label="Zdjęcie drzewa" />
                    <ImageSection type="leafImage" label="Zdjęcie liści" />
                    <ImageSection type="barkImage" label="Zdjęcie kory" />
                    <ImageSection type="fruitImage" label="Zdjęcie owoców" />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <GlassButton
                      type="button"
                      onClick={closeSpeciesModal}
                      variant="secondary"
                      size="xs"
                      className="flex-1"
                    >
                      <span className="text-xs">Anuluj</span>
                    </GlassButton>
                    <GlassButton
                      type="submit"
                      variant="primary"
                      size="xs"
                      className="flex-1"
                    >
                      <span className="text-xs">{editingSpecies ? 'Zaktualizuj' : 'Dodaj'}</span>
                    </GlassButton>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
