import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { Species } from '../types';
import { speciesService } from '../services/speciesService';
import { SpeciesCard } from '../components/Encyclopedia/SpeciesCard';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';
import { useSearchState, useSelectedState, useUIState } from '../hooks/useLocalState';


export const EncyclopediaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [species, setSpecies] = useState<Species[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
  
  // Używamy hooków do zarządzania lokalnym stanem
  const [searchQuery, setSearchQuery] = useSearchState('encyclopedia');
  const [selectedSpecies, setSelectedSpecies] = useSelectedState<Species>('encyclopedia', 'species');
  const [selectedImageIndex, setSelectedImageIndex] = useUIState('encyclopedia', 'selectedImageIndex', 0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useUIState('encyclopedia', 'isImageViewerOpen', false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const data = await speciesService.getSpecies();
        setSpecies(data);
        setFilteredSpecies(data);
        
        // Check if we should show a specific species from location state or URL params
        const urlParams = new URLSearchParams(window.location.search);
        const speciesIdFromUrl = urlParams.get('species');
        const speciesIdFromState = location.state?.selectedSpecies;
        
        
        // Priority: location state first, then URL params
        const speciesId = speciesIdFromState || speciesIdFromUrl;
        
        if (speciesId) {
          const speciesItem = data.find(s => s.id === speciesId);
          if (speciesItem) {
            setSelectedSpecies(speciesItem);
          }
        } else {
        }
      } catch (error) {
        console.error('Error loading species:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecies();
  }, [location.state, location.search]);

  useEffect(() => {
    let filtered = species;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.polishName.toLowerCase().includes(query) ||
        s.latinName.toLowerCase().includes(query) ||
        s.family.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    setFilteredSpecies(filtered);
  }, [species, searchQuery]);

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  const nextImage = () => {
    if (selectedSpecies) {
      setSelectedImageIndex((prev) => 
        prev === (selectedSpecies.images || []).length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedSpecies) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? (selectedSpecies.images || []).length - 1 : prev - 1
      );
    }
  };

  const getImageTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'Bark': 'Kora',
      'Tree': 'Drzewo',
      'Leaf': 'Liście',
      'Fruit': 'Owoce',
      'Flower': 'Kwiaty'
    };
    return labels[type] || type;
  };

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isImageViewerOpen || !selectedSpecies) return;
      
      switch (event.key) {
        case 'Escape':
          closeImageViewer();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    if (isImageViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isImageViewerOpen, selectedSpecies]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Ładowanie encyklopedii...</p>
        </div>
      </div>
    );
  }

  // If a specific species is selected, show detailed view
  if (selectedSpecies) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          {/* Species info in header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="py-2 border-b border-gray-200 dark:border-gray-700 mb-2"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  const returnToFromUrl = urlParams.get('returnTo');
                  const returnToFromState = location.state?.returnTo;
                  
                  // Priority: location state first, then URL params
                  const returnTo = returnToFromState || returnToFromUrl;
                  
                  if (returnTo === 'report') {
                    // Return to report page using React Router
                    navigate('/report');
                  } else {
                    // Return to encyclopedia list - clear selected species
                    setSelectedSpecies(null);
                  }
                }}
                className="flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Powrót"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">
                {selectedSpecies.polishName}
              </h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                {selectedSpecies.latinName}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {selectedSpecies.family}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={(selectedSpecies.images || [])[selectedImageIndex]?.imageUrl}
                  alt={(selectedSpecies.images || [])[selectedImageIndex]?.altText || selectedSpecies.polishName}
                  className="w-full h-64 sm:h-80 object-cover cursor-pointer"
                  onClick={() => openImageViewer(selectedImageIndex)}
                  crossOrigin={(selectedSpecies.images || [])[selectedImageIndex]?.imageUrl?.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
                />
              </div>
              
              {/* Image type indicator */}
              <div className="absolute top-4 right-4">
                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {getImageTypeLabel((selectedSpecies.images || [])[selectedImageIndex]?.type || '')}
                </span>
              </div>

              {/* Navigation arrows */}
              {(selectedSpecies.images || []).length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {(selectedSpecies.images || []).length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {(selectedSpecies.images || []).length}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {(selectedSpecies.images || []).length > 1 && (
                <div className="p-2 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Galeria zdjęć
                </h3>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {(selectedSpecies.images || []).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex 
                          ? 'border-green-500' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                      }`}
                    >
                      <img
                        src={image?.imageUrl}
                        alt={image?.altText || selectedSpecies.polishName}
                        className="w-full h-full object-cover"
                        crossOrigin={image?.imageUrl?.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 sm:p-6">

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    Opis
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {selectedSpecies.description}
                  </p>

                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    Przewodnik identyfikacji
                  </h3>
                  <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-1">
                    {(selectedSpecies.identificationGuide || []).map((guide, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2 text-sm">•</span>
                        {guide}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    Charakterystyka
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Maksymalna wysokość:</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.traits.maxHeight} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Żywotność:</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.traits.lifespan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rodzimy dla Polski:</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.traits.nativeToPoland ? 'Tak' : 'Nie'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Zmiany sezonowe
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Wiosna:</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.spring}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Lato:</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.summer}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Jesień:</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.autumn}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Zima:</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.winter}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Image viewer modal
  if (isImageViewerOpen && selectedSpecies) {
    const currentImage = (selectedSpecies as Species).images?.[selectedImageIndex];
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        <div className="relative max-w-6xl max-h-full p-4">
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={currentImage?.imageUrl}
            alt={currentImage?.altText || (selectedSpecies as Species).polishName}
            className="max-w-full max-h-full object-contain"
            crossOrigin={currentImage?.imageUrl?.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
          />
          
          {((selectedSpecies as Species).images?.length || 0) > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {(selectedSpecies as Species).images?.length || 1}
                <span className="ml-2 text-sm">
                  - {getImageTypeLabel(currentImage?.type || '')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        {/* Search */}
        <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="text"
                placeholder="Szukaj gatunku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>
            
            {/* Clear Search Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded transition-colors text-sm"
              >
                Wyczyść
              </button>
            )}
          </div>
        </div>

        {/* Species grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {filteredSpecies.map((speciesItem) => (
            <div key={speciesItem.id}>
              <SpeciesCard 
                species={speciesItem} 
                onClick={() => setSelectedSpecies(speciesItem)}
              />
            </div>
          ))}
        </div>

        {filteredSpecies.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              Nie znaleziono gatunków spełniających kryteria wyszukiwania
            </p>
          </div>
        )}
      </div>
    </div>
  );
};