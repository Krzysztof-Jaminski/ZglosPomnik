import React from 'react';
import { Leaf, MapPin, X, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';

interface TreeInfoPopupProps {
  tree: Tree;
  onClose: () => void;
  onReportHere?: () => void;
}

export const TreeInfoPopup: React.FC<TreeInfoPopupProps> = ({
  tree,
  onClose,
  onReportHere
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'pending': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Zatwierdzony';
      case 'rejected': return 'Odrzucony';
      case 'pending': return 'Oczekuje';
      default: return 'Nieznany';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {tree.commonName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Species */}
        <div className="mb-3 sm:mb-4">
          <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gatunek:
          </p>
          <p className="text-sm sm:text-base italic text-gray-600 dark:text-gray-400">
            {tree.species}
          </p>
        </div>

        {/* Notes */}
        {tree.notes && (
          <div className="mb-3 sm:mb-4">
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Opis:
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {tree.notes}
            </p>
          </div>
        )}

        {/* Photo */}
        {tree.photos.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <img
              src={tree.photos[0]}
              alt="Tree photo"
              className="w-full h-32 sm:h-42 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Location */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              Lokalizacja:
            </p>
          </div>
          <p className="text-sm sm:text-base font-mono text-gray-800 dark:text-gray-200">
            {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
          </p>
        </div>

        {/* Status and Details */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-5">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(tree.status)}`}>
            {getStatusText(tree.status)}
          </span>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(tree.reportedAt).toLocaleDateString('pl-PL')}</span>
          </div>
        </div>

        {/* Reporter */}
        <div className="flex items-center space-x-2 mb-3 sm:mb-5">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Zgłoszone przez: <span className="font-medium">{tree.reportedBy}</span>
          </span>
        </div>

        {/* Action Button */}
        {onReportHere && (
          <div className="flex space-x-2 sm:space-x-4">
            <GlassButton onClick={onClose} variant="secondary" size="xs" className="flex-1">
              Zamknij
            </GlassButton>
            <GlassButton onClick={onReportHere} variant="primary" size="xs" className="flex-1">
              Zgłoś tutaj
            </GlassButton>
          </div>
        )}
      </motion.div>
    </div>
  );
};
