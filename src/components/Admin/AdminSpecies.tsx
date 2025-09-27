import React, { useState } from 'react';
import { Leaf, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Species, SpeciesFormData } from '../../services/adminService';
import { GlassButton } from '../UI/GlassButton';

interface AdminSpeciesProps {
  species: Species[];
  onDeleteSpecies: (speciesId: string) => void;
  onEditSpecies: (species: Species) => void;
  onAddSpecies: () => void;
}

export const AdminSpecies: React.FC<AdminSpeciesProps> = ({ 
  species, 
  onDeleteSpecies, 
  onEditSpecies, 
  onAddSpecies 
}) => {
  if (species.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Leaf className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Zarządzanie gatunkami
              </h3>
            </div>
            <GlassButton
              onClick={onAddSpecies}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              <span className="text-sm">Dodaj gatunek</span>
            </GlassButton>
          </div>
          <div className="text-center py-8">
            <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Brak gatunków</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 sm:mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Leaf className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Zarządzanie gatunkami
            </h3>
          </div>
          <GlassButton
            onClick={onAddSpecies}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            <span className="text-sm">Dodaj gatunek</span>
          </GlassButton>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {species.map((spec, index) => (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                    {spec.polishName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {spec.latinName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Rodzina: {spec.family}
                  </p>
                </div>
              </div>
              
              {spec.description && (
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {spec.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Wysokość: {spec.traits.maxHeight}m</span>
                </div>
                <div className="flex space-x-2">
                  <GlassButton 
                    size="sm" 
                    variant="secondary"
                    icon={Edit}
                    onClick={() => onEditSpecies(spec)}
                    title="Edytuj gatunek"
                  >
                    <span className="text-xs">Edytuj</span>
                  </GlassButton>
                  <GlassButton 
                    size="sm" 
                    variant="danger"
                    icon={Trash2}
                    onClick={() => onDeleteSpecies(spec.id)}
                    title="Usuń gatunek"
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
