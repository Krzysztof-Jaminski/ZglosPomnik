import React, { useState } from 'react';
import { SearchInput } from '../UI/SearchInput';
import { Commune } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CommuneSelectorProps {
  communes: Commune[];
  selectedCommune: Commune | null;
  onCommuneSelect: (commune: Commune) => void;
}

export const CommuneSelector: React.FC<CommuneSelectorProps> = ({
  communes,
  selectedCommune,
  onCommuneSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCommunes, setExpandedCommunes] = useState(true);

  // Simple filter function
  const getFilteredCommunes = () => {
    if (!searchQuery.trim()) return communes;
    
    const query = searchQuery.toLowerCase();
    return communes.filter(commune => 
      commune.name.toLowerCase().includes(query) ||
      commune.city.toLowerCase().includes(query) ||
      commune.address.toLowerCase().includes(query)
    );
  };

  const filteredCommunes = getFilteredCommunes();

  return (
    <div className="space-y-2 p-2">
      {/* Search Filter - Always visible */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Szukaj po nazwie gminy lub mieście..."
        size="md"
        variant="compact"
        showClearButton={false}
      />

      {/* Communes List */}
      <div className="bg-gradient-to-r from-blue-50/20 to-blue-100/10 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/30 dark:border-blue-700/30 rounded-lg p-2">
        <button
          type="button"
          onClick={() => setExpandedCommunes(!expandedCommunes)}
          className="no-focus flex items-center justify-between w-full text-left p-1 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Wybierz gminę
            </span>
            <span className="text-xs text-gray-500 bg-white/50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {filteredCommunes.length}
            </span>
          </div>
          <span className="text-sm text-gray-400 font-bold">
            {expandedCommunes ? '−' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedCommunes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {filteredCommunes.slice(0, 10).map(commune => (
                <button
                  key={commune.id}
                  type="button"
                  onClick={() => onCommuneSelect(commune)}
                  className={`no-focus p-1.5 rounded text-xs text-left transition-all w-full ${
                    selectedCommune?.id === commune.id
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {commune.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 truncate">
                        {commune.city} • {commune.email}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedCommune?.id === commune.id 
                          ? 'bg-blue-600' 
                          : 'border-2 border-gray-300'
                      }`}>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredCommunes.length === 0 && searchQuery && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-xs">Nie znaleziono gmin pasujących do wyszukiwania</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};