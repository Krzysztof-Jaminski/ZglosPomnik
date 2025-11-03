import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { useSystemTheme } from '../hooks/useSystemTheme';
import { MobileLandingPage } from './MobileLandingPage';
import { AuthModal } from '../components/Auth/AuthModal';
import { EmailConfirmationModal } from '../components/Auth/EmailConfirmationModal';
import { RodoModal } from '../components/Layout/RodoModal';

interface ScreenshotInfo {
  filename: string;
  path: string;
  date: Date;
  description: string;
}

const SCREENSHOTS = [
  'Screenshot_2025-11-03-21-59-44-420_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-00-08-672_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-00-53-147_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-01-31-450_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-55-28-478_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-55-54-683_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-56-11-207_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-56-21-356_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-56-46-969_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-57-07-364_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-57-14-244_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-22-57-29-565_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-05-59-436_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-06-20-996_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-06-50-670_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-07-23-762_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-08-02-793_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-08-21-147_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-12-53-327_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-12-57-829_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-14-58-007_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-15-08-413_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-15-17-066_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-15-31-050_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-16-48-486_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-16-56-575_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-17-02-871_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-17-09-593_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-17-27-873_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-18-28-465_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-18-51-771_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-19-09-798_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-21-29-832_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-21-43-477_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-21-55-558_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-21-59-170_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-22-28-401_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-22-36-112_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-22-51-501_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-22-59-060_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-23-04-968_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-23-12-689_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-23-31-852_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-23-48-037_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-24-10-934_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-24-21-887_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-24-35-165_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-25-03-662_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-25-24-336_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-25-44-675_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-25-53-314_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-23-26-10-157_com.zglospomnik.app.jpg',
];

