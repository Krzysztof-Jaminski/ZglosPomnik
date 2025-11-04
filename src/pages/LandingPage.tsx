import { useState, useEffect, useMemo, useRef } from 'react';
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
  'Screenshot_2025-11-04-11-05-32-577_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-05-50-628_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-06-18-589_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-06-33-944_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-08-13-624_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-08-39-588_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-09-21-489_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-09-47-314_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-11-53-978_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-11-57-043_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-12-56-551_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-14-05-829_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-15-47-188_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-17-35-963_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-18-16-333_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-18-25-131_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-18-56-407_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-25-52-966_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-13-10-01-091_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-31-32-948_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-31-54-113_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-31-57-588_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-36-50-000_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-36-51-000_com.zglospomnik.app.jpg',

  'Screenshot_2025-11-04-11-33-20-268_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-33-28-225_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-33-37-646_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-13-31-01-905_com.zglospomnik.app.jpg',

  'Screenshot_2025-11-04-13-34-57-130_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-33-07-223_com.zglospomnik.app.jpg',

  'Screenshot_2025-11-04-11-33-47-267_com.zglospomnik.app.jpg',
  'Screenshot_2025-11-04-11-33-57-842_com.zglospomnik.app.jpg',
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
  // Check if mobile immediately (SSR safe) - must be the FIRST hook
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  
  // All hooks must be called consistently, even if we return early
  // This ensures the same number of hooks are called every render
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRodoModal, setShowRodoModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { login, register, resendEmailVerification, isLoading } = useAuth();
  useSystemTheme('dark');
  
  // Early return for mobile - AFTER all hooks are called
  if (isMobile) {
    return <MobileLandingPage />;
  }

  // Parse screenshots without sorting - use them in the order they appear in SCREENSHOTS array
  const parsedScreenshots = useMemo(() => {
    return SCREENSHOTS.map(parseScreenshotFilename);
  }, []);

  // Divide screenshots into sections
  const sections = useMemo(() => {
    const screenshots = parsedScreenshots;
    let index = 0;
    
    const createSection = (title: string, description: string, count: number) => {
      const sectionScreenshots = screenshots.slice(index, index + count);
      index += count;
      return { title, description, screenshots: sectionScreenshots };
    };
    
     const sectionsArray = [
       createSection('Logowanie i rejestracja', 'Bezpieczny system autoryzacji z weryfikacją emailową oraz obsługą kont użytkowników i organizacji', 4),
       createSection('Mapa drzew', 'Interaktywna mapa z wizualizacją lokalizacji drzew, filtrowaniem oraz szczegółowymi informacjami o każdym zgłoszeniu', 4),
       createSection('Zgłaszanie drzew', 'Kompleksowy formularz umożliwiający dodanie szczegółowych informacji o drzewie wraz z dokumentacją fotograficzną', 8),
       createSection('Generowanie wniosków', 'Automatyczne tworzenie profesjonalnych wniosków PDF o uznanie drzewa za pomnik przyrody z pełną dokumentacją', 8),
       createSection('Encyklopedia gatunków', 'Baza wiedzy o gatunkach drzew z możliwością rozszerzania przez moderatorów', 4),
       createSection('Feed społecznościowy i profil', 'Przeglądanie i interakcja ze zgłoszeniami innych użytkowników platformy oraz panel zarządzania danymi osobowymi, organizacyjnymi i statystykami aktywności', 8),
       createSection('Panel moderatora', 'Narzędzia administracyjne do zarządzania użytkownikami, weryfikacji zgłoszeń i zarządzania bazą gatunków', 4),
       createSection('Dodatkowe funkcje', 'Personalizacja ustawień, tryb ciemny, integracja z systemami mapowymi oraz wsparcie dla aplikacji mobilnych', 8),
     ];
    
    // Add remaining screenshots to the last section (Podziękowania)
    const remainingScreenshots = screenshots.slice(index);
    if (remainingScreenshots.length > 0) {
      sectionsArray.push({
        title: 'Podziękowania',
        description: 'Dziękujemy za uwagę! Aplikacja nie wymaga instalacji - otwórz tę stronę na telefonie i zacznij korzystać już teraz',
        screenshots: remainingScreenshots
      });
    }
    
    return sectionsArray.filter(section => section.screenshots.length > 0);
  }, [parsedScreenshots]);

  // Check if mobile on resize - reload page when switching between mobile/desktop
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    const currentIsMobile = isMobile; // Capture current value
    
    const checkMobile = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth < 1024;
        if (newIsMobile !== currentIsMobile) {
          // Reload page when switching between mobile and desktop
          window.location.reload();
        }
      }, 150); // Small delay to avoid too many reloads during resize
    };
    
    // Always set up listener - React needs consistent hook structure
    window.addEventListener('resize', checkMobile);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

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
    let lastScrollY = 0;
    
    const handleScroll = () => {
      // In fullscreen mode, get scroll from container, otherwise from window
      const currentScrollY = isFullscreen && scrollContainerRef.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };

    // In fullscreen mode, listen to scroll on the container, otherwise on window
    const scrollTarget = isFullscreen && scrollContainerRef.current
      ? scrollContainerRef.current
      : window;
    
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (scrollTarget instanceof Window) {
        scrollTarget.removeEventListener('scroll', handleScroll);
      } else {
        scrollTarget?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isFullscreen]);

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

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Usunięto pełnoekranowy loading - teraz loading jest tylko w formularzu

  return (
    <div 
      ref={scrollContainerRef}
      className={`dark min-h-screen bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-[9999] overflow-y-auto' : ''}`}
    >
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
          <div 
            className="flex items-center justify-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Wyłącz tryb pełnoekranowy" : "Włącz tryb pełnoekranowy"}
          >
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
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-center">
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
           <div className="space-y-20">
             <div className="text-center mb-16">
               <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                 Prezentacja funkcjonalności
               </h2>
               <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                 Przegląd głównych modułów i możliwości platformy
               </p>
             </div>
             
             {sections.map((section, sectionIndex) => (
               <div key={sectionIndex} className="space-y-6">
                 <div className="text-center">
                   <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                     {section.title}
                   </h3>
                   <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                     {section.description}
                   </p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {section.screenshots.map((screenshot, index) => (
                    <div key={screenshot.filename} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur-md opacity-35 group-hover:opacity-50 transition-opacity"></div>
                      <img 
                        src={screenshot.path} 
                        alt={`Screenshot ${section.title} ${index + 1}`}
                        className="relative w-full h-auto rounded-3xl shadow-xl object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
                {sectionIndex < sections.length - 1 && (
                  <div className="border-t border-gray-700 pt-16 mt-16"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-32 px-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <img src="/logo.png" alt="ZgłośPomnik Logo" className="w-32 h-32 mx-auto mb-6" />
            <h2 className="text-4xl lg:text-6xl font-bold mb-4" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
              <span className="text-blue-600 dark:text-blue-500">Zgłoś</span>
              <span className="text-green-600 dark:text-green-400">Pomnik</span>
            </h2>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-4 leading-relaxed max-w-3xl mx-auto">
              Możesz przetestować aplikację na telefonie, wchodząc na stronę <span className="text-white font-semibold">www.zglospomnik.pl</span>, rejestrując się lub korzystając z konta testowego: <span className="text-white font-semibold">user@example.com</span> / <span className="text-white font-semibold">haslo</span>
            </p>
            <p className="text-lg text-gray-300 mb-2 leading-relaxed max-w-3xl mx-auto">
              Dziękujemy za dotarcie tutaj. Liczymy na wsparcie w rozwoju aplikacji.
            </p>
            <p className="text-sm text-gray-400 mt-6 leading-relaxed max-w-3xl mx-auto">
              Technologie: React, TypeScript, Tailwind CSS, .NET C#, SQL, Leaflet, Docker, Vercel
            </p>
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