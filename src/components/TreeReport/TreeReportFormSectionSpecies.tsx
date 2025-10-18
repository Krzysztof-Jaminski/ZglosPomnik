import React from 'react';
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
  handleSpeciesSelect: (species: Species) => void;
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
  return (
    <div className="relative bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl w-full">
      <div className="space-y-2 sm:space-y-3">
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
              showClearButton={false}
            />
            <button
              type="button"
              onClick={() => setShowSpeciesPanel(!showSpeciesPanel)}
              className="no-focus absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showSpeciesPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Gatunki
                    </h3>
                    <span className="text-sm text-gray-500">
                      {filteredSpecies.length} gatunków
                    </span>
                  </div>
                </div>

                <div className="max-h-[20rem] sm:max-h-[24rem] overflow-y-auto p-2 sm:p-3">
                  {isLoadingSpecies ? (
                    <div className="flex items-center justify-center py-2 sm:py-4">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-green-600"></div>
                      <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">Ładowanie gatunków...</span>
                    </div>
                  ) : (
                    <div className="space-y-1 sm:space-y-2">
                      {filteredSpecies.map((species) => (
                        <div
                          key={species.id}
                          className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          {/* Species card for selection */}
                          <div
                            onClick={() => handleSpeciesSelect(species)}
                            className="p-2 sm:p-3"
                          >
                            {/* Header with name and family */}
                            <div className="mb-2">
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                                {species.polishName}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-1">
                                {species.latinName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Rodzina: {species.family}
                              </p>
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

                            {/* More Information Button */}
                            <div className="mt-2">
                              <GlassButton
                                onClick={async () => {
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
                                      condition,
                                      detailedHealth,
                                      isAlive,
                                      estimatedAge,
                                      treeStories,
                                      notes,
                                      photos: photoBase64s,
                                      latitude,
                                      longitude
                                    };
                                    localStorage.setItem('treeReportFormData', JSON.stringify(formData));
                                    // Navigate to encyclopedia using React Router with state
                                    navigate('/encyclopedia', { 
                                      state: { 
                                        selectedSpecies: species.id,
                                        returnTo: 'report'
                                      }
                                    });
                                  } catch (error) {
                                    console.error('Error saving form data:', error);
                                  }
                                }}
                                variant="primary"
                                size="xs"
                                className="w-full"
                              >
                                Więcej informacji
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
        {selectedSpecies && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {selectedSpecies.polishName}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-mono italic">
                    {selectedSpecies.latinName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSpeciesSelect(null as any)}
                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
          />
        </div>

        {/* Tree measurements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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
                  : 'border-gray-300 dark:border-gray-600 focus:border-gray-400'
              }`}
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
                  : 'border-gray-300 dark:border-gray-600 focus:border-gray-400'
              }`}
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
                  : 'border-gray-300 dark:border-gray-600 focus:border-gray-400'
              }`}
            />
            {validationErrors.crownSpread && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{validationErrors.crownSpread}</p>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};
