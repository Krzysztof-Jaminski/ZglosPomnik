import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">
                    Potwierdź wylogowanie
                  </h3>
                  <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  Czy na pewno chcesz się wylogować?
                </p>
                <div className="flex space-x-2 sm:space-x-3">
                  <GlassButton
                    onClick={onCancel}
                    variant="secondary"
                    size="xs"
                    className="flex-1"
                  >
                    <span className="text-xs">Anuluj</span>
                  </GlassButton>
                  <GlassButton
                    onClick={onConfirm}
                    variant="danger"
                    size="xs"
                    className="flex-1"
                  >
                    <span className="text-xs">Wyloguj się</span>
                  </GlassButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
