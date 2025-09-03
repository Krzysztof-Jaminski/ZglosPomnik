import React, { useState } from 'react';
import { MessageCircle, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { TreePost as TreePostType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';

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

  // Find the most popular comment (highest likes)
  const mostPopularComment = post.comments.length > 0 
    ? post.comments.reduce((prev, current) => 
        (current.likes > prev.likes) ? current : prev
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 mb-3 p-3">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <span className="text-green-600 dark:text-green-400 font-semibold text-base">
            {post.reportedBy.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-900 dark:text-white text-base">
              {post.reportedBy}
            </span>
            <span className="text-base text-gray-500">
              {new Date(post.reportedAt).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
      </div>

      {/* Photos */}
      {post.photos.length > 0 && (
        <div className="mb-4">
          <img
            src={post.photos[0]}
            alt="Tree photo"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-2">
          {post.commonName}
        </h3>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
          {post.notes}
        </p>
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
            <span className="text-sm font-medium">{post.comments.length}</span>
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
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {post.comments
                .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
                .map((comment) => {
                  const isMostPopular = comment.id === mostPopularComment?.id && comment.likes > 0;
                  return (
                <div key={comment.id} className={`flex space-x-4 ${isMostPopular ? 'bg-green-50 dark:bg-green-900/20 rounded-lg p-3' : ''}`}>
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold text-base">
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white text-base">
                        {comment.userName}
                      </span>
                      <span className="text-base text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-base mb-3">
                      {comment.content}
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => onCommentVote(comment.id, 'like')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                          comment.userVote === 'like' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-sm font-medium">{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => onCommentVote(comment.id, 'dislike')}
                        className={`danger flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                          comment.userVote === 'dislike' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="text-sm font-medium">{comment.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};