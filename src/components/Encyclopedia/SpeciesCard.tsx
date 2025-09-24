import React from 'react';
import { Species } from '../../types';
import { motion } from 'framer-motion';

interface SpeciesCardProps {
  species: Species;
  onClick?: () => void;
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-700 flex flex-col"
    >
      {/* Image container - square aspect ratio */}
      <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden aspect-square">
        <img
          src={species.images[0]?.imageUrl || '/logo.png'}
          alt={species.images[0]?.altText || species.polishName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          crossOrigin={species.images[0]?.imageUrl?.includes('drzewaapistorage2024.blob.core.windows.net') ? undefined : 'anonymous'}
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Info container below image */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-blue-900 dark:text-white mb-1 line-clamp-1 text-sm sm:text-base">
          {species.polishName}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 italic mb-2 line-clamp-1 text-xs sm:text-sm">
          {species.latinName}
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-2 text-xs">
          Rodzina: {species.family}
        </p>
        
        <div className="mt-auto flex justify-between items-center">
          <span className="bg-blue-100 dark:bg-green-900 text-blue-800 dark:text-green-300 px-2 py-1 rounded-full font-medium text-xs">
            {species.traits.nativeToPoland ? 'Rodzimy' : 'Obcy'}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Wys: {species.traits.maxHeight}m
          </span>
        </div>
      </div>
    </motion.div>
  );
};