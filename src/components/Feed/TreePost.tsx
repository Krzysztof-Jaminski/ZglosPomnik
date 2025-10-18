import React, { useState, useCallback } from 'react';
import { Edit, Trash2, X, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { TreePost as TreePostType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmationModal } from '../UI/DeleteConfirmationModal';
import { treesService } from '../../services/treesService';

interface TreePostProps {
  post: TreePostType;
  onDelete?: (postId: string) => void;
}

export const TreePost: React.FC<TreePostProps> = ({
  post,
  onDelete
}) => {
  // Log tree object to console for debugging
  console.log('TreePost - Tree object:', post);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showMapScreenshotModal, setShowMapScreenshotModal] = useState(false);



  // Handle tree post deletion
  const handleDeletePost = async () => {
    if (!onDelete) return;
    
    // TODO: TEMPORARY - Always try to delete, let API handle permission validation
    // TODO: In the future, this should check: user && post.userData.userId && post.userData.userId === user.id
    const hasPermission = true; // Always try to delete for now
    console.log('Attempting to delete post:', {
      hasPermission,
      postUserName: post.userData.userName,
      postUserId: post.userData.userId, // This is null/undefined for now
      postId: post.id,
      post: post
    });
    
    setIsDeleting(true);
    try {
      await treesService.deleteTree(post.id);
      console.log('Post deleted successfully');
      onDelete(post.id);
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      
      // Handle specific error cases
      if (error.message?.includes('403')) {
        console.log('403 Error - No permission to delete this post');
      } else if (error.message?.includes('404')) {
        console.log('404 Error - Post not found');
      } else if (error.message?.includes('401')) {
        console.log('401 Error - Session expired');
      } else if (error.message?.includes('500') || error.message?.includes('Server error')) {
        console.log('500 Error - Server error:', error.message);
      } else {
        console.log('Other error:', error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // TODO: TEMPORARY - Show delete button for everyone, validation happens on click
  // TODO: In the future, this should be: user && post.userData.userId && post.userData.userId === user.id
  // TODO: API should include userId in post.userData for proper security validation
  const canDeletePost = true; // Always show delete button for now

  // Photo modal functions
  const openPhotoModal = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  }, []);

  const closePhotoModal = useCallback(() => {
    setShowPhotoModal(false);
  }, []);

  const nextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev + 1) % (post.imageUrls?.length || 1));
  }, [post.imageUrls?.length]);

  const prevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev - 1 + (post.imageUrls?.length || 1)) % (post.imageUrls?.length || 1));
  }, [post.imageUrls?.length]);

  // Map screenshot modal functions
  const openMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(true);
  }, []);

  const closeMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(false);
  }, []);

  return (
    <div className="w-full mb-4 sm:mb-6">
      {/* Gradient Frame Container */}
                  <div className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                        {/* Header with user info and actions */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center overflow-hidden">
                              {post.userData.avatar ? (
                                <img 
                                  src={post.userData.avatar} 
                                  alt={post.userData.userName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                  {post.userData.userName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {post.userData.userName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(post.submissionDate).toLocaleDateString('pl-PL')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Edit button */}
                            <button
                              className="p-2 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edytuj post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            {/* Delete button */}
                            {canDeletePost && (
                              <button
                                onClick={() => {
                                  console.log('Delete post clicked:', {
                                    hasPermission: canDeletePost,
                                    postUserName: post.userData.userName,
                                    postUserId: post.userData.userId,
                                    postId: post.id
                                  });
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Usuń post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

            {/* Photos Section - MAIN CONTENT */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                {/* Photo Grid - LARGER PHOTOS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {post.imageUrls.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image}
                        crossOrigin={image.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                        referrerPolicy="no-referrer"
                        alt={`Tree photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm"
                        onClick={() => openPhotoModal(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Screenshot */}
            {post.treeScreenshotUrl && (
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                <div className="relative">
                  <img
                    src={post.treeScreenshotUrl}
                    crossOrigin={post.treeScreenshotUrl.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                    referrerPolicy="no-referrer"
                    alt="Map screenshot"
                    className="w-full h-20 sm:h-24 object-cover rounded cursor-pointer"
                    onClick={openMapScreenshotModal}
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
                  {post.species}
                </p>
                <p className="text-xs italic text-blue-600 dark:text-blue-400">
                  {post.speciesLatin}{!post.speciesLatin.endsWith('L.') ? ' L.' : ''}
                </p>
              </div>
            </div>

                        {/* All Tree Information - One Big Block */}
                        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                          <div className="space-y-3">
                            {/* Tree Name - HEADER OVER DESCRIPTION */}
                            {post.name && (
                              <div className="text-center mb-2">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                  {post.name}
                                </h2>
                              </div>
                            )}

                            {/* Description */}
                            {post.description && (
                              <div>
                                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Opis</h3>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {post.description}
                                </p>
                              </div>
                            )}

                {/* Tree Measurements */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Wymiary drzewa</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Obwód</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{post.circumference} cm</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wysokość</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{post.height} m</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Korona</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{post.crownSpread} m</p>
                    </div>
                    {post.estimatedAge && (
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded p-1 sm:p-2 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Wiek</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{post.estimatedAge} lat</p>
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
                      <strong>Adres:</strong> {post.location?.address || 'Brak adresu'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Gmina:</strong> {post.location?.commune || 'Brak danych'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Powiat:</strong> {post.location?.county || 'Brak danych'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Dzielnica:</strong> {post.location?.district || 'Brak danych'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Województwo:</strong> {post.location?.province || 'Brak danych'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Numer działki:</strong> {post.location?.plotNumber || 'Brak danych'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Lat:</strong> {post.location?.lat?.toFixed(6)}, <strong>Lng:</strong> {post.location?.lng?.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Health, Soil, Environment Tags */}
                {((post.health && Array.isArray(post.health) && post.health.length > 0) || 
                  (post.soil && Array.isArray(post.soil) && post.soil.length > 0) || 
                  (post.environment && Array.isArray(post.environment) && post.environment.length > 0)) && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Szczegóły</h3>
                    <div className="space-y-2">
                      {post.health && Array.isArray(post.health) && post.health.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Zdrowie:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.health.map((tag, index) => (
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
                      
                      {post.soil && Array.isArray(post.soil) && post.soil.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Gleba:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.soil.map((tag, index) => (
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
                      
                      {post.environment && Array.isArray(post.environment) && post.environment.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Środowisko:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.environment.map((tag, index) => (
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
                {post.legend && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Historie i legendy</h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {post.legend}
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
                                Status: {post.status === 'Approved' ? 'Zatwierdzone' : 
                                        post.status === 'Pending' ? 'Oczekujące' : 'Odrzucone'}
                              </span>
                            </div>
                            
                            {post.votesCount !== undefined && (
                              <div className="text-xs text-purple-500 dark:text-purple-400">
                                Głosy: {post.votesCount}
                              </div>
                            )}
                          </div>
                        </div>
          </div>
        </div>
      </div>

      {/* Delete Post Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        title="Usuń post"
        message="Czy na pewno chcesz usunąć ten post? Ta akcja jest nieodwracalna."
        confirmText="Usuń post"
        cancelText="Anuluj"
        isLoading={isDeleting}
      />

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {showPhotoModal && post.imageUrls && post.imageUrls.length > 0 && (
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
                {selectedPhotoIndex + 1} / {post.imageUrls.length}
              </div>

              {/* Main photo */}
              <img
                src={post.imageUrls[selectedPhotoIndex]}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Navigation arrows */}
              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {post.imageUrls.length > 1 && (
                <div className="flex gap-2 bg-black/50 rounded-lg p-2 mt-4">
                  {post.imageUrls.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden transition-opacity ${
                        index === selectedPhotoIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={photo}
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
        {showMapScreenshotModal && post.treeScreenshotUrl && (
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
                src={post.treeScreenshotUrl}
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