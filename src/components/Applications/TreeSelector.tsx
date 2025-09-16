import React, { useState, useMemo } from 'react';
import { Search, MapPin, Loader2, Plus } from 'lucide-react';
import { Tree } from '../../types';
import { GlassButton } from '../UI/GlassButton';
import { motion } from 'framer-motion';

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

  // Filter trees based on search query
  const filteredTrees = useMemo(() => {
    if (!searchQuery.trim()) return trees;
    
    const query = searchQuery.toLowerCase();
    return trees.filter(tree => 
      tree.species.toLowerCase().includes(query) ||
      tree.speciesLatin.toLowerCase().includes(query) ||
      tree.description.toLowerCase().includes(query)
    );
  }, [trees, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Monument':
        return <div className="w-2 h-2 bg-green-500 rounded-full" title="Pomnik przyrody" />;
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Oczekuje na weryfikację" />;
      case 'rejected':
        return <div className="w-2 h-2 bg-red-500 rounded-full" title="Odrzucone" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" title="Nieznany status" />;
    }
  };

  if (trees.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nie zgłosiłeś jeszcze żadnych drzew
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aby utworzyć wniosek, musisz najpierw zgłosić drzewo w aplikacji lub wybrać z już istniejących.
          </p>
          <div className="space-y-2">
            <GlassButton
              onClick={onLoadMore}
              disabled={isLoading}
              variant="primary"
              size="sm"
              icon={isLoading ? Loader2 : Plus}
            >
              {isLoading ? 'Ładowanie...' : 'Pokaż więcej drzew'}
            </GlassButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Szukaj po nazwie lub gatunku..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Trees List - Limited Height with Scroll */}
      <div className="max-h-[70vh] overflow-y-auto space-y-2 pr-2">
        {filteredTrees.map(tree => (
          <motion.div
            key={tree.id}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => onTreeClick?.(tree)}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg cursor-pointer transition-all p-3 ${
              selectedTree?.id === tree.id ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20' : 'hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90'
            }`}
          >
            <div className="flex items-start space-x-3">
              {tree.images && tree.images.length > 0 && (
                <img
                  src={tree.images[0]}
                  alt={tree.species}
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {tree.species}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-1 truncate">
                  {tree.speciesLatin}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                  {tree.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">
                      {tree.location.lat.toFixed(4)}, {tree.location.lng.toFixed(4)}
                    </span>
                  </div>
                  {getStatusIcon(tree.status)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredTrees.length === 0 && searchQuery && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>Nie znaleziono drzew pasujących do wyszukiwania</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {!showAllTrees && (
        <div className="text-center">
          <GlassButton
            onClick={onLoadMore}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            icon={isLoading ? Loader2 : Plus}
            className="px-6 py-2"
          >
            {isLoading ? 'Ładowanie...' : 'Pokaż więcej drzew'}
          </GlassButton>
        </div>
      )}
    </div>
  );
};

