import { useState } from 'react';
import { Trees, Home, Info, HelpCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import PhoneMockup from '../components/Landing/PhoneMockup';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'menu'>('menu');

  const handleContinueWithoutLogin = () => {
    navigate('/map');
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/background.png')`,
          }}
        ></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative z-40 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trees className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-white">ZgłośPomnik</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="hidden lg:flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-green-400">HOME</a>
                <a href="#" className="text-gray-400 hover:text-green-400">O NAS</a>
                <a href="#" className="text-gray-400 hover:text-green-400">POMOC</a>
                <a href="#" className="text-gray-400 hover:text-green-400">KONTAKT</a>
              </div>
              <div className="flex items-center gap-2">
                <DarkGlassButton
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  variant="secondary"
                  size="xs"
                  className="text-xs px-3"
                >
                  ZALOGUJ
                </DarkGlassButton>
                <DarkGlassButton
                  onClick={handleContinueWithoutLogin}
                  variant="primary"
                  size="xs"
                  className="text-xs px-3"
                >
                  ROZPOCZNIJ
                </DarkGlassButton>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 px-4">
            {/* Left side - Phone Mockup */}
            <div className="relative flex items-center justify-center mt-8 lg:mt-0">
              <PhoneMockup />
            </div>

            {/* Right side - Content */}
            <div className="flex flex-col justify-center max-w-lg mx-auto lg:mx-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-green-400 mb-8">
                ZGŁOŚ SWÓJ POMNIK
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                  <Home className="w-5 h-5 text-green-400 mb-2" />
                  <h3 className="text-white text-sm font-medium mb-2">Szybkie zgłoszenia</h3>
                  <p className="text-gray-400 text-xs">
                    Zgłoś pomnik przyrody w kilku prostych krokach
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                  <Info className="w-5 h-5 text-green-400 mb-2" />
                  <h3 className="text-white text-sm font-medium mb-2">Monitorowanie</h3>
                  <p className="text-gray-400 text-xs">
                    Śledź status swoich zgłoszeń na bieżąco
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                  <HelpCircle className="w-5 h-5 text-green-400 mb-2" />
                  <h3 className="text-white text-sm font-medium mb-2">Pomoc eksperta</h3>
                  <p className="text-gray-400 text-xs">
                    Wsparcie w wypełnianiu wniosków
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                  <Mail className="w-5 h-5 text-green-400 mb-2" />
                  <h3 className="text-white text-sm font-medium mb-2">Powiadomienia</h3>
                  <p className="text-gray-400 text-xs">
                    Otrzymuj aktualizacje o statusie
                  </p>
                </div>
              </div>

              <DarkGlassButton
                onClick={handleContinueWithoutLogin}
                variant="primary"
                size="lg"
                className="text-base"
              >
                ROZPOCZNIJ TERAZ
              </DarkGlassButton>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Minimal */}
        <div className="bg-gray-900/80 backdrop-blur-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center text-xs text-gray-500">
              © 2024 ZgłośPomnik
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                  </h2>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {authMode === 'login' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          placeholder="twoj@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hasło
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          placeholder="••••••••"
                        />
                      </div>
                      <DarkGlassButton
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        Zaloguj się
                      </DarkGlassButton>
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Nie masz konta?{' '}
                        <button
                          onClick={() => setAuthMode('register')}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                        >
                          Zarejestruj się
                        </button>
                      </p>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          placeholder="twoj@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hasło
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Powtórz hasło
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                          placeholder="••••••••"
                        />
                      </div>
                      <DarkGlassButton
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        Zarejestruj się
                      </DarkGlassButton>
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Masz już konto?{' '}
                        <button
                          onClick={() => setAuthMode('login')}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                        >
                          Zaloguj się
                        </button>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};