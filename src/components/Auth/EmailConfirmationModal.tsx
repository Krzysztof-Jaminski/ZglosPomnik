import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';

interface EmailConfirmationModalProps {
  showEmailConfirmation: boolean;
  onClose: () => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  showEmailConfirmation,
  onClose
}) => {
  return (
    <AnimatePresence>
      {showEmailConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-md w-full"
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-900 rounded-lg">
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">📧</div>
                  <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    Sprawdź swoją skrzynkę!
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Wysłaliśmy Ci maila z linkiem potwierdzającym. 
                    Kliknij w link, aby aktywować konto i rozpocząć korzystanie z aplikacji.
                  </p>
                  <div className="space-y-3">
                    <DarkGlassButton
                      onClick={onClose}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Rozumiem
                    </DarkGlassButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
