import React, { useState, useEffect } from 'react';
import { MessageCircle, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { TreePost as TreePostType, Comment } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { commentsService } from '../../services/commentsService';

interface TreePostProps {
  post: TreePostType;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onCommentVote: (commentId: string, vote: 'like' | 'dislike') => void;
}

export const TreePost: React.FC<TreePostProps> = ({
  post,
  onLike,
  onDislike,
  onComment,
  onCommentVote
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  // Load comments when showComments becomes true
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      loadComments();
    }
  }, [showComments, commentsLoaded]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      // Load comments for this specific tree using tree ID
      const commentsData = await commentsService.getTreeComments(post.id);
      setComments(commentsData);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
      setCommentsLoaded(true);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Find the most popular comment (highest likes)
  const mostPopularComment = comments.length > 0 
    ? comments.reduce((prev, current) => 
        (current.votes.like > prev.votes.like) ? current : prev
      )
    : null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    await onComment(post.id, newComment);
    setNewComment('');
    setIsSubmittingComment(false);
  };

  return (
    <div 
      id={`tree-post-${post.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 mb-3 p-3"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
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
            <span className="text-base text-gray-500">
              {new Date(post.submissionDate).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
      </div>

      {/* Photos */}
      {post.images.length > 0 && (
        <div className="mb-4">
          <img
            src={post.images[0]}
            alt="Tree photo"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-2">
          {post.species}
        </h3>
        <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-2">
          {post.speciesLatin}
        </p>
        {post.description && (
          <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
            {post.description}
          </p>
        )}
      </div>



      {/* Actions */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
              post.userVote === 'like' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
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
            <ThumbsDown className="w-5 h-5" />
            <span className="text-sm font-medium">{post.dislikes}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>
        </div>
        
        <button
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Udostępnij</span>
        </button>
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
                  const isMostPopular = comment.id === mostPopularComment?.id && comment.votes.like > 0;
                  return (
                <div key={comment.id} className={`flex space-x-4 ${isMostPopular ? 'bg-green-50 dark:bg-green-900/20 rounded-lg p-3' : ''}`}>
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {comment.userData.avatar ? (
                      <img 
                        src={comment.userData.avatar} 
                        alt={comment.userData.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400 font-semibold text-base">
                        {comment.userData.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white text-base">
                        {comment.userData.userName}
                      </span>
                      <span className="text-base text-gray-500">
                        {new Date(comment.datePosted).toLocaleDateString('pl-PL')}
                      </span>
                      {comment.isLegend && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full">
                          Legenda
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-base mb-3">
                      {comment.content}
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => onCommentVote(comment.id, 'like')}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-sm font-medium">{comment.votes.like}</span>
                      </button>
                      
                      <button
                        onClick={() => onCommentVote(comment.id, 'dislike')}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="text-sm font-medium">{comment.votes.dislike}</span>
                      </button>
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
    </div>
  );
};