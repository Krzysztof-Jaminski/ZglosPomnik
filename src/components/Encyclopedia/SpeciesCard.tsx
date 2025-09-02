import React from 'react';
import { TreeSpecies } from '../../types';
import { motion } from 'framer-motion';

interface SpeciesCardProps {
  species: TreeSpecies;
  onClick?: () => void;
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-700 h-full flex flex-col"
    >
      <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={species.images[0]}
          alt={species.commonName}
          className="w-full h-24 sm:h-52 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 text-sm sm:text-base">
          {species.commonName}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 italic mb-2 line-clamp-1 text-xs sm:text-sm">
          {species.scientificName}
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-2 text-xs">
          Rodzina: {species.family}
        </p>
        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed flex-1 text-xs sm:text-sm">
          {species.description}
        </p>
        
        <div className="mt-2 flex justify-between items-center">
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium text-xs">
            {species.conservationStatus === 'Stabilny' ? 'Stabilny' : species.conservationStatus}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Wys: {species.characteristics.height}
          </span>
        </div>
      </div>
    </motion.div>
  );
};