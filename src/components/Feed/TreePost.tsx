import React, { useState } from 'react';
import { Share2, Trash2, X, MapPin } from 'lucide-react';
import { TreePost as TreePostType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmationModal } from '../UI/DeleteConfirmationModal';
import { treesService } from '../../services/treesService';
import { parseTreeDescription } from '../../utils/descriptionParser';

interface TreePostProps {
  post: TreePostType;
  onDelete?: (postId: string) => void;
}

export const TreePost: React.FC<TreePostProps> = ({
  post,
  onDelete
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Parse description using the same logic as TreeReportForm
  const parsedDescription = post.description ? parseTreeDescription(post.description) : null;


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
      <div className="flex items-center space-x-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center overflow-hidden">
          {post.userData.avatar ? (
            <img 
              src={post.userData.avatar} 
              alt={post.userData.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-green-600 dark:text-green-400 font-semibold text-base">
              {post.userData.userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-900 dark:text-white text-base">
              {post.userData.userName}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(post.submissionDate).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
           <button
             className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
             title="Udostępnij"
           >
             <Share2 className="w-5 h-5" />
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
               className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
               title="Usuń post"
             >
               <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 sm:mb-6">

        {/* User description */}
        {parsedDescription?.userDescription && (
          <div className="mb-4 sm:mb-6">
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {parsedDescription.userDescription}
            </p>
          </div>
        )}

        {/* Stories section */}
        {parsedDescription?.stories && (
          <div className="mb-4 sm:mb-6">
            <h5 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Historie i legendy:
            </h5>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {parsedDescription.stories}
            </p>
          </div>
        )}


        {/* Fallback for old format descriptions */}
        {parsedDescription && !parsedDescription.hasStructuredFormat && post.description && (
          <div className="mb-4 sm:mb-6">
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {post.description}
          </p>
          </div>
        )}
      </div>

      {/* Photos and Health Status */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {post.imageUrls.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  crossOrigin={image.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
                  referrerPolicy="no-referrer"
                  alt={`Tree photo ${index + 1}`}
                  className="w-full h-48 sm:h-56 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                  onClick={() => setEnlargedImage(image)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
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
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
            <span>
              <span className="font-medium">Gatunek:</span> {post.species}
            </span>
            <span className="italic text-gray-600 dark:text-gray-400">
              {post.speciesLatin}{!post.speciesLatin.endsWith('L.') ? ' L.' : ''}
             </span>
        </div>
      </div>

        {/* Health Status - only show if there are health conditions */}
        {parsedDescription?.detailedHealth && parsedDescription.detailedHealth.length > 0 && parsedDescription.detailedHealth.some(condition => condition && condition.trim() !== '') && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {parsedDescription.detailedHealth
                .filter(condition => condition && condition.trim() !== '')
                .map((condition, index) => {
                  // Categorize conditions by type
                  const isHealthPositive = ['Dobry stan', 'Zdrowy', 'Silny'].includes(condition);
                  const isHealthNeutral = ['Ubytki w pniu', 'Narośla', 'Odbarwienia', 'Złamania'].includes(condition);
                  const isHealthNegative = ['Posusz', 'Choroby grzybowe', 'Szkodniki', 'Uszkodzenia mechaniczne', 'Zgnilizna', 'Pęknięcia'].includes(condition);
                  const isSoil = condition.startsWith('Gleba');
                  const isEnvironment = ['Ekspozycja słoneczna', 'Cień częściowy', 'Cień głęboki', 'Wiatr', 'Zanieczyszczenia', 'Bliskość dróg', 'Bliskość budynków', 'Drenaż dobry', 'Drenaż słaby', 'Wilgotność wysoka', 'Wilgotność niska'].includes(condition);
                  
                  let colorClass = 'bg-gray-100/80 text-gray-700 dark:bg-gray-600/80 dark:text-gray-300'; // neutral
                  let iconClass = '';
                  
                  if (isHealthPositive) {
                    colorClass = 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                    iconClass = '●';
                  } else if (isHealthNegative) {
                    colorClass = 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                    iconClass = '▲';
                  } else if (isHealthNeutral) {
                    colorClass = 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                    iconClass = '◆';
                  } else if (isSoil) {
                    colorClass = 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
                    iconClass = '◈';
                  } else if (isEnvironment) {
                    colorClass = 'bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                    iconClass = '◐';
                  }
                  
                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium border border-white/20 backdrop-blur-sm ${colorClass}`}
                    >
                      <span className="text-sm opacity-80">{iconClass}</span>
                      <span className="truncate max-w-[120px]">{condition}</span>
                    </span>
                  );
                })}
            </div>
        </div>
      )}
                      




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