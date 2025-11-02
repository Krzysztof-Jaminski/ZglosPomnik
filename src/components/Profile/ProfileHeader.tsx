import React from 'react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-2 sm:mb-3 ${className}`}
    >
      <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Profil użytkownika
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
        Zarządzaj swoim kontem i ustawieniami
      </p>
    </motion.div>
  );
};
