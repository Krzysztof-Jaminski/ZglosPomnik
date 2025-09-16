import React, { useState } from 'react';
import { TreeReportForm } from '../components/TreeReport/TreeReportForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';

export const ReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get location from navigation state, localStorage, or use current location
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(() => {
    // First try navigation state
    if (location.state?.latitude && location.state?.longitude) {
      return { lat: location.state.latitude, lng: location.state.longitude };
    }
    
    // Then try localStorage
    const savedData = localStorage.getItem('treeReportFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        if (formData.latitude && formData.longitude) {
          return { lat: formData.latitude, lng: formData.longitude };
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    }
    
    return null;
  });
  

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-get current location if no location provided
  React.useEffect(() => {
    if (!selectedLocation && !location.state?.latitude) {
      getCurrentLocation();
    }
  }, []);

  // Save location to localStorage when it changes
  React.useEffect(() => {
    if (selectedLocation) {
      const savedData = localStorage.getItem('treeReportFormData');
      let formData = {};
      
      if (savedData) {
        try {
          formData = JSON.parse(savedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
      
      formData = {
        ...formData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      };
      
      localStorage.setItem('treeReportFormData', JSON.stringify(formData));
    }
  }, [selectedLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Nie udało się pobrać lokalizacji.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Dostęp do lokalizacji został odrzucony. Możesz włączyć lokalizację w ustawieniach przeglądarki lub wybrać lokalizację na mapie.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokalizacja jest niedostępna. Spróbuj ponownie lub wybierz lokalizację na mapie.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Przekroczono czas oczekiwania na lokalizację. Spróbuj ponownie lub wybierz lokalizację na mapie.';
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };


  const handleSubmitSuccess = () => {
    navigate('/map');
  };
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 overflow-y-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">


        {isGettingLocation && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-green-600"></div>
              <p className="text-green-800 dark:text-green-200 text-base">
                Pobieranie twojej lokalizacji...
              </p>
            </div>
          </div>
        )}

        {locationError && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-green-800 dark:text-green-200 text-base text-center">
              {locationError}
            </p>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          <div className="space-y-2">
            <GlassButton
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full"
              size="xs"
              variant="primary"
            >
              <span className="text-sm">
                {isGettingLocation ? 'Pobieranie lokalizacji...' : 'Użyj mojej lokalizacji'}
              </span>
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/map')}
              className="w-full"
              size="xs"
              variant="secondary"
            >
              <span className="text-sm">
                Wybierz lokalizację na mapie
              </span>
            </GlassButton>
          </div>

          <TreeReportForm
            latitude={selectedLocation?.lat}
            longitude={selectedLocation?.lng}
            onSubmit={handleSubmitSuccess}
          />
        </div>
      </div>
    </div>
  );
};