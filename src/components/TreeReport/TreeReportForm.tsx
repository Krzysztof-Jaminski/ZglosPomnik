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
import { TreeSubmissionValidation } from '../../utils/validationRules';


interface TreeReportFormProps {
  latitude?: number;
  longitude?: number;
  onSubmit?: (location?: { lat: number; lng: number }) => void;
  onCancel?: () => void;
  photos?: File[];
  setPhotos?: (photos: File[]) => void;
  mapScreenshot?: File | null;
  onRegenerateScreenshot?: () => void;
}

export const TreeReportForm: React.FC<TreeReportFormProps> = ({
  latitude,
  longitude,
  onSubmit,
  onCancel,
  photos: externalPhotos,
  setPhotos: setExternalPhotos,
  mapScreenshot,
  onRegenerateScreenshot
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
  const [healthTags, setHealthTags] = useState<string[]>([]);

  // Real-time validation handlers
  const handlePierśnicaChange = (value: string) => {
    setPierśnica(value);
    const numValue = parseFloat(value);
    if (value && (numValue < TreeSubmissionValidation.circumference.min || numValue > TreeSubmissionValidation.circumference.max)) {
      setValidationErrors(prev => ({
        ...prev,
        circumference: `Obwód musi być między ${TreeSubmissionValidation.circumference.min} a ${TreeSubmissionValidation.circumference.max} cm`
      }));
    } else {
      setValidationErrors(prev => {
        const { circumference, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    const numValue = parseFloat(value);
    if (value && (numValue < TreeSubmissionValidation.height.min || numValue > TreeSubmissionValidation.height.max)) {
      setValidationErrors(prev => ({
        ...prev,
        height: `Wysokość musi być między ${TreeSubmissionValidation.height.min} a ${TreeSubmissionValidation.height.max} m`
      }));
    } else {
      setValidationErrors(prev => {
        const { height, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleCrownSpreadChange = (value: string) => {
    setCrownSpread(value);
    const numValue = parseFloat(value);
    if (value && (numValue < TreeSubmissionValidation.crownSpread.min || numValue > TreeSubmissionValidation.crownSpread.max)) {
      setValidationErrors(prev => ({
        ...prev,
        crownSpread: `Rozpiętość korony musi być między ${TreeSubmissionValidation.crownSpread.min} a ${TreeSubmissionValidation.crownSpread.max} m`
      }));
    } else {
      setValidationErrors(prev => {
        const { crownSpread, ...rest } = prev;
        return rest;
      });
    }
  };
  const [soilTags, setSoilTags] = useState<string[]>([]);
  const [environmentTags, setEnvironmentTags] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState({
    health: false,
    soil: false,
    environment: false
  });
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [estimatedAge, setEstimatedAge] = useState<string>('');
  const [treeName, setTreeName] = useState<string>('');
  const [treeStories, setTreeStories] = useState<string>('');
  
  // Real-time validation for estimatedAge
  const handleEstimatedAgeChange = (value: string) => {
    setEstimatedAge(value);
    const numValue = parseInt(value);
    if (value && (numValue < TreeSubmissionValidation.estimatedAge.min || numValue > TreeSubmissionValidation.estimatedAge.max)) {
      setValidationErrors(prev => ({
        ...prev,
        estimatedAge: `Szacowany wiek musi być między ${TreeSubmissionValidation.estimatedAge.min} a ${TreeSubmissionValidation.estimatedAge.max} lat`
      }));
    } else {
      setValidationErrors(prev => {
        const { estimatedAge, ...rest } = prev;
        return rest;
      });
    }
  };

  // Real-time validation for notes
  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (value.length > TreeSubmissionValidation.description.maxLength) {
      setValidationErrors(prev => ({
        ...prev,
        description: `Opis może mieć maksymalnie ${TreeSubmissionValidation.description.maxLength} znaków (obecnie: ${value.length})`
      }));
    } else {
      setValidationErrors(prev => {
        const { description, ...rest } = prev;
        return rest;
      });
    }
  };

  // Real-time validation for treeStories
  const handleTreeStoriesChange = (value: string) => {
    setTreeStories(value);
    if (value.length > TreeSubmissionValidation.legend.maxLength) {
      setValidationErrors(prev => ({
        ...prev,
        legend: `Historia może mieć maksymalnie ${TreeSubmissionValidation.legend.maxLength} znaków (obecnie: ${value.length})`
      }));
    } else {
      setValidationErrors(prev => {
        const { legend, ...rest } = prev;
        return rest;
      });
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
        setHealthTags(formData.healthTags || formData.detailedHealth || []); // Fallback to old detailedHealth
        setSoilTags(formData.soilTags || []);
        setEnvironmentTags(formData.environmentTags || []);
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


  // Load all species when component mounts
  React.useEffect(() => {
    const loadAllSpecies = async () => {
      setIsLoadingSpecies(true);
      try {
        console.log('TreeReportForm: Loading species...');
        const species = await speciesService.getSpecies();
        console.log('TreeReportForm: Loaded species count:', species.length);
        console.log('TreeReportForm: Species data:', species);
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
          healthTags,
          soilTags,
          environmentTags,
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
  }, [speciesQuery, selectedSpecies, treeName, pierśnica, height, crownSpread, healthTags, soilTags, environmentTags, estimatedAge, treeStories, notes, photos, latitude, longitude]);

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
        const errors: Record<string, string> = {};
        
        if (photos.length === 0) {
          errors.photos = 'Proszę dodać przynajmniej jedno zdjęcie drzewa';
        }

        // Parse and validate numeric values
        const circumferenceValue = pierśnica ? parseFloat(pierśnica) : 0;
        const heightValue = height ? parseFloat(height) : 0;
        const crownSpreadValue = crownSpread ? parseFloat(crownSpread) : 0;
        const estimatedAgeValue = estimatedAge ? parseInt(estimatedAge) : 0;

        // Validate against centralized rules
        if (circumferenceValue < TreeSubmissionValidation.circumference.min || 
            circumferenceValue > TreeSubmissionValidation.circumference.max) {
          errors.circumference = `Obwód musi być między ${TreeSubmissionValidation.circumference.min} a ${TreeSubmissionValidation.circumference.max} cm`;
        }

        if (heightValue < TreeSubmissionValidation.height.min || 
            heightValue > TreeSubmissionValidation.height.max) {
          errors.height = `Wysokość musi być między ${TreeSubmissionValidation.height.min} a ${TreeSubmissionValidation.height.max} m`;
        }

        if (crownSpreadValue < TreeSubmissionValidation.crownSpread.min || 
            crownSpreadValue > TreeSubmissionValidation.crownSpread.max) {
          errors.crownSpread = `Rozpiętość korony musi być między ${TreeSubmissionValidation.crownSpread.min} a ${TreeSubmissionValidation.crownSpread.max} m`;
        }

        if (estimatedAgeValue < TreeSubmissionValidation.estimatedAge.min || 
            estimatedAgeValue > TreeSubmissionValidation.estimatedAge.max) {
          errors.estimatedAge = `Szacowany wiek musi być między ${TreeSubmissionValidation.estimatedAge.min} a ${TreeSubmissionValidation.estimatedAge.max} lat`;
        }

        if (notes.length > TreeSubmissionValidation.description.maxLength) {
          errors.description = `Opis może mieć maksymalnie ${TreeSubmissionValidation.description.maxLength} znaków`;
        }

        if (treeStories.length > TreeSubmissionValidation.legend.maxLength) {
          errors.legend = `Historia może mieć maksymalnie ${TreeSubmissionValidation.legend.maxLength} znaków`;
        }

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          setIsSubmitting(false);
          return;
        }
        
        // Clear errors if validation passed
        setValidationErrors({});

        // Debug arrays before sending
        console.log('TreeReportForm: Arrays before sending:');
        console.log('- soilTags:', soilTags, 'length:', soilTags.length);
        console.log('- healthTags:', healthTags, 'length:', healthTags.length);
        console.log('- environmentTags:', environmentTags, 'length:', environmentTags.length);

        // Transform data to match API specification
        const apiTreeData: ApiTreeSubmission = {
          speciesId: selectedSpecies.id.toUpperCase(), // Convert to uppercase for backend
          name: treeName,
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
          circumference: circumferenceValue,
          height: heightValue,
          soil: soilTags,
          health: healthTags,
          environment: environmentTags,
          isAlive: isAlive,
          estimatedAge: estimatedAgeValue,
          crownSpread: crownSpreadValue,
          description: notes,
          legend: treeStories,
          isMonument: false // Default to false, can be changed later
        };

        console.log('TreeReportForm: Final apiTreeData arrays:');
        console.log('- soil:', apiTreeData.soil, 'length:', apiTreeData.soil?.length || 0);
        console.log('- health:', apiTreeData.health, 'length:', apiTreeData.health?.length || 0);
        console.log('- environment:', apiTreeData.environment, 'length:', apiTreeData.environment?.length || 0);

        // Submit to API with photos and map screenshot
        await treesService.submitTreeReport(apiTreeData, photos, mapScreenshot);
        
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
        setIsAlive(true);
        setEstimatedAge('');
        setHealthTags([]);
        setSoilTags([]);
        setEnvironmentTags([]);
        
        // Navigate to map after 4 seconds with tree location
        setTimeout(() => {
          onSubmit?.(apiTreeData.location);
        }, 4000);
      } else {
        // Offline mode - show inline error
        setValidationErrors({ offline: 'Wymagane połączenie z internetem do wysłania zgłoszenia' });
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
        {/* Global errors */}
        {(validationErrors.photos || validationErrors.offline) && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {validationErrors.photos || validationErrors.offline}
            </p>
          </div>
        )}

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
          setPierśnica={handlePierśnicaChange}
          height={height}
          setHeight={handleHeightChange}
          crownSpread={crownSpread}
          setCrownSpread={handleCrownSpreadChange}
          healthTags={healthTags}
          setHealthTags={setHealthTags}
          isAlive={isAlive}
          setIsAlive={setIsAlive}
          estimatedAge={estimatedAge}
          setEstimatedAge={handleEstimatedAgeChange}
          treeStories={treeStories}
          setTreeStories={handleTreeStoriesChange}
          notes={notes}
          setNotes={handleNotesChange}
          latitude={latitude}
          longitude={longitude}
          mapScreenshot={mapScreenshot}
          onRegenerateScreenshot={onRegenerateScreenshot}
          validationErrors={validationErrors}
        />

        {/* Sekcja 2: Od pierśnicy do dodatkowych informacji */}
        <TreeReportFormSectionDetails
          isAlive={isAlive}
          setIsAlive={setIsAlive}
          estimatedAge={estimatedAge}
          setEstimatedAge={setEstimatedAge}
          healthTags={healthTags}
          setHealthTags={setHealthTags}
          soilTags={soilTags}
          setSoilTags={setSoilTags}
          environmentTags={environmentTags}
          setEnvironmentTags={setEnvironmentTags}
          expandedCategories={expandedCategories}
          setExpandedCategories={setExpandedCategories}
          validationErrors={validationErrors}
        />

        {/* Sekcja 3: Reszta do historii i legend */}
        <TreeReportFormSectionNotes
          notes={notes}
          setNotes={handleNotesChange}
          treeStories={treeStories}
          setTreeStories={handleTreeStoriesChange}
          validationErrors={validationErrors}
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
