import React from 'react';
import { TreePine, Users, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tree } from '../../types';
import { GlassButton } from '../UI/GlassButton';

interface AdminTreesProps {
  trees: Tree[];
  onDeleteTree: (treeId: string) => void;
}

export const AdminTrees: React.FC<AdminTreesProps> = ({ trees, onDeleteTree }) => {
  if (trees.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TreePine className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Zgłoszenia drzew
            </h3>
          </div>
          <div className="text-center py-8">
            <TreePine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Brak zgłoszeń drzew</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TreePine className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Zgłoszenia drzew
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {trees.map((tree, index) => (
            <motion.div
              key={tree.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                    {tree.species}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {tree.speciesLatin}
                  </p>
                  <div className="flex items-center space-x-4 text-gray-500 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{tree.userData?.userName || 'Nieznany'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tree.submissionDate).toLocaleDateString('pl-PL')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tree.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  tree.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {tree.status === 'approved' ? 'Zatwierdzone' : tree.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-gray-500 text-sm">
                    <span>Polubienia: {tree.votes?.like || 0}</span>
                  </div>
                  <GlassButton 
                    size="sm" 
                    variant="danger"
                    icon={Trash2}
                    onClick={() => onDeleteTree(tree.id)}
                    title="Usuń drzewo"
                  >
                    <span className="text-xs">Usuń</span>
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
