import React, { useState, useCallback } from 'react';
import { TreeReportForm } from '../components/TreeReport/TreeReportForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


interface SavedFormData {
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

export const ReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  // Synchronize photos with form
  const handlePhotosChange = (newPhotos: File[]) => {
    setPhotos(newPhotos);
  };

  // Camera functionality
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        // Convert URI to File
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const newPhotos = [...photos, file].slice(0, 5); // Max 5 photos
        handlePhotosChange(newPhotos);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const selectFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      if (image.webPath) {
        // Convert URI to File
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const newPhotos = [...photos, file].slice(0, 5); // Max 5 photos
        handlePhotosChange(newPhotos);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
    }
  };

  // Initialize location from navigation state or localStorage
  const initializeLocation = useCallback((): { lat: number; lng: number } | null => {
    // First try navigation state
    if (location.state?.latitude && location.state?.longitude) {
      return { 
        lat: location.state.latitude, 
        lng: location.state.longitude 
      };
    }
    
    // Then try localStorage
    const savedData = localStorage.getItem('treeReportFormData');
    if (savedData) {
      try {
        const formData: SavedFormData = JSON.parse(savedData);
        if (formData.latitude && formData.longitude) {
          return { 
            lat: formData.latitude, 
            lng: formData.longitude 
          };
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    }
    
    return null;
  }, [location.state]);

  // Initialize location on mount
  React.useEffect(() => {
    const initialLocation = initializeLocation();
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    } else {
      getCurrentLocation();
    }
  }, [initializeLocation]);

  // Save location to localStorage when it changes
  React.useEffect(() => {
    if (!selectedLocation) return;

    const saveLocationToStorage = () => {
      const savedData = localStorage.getItem('treeReportFormData');
      let formData: SavedFormData = {};
      
      if (savedData) {
        try {
          formData = JSON.parse(savedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
      
      const updatedFormData = {
        ...formData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      };
      
      localStorage.setItem('treeReportFormData', JSON.stringify(updatedFormData));
    };

    saveLocationToStorage();
  }, [selectedLocation]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    // Zawsze pokazuj popup
    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        // Błąd - nie robimy nic, użytkownik może spróbować ponownie
      },
      geolocationOptions
    );
  }, []);

  const handleSubmitSuccess = useCallback(() => {
    navigate('/map');
  }, [navigate]);

  const handleLocationButtonClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleMapSelectionClick = useCallback(() => {
    navigate('/map');
  }, [navigate]);
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 overflow-y-auto">
      <div className="w-full px-3 sm:px-4">



        {/* Wyświetlanie lokalizacji */}
        {selectedLocation && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${selectedLocation ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">Lokalizacja</span>
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 font-mono text-center">
                {selectedLocation ? (
                  <>
                    <div>Lat: {selectedLocation.lat.toFixed(5)}</div>
                    <div>Long: {selectedLocation.lng.toFixed(5)}</div>
                  </>
                ) : (
                  <div>Brak</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1 sm:space-y-2">
          <div className="space-y-1">
            <GlassButton
              onClick={handleLocationButtonClick}
              className="w-full"
              size="xs"
              variant="primary"
            >
              <span className="text-xs">
                Użyj mojej lokalizacji
              </span>
            </GlassButton>
            <GlassButton
              onClick={handleMapSelectionClick}
              className="w-full"
              size="xs"
              variant="secondary"
            >
              <span className="text-xs">
                Wybierz lokalizację na mapie
              </span>
            </GlassButton>
          </div>

          {/* Photos Section */}
          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-purple-200/50 dark:border-purple-400/30 rounded-lg p-2 sm:p-3 shadow-xl w-full my-1 sm:my-2">
            <div className="space-y-2">
              <div className="flex gap-1">
                <GlassButton
                  onClick={takePhoto}
                  className="flex-1"
                  size="xs"
                  variant="primary"
                >
                  <span className="text-xs">Zrób zdjęcie</span>
                </GlassButton>
                <GlassButton
                  onClick={selectFromGallery}
                  className="flex-1"
                  size="xs"
                  variant="secondary"
                >
                  <span className="text-xs">Wybierz z galerii</span>
                </GlassButton>
              </div>
              
              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Zdjęcie ${index + 1}`}
                        className="w-full h-12 sm:h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotosChange(photos.filter((_, i) => i !== index))}
                        className="absolute top-0.5 right-0.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full w-3 h-3 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2">
            <TreeReportForm
              latitude={selectedLocation?.lat}
              longitude={selectedLocation?.lng}
              onSubmit={handleSubmitSuccess}
              photos={photos}
              setPhotos={handlePhotosChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};