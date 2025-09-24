import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Species, ApiTreeSubmission } from '../../types';
import { speciesService } from '../../services/speciesService';
import { treesService } from '../../services/treesService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { GlassButton } from '../UI/GlassButton';
import { useAuth } from '../../context/AuthContext';


interface TreeReportFormProps {
  latitude?: number;
  longitude?: number;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export const TreeReportForm: React.FC<TreeReportFormProps> = ({
  latitude,
  longitude,
  onSubmit,
  onCancel
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
  const [showSpeciesPanel, setShowSpeciesPanel] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [pierśnica, setPierśnica] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [plotNumber, setPlotNumber] = useState<string>('');
  const [condition, setCondition] = useState<string>('dobry');
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [estimatedAge, setEstimatedAge] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Load form data from localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('treeReportFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        setSpeciesQuery(formData.speciesQuery || '');
        setPierśnica(formData.pierśnica || '');
        setHeight(formData.height || '');
        setPlotNumber(formData.plotNumber || '');
        setCondition(formData.condition || 'dobry');
        setIsAlive(formData.isAlive !== undefined ? formData.isAlive : true);
        setEstimatedAge(formData.estimatedAge || '');
        setNotes(formData.notes || '');
        
        // Restore photos from base64
        if (formData.photos && Array.isArray(formData.photos)) {
          const restoredPhotos = formData.photos.map((base64: string, index: number) => 
            base64ToFile(base64, `photo_${index}.jpg`)
          );
          setPhotos(restoredPhotos);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Load all species when component mounts
  React.useEffect(() => {
    const loadAllSpecies = async () => {
      setIsLoadingSpecies(true);
      try {
        const species = await speciesService.getSpecies();
        setAllSpecies(species);
        setFilteredSpecies(species);
        
        // Check if we need to restore selected species from localStorage
        const savedData = localStorage.getItem('treeReportFormData');
        if (savedData) {
          try {
            const formData = JSON.parse(savedData);
            if (formData.speciesQuery) {
              // Find matching species by Polish or Latin name (case-insensitive)
              const matchingSpecies = species.find(s => 
                s.polishName.toLowerCase().trim() === formData.speciesQuery.toLowerCase().trim() ||
                s.latinName.toLowerCase().trim() === formData.speciesQuery.toLowerCase().trim()
              );
              if (matchingSpecies) {
                setSelectedSpecies(matchingSpecies);
              }
            }
          } catch (error) {
            console.error('Error restoring selected species:', error);
          }
        }
      } catch (error) {
        console.error('Error loading species:', error);
      } finally {
        setIsLoadingSpecies(false);
      }
    };

    loadAllSpecies();
  }, []);

  // Filter species based on search query
  React.useEffect(() => {
    if (!speciesQuery.trim()) {
      setFilteredSpecies(allSpecies);
      setSelectedSpecies(null); // Clear selection when query is empty
      return;
    }

    const query = speciesQuery.toLowerCase();
    const filtered = allSpecies.filter(species => 
      species.polishName.toLowerCase().includes(query) ||
      species.latinName.toLowerCase().includes(query) ||
      species.family.toLowerCase().includes(query)
    );
    setFilteredSpecies(filtered);

    // Auto-select species if exact match found (case-insensitive)
    const exactMatch = allSpecies.find(species => 
      species.polishName.toLowerCase().trim() === query.trim() ||
      species.latinName.toLowerCase().trim() === query.trim()
    );
    
    if (exactMatch) {
      console.log('Found exact match for species:', exactMatch.polishName, 'ID:', exactMatch.id);
      setSelectedSpecies(exactMatch);
    } else {
      console.log('No exact match found for query:', query);
      console.log('Available species:', allSpecies.map(s => s.polishName));
      setSelectedSpecies(null);
    }
  }, [speciesQuery, allSpecies]);

  // Auto-save form data to localStorage
  React.useEffect(() => {
    const saveFormData = async () => {
      try {
        // Convert photos to base64
        const photoBase64s = await Promise.all(
          photos.map(file => fileToBase64(file))
        );
        
        const formData = {
          speciesQuery,
          pierśnica,
          height,
          plotNumber,
          condition,
          isAlive,
          estimatedAge,
          notes,
          photos: photoBase64s,
          latitude,
          longitude
        };
        localStorage.setItem('treeReportFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };
    
    saveFormData();
  }, [speciesQuery, pierśnica, height, plotNumber, condition, isAlive, estimatedAge, notes, photos, latitude, longitude]);

  // Convert File to base64 for localStorage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Convert base64 back to File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSpeciesInputFocus = () => {
    setShowSpeciesPanel(true);
  };

  const handleSpeciesSelect = (species: Species) => {
    setSelectedSpecies(species);
    setSpeciesQuery(species.polishName); // Only Polish name
    setShowSpeciesPanel(false);
  };


  const handlePhotoAdd = async (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - photos.length);
      
      // Walidacja plików
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      for (const file of newPhotos) {
        if (!allowedTypes.includes(file.type)) {
          alert(`Plik ${file.name} nie jest prawidłowym obrazem. Dozwolone formaty: JPG, PNG, JPEG`);
          return;
        }
        
        if (file.size > maxSize) {
          alert(`Plik ${file.name} jest za duży. Maksymalny rozmiar: 5MB`);
          return;
        }
      }
      
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecies || !latitude || !longitude) return;

    // Check authentication status
    console.log('Auth status:', { isAuthenticated, user: user?.email });
    if (!isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isOnline) {
        // Validate photos
        if (photos.length === 0) {
          alert('Proszę dodać przynajmniej jedno zdjęcie drzewa');
          setIsSubmitting(false);
          return;
        }

        // Transform data to match API specification
        const apiTreeData: ApiTreeSubmission = {
          speciesId: selectedSpecies.id.toUpperCase(), // Convert to uppercase for backend
          location: {
            lat: latitude,
            lng: longitude,
            address: plotNumber.trim() || 'Unknown address' // Use plot number as address, fallback to "Unknown address"
          },
          circumference: pierśnica ? parseFloat(pierśnica) : 0,
          height: height ? parseFloat(height) : 0,
          condition: condition,
          isAlive: isAlive,
          estimatedAge: estimatedAge ? parseInt(estimatedAge) : 0,
          description: notes,
          isMonument: false // Default to false, can be changed later
        };

        // Submit to API with photos
        console.log('=== TREE SUBMISSION DEBUG ===');
        console.log('Species ID (original):', selectedSpecies.id);
        console.log('Species ID (uppercase):', apiTreeData.speciesId);
        console.log('Species name:', selectedSpecies.polishName);
        console.log('Plot number:', plotNumber);
        console.log('Address:', apiTreeData.location.address);
        console.log('Location:', apiTreeData.location);
        console.log('Photos count:', photos.length);
        console.log('Full API data:', apiTreeData);
        
        const result = await treesService.submitTreeReport(apiTreeData, photos);
        console.log('Tree report submitted successfully:', result);
        
        setSubmitSuccess(true);
        
        // Clear localStorage after successful submission
        localStorage.removeItem('treeReportFormData');
        
        // Reset form
        setSelectedSpecies(null);
        setSpeciesQuery('');
        setNotes('');
        setPhotos([]);
        setPierśnica('');
        setHeight('');
        setPlotNumber('');
        setCondition('dobry');
        setIsAlive(true);
        setEstimatedAge('');
        
        // Navigate to map after 4 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          onSubmit?.();
        }, 4000);
      } else {
        // Offline mode - show message that internet is required
        alert('Wymagane połączenie z internetem do wysłania zgłoszenia. Proszę sprawdzić połączenie i spróbować ponownie.');
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while AuthProvider is initializing
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 sm:p-8 w-full mx-auto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Ładowanie...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 sm:p-8 w-full mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8 text-base sm:text-lg"
        >
          <p className="text-green-800 dark:text-green-200">
            Tryb offline - zgłoszenie zostanie zsynchronizowane po powrocie internetu
          </p>
        </motion.div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Species selection */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
            Gatunek drzewa
          </label>
          
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              onFocus={handleSpeciesInputFocus}
              placeholder="Polska lub łacińska nazwa"
              className="w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSpeciesPanel(!showSpeciesPanel)}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showSpeciesPanel ? '▲' : '▼'}
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
                                    <div className="absolute top-1 right-1 bg-black/70 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      🔍
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
                                      isAlive,
                                      estimatedAge,
                                      notes,
                                      photos: photoBase64s
                                    };
                                    localStorage.setItem('treeReportFormData', JSON.stringify(formData));
                                    // Navigate to encyclopedia
                                    window.location.href = `/encyclopedia?species=${species.id}&returnTo=report`;
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

                  {!isLoadingSpecies && filteredSpecies.length === 0 && (
                    <div className="text-center py-4 sm:py-8">
                      <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                        Nie znaleziono gatunków spełniających kryteria wyszukiwania
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected species display */}
          {selectedSpecies && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src={selectedSpecies.images[0]?.imageUrl || '/logo.png'}
                  alt={selectedSpecies.images[0]?.altText || selectedSpecies.polishName}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                  crossOrigin={selectedSpecies.images[0]?.imageUrl?.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
                />
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-medium text-green-900 dark:text-green-300">
                    {selectedSpecies.polishName}
                  </h4>
                  <p className="text-sm sm:text-base text-green-700 dark:text-green-400 italic">
                    {selectedSpecies.latinName}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    Rodzina: {selectedSpecies.family}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecies(null);
                    setSpeciesQuery('');
                  }}
                  className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Location display */}
        {latitude && longitude && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Lokalizacja
            </label>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-mono">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* Photos */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zdjęcia drzewa
          </label>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Tree photo ${index + 1}`}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 text-white rounded-full p-1 hover:bg-green-600 transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </motion.div>
            ))}
          </div>
          
          {photos.length < 5 && (
            <div className="flex space-x-2 sm:space-x-3">
              <GlassButton
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                variant="secondary"
                size="xs"
                className="flex-1"
              >
                Zrób zdjęcie
              </GlassButton>
              <GlassButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="xs"
                className="flex-1"
              >
                Wybierz z galerii
              </GlassButton>
            </div>
          )}
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => handlePhotoAdd(e.target.files)}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handlePhotoAdd(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Tree measurements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
              step="0.1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
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
              placeholder="np. 15"
              min="0"
              step="0.1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numer działki <span className="text-gray-500">(opcjonalny)</span>
            </label>
            <input
              type="text"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              placeholder="np. 123/4"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Tree condition and status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stan drzewa
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="np. dobry, średni, słaby"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Czy drzewo żyje?
            </label>
            <input
              type="text"
              value={isAlive ? 'tak' : 'nie'}
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                if (value === 'tak' || value === 'yes' || value === 'true' || value === '1') {
                  setIsAlive(true);
                } else if (value === 'nie' || value === 'no' || value === 'false' || value === '0') {
                  setIsAlive(false);
                }
                // Allow user to type freely - don't force immediate conversion
              }}
              placeholder="tak / nie"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Szacowany wiek (lata)
            </label>
            <input
              type="number"
              value={estimatedAge}
              onChange={(e) => setEstimatedAge(e.target.value)}
              placeholder="np. 50"
              min="0"
              step="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uwagi i opis stanu drzewa
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="Opisz stan drzewa, potrzebne działania, szczególne cechy..."
            rows={5}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[120px]"
          />
        </div>

        {/* Submit button */}
        <div className="flex space-x-2 sm:space-x-3">
          {onCancel && (
            <GlassButton
              type="button"
              onClick={onCancel}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              Anuluj
            </GlassButton>
          )}
          <GlassButton
            type="submit"
            disabled={
              !selectedSpecies || 
              !latitude || 
              !longitude || 
              !pierśnica.trim() || 
              !height.trim() || 
              !condition.trim() || 
              !estimatedAge.trim() || 
              !notes.trim() || 
              isSubmitting
            }
            className="flex-1"
            size="sm"
            variant="primary"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Wysyłanie...</span>
              </div>
            ) : (
              <span className="text-sm">Wyślij</span>
            )}
          </GlassButton>
        </div>
      </form>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-5 mt-4 sm:mt-6 text-base sm:text-lg"
        >
          <p className="text-green-800 dark:text-green-200">
            ✅ Zgłoszenie zostało pomyślnie wysłane do bazy danych!<br/>
            <span className="text-sm">Za chwilę zostaniesz przekierowany na mapę...</span>
          </p>
        </motion.div>
      )}


      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedImage}
                alt="Powiększone zdjęcie"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};