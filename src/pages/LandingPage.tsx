import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { useSystemTheme } from '../hooks/useSystemTheme';
import { MobileLandingPage } from './MobileLandingPage';
import { AuthModal } from '../components/Auth/AuthModal';
import { EmailConfirmationModal } from '../components/Auth/EmailConfirmationModal';

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

      {/* Mapa Interaktywna Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Image */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="Mapa Interaktywna Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
              </div>
            </div>
            
            {/* Right - Text Content */}
            <div className="space-y-6 order-1 lg:order-2 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Mapa Interaktywna
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Wyświetlanie wszystkich zatwierdzonych drzew na mapie Google Maps z możliwością filtrowania według gatunku, regionu i statusu. Geolokalizacja użytkownika i szczegółowe informacje o każdym drzewie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Zgłaszanie Drzew Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6 order-2 lg:order-1 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Zgłaszanie Drzew
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Formularz zgłoszeniowy z walidacją umożliwiający dodanie do 5 zdjęć i automatyczne pobieranie lokalizacji GPS. Szczegółowe dane obejmują gatunek, wymiary, opis oraz legendy.
              </p>
            </div>
            
            {/* Right - Image */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="Zgłaszanie Drzew Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Encyklopedia Gatunków Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6 order-2 lg:order-1 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Encyklopedia Gatunków
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Baza wiedzy o polskich gatunkach drzew z nazwami polskimi i łacińskimi oraz przewodnikiem identyfikacyjnym. Opisy zmian sezonowych i charakterystyczne cechy każdego gatunku.
              </p>
            </div>
            
            {/* Right - Image */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="Encyklopedia Gatunków Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aktualności Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Image */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="Aktualności Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
              </div>
            </div>
            
            {/* Right - Text Content */}
            <div className="space-y-6 order-1 lg:order-2 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Aktualności
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Chronologiczny strumień zatwierdzonych zgłoszeń z systemem głosowania i możliwością przeglądania opisów. Filtry i wyszukiwarka oraz społecznościowe dzielenie się odkryciami natury.
              </p>
            </div>
          </div>
              </div>
      </section>

      {/* Generator Zgłoszeń Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6 order-2 lg:order-1 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Generator Zgłoszeń
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Automatyczne dostosowywanie wniosku do formularza gmin z wsparciem AI i automatycznym generowaniem załączników. System wypełnia pola użytkownika i dostarcza instrukcje wysyłki przez epulap.
              </p>
            </div>
            
            {/* Right - Image */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="Generator Zgłoszeń Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Zwiększona */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Image */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="ZgłośPomnik Application Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
              </div>
            </div>
            
            {/* Right - Text Content */}
            <div className="space-y-6 order-1 lg:order-2 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Zgłaszanie. Uproszczone.
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                ZgłośPomnik prowadzi Cię krok po kroku przez proces zgłaszania drzew i priorytetyzuje to, co najważniejsze dla ochrony przyrody. Intuicyjny interfejs dla każdego użytkownika.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            {/* Text Content Only */}
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Monitoring dostosowany do Ciebie
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                ZgłośPomnik identyfikuje zagrożenia w Twojej okolicy i pomaga Ci je szybko rozwiązać!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left - Report Image */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-sm opacity-75"></div>
                <img 
                  src="/LandPagePhotos/image2.png" 
                  alt="ZgłośPomnik Report Screenshot" 
                  className="relative max-w-sm max-h-md w-full h-auto rounded-3xl"
                />
            </div>
          </div>
          
            {/* Right - Text Content */}
            <div className="space-y-6 order-1 lg:order-2 text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif', lineHeight: '1.6' }}>
                Śledź swój postęp
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Zobacz statystyki zgłoszeń dla każdego gatunku drzew, aby zidentyfikować luki w ochronie i śledzić postęp w czasie rzeczywistym.
              </p>
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