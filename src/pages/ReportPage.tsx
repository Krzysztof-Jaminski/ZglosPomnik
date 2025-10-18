import React, { useState, useCallback } from 'react';
import { TreeReportForm } from '../components/TreeReport/TreeReportForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
  const [mapScreenshot, setMapScreenshot] = useState<File | null>(null);
  const [isGeneratingMapScreenshot, setIsGeneratingMapScreenshot] = useState(false);
  const [mapScreenshotCoords, setMapScreenshotCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showMapScreenshotModal, setShowMapScreenshotModal] = useState(false);

  // Generate map screenshot directly from Leaflet map
  const generateMapScreenshot = useCallback(async (lat: number, lng: number): Promise<File | null> => {
    try {
      console.log('Generating map screenshot for coordinates:', lat, lng);
      
      // Create a temporary map container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.height = '600px';
      tempContainer.style.zIndex = '-1';
      document.body.appendChild(tempContainer);

      // Import Leaflet dynamically
      const L = await import('leaflet');
      
      // Create map instance
      const map = L.map(tempContainer, {
        center: [lat, lng],
        zoom: 19, // Maximum zoom for detailed satellite view
        zoomControl: false,
        attributionControl: false
      });

      // Add satellite tile layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
      }).addTo(map);

      // Add blue marker at the exact location (same as on the main map)
      L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      // Wait for map to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Use html2canvas to capture the map
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(tempContainer, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        scale: 1
      });

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
                  const file = new File([blob], `map_localization_${Date.now()}.png`, { type: 'image/png' });
            console.log('Map screenshot generated:', file.name, file.size, 'bytes');
            resolve(file);
          } else {
            resolve(null);
          }
          
          // Cleanup
          document.body.removeChild(tempContainer);
          map.remove();
        }, 'image/png', 0.9);
      });

    } catch (error) {
      console.error('Error generating map screenshot:', error);
      
      // Fallback: create a simple canvas with coordinates
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a simple background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw blue marker in the center
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(400, 300, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw white border around marker
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw coordinates text below the marker
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Współrzędne: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 400, 350);
        
        // Convert canvas to blob
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
                  const file = new File([blob], `map_localization_${Date.now()}.png`, { type: 'image/png' });
              console.log('Fallback map screenshot generated:', file.name, file.size, 'bytes');
              resolve(file);
            } else {
              resolve(null);
            }
          }, 'image/png');
        });
      }
      
      return null;
    }
  }, []);

  // Track which page was last active
  React.useEffect(() => {
    localStorage.setItem('lastActivePage', 'report');
  }, []);

  // Auto-generate map screenshot when location is selected
  React.useEffect(() => {
    if (selectedLocation) {
      // Check if we already have a screenshot for these coordinates
      const coordsMatch = mapScreenshotCoords && 
        Math.abs(mapScreenshotCoords.lat - selectedLocation.lat) < 0.0001 &&
        Math.abs(mapScreenshotCoords.lng - selectedLocation.lng) < 0.0001;
      
      if (coordsMatch && mapScreenshot) {
        console.log('Using existing map screenshot for same coordinates');
        return;
      }
      
      // Generate new screenshot for new coordinates
      setIsGeneratingMapScreenshot(true);
      setMapScreenshot(null); // Clear previous screenshot
      
      generateMapScreenshot(selectedLocation.lat, selectedLocation.lng).then(screenshot => {
        if (screenshot) {
          setMapScreenshot(screenshot);
          setMapScreenshotCoords(selectedLocation);
          console.log('Auto-generated map screenshot for new coordinates');
        } else {
          console.log('Failed to auto-generate map screenshot');
        }
        setIsGeneratingMapScreenshot(false);
      });
    }
  }, [selectedLocation, generateMapScreenshot, mapScreenshotCoords, mapScreenshot]);



  // Synchronize photos with form
  const handlePhotosChange = (newPhotos: File[]) => {
    console.log('ReportPage: handlePhotosChange called with', newPhotos.length, 'photos');
    setPhotos(newPhotos);
  };

  // Camera functionality
  const takePhoto = async () => {
    if (photos.length >= 5) {
      alert('Możesz dodać maksymalnie 5 zdjęć');
      return;
    }
    
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
    if (photos.length >= 5) {
      alert('Możesz dodać maksymalnie 5 zdjęć');
            return;
          }
          
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
      const lat = location.state.latitude;
      const lng = location.state.longitude;
      // Check if coordinates are not the specific default values
      if (!(lat === 0.000000 && lng === 0.000000)) {
        return { lat, lng };
      }
    }
    
    // Then try localStorage
    const savedData = localStorage.getItem('treeReportFormData');
    if (savedData) {
      try {
        const formData: SavedFormData = JSON.parse(savedData);
        if (formData.latitude !== undefined && formData.longitude !== undefined) {
          const lat = formData.latitude;
          const lng = formData.longitude;
          // Check if coordinates are not the specific default values
          if (!(lat === 0.000000 && lng === 0.000000)) {
            return { lat, lng };
          }
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
    }
    // Don't automatically get current location - let user click the button

        // Load photos and map screenshot from localStorage
        const savedData = localStorage.getItem('treeReportFormData');
        if (savedData) {
          try {
            const formData: SavedFormData = JSON.parse(savedData);
            
            // Restore photos
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
            
            // Restore map screenshot
            if (formData.mapScreenshot) {
              const base64 = formData.mapScreenshot;
              const arr = base64.split(',');
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const restoredScreenshot = new File([u8arr], `map_screenshot.png`, { type: mime });
              setMapScreenshot(restoredScreenshot);
              
              // Restore map screenshot coordinates
              if (formData.mapScreenshotCoords) {
                setMapScreenshotCoords(formData.mapScreenshotCoords);
              }
            }
          } catch (error) {
            console.error('Error loading saved photos and screenshot:', error);
          }
        }
  }, [initializeLocation]);

  // Save location from navigation state to localStorage
  React.useEffect(() => {
    if (location.state?.latitude && location.state?.longitude) {
      const lat = location.state.latitude;
      const lng = location.state.longitude;
      // Only set location if coordinates are not the specific default values
      if (!(lat === 0.000000 && lng === 0.000000)) {
        const newLocation = {
          lat: lat,
          lng: lng
        };
        setSelectedLocation(newLocation);
      }
      
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
        latitude: lat,
        longitude: lng
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
        
        // Convert map screenshot to base64 for storage
        let mapScreenshotBase64 = null;
        if (mapScreenshot) {
          mapScreenshotBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(mapScreenshot);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        }
        
        const updatedFormData = {
          ...formData,
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          photos: photoBase64s,
          mapScreenshot: mapScreenshotBase64,
          mapScreenshotCoords: mapScreenshotCoords
        };
        
        localStorage.setItem('treeReportFormData', JSON.stringify(updatedFormData));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    };

    if (selectedLocation || photos.length > 0 || mapScreenshot) {
      saveToStorage();
    }
  }, [selectedLocation, photos, mapScreenshot, mapScreenshotCoords]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.');
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
        // Handle different types of geolocation errors gracefully
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Dostęp do geolokalizacji został zablokowany. Możesz wybrać lokalizację na mapie.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Lokalizacja jest niedostępna. Spróbuj wybrać lokalizację na mapie.');
            break;
          case error.TIMEOUT:
            alert('Przekroczono czas oczekiwania na lokalizację. Spróbuj ponownie lub wybierz lokalizację na mapie.');
            break;
          default:
            alert('Wystąpił błąd podczas pobierania lokalizacji. Wybierz lokalizację na mapie.');
            break;
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

  // Photo modal functions
  const openPhotoModal = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  }, []);

  const closePhotoModal = useCallback(() => {
    setShowPhotoModal(false);
  }, []);

  const nextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Map screenshot modal functions
  const openMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(true);
  }, []);

  const closeMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(false);
  }, []);

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
                  className="w-full flex-shrink-0 min-w-0 max-w-full"
                  size="xs"
                  variant="primary"
                >
                  <span className="text-xs whitespace-nowrap truncate">
                    Użyj mojej lokalizacji
                  </span>
                </GlassButton>
                <GlassButton
                  onClick={handleMapSelectionClick}
                  className="w-full flex-shrink-0 min-w-0 max-w-full"
                  size="xs"
                  variant="secondary"
                >
                  <span className="text-xs whitespace-nowrap truncate">
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
                  <div className="grid grid-cols-5 gap-1">
                      {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openPhotoModal(index)}
                          />
                          <button
                            onClick={() => {
                              const newPhotos = photos.filter((_, i) => i !== index);
                              handlePhotosChange(newPhotos);
                            }}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          </button>
                        </div>
                      ))}
                    {/* Empty slots for remaining photos */}
                    {Array.from({ length: 5 - photos.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square border-2 border-dashed border-gray-400 dark:border-gray-600 rounded flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-600 text-xs">+</span>
                        </div>
                      ))}
                    </div>
                  
                  {/* Map Screenshot Preview */}
                  {selectedLocation && (
                    <>
                      {mapScreenshot && !isGeneratingMapScreenshot && (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(mapScreenshot)}
                            alt="Map screenshot"
                            className="w-full h-16 sm:h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={openMapScreenshotModal}
                          />
                          <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            Zdjęcie mapy lokalizacji
                          </div>
                        </div>
                      )}
                      
                      {isGeneratingMapScreenshot && (
                        <div className="w-full h-16 sm:h-20 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded flex items-center justify-center">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 dark:border-blue-400"></div>
                            <span className="text-xs text-blue-600 dark:text-blue-400">Generowanie screenshotu...</span>
                          </div>
                        </div>
                      )}
                      
                      {!mapScreenshot && !isGeneratingMapScreenshot && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                          Generowanie screenshotu mapy...
                        </div>
                      )}
                    </>
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
            mapScreenshot={mapScreenshot}
          />
        </div>
      </div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {showPhotoModal && photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
            onClick={closePhotoModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Photo counter */}
              <div className="absolute -top-12 left-0 text-white text-lg font-medium z-10">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>

              {/* Main photo */}
              <img
                src={URL.createObjectURL(photos[selectedPhotoIndex])}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 bg-black/50 rounded-lg p-2 mt-4">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden transition-opacity ${
                        index === selectedPhotoIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Screenshot Preview Modal */}
      <AnimatePresence>
        {showMapScreenshotModal && mapScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
            onClick={closeMapScreenshotModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeMapScreenshotModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Title */}
              <div className="absolute -top-12 left-0 text-white text-lg font-medium z-10">
                Screenshot mapy lokalizacji
              </div>

              {/* Main screenshot */}
              <img
                src={URL.createObjectURL(mapScreenshot)}
                alt="Map screenshot"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};