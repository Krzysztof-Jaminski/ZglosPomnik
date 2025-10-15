import React, { useState } from 'react';
import { Edit, Trash2, X, MapPin } from 'lucide-react';
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
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);



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

  return (
    <div 
      id={`tree-post-${post.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 mb-3 p-3 sm:p-4 lg:p-6"
    >
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-4 mb-3">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center overflow-hidden">
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
        <div className="flex-1">
          <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900 dark:text-white text-sm">
              {post.userData.userName}
            </span>
              <span className="text-xs text-gray-500">
              {new Date(post.submissionDate).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
            {/* Edit button */}
           <button
              className="p-1.5 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Edytuj post"
           >
              <Edit className="w-4 h-4" />
           </button>
          
          {/* Delete button - only show if user has permission */}
          {canDeletePost && (
            <button
              onClick={() => {
                console.log('Delete post clicked:', {
                  hasPermission: canDeletePost,
                  postUserName: post.userData.userName,
                  postUserId: post.userData.userId, // This is null/undefined for now
                  postId: post.id
                });
                setShowDeleteModal(true);
              }}
                 className="p-1.5 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
               title="Usuń post"
             >
                 <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
        
      </div>

      {/* Content */}
      <div className="mb-4 sm:mb-6">

        {/* Tree name */}
        {post.name && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nazwa drzewa:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {post.name}
            </p>
          </div>
        )}

        {/* Description and Legend in two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Description */}
          {post.description && (
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opis:
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {post.description}
              </p>
            </div>
          )}

          {/* Legend section */}
          {post.legend && (
            <div>
              <h5 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Historie i legendy:
              </h5>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {post.legend}
              </p>
            </div>
          )}
        </div>

        {/* Tags Section */}
        {((post.health && post.health.length > 0) || 
          (post.soil && post.soil.length > 0) || 
          (post.environment && post.environment.length > 0)) && (
          <div className="mb-4 sm:mb-6">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Szczegóły:
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Health Tags */}
              {post.health && post.health.map((tag, index) => (
                <span
                  key={`health-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700"
                >
                  {tag}
                </span>
              ))}
              
              {/* Soil Tags */}
              {post.soil && post.soil.map((tag, index) => (
                <span
                  key={`soil-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700"
                >
                  {tag}
                </span>
              ))}
              
              {/* Environment Tags */}
              {post.environment && post.environment.map((tag, index) => (
                <span
                  key={`env-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {post.imageUrls.map((image, index) => (
                <div key={index} className="relative group">
                <img
                  src={image}
                  crossOrigin={image.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                  referrerPolicy="no-referrer"
                  alt={`Tree photo ${index + 1}`}
                    className="w-full h-32 sm:h-36 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                  onClick={() => setEnlargedImage(image)}
                />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {index + 1}/{post.imageUrls.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Species information */}
      <div className="mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
          <div className="mb-1">
            <span className="font-medium">Gatunek:</span> {post.species}
        </div>
          <div className="italic text-gray-600 dark:text-gray-400">
            {post.speciesLatin}{!post.speciesLatin.endsWith('L.') ? ' L.' : ''}
                  </div>
                </div>
              </div>


      {/* Tree Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Obwód:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {post.circumference} cm
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wysokość:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {post.height} m
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rozpiętość korony:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {post.crownSpread} m
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-3 h-3 text-gray-500" />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Lokalizacja:
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {post.address || 'Brak adresu'}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-5">
          Lat: {post.latitude?.toFixed(6)}, Lng: {post.longitude?.toFixed(6)}
        </p>
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


      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedImage}
                alt="Powiększone zdjęcie"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};