import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { TreeSpecies } from '../types';
import { api } from '../services/api';
import { SpeciesCard } from '../components/Encyclopedia/SpeciesCard';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';


export const EncyclopediaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<TreeSpecies[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<TreeSpecies | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const data = await api.getSpecies();
        setSpecies(data);
        setFilteredSpecies(data);
        
        // Check if we should show a specific species
        const selectedSpeciesId = location.state?.selectedSpecies;
        if (selectedSpeciesId) {
          const speciesItem = data.find(s => s.id === selectedSpeciesId);
          if (speciesItem) {
            setSelectedSpecies(speciesItem);
          }
        }
      } catch (error) {
        console.error('Error loading species:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecies();
  }, [location.state]);

  useEffect(() => {
    let filtered = species;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.commonName.toLowerCase().includes(query) ||
        s.scientificName.toLowerCase().includes(query) ||
        s.family.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    setFilteredSpecies(filtered);
  }, [species, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Ładowanie encyklopedii...</p>
        </div>
      </div>
    );
  }

  // If a specific species is selected, show detailed view
  if (selectedSpecies) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <GlassButton
              onClick={() => setSelectedSpecies(null)}
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
            >
              Powrót do listy
            </GlassButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={selectedSpecies.images[0]}
                alt={selectedSpecies.commonName}
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedSpecies.commonName}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 italic mb-2">
                  {selectedSpecies.scientificName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Rodzina: {selectedSpecies.family}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Opis
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {selectedSpecies.description}
                  </p>

                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Środowisko
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedSpecies.habitat}
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Charakterystyka
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Wysokość:</span>
                      <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.characteristics.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Żywotność:</span>
                      <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.characteristics.lifespan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Liście:</span>
                      <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.characteristics.leaves}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Kora:</span>
                      <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                        {selectedSpecies.characteristics.bark}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Status ochrony
                    </h3>
                    <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full font-medium text-sm sm:text-base">
                      {selectedSpecies.conservationStatus === 'Stabilny' ? 'Stabilny' : selectedSpecies.conservationStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj gatunku..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Species grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredSpecies.map((speciesItem) => (
            <div key={speciesItem.id}>
              <SpeciesCard 
                species={speciesItem} 
                onClick={() => setSelectedSpecies(speciesItem)}
              />
            </div>
          ))}
        </div>

        {filteredSpecies.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              Nie znaleziono gatunków spełniających kryteria wyszukiwania
            </p>
          </div>
        )}
      </div>
    </div>
  );
};