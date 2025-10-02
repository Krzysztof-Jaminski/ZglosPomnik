import React, { useState } from 'react';
import { SearchInput } from '../UI/SearchInput';
import { Tree } from '../../types';
import { GlassButton } from '../UI/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';
import { parseTreeDescription } from '../../utils/descriptionParser';

interface TreeSelectorProps {
  trees: Tree[];
  selectedTree: Tree | null;
  onTreeSelect: (tree: Tree) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  showAllTrees: boolean;
  onTreeClick?: (tree: Tree) => void;
}

export const TreeSelector: React.FC<TreeSelectorProps> = ({
  trees,
  selectedTree,
  onTreeSelect,
  onLoadMore,
  isLoading,
  showAllTrees,
  onTreeClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTrees, setExpandedTrees] = useState(true);

  // Simple filter function
  const getFilteredTrees = () => {
    if (!searchQuery.trim()) return trees;
    
    const query = searchQuery.toLowerCase();
    return trees.filter(tree => {
      const parsedDescription = parseTreeDescription(tree.description);
      const treeName = parsedDescription.treeName || tree.species;
      
      return treeName.toLowerCase().includes(query) ||
             tree.species.toLowerCase().includes(query) ||
             tree.location.address.toLowerCase().includes(query);
    });
  };

  const filteredTrees = getFilteredTrees();


  return (
    <div className="space-y-2 p-2">
      {/* Search Filter - Always visible */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Szukaj po nazwie drzewa, lokalizacji lub opisie..."
        size="md"
        variant="compact"
        showClearButton={false}
      />

      {/* Trees List */}
      <div className="bg-gradient-to-r from-green-50/20 to-green-100/10 dark:from-green-900/20 dark:to-green-800/10 border border-green-200/30 dark:border-green-700/30 rounded-lg p-2">
        <button
          type="button"
          onClick={() => setExpandedTrees(!expandedTrees)}
          className="no-focus flex items-center justify-between w-full text-left p-1 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Wybierz drzewo
            </span>
            <span className="text-xs text-gray-500 bg-white/50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {filteredTrees.length}
            </span>
          </div>
          <span className="text-sm text-gray-400 font-bold">
            {expandedTrees ? '−' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedTrees && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {trees.length === 0 ? (
                <div className="text-center py-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-lg">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Nie zgłosiłeś jeszcze żadnych drzew
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      Aby utworzyć wniosek, musisz najpierw zgłosić drzewo w aplikacji lub wybrać z już istniejących.
                    </p>
                    <GlassButton
                      onClick={onLoadMore}
                      disabled={isLoading}
                      variant="primary"
                      size="xs"
                      className="text-xs"
                    >
                      {isLoading ? 'Ładowanie...' : 'Pokaż więcej drzew'}
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <>
                  {filteredTrees.slice(0, 10).map(tree => {
                    const parsedDescription = parseTreeDescription(tree.description);
                    const treeName = parsedDescription.treeName || tree.species;
                    
                    return (
                      <button
                        key={tree.id}
                        type="button"
                        onClick={() => onTreeClick?.(tree)}
                        className={`no-focus p-1.5 rounded text-xs text-left transition-all w-full ${
                          selectedTree?.id === tree.id
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{treeName}</div>
                            <div className="text-gray-500 dark:text-gray-400 truncate">
                              {tree.species} • {tree.location.lat.toFixed(4)}, {tree.location.lng.toFixed(4)}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${
                              selectedTree?.id === tree.id 
                                ? 'bg-green-600' 
                                : 'border-2 border-gray-300'
                            }`}>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  
                  {filteredTrees.length === 0 && searchQuery && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p className="text-xs">Nie znaleziono drzew pasujących do wyszukiwania</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};