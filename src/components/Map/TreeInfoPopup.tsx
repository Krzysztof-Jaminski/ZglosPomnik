import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
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
        className="max-w-md sm:max-w-lg lg:max-w-xl w-full max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Frame Container - jak w TreePost */}
        <div className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              {/* Header with user info - jak w TreePost */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                      {tree.userData.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      {tree.userData.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tree.submissionDate).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photos Section - MAIN CONTENT - jak w TreePost */}
              {tree.imageUrls && tree.imageUrls.length > 0 && (
                <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                  {/* Photo Grid - LARGER PHOTOS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {tree.imageUrls.slice(0, 3).map((image, index) => {
                      const isLastImage = index === tree.imageUrls.slice(0, 3).length - 1;
                      const isOddCount = tree.imageUrls.slice(0, 3).length % 2 !== 0;
                      const shouldSpanTwo = isLastImage && isOddCount;
                      
                      return (
                        <div 
                          key={index} 
                          className={`relative ${shouldSpanTwo ? 'col-span-2 sm:col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                        >
                          <img
                            src={image}
                            crossOrigin={image.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                            referrerPolicy="no-referrer"
                            alt={`Tree photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm"
                            onClick={() => setShowImageModal(true)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Map Screenshot */}
              {tree.treeScreenshotUrl && (
                <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                  <div className="relative">
                    <img
                      src={tree.treeScreenshotUrl}
                      crossOrigin={tree.treeScreenshotUrl.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                      referrerPolicy="no-referrer"
                      alt="Map screenshot"
                      className="w-full h-20 sm:h-24 object-cover rounded cursor-pointer"
                    />
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Lokalizacja na mapie
                    </div>
                  </div>
                </div>
              )}

              {/* Species Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Gatunek</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300">
                    {tree.species}
                  </p>
                  <p className="text-xs italic text-blue-600 dark:text-blue-400">
                    {tree.speciesLatin}{!tree.speciesLatin.endsWith('L.') ? ' L.' : ''}
                  </p>
                </div>
              </div>

              {/* All Tree Information - One Big Block - jak w TreePost */}
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                <div className="space-y-3">
                  {/* Tree Name - FIRST FIELD ON THE LEFT */}
                  {tree.name && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Nazwa drzewa</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tree.name}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {tree.description && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Opis</h3>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {tree.description}
                      </p>
                    </div>
                  )}

                  {/* Tree Measurements */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Wymiary drzewa</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Obwód</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{tree.circumference} cm</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wysokość</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{tree.height} m</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Korona</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{tree.crownSpread} m</p>
                      </div>
                      {tree.estimatedAge && (
                        <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wiek</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{tree.estimatedAge} lat</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      Lokalizacja
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Adres:</strong> {tree.location?.address || 'Brak adresu'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Gmina:</strong> {tree.location?.commune || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Powiat:</strong> {tree.location?.county || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Dzielnica:</strong> {tree.location?.district || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Województwo:</strong> {tree.location?.province || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Numer działki:</strong> {tree.location?.plotNumber || 'Brak danych'}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Lat:</strong> {tree.location?.lat?.toFixed(6)}, <strong>Lng:</strong> {tree.location?.lng?.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {/* Health, Soil, Environment Tags */}
                  {((tree.health && Array.isArray(tree.health) && tree.health.length > 0) || 
                    (tree.soil && Array.isArray(tree.soil) && tree.soil.length > 0) || 
                    (tree.environment && Array.isArray(tree.environment) && tree.environment.length > 0)) && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Szczegóły</h3>
                      <div className="space-y-2">
                        {tree.health && Array.isArray(tree.health) && tree.health.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Zdrowie:</p>
                            <div className="flex flex-wrap gap-1">
                              {tree.health.map((tag, index) => (
                                <span
                                  key={`health-${index}`}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {tree.soil && Array.isArray(tree.soil) && tree.soil.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Gleba:</p>
                            <div className="flex flex-wrap gap-1">
                              {tree.soil.map((tag, index) => (
                                <span
                                  key={`soil-${index}`}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {tree.environment && Array.isArray(tree.environment) && tree.environment.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Środowisko:</p>
                            <div className="flex flex-wrap gap-1">
                              {tree.environment.map((tag, index) => (
                                <span
                                  key={`env-${index}`}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  {tree.legend && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Historie i legendy</h3>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {tree.legend}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Status: {tree.status === 'Approved' ? 'Zatwierdzone' : 
                              tree.status === 'Pending' ? 'Oczekujące' : 'Odrzucone'}
                    </span>
                  </div>
                  
                  {tree.votesCount !== undefined && (
                    <div className="text-xs text-purple-500 dark:text-purple-400">
                      Głosy: {tree.votesCount}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <GlassButton onClick={onClose} variant="secondary" size="xs" className="flex-1">
                  Zamknij
                </GlassButton>
                {onGoToFeed && (
                  <GlassButton 
                    onClick={() => onGoToFeed(tree.id)} 
                    variant="primary" 
                    size="xs" 
                    className="flex-1"
                  >
                    Więcej
                  </GlassButton>
                )}
              </div>
            </div>
          </div>
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