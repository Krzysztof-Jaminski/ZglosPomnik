import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { HeroSection } from '../components/Landing/HeroSection';
import { FeaturesSection } from '../components/Landing/FeaturesSection';
import { FAQSection } from '../components/Landing/FAQSection';
import { GuidesSection } from '../components/Landing/GuidesSection';
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

  // Pusta tablica dependencies

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
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/background.png')`,
          }}
        ></div>
      </div>

      {/* Top Navigation - Fixed */}
      <nav className="fixed top-0 left-0 right-0 z-40 py-2 sm:py-3 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/logo.png" 
                alt="ZgłośPomnik" 
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <span className="text-lg sm:text-2xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                <span className="text-blue-400">Zgłoś</span><span className="text-green-400">Pomnik</span>
              </span>
            </div>
            
            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-3">
              <DarkGlassButton
                onClick={scrollToTop}
                variant="secondary"
                size="sm"
                className="text-xs px-3 py-1"
              >
                Home
              </DarkGlassButton>
              <DarkGlassButton
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary"
                size="sm"
                className="text-xs px-3 py-1"
              >
                Funkcje
              </DarkGlassButton>
              <DarkGlassButton
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary"
                size="sm"
                className="text-xs px-3 py-1"
              >
                FAQ
              </DarkGlassButton>
              <DarkGlassButton
                onClick={() => document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary"
                size="sm"
                className="text-xs px-3 py-1"
              >
                Poradniki
              </DarkGlassButton>
              <DarkGlassButton
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary"
                size="sm"
                className="text-xs px-3 py-1"
              >
                Kontakt
              </DarkGlassButton>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DarkGlassButton
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  variant="primary"
                  size="sm"
                  className="text-xs sm:text-sm w-fit px-4 py-2"
                >
                  ZALOGUJ SIĘ
                </DarkGlassButton>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onShowAuthModal={(mode) => {
        setAuthMode(mode);
                    setShowAuthModal(true);
      }} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Spacing between sections */}
      <div className="h-24"></div>

      {/* FAQ Section */}
      <FAQSection />

      {/* Guides Section */}
      <GuidesSection onShowAuthModal={(mode) => {
        setAuthMode(mode);
                    setShowAuthModal(true);
      }} />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-gray-500">
            <p className="text-xs sm:text-sm">© 2025 Aplikacja do zgłaszania pomników przyrody. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
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