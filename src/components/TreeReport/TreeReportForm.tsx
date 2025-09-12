import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Search, ChevronDown, ChevronUp, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Species, NewTreeReport, ApiTreeSubmission } from '../../types';
import { speciesService } from '../../services/speciesService';
import { api } from '../../services/api';
import { treesService } from '../../services/treesService';
import { storage } from '../../utils/storage';
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
        // Note: photos can't be restored from localStorage as they are File objects
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
      return;
    }

    const query = speciesQuery.toLowerCase();
    const filtered = allSpecies.filter(species => 
      species.polishName.toLowerCase().includes(query) ||
      species.latinName.toLowerCase().includes(query) ||
      species.family.toLowerCase().includes(query)
    );
    setFilteredSpecies(filtered);
  }, [speciesQuery, allSpecies]);

  // Auto-save form data to localStorage
  React.useEffect(() => {
    const formData = {
      speciesQuery,
      pierśnica,
      height,
      plotNumber,
      condition,
      isAlive,
      estimatedAge,
      notes,
      photos: photos.length
    };
    localStorage.setItem('treeReportFormData', JSON.stringify(formData));
  }, [speciesQuery, pierśnica, height, plotNumber, condition, isAlive, estimatedAge, notes, photos.length]);

  const handleSpeciesInputFocus = () => {
    setShowSpeciesPanel(true);
  };

  const handleSpeciesSelect = (species: Species) => {
    setSelectedSpecies(species);
    setSpeciesQuery(`${species.polishName} (${species.latinName})`);
    setShowSpeciesPanel(false);
  };


  const handlePhotoAdd = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - photos.length);
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
        // Upload photos first if any
        let imageUrls: string[] = [];
        if (photos.length > 0) {
          for (const photo of photos) {
            try {
              const uploadedUrl = await api.uploadPhoto(photo);
              imageUrls.push(uploadedUrl);
            } catch (error) {
              console.error('Error uploading photo:', error);
              // Continue with other photos even if one fails
            }
          }
        }

        // Transform data to match API specification
        const apiTreeData: ApiTreeSubmission = {
          speciesId: selectedSpecies.id,
          location: {
            lat: latitude,
            lng: longitude,
            address: '' // We don't have address in the form, could be added later
          },
          circumference: pierśnica ? parseFloat(pierśnica) : 0,
          height: height ? parseFloat(height) : 0,
          condition: condition,
          isAlive: isAlive,
          estimatedAge: estimatedAge ? parseInt(estimatedAge) : 0,
          description: notes,
          images: imageUrls
        };

        // Submit to API
        await treesService.submitTreeReport(apiTreeData);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000); // Hide success message after 3 seconds
      } else {
        // Offline mode - store for later sync
        const report: NewTreeReport = {
          species: selectedSpecies.latinName,
          commonName: selectedSpecies.polishName,
          latitude,
          longitude,
          notes,
          photos,
          pierśnica: pierśnica ? parseFloat(pierśnica) : undefined,
          height: height ? parseFloat(height) : undefined,
          plotNumber: plotNumber || undefined
        };
        storage.addPendingReport(report);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000); // Hide success message after 3 seconds
      }
      
      // Reset form
      setSelectedSpecies(null);
      setSpeciesQuery('');
      setNotes('');
      setPhotos([]);
      setPierśnica('');
      setHeight('');
      setPlotNumber('');
      setCondition('good');
      setIsAlive(true);
      setEstimatedAge('');
      onSubmit?.();
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

      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8 text-base sm:text-lg"
        >
          <p className="text-green-800 dark:text-green-200">
            ✅ Zgłoszenie zostało pomyślnie wysłane!
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
            <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              onFocus={handleSpeciesInputFocus}
              placeholder="Polska lub łacińska nazwa"
              className="w-full pl-8 sm:pl-10 pr-10 sm:pr-14 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSpeciesPanel(!showSpeciesPanel)}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showSpeciesPanel ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
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
                                    />
                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                      {typeLabels[image.type] || 'Zdjęcie'}
                                    </div>
                                    <div className="absolute top-1 right-1 bg-black/70 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-4 h-4" />
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

                            {/* Go to Encyclopedia Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Save current form data to localStorage
                                const formData = {
                                  speciesQuery,
                                  pierśnica,
                                  height,
                                  plotNumber,
                                  condition,
                                  isAlive,
                                  estimatedAge,
                                  notes,
                                  photos: photos.length
                                };
                                localStorage.setItem('treeReportFormData', JSON.stringify(formData));
                                // Navigate to encyclopedia
                                window.location.href = `/encyclopedia?species=${species.id}&returnTo=report`;
                              }}
                              className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              Przejdź do encyklopedii
                            </button>
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
                icon={Camera}
              >
                Zrób zdjęcie
              </GlassButton>
              <GlassButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="xs"
                className="flex-1"
                icon={Upload}
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
              onChange={(e) => setIsAlive(e.target.value.toLowerCase() === 'tak')}
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
            disabled={!selectedSpecies || !latitude || !longitude || isSubmitting}
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