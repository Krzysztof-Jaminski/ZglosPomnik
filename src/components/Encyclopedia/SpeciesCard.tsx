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
      className="rounded-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-700/40 shadow-xl"
    >
      {/* Image container - square aspect ratio */}
      <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden aspect-square">
        <img
          src={species.images[0]?.imageUrl || '/logo.png'}
          alt={species.images[0]?.altText || species.polishName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          crossOrigin={species.images[0]?.imageUrl?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Info container below image */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm sm:text-base">
            {species.polishName}
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 italic mb-2 line-clamp-1 text-xs sm:text-sm">
          {species.latinName}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-xs">
          Rodzina: {species.family}
        </p>
        
        <div className="mt-auto flex justify-between items-center">
          <span className="px-2 py-1 rounded-full font-medium text-[11px] bg-green-900/30 text-green-300 border border-green-500/20">
            {species.traits.nativeToPoland ? 'Rodzimy' : 'Obcy'}
          </span>
          <span className="text-gray-400 text-xs">
            Wys: {species.traits.maxHeight}m
          </span>
        </div>
      </div>
    </motion.div>
  );
};