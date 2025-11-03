import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { useSystemTheme } from '../hooks/useSystemTheme';
import { MobileLandingPage } from './MobileLandingPage';
import { AuthModal } from '../components/Auth/AuthModal';
import { EmailConfirmationModal } from '../components/Auth/EmailConfirmationModal';

interface ScreenshotInfo {
  filename: string;
  path: string;
  date: Date;
  description: string;
}

const SCREENSHOTS = [
  'Screenshot_2025-11-03-16-46-56-384_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-47-18-329_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-47-43-143_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-47-55-744_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-48-57-130_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-49-23-988_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-49-36-999_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-49-46-185_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-50-23-654_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-50-52-632_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-51-05-229_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-51-32-935_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-51-57-772_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-52-10-663_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-52-38-614_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-53-03-740_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-53-15-961_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-54-22-596_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-54-26-157_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-55-05-084_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-55-15-639_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-55-25-277_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-56-43-929_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-57-05-433_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-57-37-372_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-57-43-687_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-57-54-651_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-58-29-802_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-16-58-34-323_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-02-18-654_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-02-49-435_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-03-21-631_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-03-26-076_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-03-30-833_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-03-55-488_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-04-05-028_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-04-08-702_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-04-34-800_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-04-38-737_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-03-17-04-49-405_com.zglospomnik.app.jpg',
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
                Aplikacja jest przeznaczona dla nowych ekologów, profesjonalistów, hobbystów jak i fundacji ekologicznych!
              </p>
            </div>

            {/* Mobile: Text only (no title) */}
            <div className="lg:hidden space-y-2">
              <p className="text-base text-gray-300 leading-relaxed">
                ZgłośPomnik to platforma, która umożliwia Ci wygodne zgłaszanie drzew w Twojej okolicy oraz generowanie profesjonalnych wniosków o ochronę.
              </p>
              <p className="text-base text-gray-300 leading-relaxed">
                Aplikacja jest przeznaczona dla nowych ekologów, profesjonalistów, hobbystów jak i fundacji ekologicznych!
              </p>
            </div>

            {/* Desktop: Auth Buttons */}
            <div className="hidden lg:flex flex-row gap-3 mt-8">
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

    </div>
  );
};