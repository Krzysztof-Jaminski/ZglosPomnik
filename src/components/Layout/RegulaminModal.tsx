import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DarkGlassButton } from '../UI/DarkGlassButton';

interface RegulaminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulaminModal: React.FC<RegulaminModalProps> = ({
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
                        Regulamin Użytkowania
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
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Zasady użytkowania platformy
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Korzystając z platformy ZgłośPomnik, użytkownik zobowiązuje się przestrzegać poniższych zasad.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Zakaz naruszania praw autorskich
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Zabronione jest dodawanie, publikowanie lub udostępnianie treści, które naruszają prawa autorskie lub prawa pokrewne. Użytkownik zobowiązuje się, że wszystkie treści przez niego dodane (w tym zdjęcia, teksty, grafiki) są jego własnością lub posiada odpowiednie uprawnienia do ich wykorzystania.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Zakaz naruszania prawa polskiego
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Zabronione jest dodawanie, publikowanie lub udostępnianie treści, które naruszają przepisy prawa polskiego, w tym przepisy dotyczące ochrony danych osobowych, prawa karnego, prawa cywilnego oraz innych obowiązujących przepisów.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Odpowiedzialność użytkownika
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Użytkownik ponosi pełną odpowiedzialność za treści dodane przez siebie na platformę. W przypadku naruszenia praw autorskich lub przepisów prawa, użytkownik ponosi wyłączną odpowiedzialność za swoje działania.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Odpowiedzialność platformy
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Platforma ZgłośPomnik jest otwartą platformą, która umożliwia użytkownikom dodawanie treści. Ze względu na otwarty charakter platformy, nie ponosimy odpowiedzialności za treści dodane przez użytkowników, które mogą naruszać prawa autorskie lub przepisy prawa polskiego. W przypadku zgłoszenia naruszenia, podejmiemy odpowiednie działania w celu usunięcia nielegalnych treści.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Zastrzeżenia
                      </h3>
                      <p className="text-xs leading-relaxed">
                        Administratorzy platformy zastrzegają sobie prawo do usunięcia treści naruszających regulamin bez wcześniejszego powiadomienia. W przypadku powtarzających się naruszeń, konto użytkownika może zostać zablokowane.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white mb-1.5">
                        Licencje zdjęć i obrazów
                      </h3>
                      <p className="text-xs leading-relaxed mb-2">
                        Przy dodawaniu zdjęć lub obrazów do aplikacji (w tym zdjęć drzew, obrazów roślin w encyklopedii gatunków itp.), użytkownik zobowiązuje się do podania odpowiednich informacji o licencji i autorze, jeśli zdjęcie nie jest jego własnością.
                      </p>
                      <p className="text-xs leading-relaxed mb-2">
                        Obrazy roślin mogą pochodzić z Wikimedia Commons (wymagają podania autora zgodnie z licencjami Creative Commons) lub być dodawane przez niezależnych użytkowników. Użytkownik dodający obrazy ponosi odpowiedzialność za przestrzeganie praw autorskich i podanie wymaganych informacji o licencji.
                      </p>
                      <p className="text-xs leading-relaxed">
                        <strong>W przypadku braku wymaganych informacji o licencji lub zgłoszenia naruszenia praw autorskich, zdjęcia lub obrazy zostaną natychmiast usunięte z aplikacji.</strong> Administratorzy zastrzegają sobie prawo do usunięcia treści bez wcześniejszego powiadomienia, jeśli zostanie stwierdzone naruszenie praw autorskich.
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

