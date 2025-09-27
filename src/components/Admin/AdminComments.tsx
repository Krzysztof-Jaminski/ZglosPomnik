import React from 'react';
import { MessageSquare, Users, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Comment } from '../../types';
import { GlassButton } from '../UI/GlassButton';

interface AdminCommentsProps {
  comments: Comment[];
  onDeleteComment: (commentId: string) => void;
}

export const AdminComments: React.FC<AdminCommentsProps> = ({ comments, onDeleteComment }) => {
  if (comments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Zarządzanie komentarzami
            </h3>
          </div>
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Brak komentarzy</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Zarządzanie komentarzami
          </h3>
        </div>
        
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {comment.userData.userName}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {comment.treePolishName}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{new Date(comment.datePosted).toLocaleDateString('pl-PL')}</span>
                    <span>Polubienia: {comment.votes.like}</span>
                    <span>Niepolubienia: {comment.votes.dislike}</span>
                    {comment.isLegend && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        Legenda
                      </span>
                    )}
                  </div>
                </div>
                <GlassButton 
                  size="sm" 
                  variant="danger"
                  icon={Trash2}
                  onClick={() => onDeleteComment(comment.id)}
                  title="Usuń komentarz"
                >
                  <span className="text-xs">Usuń</span>
                </GlassButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
