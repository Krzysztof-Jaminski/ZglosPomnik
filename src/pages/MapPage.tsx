import React, { useState, useCallback, useRef } from 'react';
import { MapComponent, MapComponentRef } from '../components/Map/MapComponent';
import { MapConfirmationPopup } from '../components/Map/MapConfirmationPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';

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

  const handleFloatingButtonClick = () => {
    navigate('/report');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Map takes all space except bottombar */}
      <div className="flex-1 relative overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        <MapComponent ref={mapComponentRef} onTreeSelect={handleMapClick} />
      </div>
      
      {/* Bottombar space */}
      <div className="h-16 sm:hidden"></div>

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