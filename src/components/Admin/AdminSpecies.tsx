import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Species } from '../../types';
import { SpeciesFormData } from '../../services/adminService';
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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (species.length === 1) {
      setIsExpanded(true);
    }
  }, [species.length]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <GlassButton
        onClick={toggleExpand}
        variant="primary"
        size="sm"
        className="w-full"
      >
        <span className="text-sm">Zarządzaj Gatunkami</span>
      </GlassButton>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="p-2 sm:p-3">
                  <div className="flex items-center justify-end mb-2 sm:mb-3">
                    <GlassButton
                      onClick={onAddSpecies}
                      variant="primary"
                      size="sm"
                    >
                      <span className="text-sm flex items-center">
                        <Plus className="w-4 h-4 mr-1" />
                        Dodaj gatunek
                      </span>
                    </GlassButton>
                  </div>

                  {species.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-lg">Brak gatunków</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {species.map((spec, index) => (
                        <motion.div
                          key={spec.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3 shadow-xl hover:shadow-2xl transition-all"
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
                                onClick={() => onEditSpecies(spec)}
                                title="Edytuj gatunek"
                              >
                                <span className="text-xs flex items-center">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edytuj
                                </span>
                              </GlassButton>
                              <GlassButton 
                                size="sm" 
                                variant="danger"
                                onClick={() => onDeleteSpecies(spec.id)}
                                title="Usuń gatunek"
                              >
                                <span className="text-xs flex items-center">
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Usuń
                                </span>
                              </GlassButton>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
