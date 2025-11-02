import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import { SearchInput } from '../components/UI/SearchInput';
import { PhotoPicker } from '../components/UI/PhotoPicker';
import { useAutoTextarea } from '../hooks/useAutoTextarea';
import { Species } from '../types';
import { speciesService } from '../services/speciesService';
import { SpeciesCard } from '../components/Encyclopedia/SpeciesCard';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchState, useSelectedState, useUIState } from '../hooks/useLocalState';
import { adminService, SpeciesFormData } from '../services/adminService';
import { DeleteConfirmationModal } from '../components/UI/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';


export const EncyclopediaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isModerator } = useAuth();
  const [species, setSpecies] = useState<Species[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [speciesFormData, setSpeciesFormData] = useState<SpeciesFormData>({
    polishName: '',
    latinName: '',
    family: '',
    description: '',
    identificationGuide: [],
    seasonalChanges: { spring: '', summer: '', autumn: '', winter: '' },
    traits: { maxHeight: 0, lifespan: '', nativeToPoland: false },
    treeImage: undefined,
    leafImage: undefined,
    barkImage: undefined,
    fruitImage: undefined
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  // Używamy hooków do zarządzania lokalnym stanem
  const [searchQuery, setSearchQuery] = useSearchState('encyclopedia');
  const [selectedSpecies, setSelectedSpecies] = useSelectedState<Species>('encyclopedia', 'species');
  const [selectedImageIndex, setSelectedImageIndex] = useUIState('encyclopedia', 'selectedImageIndex', 0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useUIState('encyclopedia', 'isImageViewerOpen', false);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize selectedSpecies from temporary localStorage if available (for smooth navigation from report page)
  // This runs BEFORE loadSpecies to prepare the page
  useEffect(() => {
    const speciesIdFromStorage = localStorage.getItem('_temp_encyclopedia_selectedSpecies');
    if (speciesIdFromStorage) {
      // Check if we have cached species data
      const cachedSpecies = localStorage.getItem('cached_species');
      if (cachedSpecies) {
        try {
          const cachedData = JSON.parse(cachedSpecies);
          const speciesItem = cachedData.find((s: Species) => s.id === speciesIdFromStorage);
          if (speciesItem) {
            // Set species immediately from cache to prevent flickering
            setSelectedSpecies(speciesItem);
            localStorage.removeItem('_temp_encyclopedia_selectedSpecies');
            // Keep _temp_encyclopedia_returnTo until user navigates back
          }
        } catch (e) {
          console.warn('Failed to parse cached species for initialization:', e);
        }
      }
    }
  }, [setSelectedSpecies]);

  // Auto-resize for description-like fields (when editing)
  const { ref: descRef, onInput: onDescInput } = useAutoTextarea(speciesFormData.description || '');
  const { ref: guideRef, onInput: onGuideInput } = useAutoTextarea((speciesFormData.identificationGuide || []).join('\n'));
  const { ref: springRef, onInput: onSpringInput } = useAutoTextarea(speciesFormData.seasonalChanges.spring || '');
  const { ref: summerRef, onInput: onSummerInput } = useAutoTextarea(speciesFormData.seasonalChanges.summer || '');
  const { ref: autumnRef, onInput: onAutumnInput } = useAutoTextarea(speciesFormData.seasonalChanges.autumn || '');
  const { ref: winterRef, onInput: onWinterInput } = useAutoTextarea(speciesFormData.seasonalChanges.winter || '');

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        console.log('EncyclopediaPage: Loading species...');
        
        // Check for selected species from temporary localStorage FIRST (before loading data)
        const speciesIdFromStorage = localStorage.getItem('_temp_encyclopedia_selectedSpecies');
        
        // Try to load from localStorage first
        const cachedSpecies = localStorage.getItem('cached_species');
        let data: Species[] = [];
        
        if (cachedSpecies) {
          try {
            const cachedData = JSON.parse(cachedSpecies);
            const cacheTime = localStorage.getItem('cached_species_time');
            const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity;
            
            // Use cached data if less than 5 minutes old
            if (cacheAge < 5 * 60 * 1000 && Array.isArray(cachedData) && cachedData.length > 0) {
              console.log('EncyclopediaPage: Using cached species data');
              data = cachedData;
              setSpecies(data);
              setFilteredSpecies(data);
              setIsLoading(false);
              
              // If we have a selected species from temporary storage, set it immediately
              if (speciesIdFromStorage && !selectedSpecies) {
                const speciesItem = data.find(s => s.id === speciesIdFromStorage);
                if (speciesItem) {
                  setSelectedSpecies(speciesItem);
                  // Clear species from localStorage after using it
                  localStorage.removeItem('_temp_encyclopedia_selectedSpecies');
                  // Keep _temp_encyclopedia_returnTo until user navigates back
                }
              }
            }
          } catch (e) {
            console.warn('Failed to parse cached species:', e);
          }
        }
        
        // Always fetch fresh data in background
        const freshData = await speciesService.getSpecies();
        console.log('EncyclopediaPage: Loaded species count:', freshData.length);
        
        // Cache the data
        localStorage.setItem('cached_species', JSON.stringify(freshData));
        localStorage.setItem('cached_species_time', Date.now().toString());
        
        setSpecies(freshData);
        setFilteredSpecies(freshData);
        
        // Check if we should show a specific species from location state, URL params, or temporary localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const speciesIdFromUrl = urlParams.get('species');
        const speciesIdFromState = location.state?.selectedSpecies;
        
        // Priority: location state first, then URL params, then temporary localStorage
        // But only if we don't already have a selected species (to prevent flickering)
        if (!selectedSpecies) {
          const speciesId = speciesIdFromState || speciesIdFromUrl || speciesIdFromStorage;
          
          if (speciesId) {
            const speciesItem = freshData.find(s => s.id === speciesId);
            if (speciesItem) {
              setSelectedSpecies(speciesItem);
              // Clear species from localStorage after using it
              if (speciesIdFromStorage) {
                localStorage.removeItem('_temp_encyclopedia_selectedSpecies');
                // Keep _temp_encyclopedia_returnTo until user navigates back
              }
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading species:', error);
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

  // Don't show full screen loading - show content with spinner instead

  // If a specific species is selected, show detailed view
  if (selectedSpecies) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg overflow-hidden bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-300/40 dark:border-gray-700/40 shadow-xl"
          >
          {/* Header inside bordered container */}
          <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-300/40 dark:border-gray-700/40">
              <button
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  const returnToFromUrl = urlParams.get('returnTo');
                  const returnToFromState = location.state?.returnTo;
                  const returnToFromStorage = localStorage.getItem('_temp_encyclopedia_returnTo');
                  const returnTo = returnToFromState || returnToFromUrl || returnToFromStorage;
                  if (returnTo === 'report') {
                    // Clear temporary storage when navigating back
                    localStorage.removeItem('_temp_encyclopedia_returnTo');
                    localStorage.removeItem('_temp_encyclopedia_selectedSpecies');
                    navigate('/report');
                  } else {
                    setSelectedSpecies(null);
                  }
                }}
              className="flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/5"
                title="Powrót"
              >
              <ArrowLeft className="w-5 h-5" />
              </button>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {selectedSpecies.polishName}
              </h1>
            {isModerator && (
              <div className="ml-auto flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={async () => {
                        if (!selectedSpecies) return;
                        const [f0, f1, f2, f3] = editPhotos;
                        const updatedForm = {
                          ...speciesFormData,
                          treeImage: f0,
                          leafImage: f1,
                          barkImage: f2,
                          fruitImage: f3
                        };
                        setSpeciesFormData(updatedForm);
                        const uploadedCount = editPhotos.length;
                        const existingCount = (selectedSpecies.images || []).length;
                        if (existingCount + uploadedCount < 4) {
                          alert('Wymagane są łącznie 4 zdjęcia (istniejące + nowe).');
                          return;
                        }
                        const updated = await adminService.updateSpecies(selectedSpecies.id, updatedForm);
                        setSpecies(prev => prev.map(s => s.id === updated.id ? updated : s));
                        setFilteredSpecies(prev => prev.map(s => s.id === updated.id ? updated : s));
                        setSelectedSpecies(updated);
                        setIsEditing(false);
                        setEditPhotos([]);
                      }}
                      className="p-2 text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50/10 flex items-center justify-center min-h-[28px] min-w-[28px]"
                      title="Zapisz zmiany"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7"/><path d="M16 3H8v5h8V3z"/></svg>
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedSpecies) return;
                        setSpeciesFormData({
                          polishName: selectedSpecies.polishName,
                          latinName: selectedSpecies.latinName,
                          family: selectedSpecies.family,
                          description: selectedSpecies.description,
                          identificationGuide: selectedSpecies.identificationGuide,
                          seasonalChanges: selectedSpecies.seasonalChanges,
                          traits: selectedSpecies.traits
                        });
                        setIsEditing(false);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50/10 flex items-center justify-center min-h-[28px] min-w-[28px]"
                      title="Anuluj"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (!selectedSpecies) return;
                        setSpeciesFormData({
                          polishName: selectedSpecies.polishName,
                          latinName: selectedSpecies.latinName,
                          family: selectedSpecies.family,
                          description: selectedSpecies.description,
                          identificationGuide: selectedSpecies.identificationGuide,
                          seasonalChanges: selectedSpecies.seasonalChanges,
                          traits: selectedSpecies.traits
                        });
                        setIsEditing(true);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50/10 flex items-center justify-center min-h-[28px] min-w-[28px]"
                      title="Edytuj gatunek"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setPendingDeleteId(selectedSpecies.id); setShowDeleteModal(true); }}
                      className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50/10 flex items-center justify-center min-h-[28px] min-w-[28px]"
                      title="Usuń gatunek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

            <div className="relative">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={(selectedSpecies.images || [])[selectedImageIndex]?.imageUrl}
                  alt={(selectedSpecies.images || [])[selectedImageIndex]?.altText || selectedSpecies.polishName}
                  className="w-full h-64 sm:h-80 object-cover cursor-pointer"
                  onClick={() => openImageViewer(selectedImageIndex)}
                  crossOrigin={(selectedSpecies.images || [])[selectedImageIndex]?.imageUrl?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
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
                <div className="p-2">
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
                        crossOrigin={image?.imageUrl?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Latin and family under images (display mode) */}
          {!isEditing && (
            <div className="px-4 pt-1 pb-2">
              <div className="flex items-center gap-2 text-xs">
                <p className="text-gray-900 dark:text-gray-200 font-semibold">{selectedSpecies.polishName}</p>
                <span className="text-gray-500">|</span>
                <p className="text-gray-700 dark:text-gray-300 italic">{selectedSpecies.latinName}</p>
                <span className="text-gray-500">|</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedSpecies.family}</p>
                </div>
              </div>
            )}
            
            <div className="p-4 sm:p-6 pt-2 sm:pt-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                {/* Images section - use PhotoPicker from report; 4 slots for species */}
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Zdjęcia</h3>
                    </div>
                  ) : null}
                  {isEditing ? (
                    <PhotoPicker
                      photos={editPhotos}
                      onChange={setEditPhotos}
                      onSelectFromGallery={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.multiple = true;
                        input.onchange = (e: any) => {
                          const files = Array.from(e.target.files || []) as File[];
                          setEditPhotos((prev: File[]) => {
                            const combined = [...prev, ...files];
                            return combined.slice(0, 4);
                          });
                        };
                        input.click();
                      }}
                      maxPhotos={4}
                    />
                  ) : null}
                </div>

                <div>
                  {/* Editable header fields moved here to align right column - only in edit mode */}
                  {isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nazwa polska</label>
                        <input className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 placeholder-gray-400" value={speciesFormData.polishName} onChange={e => setSpeciesFormData({ ...speciesFormData, polishName: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nazwa łacińska</label>
                        <input className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 placeholder-gray-400" value={speciesFormData.latinName} onChange={e => setSpeciesFormData({ ...speciesFormData, latinName: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Rodzina</label>
                        <input className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 placeholder-gray-400" value={speciesFormData.family} onChange={e => setSpeciesFormData({ ...speciesFormData, family: e.target.value })} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Opis</h3>
                  </div>
                  {isEditing ? (
                    <textarea ref={descRef} onInput={onDescInput} className="w-full min-h-[90px] rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 placeholder-gray-400 resize-none overflow-hidden"
                      value={speciesFormData.description}
                      onChange={e => setSpeciesFormData({ ...speciesFormData, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{selectedSpecies.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Przewodnik identyfikacji</h3>
                  </div>
                  {isEditing ? (
                    <textarea ref={guideRef} onInput={onGuideInput} className="w-full min-h-[110px] rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 placeholder-gray-400 resize-none overflow-hidden"
                      placeholder="Każdy punkt w nowej linii"
                      value={(speciesFormData.identificationGuide || []).join('\n')}
                      onChange={e => setSpeciesFormData({ ...speciesFormData, identificationGuide: e.target.value.split('\n').filter(Boolean) })}
                    />
                  ) : (
                  <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-1">
                    {(selectedSpecies.identificationGuide || []).map((guide, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2 text-sm">•</span>
                        {guide}
                      </li>
                    ))}
                  </ul>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Charakterystyka</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Maksymalna wysokość (m):</span>
                      {isEditing ? (
                        <input type="number" className="w-28 rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1 text-xs sm:text-sm text-gray-100 text-right"
                          value={speciesFormData.traits.maxHeight || 0}
                          onChange={e => setSpeciesFormData({ ...speciesFormData, traits: { ...speciesFormData.traits, maxHeight: Number(e.target.value) } })}
                        />
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">{selectedSpecies.traits.maxHeight} m</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Żywotność:</span>
                      {isEditing ? (
                        <input className="w-48 rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1 text-xs sm:text-sm text-gray-100 text-right"
                          value={speciesFormData.traits.lifespan || ''}
                          onChange={e => setSpeciesFormData({ ...speciesFormData, traits: { ...speciesFormData.traits, lifespan: e.target.value } })}
                        />
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">{selectedSpecies.traits.lifespan}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rodzimy dla Polski:</span>
                      {isEditing ? (
                        <input type="checkbox" className="w-4 h-4" checked={!!speciesFormData.traits.nativeToPoland} onChange={e => setSpeciesFormData({ ...speciesFormData, traits: { ...speciesFormData.traits, nativeToPoland: e.target.checked } })} />
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">{selectedSpecies.traits.nativeToPoland ? 'Tak' : 'Nie'}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Zmiany sezonowe</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Wiosna:</span>
                        {isEditing ? (
                          <textarea ref={springRef} onInput={onSpringInput} className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 mt-1 resize-none overflow-hidden" value={speciesFormData.seasonalChanges.spring} onChange={e => setSpeciesFormData({ ...speciesFormData, seasonalChanges: { ...speciesFormData.seasonalChanges, spring: e.target.value } })} />
                        ) : (
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.spring}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Lato:</span>
                        {isEditing ? (
                          <textarea ref={summerRef} onInput={onSummerInput} className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 mt-1 resize-none overflow-hidden" value={speciesFormData.seasonalChanges.summer} onChange={e => setSpeciesFormData({ ...speciesFormData, seasonalChanges: { ...speciesFormData.seasonalChanges, summer: e.target.value } })} />
                        ) : (
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.summer}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Jesień:</span>
                        {isEditing ? (
                          <textarea ref={autumnRef} onInput={onAutumnInput} className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 mt-1 resize-none overflow-hidden" value={speciesFormData.seasonalChanges.autumn} onChange={e => setSpeciesFormData({ ...speciesFormData, seasonalChanges: { ...speciesFormData.seasonalChanges, autumn: e.target.value } })} />
                        ) : (
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.autumn}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Zima:</span>
                        {isEditing ? (
                          <textarea ref={winterRef} onInput={onWinterInput} className="w-full rounded-md bg-gray-900/40 dark:bg-gray-800/60 border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-0 px-2 py-1.5 text-xs sm:text-sm text-gray-100 mt-1 resize-none overflow-hidden" value={speciesFormData.seasonalChanges.winter} onChange={e => setSpeciesFormData({ ...speciesFormData, seasonalChanges: { ...speciesFormData.seasonalChanges, winter: e.target.value } })} />
                        ) : (
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{selectedSpecies.seasonalChanges.winter}</p>
                        )}
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
        <div className="relative max-w-7xl max-h-[90vh] p-4">
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
            crossOrigin={currentImage?.imageUrl?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
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
      {/* Search */}
      <div className="px-3 py-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Szukaj gatunku..."
          size="md"
          variant="compact"
          showClearButton={false}
        />
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6">
        {/* Species grid */}
        {isLoading && filteredSpecies.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ładowanie gatunków...</p>
            </div>
          </div>
        ) : (
          <>
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

            {filteredSpecies.length === 0 && !isLoading && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                  Nie znaleziono gatunków spełniających kryteria wyszukiwania
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (!pendingDeleteId) return;
          await adminService.deleteSpecies(pendingDeleteId);
          setFilteredSpecies(prev => prev.filter(s => s.id !== pendingDeleteId));
          setSpecies(prev => prev.filter(s => s.id !== pendingDeleteId));
          setShowDeleteModal(false);
          setPendingDeleteId(null);
        }}
        title="Usuń gatunek"
        message="Czy na pewno chcesz usunąć ten gatunek?"
      />

      
    </div>
  );
};