const parseScreenshotFilename = (filename: string): ScreenshotInfo => {
  const match = filename.match(/Screenshot_(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d+)_com\.zglospomnik\.app\.jpg/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
    const description = `${day}.${month}.${year} ${hour}:${minute}`;
    return {
      filename,
      path: `/LandPagePhotos/LandPagePhotos/Screenshoots/${filename}`,
      date,
      description,
    };
  }
  return {
    filename,
    path: `/LandPagePhotos/LandPagePhotos/Screenshoots/${filename}`,
    date: new Date(0),
    description: filename,
  };
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRodoModal, setShowRodoModal] = useState(false);
  // Check if mobile immediately (SSR safe)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  
  const { login, register, resendEmailVerification, isLoading } = useAuth();
  useSystemTheme('dark');

  const sortedScreenshots = useMemo(() => {
    return SCREENSHOTS.map(parseScreenshotFilename)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Handle scroll to hide/show topbar
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show mobile landing page for mobile devices
  if (isMobile) {
    return <MobileLandingPage />;
  }

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      await login(credentials);
      setShowAuthModal(false);
      navigate('/map');
    } catch (error: any) {
      setError('Sprawdź dane logowania'); // Ogólny komunikat dla bezpieczeństwa
      // Nie rzucamy błędu - Error Boundary by złapało i zresetowało komponent
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      console.log('LandingPage: Starting registration...');
      setError(null);
      const response = await register(userData);
      console.log('LandingPage: Registration response:', response);
      
      // Check if email verification is required
      if (response && response.requiresEmailVerification) {
        console.log('LandingPage: Email verification required, showing modal');
        console.log('LandingPage: Current showEmailConfirmation:', showEmailConfirmation);
        setUserEmail(userData.email); // Save user email for resend functionality
        
        // Use setTimeout to ensure state updates happen after current render
        setTimeout(() => {
          console.log('LandingPage: Setting showAuthModal to false');
          setShowAuthModal(false);
          console.log('LandingPage: Setting showEmailConfirmation to true');
          setShowEmailConfirmation(true);
          console.log('LandingPage: State updates queued');
        }, 0);
        
        console.log('LandingPage: Modal should be shown now');
      } else {
        console.log('LandingPage: Normal registration, redirecting to map');
        // Normal registration - redirect to map (this should rarely happen)
        setShowAuthModal(false);
        navigate('/map');
      }
    } catch (error: any) {
      console.error('LandingPage: Registration error:', error);
      setError('Sprawdź dane rejestracji'); // Ogólny komunikat dla bezpieczeństwa
    }
  };

  const closeModal = () => {
    setShowAuthModal(false);
    navigate('/', { replace: true });
  };

  const closeEmailConfirmation = () => {
    setShowEmailConfirmation(false);
  };

  // Usunięto pełnoekranowy loading - teraz loading jest tylko w formularzu

  return (
    <div className="dark min-h-screen bg-gray-900 text-white">
      {/* Topbar - znika przy scrollowaniu */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-800"
        style={{
          background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.7))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-18 h-18" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              <span className="text-blue-600 dark:text-blue-500">Zgłoś</span>
              <span className="text-green-600 dark:text-green-400">Pomnik</span>
              </h1>
          </div>
        </div>
      </motion.div>

      {/* Hero Section - telefon na środku z tłem lasu */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-6 pt-16">
        {/* Tło lasu z przyciemnionym filtrem */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/forest1.png" 
            alt="Forest background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
            </div>
            
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 items-center w-full pt-0 lg:pt-0">
          {/* Mobile: Phone first */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end lg:mr-4">
            <img 
              src="/LandPagePhotos/image.png" 
              alt="ZgłośPomnik App Screenshot" 
               className="max-w-sm max-h-md w-full h-auto rounded-3xl mx-auto"
            />
            </div>

          {/* Mobile: Buttons second */}
          <div className="order-2 lg:order-4 flex justify-center lg:hidden mb-2">
            <div className="flex flex-row gap-3">
            <DarkGlassButton
              onClick={() => {
                setError(null); // Wyczyść błąd przy otwieraniu
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              variant="primary"
              size="md"
                className="px-4 py-2 text-sm font-semibold"
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
                  className="px-4 py-2 text-sm font-semibold"
                >
                  Zarejestruj się
            </DarkGlassButton>
          </div>
        </div>

          {/* Mobile: Text third, Desktop: Text first */}
          <div className="space-y-2 order-3 lg:order-1 text-center lg:text-left lg:ml-12 lg:pr-0">
            {/* Desktop: Full content */}
            <div className="hidden lg:block space-y-4">
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.4' }}>
                Chroń drzewa przed wycinką.
                <br />
                Zgłaszaj pomniki przyrody.
                <br />
                Szybko i skutecznie.
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed max-w-5xl">
                ZgłośPomnik to platforma, która umożliwia Ci wygodne zgłaszanie drzew w Twojej okolicy oraz generowanie profesjonalnych wniosków o ochronę.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed max-w-5xl">
                Aby korzystać z platformy, otwórz tę stronę na urządzeniu mobilnym lub pobierz dedykowaną aplikację dostępną na Android i iOS.
              </p>
            </div>

            {/* Mobile: Text only (no title) */}
            <div className="lg:hidden space-y-2">
              <p className="text-base text-gray-300 leading-relaxed">
                ZgłośPomnik to platforma, która umożliwia Ci wygodne zgłaszanie drzew w Twojej okolicy oraz generowanie profesjonalnych wniosków o ochronę.
              </p>
              <p className="text-base text-gray-300 leading-relaxed">
                Aby korzystać z platformy, otwórz tę stronę na urządzeniu mobilnym lub pobierz dedykowaną aplikację dostępną na Android i iOS.
              </p>
            </div>

            {/* Desktop: Mobile app buttons */}
            <div className="hidden lg:flex flex-row gap-3 mt-8">
            <DarkGlassButton
                onClick={() => {}}
              variant="primary"
              size="md"
              className="px-4 py-2 text-sm font-semibold"
            >
                Pobierz na Android
            </DarkGlassButton>
              
              <DarkGlassButton
                onClick={() => {}}
                variant="secondary"
                size="md"
                className="px-4 py-2 text-sm font-semibold"
              >
                Pobierz na iOS
              </DarkGlassButton>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Gallery Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Zobacz aplikację w akcji
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Przejrzyj screenshoty pokazujące funkcjonalności ZgłośPomnik od najstarszych do najnowszych wersji
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedScreenshots.map((screenshot, index) => (
                <div key={screenshot.filename} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur-md opacity-35 group-hover:opacity-50 transition-opacity"></div>
                  <img 
                    src={screenshot.path} 
                    alt={`Screenshot ${index + 1}`}
                    className="relative w-full h-auto rounded-3xl shadow-xl object-cover transition-transform group-hover:scale-105"
                />
            </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        showAuthModal={showAuthModal}
        authMode={authMode}
        error={error}
        isLoading={isLoading}
                          onClose={closeModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
                          onSwitchToLogin={() => setAuthMode('login')}
        onSwitchToRegister={() => setAuthMode('register')}
      />

      <EmailConfirmationModal
        showEmailConfirmation={showEmailConfirmation}
        email={userEmail}
        onClose={closeEmailConfirmation}
        onResendEmail={resendEmailVerification}
      />

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-12" />
                <h3 className="text-2xl font-bold" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  <span className="text-blue-600 dark:text-blue-500">Zgłoś</span>
                  <span className="text-green-600 dark:text-green-400">Pomnik</span>
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Platforma do zgłaszania i ochrony pomników przyrody. Chronimy polskie drzewa razem.
              </p>
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} ZgłośPomnik. Wszelkie prawa zastrzeżone.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Szybkie linki</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    O platformie
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Jak działa
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Informacje prawne</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowRodoModal(true)}
                    className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                  >
                    Polityka prywatności / RODO
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Regulamin
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <RodoModal
        isOpen={showRodoModal}
        onClose={() => setShowRodoModal(false)}
      />

    </div>
  );
};