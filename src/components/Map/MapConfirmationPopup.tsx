import React from 'react';
import { MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';

interface MapConfirmationPopupProps {
  latitude: number;
  longitude: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MapConfirmationPopup: React.FC<MapConfirmationPopupProps> = ({
  latitude,
  longitude,
  onConfirm,
  onCancel
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Zgłoś drzewo
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
          Czy chcesz zgłosić drzewo w tym miejscu?
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-5 mb-4 sm:mb-8">
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2">
            Lokalizacja:
          </p>
          <p className="text-base sm:text-lg font-mono text-gray-800 dark:text-gray-200">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>

        <div className="flex space-x-3 sm:space-x-4">
          <GlassButton onClick={onCancel} variant="secondary" size="sm" className="flex-1">
            Anuluj
          </GlassButton>
          <GlassButton onClick={onConfirm} variant="primary" size="sm" className="flex-1">
            Zgłoś tutaj
          </GlassButton>
        </div>
      </motion.div>
    </div>
  );
};