import React, { useState } from 'react';
import { TreePine, MapPin, X, Calendar, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { Tree } from '../../types';

interface TreeInfoPopupProps {
  tree: Tree;
  onClose: () => void;
  onGoToFeed?: (treeId: string) => void;
}

export const TreeInfoPopup: React.FC<TreeInfoPopupProps> = ({
  tree,
  onClose,
  onGoToFeed
}) => {
  // Log tree object to console for debugging
  console.log('TreeInfoPopup - Tree object:', tree);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Monument': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'approved': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'pending': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'nieznany': return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Monument': return 'Pomnik przyrody';
      case 'approved': return 'Zatwierdzony';
      case 'rejected': return 'Odrzucony';
      case 'pending': return 'Oczekuje';
      case 'nieznany': return 'Nieznany';
      default: return 'Nieznany';
    }
  };

  return (
    <div
      className="fixed top-10 sm:top-12 left-0 right-0 bottom-16 sm:bottom-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 max-w-md sm:max-w-lg lg:max-w-xl w-full max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
             <TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {tree.name || 'Drzewo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>


        {/* Description */}
        {tree.description && (
          <div className="mb-3 sm:mb-4">
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Opis:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {tree.description}
            </p>
          </div>
        )}

        {/* Legend section */}
        {tree.legend && (
          <div className="mb-3 sm:mb-4">
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Historie i legendy:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {tree.legend}
            </p>
          </div>
        )}

        {/* Tags Section */}
        {((tree.health && tree.health.length > 0) || 
          (tree.soil && tree.soil.length > 0) || 
          (tree.environment && tree.environment.length > 0)) && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Szczegóły:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {/* Health Tags */}
              {tree.health && tree.health.map((tag, index) => (
                <span
                  key={`health-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700"
                >
                  {tag}
                </span>
              ))}
              
              {/* Soil Tags */}
              {tree.soil && tree.soil.map((tag, index) => (
                <span
                  key={`soil-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700"
                >
                  {tag}
                </span>
              ))}
              
              {/* Environment Tags */}
              {tree.environment && tree.environment.map((tag, index) => (
                <span
                  key={`env-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photo and Health Status */}
        <div className="mb-3 sm:mb-4">
          {/* Photo */}
          {tree.imageUrls && tree.imageUrls.length > 0 && (
            <div className="mb-3 relative">
              <img
                src={tree.imageUrls?.[0] || ''}
                alt="Tree photo"
                className="w-full h-40 sm:h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowImageModal(true)}
                crossOrigin={tree.imageUrls?.[0]?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

        </div>

        {/* Species information */}
        <div className="mb-3 sm:mb-4">
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
            <div className="mb-1">
              <span className="font-medium">Gatunek:</span> {tree.species}
            </div>
            <div className="italic text-gray-600 dark:text-gray-400">
              {tree.speciesLatin}{!tree.speciesLatin.endsWith('L.') ? ' L.' : ''}
            </div>
          </div>
        </div>


        {/* Tree Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Obwód:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {tree.circumference} cm
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wysokość:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {tree.height} m
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rozpiętość korony:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {tree.crownSpread} m
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              Lokalizacja:
            </p>
          </div>
          <p className="text-sm sm:text-base font-mono text-gray-800 dark:text-gray-200">
            {tree.location.lat.toFixed(6)}, {tree.location.lng.toFixed(6)}
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {tree.location.address}
          </p>
        </div>

        {/* Status and Details - only show if status is valid and not "nieznany" */}
        {tree.status && tree.status !== 'nieznany' && tree.status !== 'default' && tree.status !== 'undefined' && tree.status !== 'null' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-5">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(tree.status)}`}>
              {getStatusText(tree.status)}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(tree.submissionDate).toLocaleDateString('pl-PL')}</span>
            </div>
          </div>
        )}

        {/* Reporter */}
        <div className="flex items-center space-x-2 mb-3 sm:mb-5">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Zgłoszone przez: <span className="font-medium">{tree.userData.userName}</span>
          </span>
        </div>



        {/* Action Buttons */}
        <div className="flex space-x-2 sm:space-x-4">
          <GlassButton onClick={onClose} variant="secondary" size="xs" className="flex-1">
            Zamknij
          </GlassButton>
          {onGoToFeed && (
            <GlassButton 
              onClick={() => onGoToFeed(tree.id)} 
              variant="primary" 
              size="xs" 
              className="flex-1"
              icon={ArrowRight}
            >
              Zobacz
            </GlassButton>
          )}
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={tree.imageUrls?.[0] || ''}
                alt="Tree photo - enlarged"
                className="max-w-full max-h-full object-contain rounded-lg"
                crossOrigin={tree.imageUrls?.[0]?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
