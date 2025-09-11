import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeSpecies, NewTreeReport, ApiTreeSubmission } from '../../types';
import { api } from '../../services/api';
import { treesService } from '../../services/treesService';
import { storage } from '../../utils/storage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { GlassButton } from '../UI/GlassButton';
import { useNavigate } from 'react-router-dom';
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
  const [selectedSpecies, setSelectedSpecies] = useState<TreeSpecies | null>(null);
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [allSpecies, setAllSpecies] = useState<TreeSpecies[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<TreeSpecies[]>([]);
  const [showSpeciesPanel, setShowSpeciesPanel] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [pierśnica, setPierśnica] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [plotNumber, setPlotNumber] = useState<string>('');
  const [condition, setCondition] = useState<string>('good');
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [estimatedAge, setEstimatedAge] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Load all species when component mounts
  React.useEffect(() => {
    const loadAllSpecies = async () => {
      setIsLoadingSpecies(true);
      try {
        const species = await api.getSpecies();
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
      species.commonName.toLowerCase().includes(query) ||
      species.scientificName.toLowerCase().includes(query) ||
      species.family.toLowerCase().includes(query)
    );
    setFilteredSpecies(filtered);
  }, [speciesQuery, allSpecies]);

  const handleSpeciesInputFocus = () => {
    setShowSpeciesPanel(true);
  };

  const handleSpeciesSelect = (species: TreeSpecies) => {
    setSelectedSpecies(species);
    setSpeciesQuery(`${species.commonName} (${species.scientificName})`);
    setShowSpeciesPanel(false);
  };

  const handleSpeciesCardClick = (species: TreeSpecies) => {
    // Navigate to encyclopedia with the specific species
    navigate('/encyclopedia', { state: { selectedSpecies: species.id } });
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
          species: selectedSpecies.scientificName,
          commonName: selectedSpecies.commonName,
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
            <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              onFocus={handleSpeciesInputFocus}
              placeholder="Wpisz nazwę gatunku po polsku lub łacinie..."
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-14 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSpeciesPanel(!showSpeciesPanel)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Wybierz gatunek z encyklopedii
                    </h3>
                    <span className="text-base text-gray-500">
                      {filteredSpecies.length} gatunków
                    </span>
                  </div>
                </div>

                <div className="max-h-48 sm:max-h-96 overflow-y-auto p-3 sm:p-6">
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
                          className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer p-3 sm:p-4"
                        >
                          {/* Species card for selection */}
                          <div
                            onClick={() => handleSpeciesSelect(species)}
                            className="flex items-center space-x-3 sm:space-x-4"
                          >
                            <div className="flex-shrink-0">
                              <img
                                src={species.images[0]}
                                alt={species.commonName}
                                className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white text-base mb-1 truncate">
                                {species.commonName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-1 truncate">
                                {species.scientificName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {species.family}
                              </p>
                            </div>
                          </div>

                          {/* Encyclopedia link overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeciesCardClick(species);
                            }}
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Zobacz w encyklopedii"
                          >
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                          </button>
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
                  src={selectedSpecies.images[0]}
                  alt={selectedSpecies.commonName}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-medium text-green-900 dark:text-green-300">
                    {selectedSpecies.commonName}
                  </h4>
                  <p className="text-sm sm:text-base text-green-700 dark:text-green-400 italic">
                    {selectedSpecies.scientificName}
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
              Pierśnica (130 cm) <span className="text-gray-500">(cm)</span>
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
              Wysokość drzewa <span className="text-gray-500">(m)</span>
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
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            >
              <option value="excellent">Doskonały</option>
              <option value="good">Dobry</option>
              <option value="average">Średni</option>
              <option value="poor">Słaby</option>
              <option value="critical">Krytyczny</option>
            </select>
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Czy drzewo żyje?
            </label>
            <select
              value={isAlive ? 'true' : 'false'}
              onChange={(e) => setIsAlive(e.target.value === 'true')}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            >
              <option value="true">Tak</option>
              <option value="false">Nie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Szacowany wiek <span className="text-gray-500">(lata)</span>
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
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opisz stan drzewa, potrzebne działania, szczególne cechy..."
            rows={3}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all"
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
    </motion.div>
  );
};