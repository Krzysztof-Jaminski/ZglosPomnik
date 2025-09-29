import React from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
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
  plotNumber: string;
  setPlotNumber: (value: string) => void;
  condition: string;
  setCondition: (value: string) => void;
  detailedHealth: string[];
  setDetailedHealth: (health: string[]) => void;
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
  plotNumber,
  setPlotNumber,
  condition,
  setCondition,
  detailedHealth,
  setDetailedHealth,
  isAlive,
  setIsAlive,
  estimatedAge,
  setEstimatedAge,
  treeStories,
  setTreeStories,
  notes,
  setNotes,
  latitude,
  longitude
}) => {
  return (
    <div className="relative bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-400/30 rounded-xl p-4 sm:p-6 shadow-xl w-full">
      <div className="space-y-4 sm:space-y-5">
        {/* Species selection */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
            Gatunek drzewa
          </label>
          
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              onFocus={handleSpeciesInputFocus}
              placeholder="Polska lub łacińska nazwa"
              className="w-full pl-10 pr-12 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSpeciesPanel(!showSpeciesPanel)}
              className="no-focus absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Gatunki
                    </h3>
                    <span className="text-base text-gray-500">
                      {filteredSpecies.length} gatunków
                    </span>
                  </div>
                </div>

                <div className="max-h-[32rem] sm:max-h-[40rem] overflow-y-auto p-3 sm:p-6">
                  {isLoadingSpecies ? (
                    <div className="flex items-center justify-center py-4 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-600 dark:text-gray-300">Ładowanie gatunków...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {filteredSpecies.map((species) => (
                        <div
                          key={species.id}
                          className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          {/* Species card for selection */}
                          <div
                            onClick={() => handleSpeciesSelect(species)}
                            className="p-4 sm:p-6"
                          >
                            {/* Header with name and family */}
                            <div className="mb-4">
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                {species.polishName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-1">
                                {species.latinName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Rodzina: {species.family}
                              </p>
                            </div>

                            {/* Images Grid - up to 4 images */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 mb-4">
                              {species.images.slice(0, 4).map((image, index) => {
                                const typeLabels = {
                                  'Tree': 'Całościowe',
                                  'Leaf': 'Liście', 
                                  'Bark': 'Kora',
                                  'Fruit': 'Owoce',
                                  'Flower': 'Kwiaty'
                                };
                                return (
                                  <div key={index} className="relative group aspect-square sm:aspect-[4/3] lg:aspect-square">
                                    <img
                                      src={image.imageUrl}
                                      alt={image.altText || `${species.polishName} - ${typeLabels[image.type] || 'Zdjęcie'}`}
                                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEnlargedImage(image.imageUrl);
                                      }}
                                      crossOrigin={image.imageUrl?.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
                                    />
                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                      {typeLabels[image.type] || 'Zdjęcie'}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Fill empty slots if less than 4 images */}
                              {Array.from({ length: Math.max(0, 4 - species.images.length) }).map((_, index) => (
                                <div key={`empty-${index}`} className="aspect-square sm:aspect-[4/3] lg:aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500">Brak zdjęcia</span>
                                </div>
                              ))}
                            </div>

                            {/* More Information Button */}
                            <div className="mt-3">
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
                                      plotNumber,
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
                                size="sm"
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400">
                    {selectedSpecies.polishName}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-mono italic">
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
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nazwa/Imię drzewa
          </label>
          <input
            type="text"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            placeholder="np. Dąb Bartek"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
          />
        </div>

        {/* Tree measurements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pierśnica (cm)
            </label>
            <input
              type="number"
              value={pierśnica}
              onChange={(e) => setPierśnica(e.target.value)}
              placeholder="np. 120"
              min="0"
              step="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wysokość drzewa (m)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="np. 25"
              min="0"
              step="0.1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adres drzewa <span className="text-gray-500">(opcjonalny)</span>
          </label>
          <input
            type="text"
            value={plotNumber}
            onChange={(e) => setPlotNumber(e.target.value)}
            placeholder="np. ul. Słowackiego 15, 30-001 Kraków"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
          />
        </div>

      </div>
    </div>
  );
};
