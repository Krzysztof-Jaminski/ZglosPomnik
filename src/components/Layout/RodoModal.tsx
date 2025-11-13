import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DarkGlassButton } from '../UI/DarkGlassButton';

interface RodoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RodoModal: React.FC<RodoModalProps> = ({
  isOpen,
  onClose
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-3xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-xl p-1 shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              padding: '2px'
            }}>
              <div className="bg-gray-900 rounded-lg">
                <div className="p-4 max-h-[85vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/logo.png" 
                        alt="ZgłośPomnik" 
                        className="w-10 h-10"
                      />
                      <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Polityka Prywatności
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 text-gray-300">
                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                      <h3 className="text-base font-semibold text-yellow-400 mb-2">
                        ⚠️ Wersja testowa
                      </h3>
                      <p className="text-xs leading-relaxed text-yellow-200/90">
                        Aplikacja jest w wersji testowej. Zespół dokłada starań, ale jako nowa aplikacja nie możemy jeszcze w pełni zagwarantować stabilności. Może dojść do awarii, błędów czy problemów z dostępnością danych. Nie ponosimy odpowiedzialności za utratę lub uszkodzenie danych. Korzystasz na własną odpowiedzialność.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Przetwarzanie danych
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Zgadzasz się na przetwarzanie danych osobowych w celu tworzenia wniosków o pomniki przyrody i zarządzania zgłoszeniami.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Dane publiczne
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Imię i nazwisko będą publicznie dostępne wraz ze zgłoszonymi drzewami. Pozostałe dane (e-mail, telefon) nie są publiczne.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Twoje prawa (RODO)
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Masz prawo do dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania danych. Aby skorzystać z tych praw, skontaktuj się z nami poprzez email: <a href="mailto:3andflora@gmail.com" className="text-green-400 hover:text-green-300 underline">3andflora@gmail.com</a>.
                      </p>
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="mt-8 flex justify-end">
                    <DarkGlassButton
                      onClick={onClose}
                      variant="primary"
                      size="md"
                      className="px-6 py-2"
                    >
                      Zamknij
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

