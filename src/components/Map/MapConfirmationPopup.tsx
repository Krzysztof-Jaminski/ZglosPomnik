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
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-sm sm:max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Frame Container - jak w TreePost */}
        <div className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30">
          <div className="bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              {/* Header with user info - jak w TreePost */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Zgłoś drzewo
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Wybierz lokalizację
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main content section */}
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Pytanie</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Czy chcesz zgłosić drzewo w tym miejscu?
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      Lokalizacja
                    </h3>
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded p-2 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Współrzędne</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <GlassButton onClick={onCancel} variant="secondary" size="xs" className="flex-1">
                  Anuluj
                </GlassButton>
                <GlassButton onClick={onConfirm} variant="primary" size="xs" className="flex-1">
                  Zgłoś tutaj
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};