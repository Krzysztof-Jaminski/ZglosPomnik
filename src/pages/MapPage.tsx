import React, { useState, useCallback, useRef } from 'react';
import { MapComponent, MapComponentRef } from '../components/Map/MapComponent';
import { MapConfirmationPopup } from '../components/Map/MapConfirmationPopup';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const mapComponentRef = useRef<MapComponentRef>(null);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowConfirmation(true);
  }, []);

  const handleConfirm = () => {
    setShowConfirmation(false);
    // Navigate to report page with location data
    navigate('/report', { 
      state: { 
        latitude: selectedLocation?.lat, 
        longitude: selectedLocation?.lng 
      } 
    });
    setSelectedLocation(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedLocation(null);
    // Clear click marker when popup is cancelled
    if (mapComponentRef.current) {
      mapComponentRef.current.clearClickMarker();
    }
  };

  const handleGoToFeed = (treeId: string) => {
    // Navigate to feed with tree ID in state
    navigate('/feed', { 
      state: { 
        scrollToTreeId: treeId 
      } 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map takes all available space */}
      <div className="flex-1 relative overflow-hidden">
        <MapComponent 
          ref={mapComponentRef} 
          onGoToFeed={handleGoToFeed} 
          onTreeSelect={handleMapClick} 
        />
      </div>

      {/* Confirmation popup */}
      <AnimatePresence>
        {showConfirmation && selectedLocation && (
          <MapConfirmationPopup
            latitude={selectedLocation.lat}
            longitude={selectedLocation.lng}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};