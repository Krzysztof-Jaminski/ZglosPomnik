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
    console.log('ReportPage: handlePhotosChange called with', newPhotos.length, 'photos');
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
      // Use HTML file input for multiple selection
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) {
          const newPhotos = [...photos, ...files].slice(0, 5); // Max 5 photos total
          handlePhotosChange(newPhotos);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error selecting photos:', error);
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
        if (formData.latitude !== undefined && formData.longitude !== undefined) {
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

  // Initialize location and photos on mount
  React.useEffect(() => {
    const initialLocation = initializeLocation();
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    } else {
      getCurrentLocation();
    }

    // Load photos from localStorage
    const savedData = localStorage.getItem('treeReportFormData');
    if (savedData) {
      try {
        const formData: SavedFormData = JSON.parse(savedData);
        if (formData.photos && Array.isArray(formData.photos)) {
          const restoredPhotos = formData.photos.map((base64: string, index: number) => {
            const arr = base64.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], `photo_${index}.jpg`, { type: mime });
          });
          setPhotos(restoredPhotos);
        }
      } catch (error) {
        console.error('Error loading saved photos:', error);
      }
    }
  }, [initializeLocation]);

  // Save location from navigation state to localStorage
  React.useEffect(() => {
    if (location.state?.latitude && location.state?.longitude) {
      const newLocation = {
        lat: location.state.latitude,
        lng: location.state.longitude
      };
      setSelectedLocation(newLocation);
      
      // Save to localStorage immediately
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
        latitude: newLocation.lat,
        longitude: newLocation.lng
      };
      
      localStorage.setItem('treeReportFormData', JSON.stringify(updatedFormData));
    }
  }, [location.state]);

  // Save location and photos to localStorage when they change
  React.useEffect(() => {
    const saveToStorage = async () => {
      try {
        const savedData = localStorage.getItem('treeReportFormData');
        let formData: SavedFormData = {};
        
        if (savedData) {
          try {
            formData = JSON.parse(savedData);
          } catch (error) {
            console.error('Error parsing saved form data:', error);
          }
        }
        
        // Convert photos to base64 for storage
        const photoBase64s = await Promise.all(
          photos.map(file => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
            });
          })
        );
        
        const updatedFormData = {
          ...formData,
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          photos: photoBase64s
        };
        
        localStorage.setItem('treeReportFormData', JSON.stringify(updatedFormData));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    };

    if (selectedLocation || photos.length > 0) {
      saveToStorage();
    }
  }, [selectedLocation, photos]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

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
      (error) => {
        console.error('Geolocation error:', error);
        
        // Sprawdź czy to błąd związany z zablokowanymi uprawnieniami
        if (error.message && error.message.includes('permission')) {
          console.warn('Geolocation permission has been blocked as the user has ignored the permission prompt several times. This can be reset in Page Info which can be accessed by clicking the tune icon next to the URL. See https://www.chromestatus.com/feature/6443143280984064 for more information.');
        }
      },
      geolocationOptions
    );
  }, []);

  const handleSubmitSuccess = useCallback((location?: { lat: number; lng: number }) => {
    if (location) {
      navigate('/map', { 
        state: { 
          centerOnLocation: location,
          showNewTree: true 
        } 
      });
    } else {
      navigate('/map');
    }
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
        {/* Gradient Frame Container - tylko obramówka */}
        <div className="relative rounded-xl p-1 shadow-lg mb-2 sm:mb-3" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
          padding: '2px'
        }}>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="space-y-1 sm:space-y-2">
              {/* Wyświetlanie lokalizacji */}
              {selectedLocation && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">Lokalizacja</span>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 font-mono text-center">
                      <div>Lat: {selectedLocation.lat.toFixed(5)}</div>
                      <div>Long: {selectedLocation.lng.toFixed(5)}</div>
                    </div>
                  </div>
                </div>
              )}

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
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-400/30 rounded-lg p-2 sm:p-3 shadow-xl w-full my-1 sm:my-2">
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
                      <span className="text-xs">Wybierz zdjęcia</span>
                    </GlassButton>
                  </div>
                  
                  {/* Photo Preview */}
                  {photos.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                          />
                          <button
                            onClick={() => {
                              const newPhotos = photos.filter((_, i) => i !== index);
                              handlePhotosChange(newPhotos);
                            }}
                            className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
  );
};