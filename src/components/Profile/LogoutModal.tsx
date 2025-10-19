import React from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-md w-full"
      >
        <div className="relative rounded-xl p-1 shadow-lg" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
          padding: '2px'
        }}>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-white mb-3 font-semibold text-lg">
              Potwierdź wylogowanie
            </h3>
            <p className="text-gray-300 mb-4 text-base">
              Czy na pewno chcesz się wylogować?
            </p>
            <div className="flex space-x-3">
              <GlassButton
                onClick={onCancel}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <span className="text-sm">Anuluj</span>
              </GlassButton>
              <GlassButton
                onClick={onConfirm}
                variant="danger"
                size="sm"
                className="flex-1"
              >
                <span className="text-xs">Wyloguj się</span>
              </GlassButton>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
