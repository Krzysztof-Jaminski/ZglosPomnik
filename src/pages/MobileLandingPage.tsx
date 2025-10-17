import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useSystemTheme } from '../hooks/useSystemTheme';

export const MobileLandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  // Ref do przechowania stanu modala podczas błędów
  const showAuthModalRef = useRef(false);
  
  const { login, register } = useAuth();
  useSystemTheme('dark');

  // Debug: monitoruj zmiany w showAuthModal
  useEffect(() => {
    console.log('MobileLandingPage: showAuthModal changed to:', showAuthModal);
    showAuthModalRef.current = showAuthModal;
  }, [showAuthModal]);

  // Debug: monitoruj zmiany w error
  useEffect(() => {
    console.log('MobileLandingPage: error changed to:', error);
  }, [error]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      console.log('MobileLandingPage: Starting login, showAuthModal:', showAuthModal);
      setError(null);
      await login(credentials);
      console.log('MobileLandingPage: Login successful, closing modal');
      setShowAuthModal(false);
      navigate('/map');
    } catch (error: any) {
      console.log('MobileLandingPage: Login failed, setting error');
      console.log('MobileLandingPage: showAuthModal should still be true:', showAuthModal);
      console.log('MobileLandingPage: showAuthModalRef.current:', showAuthModalRef.current);
      
      // Opóźnij ustawienie błędu żeby zobaczyć czy to pomoże
      setTimeout(() => {
        console.log('MobileLandingPage: Setting error after timeout');
        setError('Sprawdź dane logowania'); // Ogólny komunikat dla bezpieczeństwa
        console.log('MobileLandingPage: Error set after timeout');
        
        // Upewnij się, że modal pozostaje otwarty
        if (!showAuthModalRef.current) {
          console.log('MobileLandingPage: Modal was closed, reopening it');
          setShowAuthModal(true);
        }
      }, 100);
      
      // Nie rzucamy błędu - Error Boundary by złapało i zresetowało komponent
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      setError(null);
      await register(userData);
      setShowAuthModal(false);
      setShowEmailConfirmation(true);
    } catch (error: any) {
      setError('Sprawdź dane rejestracji'); // Ogólny komunikat dla bezpieczeństwa
    }
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const closeEmailConfirmation = () => {
    setShowEmailConfirmation(false);
  };

  // Usunięto pełnoekranowy loading - teraz loading jest tylko w formularzu

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 pt-16">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="ZgłośPomnik Logo" 
            className="w-28 h-28 mx-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
          <span className="text-blue-600 dark:text-blue-500">Zgłoś</span>
          <span className="text-green-600 dark:text-green-400">Pomnik</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-300 text-center max-w-sm">
          Najłatwiejszy sposób na zgłaszanie i ochronę pomników przyrody
        </p>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="px-6 pb-8">
        <div className="w-full max-w-sm space-y-3 mx-auto">
          <DarkGlassButton
            onClick={() => {
              setError(null); // Wyczyść błąd przy otwieraniu
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            variant="primary"
            size="md"
            className="w-full px-4 py-3 text-sm font-semibold"
          >
            Zaloguj się
          </DarkGlassButton>
          
          <DarkGlassButton
            onClick={() => {
              setError(null); // Wyczyść błąd przy otwieraniu
              setAuthMode('register');
              setShowAuthModal(true);
            }}
            variant="secondary"
            size="md"
            className="w-full px-4 py-3 text-sm font-semibold"
          >
            Zarejestruj się
          </DarkGlassButton>
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
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
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src="/logo.png" 
                          alt="ZgłośPomnik" 
                          className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                        <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                          <span className="text-blue-600 dark:text-blue-500">Zgłoś</span><span className="text-green-600 dark:text-green-400">Pomnik</span>
                        </h2>
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-green-400 hover:text-green-300 transition-colors duration-200 p-2 hover:bg-green-900/30 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>


                    <div className="space-y-4">
                      {authMode === 'login' ? (
                        <LoginForm
                          onSubmit={handleLogin}
                          onSwitchToRegister={() => setAuthMode('register')}
                          onClose={closeModal}
                          error={error}
                        />
                      ) : (
                        <RegisterForm
                          onSubmit={handleRegister}
                          onSwitchToLogin={() => setAuthMode('login')}
                          onClose={closeModal}
                          error={error}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Confirmation Modal */}
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
                        onClick={closeEmailConfirmation}
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
    </div>
  );
};
