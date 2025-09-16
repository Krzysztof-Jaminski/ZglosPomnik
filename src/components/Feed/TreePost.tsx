import React, { useState, useEffect } from 'react';
import { MessageCircle, Share2, ThumbsUp, ThumbsDown, Trash2, X } from 'lucide-react';
import { TreePost as TreePostType, Comment } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { DeleteConfirmationModal } from '../UI/DeleteConfirmationModal';
import { commentsService } from '../../services/commentsService';
import { treesService } from '../../services/treesService';
import { useAuth } from '../../context/AuthContext';

interface TreePostProps {
  post: TreePostType;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onComment: (postId: string, comment: string, userId?: string) => void;
  onDelete?: (postId: string) => void;
}

export const TreePost: React.FC<TreePostProps> = ({
  post,
  onLike,
  onDislike,
  onComment,
  onDelete
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const { user } = useAuth();

  // Load comments when showComments becomes true
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      loadComments();
    }
  }, [showComments, commentsLoaded]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      // Load comments for this specific tree using API
      const commentsData = await commentsService.getTreeCommentsFromAPI(post.id);
      console.log(`Loaded comments for tree ${post.id}:`, commentsData);
      
      // Remove duplicates based on comment ID
      const uniqueComments = commentsData.filter((comment, index, self) => 
        index === self.findIndex(c => c.id === comment.id)
      );
      
      setComments(uniqueComments);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments from API:', error);
      // Fallback to localStorage
      const commentsData = commentsService.getTreeComments(post.id);
      console.log(`Fallback comments for tree ${post.id}:`, commentsData);
      
      // Remove duplicates based on comment ID
      const uniqueComments = commentsData.filter((comment, index, self) => 
        index === self.findIndex(c => c.id === comment.id)
      );
      
      setComments(uniqueComments);
      setCommentsLoaded(true);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Find the most popular comment and check if it should be marked as legend
  const sortedComments = comments.sort((a, b) => b.votes.like - a.votes.like);
  const mostPopularComment = sortedComments.length > 0 ? sortedComments[0] : null;
  const secondMostPopularComment = sortedComments.length > 1 ? sortedComments[1] : null;
  
  // Check if the most popular comment should be marked as legend
  const shouldShowLegend = mostPopularComment && 
    mostPopularComment.votes.like > 0 && 
    (!secondMostPopularComment || 
     (mostPopularComment.votes.like - secondMostPopularComment.votes.like) >= 3);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // Pass userId to the comment creation
      if (user?.id) {
        await onComment(post.id, newComment, user.id);
      } else {
        await onComment(post.id, newComment);
      }
      setNewComment('');
      // Reload comments after adding new one
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentVote = async (commentId: string, vote: 'like' | 'dislike') => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const wasLiked = comment.userVote === 'like';
      const wasDisliked = comment.userVote === 'dislike';

      // Update local state immediately for better UX
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === commentId
            ? {
                ...c,
                votes: {
                  like: vote === 'like' && !wasLiked ? c.votes.like + 1 : 
                        vote === 'like' && wasLiked ? c.votes.like - 1 : c.votes.like,
                  dislike: vote === 'dislike' && !wasDisliked ? c.votes.dislike + 1 : 
                           vote === 'dislike' && wasDisliked ? c.votes.dislike - 1 : c.votes.dislike
                },
                userVote: (vote === 'like' && wasLiked) || (vote === 'dislike' && wasDisliked) 
                  ? null 
                  : vote
              }
            : c
        )
      );

      // Call API in background
      try {
        let updatedVotes;
        if (vote === 'like' && wasLiked) {
          // Remove existing like
          updatedVotes = await commentsService.removeVoteFromComment(commentId);
        } else if (vote === 'dislike' && wasDisliked) {
          // Remove existing dislike
          updatedVotes = await commentsService.removeVoteFromComment(commentId);
        } else {
          // Add vote (or change from one type to another)
          const voteType = vote === 'like' ? 'Like' : 'Dislike';
          updatedVotes = await commentsService.voteComment(commentId, voteType);
        }

        // Update with API response
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId
              ? { 
                  ...c, 
                  votes: updatedVotes,
                  userVote: (vote === 'like' && wasLiked) || (vote === 'dislike' && wasDisliked) 
                    ? null 
                    : vote
                }
              : c
          )
        );
      } catch (error) {
        console.error('Error voting on comment:', error);
        // Revert local changes on error
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId
              ? {
                  ...c,
                  votes: {
                    like: vote === 'like' && !wasLiked ? c.votes.like - 1 : 
                          vote === 'like' && wasLiked ? c.votes.like + 1 : c.votes.like,
                    dislike: vote === 'dislike' && !wasDisliked ? c.votes.dislike - 1 : 
                             vote === 'dislike' && wasDisliked ? c.votes.dislike + 1 : c.votes.dislike
                  },
                  userVote: wasLiked ? 'like' : wasDisliked ? 'dislike' : null
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleDeleteCommentClick = (commentId: string) => {
    // TODO: TEMPORARY - Always try to delete, let API handle permission validation
    // TODO: In the future, this should be: user && comment?.userId && comment.userId === user.id
    setCommentToDelete(commentId);
    setShowDeleteCommentModal(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    const comment = comments.find(c => c.id === commentToDelete);
    // TODO: TEMPORARY - Always try to delete, let API handle permission validation
    const hasPermission = true; // Always try to delete for now
    
    console.log('Attempting to delete comment:', {
      hasPermission,
      user: user?.id,
      userName: user?.name,
      userFullData: user,
      commentUserName: comment?.userData?.userName,
      commentUserId: comment?.userId, // This might be null/undefined for now
      commentId: commentToDelete,
      comment: comment
    });
    
    try {
      // Remove from local state immediately
      setComments(prevComments => prevComments.filter(c => c.id !== commentToDelete));
      
      // Call API in background
      try {
        await commentsService.deleteComment(commentToDelete);
        console.log(`Comment ${commentToDelete} deleted successfully`);
        setShowDeleteCommentModal(false);
        setCommentToDelete(null);
      } catch (error: any) {
        console.error('Error deleting comment:', error);
        
        // Handle specific error cases
        if (error.message?.includes('403')) {
          console.log('403 Error - No permission to delete this comment');
        } else if (error.message?.includes('404') || error.message?.includes('Comment not found')) {
          console.log('404 Error - Comment not found:', error.message);
        } else if (error.message?.includes('401')) {
          console.log('401 Error - Session expired');
        } else {
          console.log('Other error:', error.message);
        }
        
        // Revert local changes on error
        await loadComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Handle tree post deletion
  const handleDeletePost = async () => {
    if (!onDelete) return;
    
    // TODO: TEMPORARY - Always try to delete, let API handle permission validation
    // TODO: In the future, this should check: user && post.userData.userId && post.userData.userId === user.id
    const hasPermission = true; // Always try to delete for now
    console.log('Attempting to delete post:', {
      hasPermission,
      user: user?.id,
      userName: user?.name,
      userFullData: user,
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
                  user: user?.id,
                  userName: user?.name,
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
        <h3 className="font-medium text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3">
          {post.species}
        </h3>
        <p className="text-sm sm:text-base italic text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
          {post.speciesLatin}
        </p>
        {post.description && (
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
            {post.description}
          </p>
        )}
      </div>

      {/* Photos */}
        {post.images.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Tree photo ${index + 1}`}
                  className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }}
                  onClick={() => setEnlargedImage(image)}
                />
              ))}
            </div>
          </div>
        )}



      {/* Actions */}
      <div className="flex items-center justify-between space-x-2 sm:space-x-4">
        <div className="flex items-center space-x-2">
           <button
             onClick={() => onLike(post.id)}
             className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
               post.userVote === 'like' 
                 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                 : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
             }`}
           >
             <ThumbsUp className="w-6 h-6" />
             <span className="text-sm font-medium">{post.likes}</span>
           </button>
          
           <button
             onClick={() => onDislike(post.id)}
             className={`danger flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
               post.userVote === 'dislike' 
                 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                 : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
             }`}
           >
             <ThumbsDown className="w-6 h-6" />
             <span className="text-sm font-medium">{post.dislikes}</span>
           </button>
          
           <button
             onClick={() => setShowComments(!showComments)}
             className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[120px]"
           >
             <MessageCircle className="w-5 h-5" />
             <span className="text-sm font-medium">
               {showComments ? 'Ukryj' : 'Komentarze'}
               {post.commentCount > 0 && ` (${post.commentCount})`}
             </span>
           </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-base">Ty</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Napisz komentarz..."
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <GlassButton
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      variant="primary"
                      size="sm"
                    >
                      {isSubmittingComment ? 'Wysyłanie...' : 'Komentuj'}
                    </GlassButton>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 dark:text-gray-400">Ładowanie komentarzy...</div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 dark:text-gray-400">Brak komentarzy</div>
                </div>
              ) : (
                comments
                  .sort((a, b) => b.votes.like - a.votes.like)
                .map((comment) => {
                  const isMostPopular = comment.id === mostPopularComment?.id && shouldShowLegend;
                  return (
                <div key={comment.id} className={`flex space-x-4 ${isMostPopular ? 'bg-green-50 dark:bg-green-900/20 rounded-lg' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                    isMostPopular 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {comment.userData.avatar ? (
                      <img 
                        src={comment.userData.avatar} 
                        alt={comment.userData.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`font-semibold text-base ${
                        isMostPopular 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {comment.userData.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`font-medium text-base ${
                        isMostPopular 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {comment.userData.userName}
                      </span>
                      <span className={`text-base ${
                        isMostPopular 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-500'
                      }`}>
                        {new Date(comment.datePosted).toLocaleDateString('pl-PL')}
                      </span>
                      {isMostPopular && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300 text-xs rounded-full">
                          Legenda
                        </span>
                      )}
                    </div>
                    <p className={`text-base mb-3 ${
                      isMostPopular 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {comment.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleCommentVote(comment.id, 'like')}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            comment.userVote === 'like' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                          <span className="text-sm font-medium min-w-[20px] text-center">{comment.votes.like}</span>
                        </button>
                        
                        <button
                          onClick={() => handleCommentVote(comment.id, 'dislike')}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            comment.userVote === 'dislike' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <ThumbsDown className="w-5 h-5" />
                          <span className="text-sm font-medium min-w-[20px] text-center">{comment.votes.dislike}</span>
                        </button>
                      </div>
                      
                      {/* Delete button - show for everyone, validation happens on click */}
                      {/* TODO: TEMPORARY - Show delete button for everyone, validation happens on click */}
                      {/* TODO: In the future, this should be: user && comment.userId === user.id */}
                      {user && (
                        <button
                          onClick={() => {
                            // TODO: TEMPORARY - Always try to delete, let API handle permission validation
                            handleDeleteCommentClick(comment.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Usuń komentarz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Delete Comment Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteCommentModal}
        onClose={() => {
          setShowDeleteCommentModal(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        title="Usuń komentarz"
        message="Czy na pewno chcesz usunąć ten komentarz? Ta akcja jest nieodwracalna."
        confirmText="Usuń komentarz"
        cancelText="Anuluj"
        isLoading={false}
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