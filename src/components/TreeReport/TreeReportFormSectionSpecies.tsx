import React, { useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SearchInput } from '../UI/SearchInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Species } from '../../types';
import { GlassButton } from '../UI/GlassButton';

interface TreeReportFormSectionSpeciesProps {
  speciesQuery: string;
  setSpeciesQuery: (query: string) => void;
  showSpeciesPanel: boolean;
  setShowSpeciesPanel: (show: boolean) => void;
  handleSpeciesInputFocus: () => void;
  filteredSpecies: Species[];
  isLoadingSpecies: boolean;
  handleSpeciesSelect: (species: Species | null) => void;
  selectedSpecies: Species | null;
  setEnlargedImage: (image: string | null) => void;
  photos: File[];
  setPhotos: (photos: File[]) => void;
  fileToBase64: (file: File) => Promise<string>;
  navigate: (path: string, options?: any) => void;
  treeName: string;
  setTreeName: (name: string) => void;
  pierśnica: string;
  setPierśnica: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  crownSpread: string;
  setCrownSpread: (value: string) => void;
  healthTags: string[];
  setHealthTags: (health: string[]) => void;
  isAlive: boolean;
  setIsAlive: (alive: boolean) => void;
  estimatedAge: string;
  setEstimatedAge: (age: string) => void;
  treeStories: string;
  setTreeStories: (stories: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  latitude?: number;
  longitude?: number;
  mapScreenshot?: File | null;
  onRegenerateScreenshot?: () => void;
  validationErrors?: Record<string, string>;
}

export const TreeReportFormSectionSpecies: React.FC<TreeReportFormSectionSpeciesProps> = ({
  speciesQuery,
  setSpeciesQuery,
  showSpeciesPanel,
  setShowSpeciesPanel,
  handleSpeciesInputFocus,
  filteredSpecies,
  isLoadingSpecies,
  handleSpeciesSelect,
  selectedSpecies,
  setEnlargedImage,
  photos,
  setPhotos,
  fileToBase64,
  navigate,
  treeName,
  setTreeName,
  pierśnica,
  setPierśnica,
  height,
  setHeight,
  crownSpread,
  setCrownSpread,
  healthTags,
  setHealthTags,
  isAlive,
  setIsAlive,
  estimatedAge,
  setEstimatedAge,
  treeStories,
  setTreeStories,
  notes,
  setNotes,
  latitude,
  longitude,
  mapScreenshot,
  onRegenerateScreenshot,
  validationErrors = {}
}) => {
  // Save/restore showSpeciesPanel state from localStorage
  useEffect(() => {
    // Try to restore state from localStorage when component mounts
    const savedPanelState = localStorage.getItem('showSpeciesPanel');
    if (savedPanelState === 'true') {
      setShowSpeciesPanel(true);
    }
  }, [setShowSpeciesPanel]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('showSpeciesPanel', showSpeciesPanel.toString());
  }, [showSpeciesPanel]);

