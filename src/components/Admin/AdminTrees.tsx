import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tree } from '../../types';
import { GlassButton } from '../UI/GlassButton';

interface AdminTreesProps {
  trees: Tree[];
  onDeleteTree: (treeId: string) => void;
}

export const AdminTrees: React.FC<AdminTreesProps> = ({ trees, onDeleteTree }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (trees.length === 1) {
      setIsExpanded(true);
    }
  }, [trees.length]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <GlassButton
        onClick={toggleExpand}
        variant="primary"
        size="sm"
        className="w-full"
      >
        <span className="text-sm">Zarządzaj Drzewami</span>
      </GlassButton>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="p-2 sm:p-3">
                  {trees.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-lg">Brak drzew</p>
                    </div>
                  ) : (
                    <div className="space-y-1 sm:space-y-2">
                      {trees.map((tree, index) => (
                        <motion.div
                          key={tree.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-2 sm:p-3 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-xs font-semibold">
                                  {tree.species?.charAt(0).toUpperCase() || 'T'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {tree.species || tree.name || 'Bez nazwy'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {tree.speciesLatin || tree.location?.address || 'Brak danych'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tree.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              tree.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {tree.status === 'approved' ? 'Zatwierdzone' : tree.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                            </span>
                            <button
                              onClick={() => onDeleteTree(tree.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Usuń drzewo"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
