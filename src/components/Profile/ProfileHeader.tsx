import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-2 sm:mb-4 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Profil użytkownika
        </h1>
      </div>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
        Zarządzaj swoim kontem i ustawieniami
      </p>
    </motion.div>
  );
};
