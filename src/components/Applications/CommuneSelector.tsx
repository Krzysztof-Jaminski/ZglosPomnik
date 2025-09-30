import React, { useState, useMemo } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { Commune } from '../../types';
import { motion } from 'framer-motion';

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

  // Filter communes based on search query
  const filteredCommunes = useMemo(() => {
    if (!searchQuery.trim()) return communes;
    
    const query = searchQuery.toLowerCase();
    return communes.filter(commune => 
      commune.name.toLowerCase().includes(query) ||
      commune.city.toLowerCase().includes(query) ||
      commune.address.toLowerCase().includes(query)
    );
  }, [communes, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Szukaj po nazwie gminy lub mieście..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Communes List - Limited Height with Scroll */}
      <div className="max-h-[75vh] overflow-y-auto space-y-2 pr-2 py-2">
        {filteredCommunes.map(commune => (
          <motion.div
            key={commune.id}
            whileHover={{ scale: 1.002 }}
            onClick={() => onCommuneSelect(commune)}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg cursor-pointer transition-all p-3 ${
              selectedCommune?.id === commune.id ? 'bg-green-50/50 dark:bg-green-900/20' : 'hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {commune.name}
                  {!commune.isActive && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      Niedostępna
                    </span>
                  )}
                </h3>
                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <p className="truncate">Email: {commune.email}</p>
                  <p className="truncate">Telefon: {commune.phone}</p>
                  <p className="truncate">Adres: {commune.address}, {commune.city}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                selectedCommune?.id === commune.id 
                  ? 'bg-green-600 border-green-600' 
                  : 'border-gray-300'
              }`}>
                {selectedCommune?.id === commune.id && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredCommunes.length === 0 && searchQuery && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>Nie znaleziono gmin pasujących do wyszukiwania</p>
          </div>
        )}
      </div>
    </div>
  );
};

