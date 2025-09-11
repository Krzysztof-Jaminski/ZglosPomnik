import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Species } from '../types';
import { speciesService } from '../services/speciesService';
import { SpeciesCard } from '../components/Encyclopedia/SpeciesCard';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';


export const EncyclopediaPage: React.FC = () => {
  const location = useLocation();
  const [species, setSpecies] = useState<Species[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const data = await speciesService.getSpecies();
        setSpecies(data);
        setFilteredSpecies(data);
        
        // Check if we should show a specific species
        const selectedSpeciesId = location.state?.selectedSpecies;
        if (selectedSpeciesId) {
          const speciesItem = data.find(s => s.id === selectedSpeciesId);
          if (speciesItem) {
            setSelectedSpecies(speciesItem);
          }
        }
      } catch (error) {
        console.error('Error loading species:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecies();
  }, [location.state]);

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
        prev === selectedSpecies.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedSpecies) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? selectedSpecies.images.length - 1 : prev - 1
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
      <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <GlassButton
              onClick={() => setSelectedSpecies(null)}
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
            >
              Powrót do listy
            </GlassButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={selectedSpecies.images[selectedImageIndex]?.imageUrl}
                  alt={selectedSpecies.images[selectedImageIndex]?.altText || selectedSpecies.polishName}
                  className="w-full h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] xl:h-[36rem] object-cover cursor-pointer"
                  onClick={() => openImageViewer(selectedImageIndex)}
                />
              </div>
              
              {/* Image type indicator */}
              <div className="absolute top-4 right-4">
                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {getImageTypeLabel(selectedSpecies.images[selectedImageIndex]?.type || '')}
                </span>
              </div>

              {/* Navigation arrows */}
              {selectedSpecies.images.length > 1 && (
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
              {selectedSpecies.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {selectedSpecies.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {selectedSpecies.images.length > 1 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Galeria zdjęć
                </h3>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {selectedSpecies.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex 
                          ? 'border-green-500' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                      }`}
                    >
                      <img
                        src={image?.imageUrl}
                        alt={image?.altText || selectedSpecies.polishName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {selectedSpecies.polishName}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 italic mb-3">
                  {selectedSpecies.latinName}
                </p>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-500">
                  Rodzina: {selectedSpecies.family}
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Opis
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {selectedSpecies.description}
                  </p>

                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Przewodnik identyfikacji
                  </h3>
                  <ul className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                    {selectedSpecies.identificationGuide.map((guide, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-3 text-lg">•</span>
                        {guide}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Charakterystyka
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Maksymalna wysokość:</span>
                      <span className="text-base sm:text-lg text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.traits.maxHeight} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Żywotność:</span>
                      <span className="text-base sm:text-lg text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.traits.lifespan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Rodzimy dla Polski:</span>
                      <span className="text-base sm:text-lg text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.traits.nativeToPoland ? 'Tak' : 'Nie'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Zmiany sezonowe
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-base font-medium text-green-600 dark:text-green-400">Wiosna:</span>
                        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.spring}</p>
                      </div>
                      <div>
                        <span className="text-base font-medium text-green-600 dark:text-green-400">Lato:</span>
                        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.summer}</p>
                      </div>
                      <div>
                        <span className="text-base font-medium text-orange-600 dark:text-orange-400">Jesień:</span>
                        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.autumn}</p>
                      </div>
                      <div>
                        <span className="text-base font-medium text-blue-600 dark:text-blue-400">Zima:</span>
                        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.winter}</p>
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
    const currentImage = (selectedSpecies as Species).images[selectedImageIndex];
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
          />
          
          {(selectedSpecies as Species).images.length > 1 && (
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
                {selectedImageIndex + 1} / {(selectedSpecies as Species).images.length}
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
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj gatunku..."
              className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Species grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
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