  return (
    <div className="relative rounded-xl p-1 shadow-lg mb-2 sm:mb-3 w-full" style={{
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
      padding: '2px'
    }}>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="p-2 sm:p-3">
          <div className="space-y-1 sm:space-y-2">
            {/* Species selection */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Gatunek drzewa
              </label>
          
          {/* Search input */}
          <div className="relative">
            <SearchInput
              value={speciesQuery}
              onChange={setSpeciesQuery}
              placeholder="Polska lub łacińska nazwa"
              size="md"
              variant="compact"
              showClearButton={true}
            />
            <button
              type="button"
              onClick={() => setShowSpeciesPanel(!showSpeciesPanel)}
              className="no-focus absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 z-10"
            >
              {showSpeciesPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

              {/* Expandable species panel */}
          <AnimatePresence>
            {showSpeciesPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
              >
                <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      Gatunki
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {filteredSpecies.length} gatunków
                    </span>
                  </div>
                </div>

                <div className="max-h-[45rem] sm:max-h-[54rem] overflow-y-auto p-2 sm:p-3">
                  {isLoadingSpecies ? (
                    <div className="flex items-center justify-center py-2 sm:py-4">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-green-600"></div>
                      <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ładowanie gatunków...</span>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {filteredSpecies.map((species, index) => (
                        <div
                          key={species.id}
                          className={`group relative bg-white dark:bg-gray-800 transition-all overflow-hidden ${
                            index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''
                          }`}
                        >
                          {/* Species card for selection */}
                          <div className="p-2 sm:p-3">
                            {/* Clickable area for selecting species */}
                            <div
                              onClick={() => handleSpeciesSelect(species)}
                              className="cursor-pointer"
                            >
                            {/* Header with name and family */}
                            <div className="mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                  {species.polishName}
                                </h4>
                                <span className="text-gray-400">|</span>
                                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                  {species.latinName}
                                </p>
                                <span className="text-gray-400">|</span>
                                <p className="text-xs text-gray-500">
                                  {species.family}
                                </p>
                              </div>
                            </div>

                            {/* Images Grid - up to 4 images */}
                            <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2">
                              {species.images.slice(0, 4).map((image, index) => {
                                const typeLabels = {
                                  'Tree': 'Całościowe',
                                  'Leaf': 'Liście', 
                                  'Bark': 'Kora',
                                  'Fruit': 'Owoce',
                                  'Flower': 'Kwiaty'
                                };
                                return (
                                  <div key={index} className="relative group aspect-square">
                                    <img
                                      src={image.imageUrl}
                                      alt={image.altText || `${species.polishName} - ${typeLabels[image.type] || 'Zdjęcie'}`}
                                      className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEnlargedImage(image.imageUrl);
                                      }}
                                      crossOrigin={image.imageUrl?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                                    />
                                    <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                      {typeLabels[image.type] || 'Zdjęcie'}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Fill empty slots if less than 4 images */}
                              {Array.from({ length: Math.max(0, 4 - species.images.length) }).map((_, index) => (
                                <div key={`empty-${index}`} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-500">Brak zdjęcia</span>
                                </div>
                              ))}
                            </div>
                            </div>
                            
                            {/* Action buttons - Select and More Information */}
                            <div className="mt-4 sm:mt-6 pb-2 sm:pb-3 flex gap-2">
                              <GlassButton
                                onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                                  if (e) {
                                    e.stopPropagation();
                                  }
                                  handleSpeciesSelect(species);
                                }}
                                variant="primary"
                                size="xs"
                                className="flex-1"
                              >
                                Wybierz
                              </GlassButton>
                              <GlassButton
                                onClick={async (e?: React.MouseEvent<HTMLButtonElement>) => {
                                  if (e) {
                                    e.stopPropagation();
                                  }
                                  try {
                                    // Convert photos to base64 and save
                                    const photoBase64s = await Promise.all(
                                      photos.map(file => fileToBase64(file))
                                    );
                                    
                                    const formData = {
                                      speciesQuery,
                                      pierśnica,
                                      height,
                                      crownSpread,
                                      healthTags,
                                      isAlive,
                                      estimatedAge,
                                      treeStories,
                                      notes,
                                      photos: photoBase64s,
                                      latitude,
                                      longitude
                                    };
                                    localStorage.setItem('treeReportFormData', JSON.stringify(formData));
                                    
                                    // Set selected species in a temporary key for encyclopedia to prepare
                                    // Use different key to avoid conflict with useSelectedState
                                    localStorage.setItem('_temp_encyclopedia_selectedSpecies', species.id);
                                    localStorage.setItem('_temp_encyclopedia_returnTo', 'report');
                                    
                                    // Wait 0.5 seconds for encyclopedia page to prepare
                                    // This allows the encyclopedia component to mount and set up the species
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    
                                    // Navigate to encyclopedia - it will use temporary localStorage key to find the species
                                    navigate('/encyclopedia');
                                  } catch (error) {
                                    console.error('Error saving form data:', error);
                                  }
                                }}
                                variant="primary"
                                size="xs"
                                className="flex-1"
                              >
                                Szczegóły
                              </GlassButton>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

            {/* Selected species display */}
            <AnimatePresence mode="wait">
              {selectedSpecies && (
                <motion.div
                  key={selectedSpecies.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3 mb-2"
                >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                        {selectedSpecies.polishName}
                      </h3>
                      <p className="text-xs text-green-700 dark:text-green-300 font-mono italic">
                        {selectedSpecies.latinName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeciesSelect(null)}
                    className="text-green-400 hover:text-green-600 dark:hover:text-green-300"
                  >
                    ✕
                  </button>
                </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tree name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nazwa/Imię drzewa
              </label>
              <input
                type="text"
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
                placeholder="np. Dąb Bartek"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500 dark:bg-gray-800 dark:text-white transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Tree measurements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pierśnica (cm)
                </label>
                <input
                  type="number"
                  value={pierśnica}
                  onChange={(e) => setPierśnica(e.target.value)}
                  placeholder="np. 120"
                  min="0"
                  step="1"
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white transition-all ${
                    validationErrors.circumference 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                  } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                />
                {validationErrors.circumference && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{validationErrors.circumference}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Wysokość drzewa (m)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="np. 25"
                  min="0"
                  step="0.1"
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white transition-all ${
                    validationErrors.height 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                  } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                />
                {validationErrors.height && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{validationErrors.height}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rozpiętość korony (m)
                </label>
                <input
                  type="number"
                  value={crownSpread}
                  onChange={(e) => setCrownSpread(e.target.value)}
                  placeholder="np. 15"
                  min="0"
                  step="0.1"
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-0 dark:bg-gray-800 dark:text-white transition-all ${
                    validationErrors.crownSpread 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500'
                  } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                />
                {validationErrors.crownSpread && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{validationErrors.crownSpread}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
