import React, { useState } from 'react';
import { X, TreePine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Species, ApiTreeSubmission } from '../../types';
import { speciesService } from '../../services/speciesService';
import { treesService } from '../../services/treesService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { GlassButton } from '../UI/GlassButton';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TreeReportFormSectionSpecies } from './TreeReportFormSectionSpecies';
import { TreeReportFormSectionDetails } from './TreeReportFormSectionDetails';
import { TreeReportFormSectionNotes } from './TreeReportFormSectionNotes';


interface TreeReportFormProps {
  latitude?: number;
  longitude?: number;
  onSubmit?: (location?: { lat: number; lng: number }) => void;
  onCancel?: () => void;
  photos?: File[];
  setPhotos?: (photos: File[]) => void;
}

export const TreeReportForm: React.FC<TreeReportFormProps> = ({
  latitude,
  longitude,
  onSubmit,
  onCancel,
  photos: externalPhotos,
  setPhotos: setExternalPhotos
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
  const [showSpeciesPanel, setShowSpeciesPanel] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>(externalPhotos || []);

  // Synchronize photos with external state
  React.useEffect(() => {
    console.log('TreeReportForm: externalPhotos changed:', externalPhotos?.length || 0, 'photos');
    if (externalPhotos !== undefined) {
      setPhotos(externalPhotos);
    }
  }, [externalPhotos]);

  // Update external photos when internal photos change
  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
    if (setExternalPhotos) {
      setExternalPhotos(newPhotos);
    }
  };
  const [pierśnica, setPierśnica] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [crownSpread, setCrownSpread] = useState<string>('');
  const [condition, setCondition] = useState<string>('dobry');
  const [detailedHealth, setDetailedHealth] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState({
    health: false,
    soil: false,
    environment: false
  });
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [estimatedAge, setEstimatedAge] = useState<string>('');
  const [treeName, setTreeName] = useState<string>('');
  const [treeStories, setTreeStories] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const isOnline = useOnlineStatus();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Load form data from localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('treeReportFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        setSpeciesQuery(formData.speciesQuery || '');
        setSelectedSpecies(formData.selectedSpecies || null);
        setTreeName(formData.treeName || '');
        setPierśnica(formData.pierśnica || '');
        setHeight(formData.height || '');
        setCrownSpread(formData.crownSpread || '');
        setCondition(formData.condition || 'dobry');
        setDetailedHealth(formData.detailedHealth || []);
        // isAlive nie jest przywracane z localStorage - zostaje domyślne
        setEstimatedAge(formData.estimatedAge || '');
        setTreeStories(formData.treeStories || '');
        setNotes(formData.notes || '');
        
        // Restore photos from base64
        if (formData.photos && Array.isArray(formData.photos)) {
          const restoredPhotos = formData.photos.map((base64: string, index: number) => 
            base64ToFile(base64, `photo_${index}.jpg`)
          );
          handlePhotosChange(restoredPhotos);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Auto-save form data to localStorage whenever it changes
  React.useEffect(() => {
    const saveFormData = async () => {
      try {
        // Convert photos to base64 for storage
        const photoBase64s = await Promise.all(
          photos.map(file => fileToBase64(file))
        );
        
        const formData = {
          speciesQuery,
          selectedSpecies,
          treeName,
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
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };

    // Only save if we have some data (not on initial empty state)
    if (speciesQuery || treeName || pierśnica || height || crownSpread || notes || treeStories || photos.length > 0) {
      saveFormData();
    }
  }, [speciesQuery, selectedSpecies, treeName, pierśnica, height, crownSpread, condition, detailedHealth, isAlive, estimatedAge, treeStories, notes, photos, latitude, longitude]);

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
      setSelectedSpecies(exactMatch);
    } else {
      setSelectedSpecies(null);
    }
  }, [speciesQuery, allSpecies]);

  // Auto-save form data to localStorage (bez isAlive - nie zapisujemy tego pola)
  React.useEffect(() => {
    const saveFormData = async () => {
      try {
        // Convert photos to base64
        const photoBase64s = await Promise.all(
          photos.map(file => fileToBase64(file))
        );
        
        const formData = {
          speciesQuery,
          selectedSpecies,
          treeName,
          pierśnica,
          height,
          crownSpread,
          condition,
          detailedHealth,
          estimatedAge,
          treeStories,
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
  }, [speciesQuery, selectedSpecies, treeName, pierśnica, height, condition, detailedHealth, estimatedAge, treeStories, notes, photos, latitude, longitude]);

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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecies || !latitude || !longitude) return;

    // Check authentication status
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
            address: '', // Address is auto-generated by backend
            plotNumber: '', // Will be populated by backend
            district: '', // Will be populated by backend
            province: '', // Will be populated by backend
            county: '', // Will be populated by backend
            commune: '' // Will be populated by backend
          },
          circumference: pierśnica ? parseFloat(pierśnica) : 0,
          height: height ? parseFloat(height) : 0,
          crownSpread: crownSpread ? parseFloat(crownSpread) : 0,
          condition: condition,
          isAlive: isAlive,
          estimatedAge: estimatedAge ? parseInt(estimatedAge) : 0,
          name: treeName,
          description: notes,
          legend: treeStories,
          isMonument: false // Default to false, can be changed later
        };

        // Submit to API with photos
        
        await treesService.submitTreeReport(apiTreeData, photos);
        
        // Clear localStorage after successful submission
        localStorage.removeItem('treeReportFormData');
        
        // Reset form
        setSelectedSpecies(null);
        setSpeciesQuery('');
        setTreeName('');
        setNotes('');
        setTreeStories('');
        handlePhotosChange([]);
        setPierśnica('');
        setHeight('');
        setCrownSpread('');
        setCondition('dobry');
        setIsAlive(true);
        setEstimatedAge('');
        setDetailedHealth([]);
        
        // Navigate to map after 4 seconds with tree location
        setTimeout(() => {
          onSubmit?.(apiTreeData.location);
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
      className="w-full"
    >
      <div className="flex justify-between items-center mb-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <p className="text-green-800 dark:text-green-200">
            Tryb offline - zgłoszenie zostanie zsynchronizowane po powrocie internetu
          </p>
        </motion.div>
      )}


      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        {/* Sekcja 1: Gatunek drzewa do Pierśnicy */}
        <TreeReportFormSectionSpecies
          speciesQuery={speciesQuery}
          setSpeciesQuery={setSpeciesQuery}
          showSpeciesPanel={showSpeciesPanel}
          setShowSpeciesPanel={setShowSpeciesPanel}
          handleSpeciesInputFocus={handleSpeciesInputFocus}
          filteredSpecies={filteredSpecies}
          isLoadingSpecies={isLoadingSpecies}
          handleSpeciesSelect={handleSpeciesSelect}
          selectedSpecies={selectedSpecies}
          setEnlargedImage={setEnlargedImage}
          photos={photos}
          setPhotos={handlePhotosChange}
          fileToBase64={fileToBase64}
          navigate={navigate}
          treeName={treeName}
          setTreeName={setTreeName}
          pierśnica={pierśnica}
          setPierśnica={setPierśnica}
          height={height}
          setHeight={setHeight}
          crownSpread={crownSpread}
          setCrownSpread={setCrownSpread}
          condition={condition}
          setCondition={setCondition}
          detailedHealth={detailedHealth}
          setDetailedHealth={setDetailedHealth}
          isAlive={isAlive}
          setIsAlive={setIsAlive}
          estimatedAge={estimatedAge}
          setEstimatedAge={setEstimatedAge}
          treeStories={treeStories}
          setTreeStories={setTreeStories}
          notes={notes}
          setNotes={setNotes}
          latitude={latitude}
          longitude={longitude}
        />

        {/* Sekcja 2: Od pierśnicy do dodatkowych informacji */}
        <TreeReportFormSectionDetails
          isAlive={isAlive}
          setIsAlive={setIsAlive}
          estimatedAge={estimatedAge}
          setEstimatedAge={setEstimatedAge}
          detailedHealth={detailedHealth}
          setDetailedHealth={setDetailedHealth}
          expandedCategories={expandedCategories}
          setExpandedCategories={setExpandedCategories}
        />

        {/* Sekcja 3: Reszta do historii i legend */}
        <TreeReportFormSectionNotes
          notes={notes}
          setNotes={setNotes}
          treeStories={treeStories}
          setTreeStories={setTreeStories}
        />

        {/* Submit button */}
        <div className="flex space-x-1 sm:space-x-2">
          {onCancel && (
            <GlassButton
              type="button"
              onClick={onCancel}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              Anuluj
            </GlassButton>
          )}
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || !selectedSpecies || photos.length === 0 || !treeName.trim()}
            className="flex-1 sm:flex-none text-sm"
            icon={TreePine}
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zgłoś drzewo'}
          </GlassButton>
        </div>
      </form>

      {/* Enlarged image modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-[90vh]"
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
