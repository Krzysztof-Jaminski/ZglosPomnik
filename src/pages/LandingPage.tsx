import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { HeroSection } from '../components/Landing/HeroSection';
import { FeaturesSection } from '../components/Landing/FeaturesSection';
import { FAQSection } from '../components/Landing/FAQSection';
import { ContactSection } from '../components/Landing/ContactSection';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useSystemTheme } from '../hooks/useSystemTheme';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  // Używanie kontekstu autoryzacji
  const { login, register, isLoading } = useAuth();
  
  // Landing page always uses dark theme for system UI
  useSystemTheme('dark');

  // Preload background image
  useEffect(() => {
    // Add preload link to head for this specific page
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = '/background.png';
    preloadLink.as = 'image';
    document.head.appendChild(preloadLink);

    const img = new Image();
    img.onload = () => {
      setBackgroundLoaded(true);
    };
    img.onerror = () => {
      setBackgroundLoaded(true); // Still show page even if image fails to load
    };
    img.src = '/background.png';

    // Cleanup preload link when component unmounts
    return () => {
      const existingLink = document.querySelector('link[href="/background.png"]');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  // Sprawdź parametry URL dla logowania/rejestracji
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('auth') === 'login') {
      setAuthMode('login');
      setShowAuthModal(true);
    } else if (urlParams.get('auth') === 'register') {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  }, [location.search]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      await login(credentials);
      setShowAuthModal(false);
      navigate('/map');
    } catch (error: any) {
      setError(error.message || 'Błąd logowania');
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      setError(null);
      await register(userData);
      setShowAuthModal(false);
      navigate('/map');
    } catch (error: any) {
      setError(error.message || 'Błąd rejestracji');
    }
  };

  const closeModal = () => {
    setShowAuthModal(false);
    // Wyczyść parametry URL
    navigate('/', { replace: true });
  };

  // Pokaż loading podczas sprawdzania uwierzytelniania lub ładowania background
  if (isLoading || !backgroundLoaded) {
  return (
      <div id="app-layout" className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Ładowanie...</div>
          <div className="text-gray-400 text-sm">
            {isLoading ? 'Sprawdzanie danych logowania' : 'Ładowanie aplikacji'}
      </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-layout" className="min-h-screen relative">
      {/* Background Image with Enhanced Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/85 to-gray-900/95 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/background.png')`,
          }}
        ></div>
      </div>

      {/* Enhanced Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 py-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="ZgłośPomnik" 
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                <span className="text-blue-400">Zgłoś</span><span className="text-green-400">Pomnik</span>
              </span>
            </div>
            
            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={scrollToTop}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Funkcje
              </button>
              <button
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                FAQ
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Kontakt
              </button>
            </div>
            
            <div className="flex items-center gap-3">
                <DarkGlassButton
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  variant="primary"
                  size="sm"
                className="text-sm px-6 py-2"
                >
                  ZALOGUJ SIĘ
                </DarkGlassButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
      {/* Hero Section */}
      <HeroSection onShowAuthModal={(mode) => {
        setAuthMode(mode);
                    setShowAuthModal(true);
      }} />

      {/* Features Section */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <ContactSection />
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 bg-gray-900/95 backdrop-blur-md border-t border-gray-800/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="ZgłośPomnik" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  <span className="text-blue-400">Zgłoś</span><span className="text-green-400">Pomnik</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Platforma do ochrony pomników przyrody. Razem chronimy przyrodę dla przyszłych pokoleń.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white font-semibold mb-4">Szybkie linki</h3>
              <div className="space-y-2">
                <button
                  onClick={scrollToTop}
                  className="block text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Strona główna
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Funkcje
                </button>
                <button
                  onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  FAQ
                </button>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Kontakt
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white font-semibold mb-4">Kontakt</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">kontakt@zglospomnik.pl</p>
                <p className="text-gray-400">+48 123 456 789</p>
                <p className="text-gray-400">ul. Przyrodnicza 123</p>
                <p className="text-gray-400">00-001 Warszawa</p>
              </div>
            </div>
          </div>

           <div className="border-t border-gray-800/70 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2025 Aplikacja do zgłaszania pomników przyrody. Wszystkie prawa zastrzeżone.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <span className="text-gray-500 text-sm">Polityka prywatności</span>
                <span className="text-gray-500 text-sm">Regulamin</span>
                <span className="text-gray-500 text-sm">Cookies</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full border border-gray-700/50"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.png" 
                      alt="ZgłośPomnik" 
                      className="w-8 h-8"
                    />
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                  </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-700/50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl"
                  >
                    <p className="text-sm text-red-300">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-6">
                  {authMode === 'login' ? (
                    <LoginForm
                      onSubmit={handleLogin}
                      onSwitchToRegister={() => setAuthMode('register')}
                      onClose={closeModal}
                      isLoading={isLoading}
                    />
                  ) : (
                    <RegisterForm
                      onSubmit={handleRegister}
                      onSwitchToLogin={() => setAuthMode('login')}
                      onClose={closeModal}
                      isLoading={isLoading}
                    />
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