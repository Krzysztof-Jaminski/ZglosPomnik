import { useState, useEffect } from 'react';
import { Info, MapPin, FileText, Users, BarChart3, Settings, Shield, Zap, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useSystemTheme } from '../hooks/useSystemTheme';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  // Używanie kontekstu autoryzacji
  const { login, register, isAuthenticated, isLoading } = useAuth();
  
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
      if (document.head.contains(preloadLink)) {
        document.head.removeChild(preloadLink);
      }
    };
  }, []);

  // Sprawdź czy użytkownik jest już zalogowany i przekieruj
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/map');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Obsługa parametrów URL do automatycznego otwierania modala
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get('action');
    
    if (action === 'login') {
      setAuthMode('login');
      setShowAuthModal(true);
    } else if (action === 'register') {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  }, [location.search]);


  // Dane dla animowanego telefonu
  const phoneScreens = [
    {
      id: 1,
      image: '/LandPagePhotos/1.jpg',
      title: 'Mapa Interaktywna',
      description: 'Odkryj pomniki przyrody w swojej okolicy dzięki intuicyjnej mapie. Kliknij na lokalizację, aby zobaczyć szczegóły i zgłosić nowy pomnik.',
      features: ['Interaktywna mapa', 'Lokalizacja GPS', 'Szczegóły pomników'],
      icon: MapPin
    },
    {
      id: 2,
      image: '/LandPagePhotos/2.jpg',
      title: 'Formularz Zgłoszenia',
      description: 'Wypełnij szczegółowy formularz zgłoszenia pomnika przyrody. Nasz system poprowadzi Cię przez każdy krok procesu.',
      features: ['Przewodnik krok po kroku', 'Walidacja danych', 'Zapisywanie postępu'],
      icon: FileText
    },
    {
      id: 3,
      image: '/LandPagePhotos/3.jpg',
      title: 'Status Zgłoszeń',
      description: 'Śledź status swoich zgłoszeń w czasie rzeczywistym. Otrzymuj powiadomienia o zmianach i postępach w procesie.',
      features: ['Status w czasie rzeczywistym', 'Historia zgłoszeń', 'Powiadomienia push'],
      icon: BarChart3
    },
    {
      id: 4,
      image: '/LandPagePhotos/4.jpg',
      title: 'Encyklopedia Przyrody',
      description: 'Poznaj różne gatunki drzew i roślin. Nasza encyklopedia pomoże Ci zidentyfikować i lepiej zrozumieć pomniki przyrody.',
      features: ['Baza wiedzy', 'Identyfikacja gatunków', 'Ciekawostki przyrodnicze'],
      icon: Info
    },
    {
      id: 5,
      image: '/LandPagePhotos/5.jpg',
      title: 'Społeczność',
      description: 'Dołącz do społeczności miłośników przyrody. Dziel się zdjęciami, komentuj i wspieraj innych w ochronie pomników.',
      features: ['Galeria zdjęć', 'System komentarzy', 'Oceny i reakcje'],
      icon: Users
    },
    {
      id: 6,
      image: '/LandPagePhotos/6.jpg',
      title: 'Profil i Logowanie',
      description: 'Zaloguj się do swojego konta lub utwórz nowe. Zarządzaj swoimi zgłoszeniami, ustawieniami i preferencjami.',
      features: ['Bezpieczne logowanie', 'Zarządzanie kontem', 'Ustawienia prywatności'],
      icon: Settings
    }
  ];

  // Animacja telefonu
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % 6); // Stała liczba ekranów
    }, 8000); // 8 sekund
    
    return () => clearInterval(interval);
  }, []); // Pusta tablica dependencies


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (credentials: any) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Ładowanie...</div>
          <div className="text-gray-400 text-sm">
            {isLoading ? 'Sprawdzanie danych logowania' : 'Ładowanie tła aplikacji'}
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen relative">
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
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              <div className="hidden lg:flex items-center gap-3 sm:gap-4">
                <DarkGlassButton
                  onClick={scrollToTop}
                  variant="secondary"
                  size="xs"
                  className="text-xs"
                >
                  HOME
                </DarkGlassButton>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DarkGlassButton
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  variant="secondary"
                  size="xs"
                  className="text-xs px-2 sm:px-3 py-1"
                >
                  ZALOGUJ
                </DarkGlassButton>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated Phone Section */}
      <section className="relative z-10 min-h-screen flex items-center pt-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Phone Mockup - Left side */}
            <div className="relative flex items-center justify-center order-1 lg:order-1">
              <div className="relative">
                <div 
                  className="relative w-full max-w-64 sm:max-w-80 lg:w-[28rem] aspect-[9/19.5] bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                >
                  <div className="w-full h-full bg-black rounded-[1.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-3 sm:h-4 bg-black rounded-b-xl z-10"></div>
                    
                    {/* Screen */}
                    <div className="w-full h-full flex flex-col">
                      <div className="h-1 sm:h-2"></div>
                      <div className="flex-1 relative px-0.5">
                        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
                          <motion.img 
                            key={currentScreen}
                            src={phoneScreens[currentScreen].image} 
                            alt={phoneScreens[currentScreen].title}
                            className="w-full h-full object-contain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      <div className="h-2 sm:h-3"></div>
                    </div>
                  </div>
                </div>
                
                
              </div>
            </div>

            {/* Mobile: Description below phone */}
            <div className="lg:hidden order-2 text-center">
              <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-md mx-auto">
                Platforma stworzona dla miłośników przyrody. Szybko zgłaszaj zagrożone drzewa, tworz wnioski o ochronę pomników przyrody i zapobiegaj wycince lasów. Dołącz do społeczności, która aktywnie chroni naszą przyrodę.
              </p>

              <div className="flex items-center justify-center mb-8">
                <DarkGlassButton
                  onClick={() => navigate('/map')}
                  variant="primary"
                  size="md"
                  className="text-base px-8 py-3"
                >
                  KONTYNUUJ
                </DarkGlassButton>
              </div>
            </div>

            {/* Desktop: Content - Right side */}
            <div className="hidden lg:flex flex-col justify-center max-w-lg mx-auto lg:mx-0 order-2 lg:order-2 text-center">
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Platforma stworzona dla miłośników przyrody. Szybko zgłaszaj zagrożone drzewa, tworz wnioski o ochronę pomników przyrody i zapobiegaj wycince lasów. Dołącz do społeczności, która aktywnie chroni naszą przyrodę.
              </p>

              <div className="flex items-center justify-center">
                <DarkGlassButton
                  onClick={() => navigate('/map')}
                  variant="primary"
                  size="sm"
                  className="text-xs sm:text-sm w-fit px-4 py-2"
                >
                  KONTYNUUJ
                </DarkGlassButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Co możesz robić w aplikacji?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Nasza platforma oferuje wszystkie narzędzia potrzebne do skutecznej ochrony pomników przyrody
                  </p>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Mapa */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Mapa Interaktywna</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Odkryj pomniki przyrody w swojej okolicy dzięki intuicyjnej mapie. Kliknij na lokalizację, aby zobaczyć szczegóły i zgłosić nowy pomnik.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Interaktywna mapa z GPS</li>
                <li>• Szczegóły każdego pomnika</li>
                <li>• Lokalizacja w czasie rzeczywistym</li>
              </ul>
            </div>

            {/* Zgłoszenia */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Zgłaszanie Pomników</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Wypełnij szczegółowy formularz zgłoszenia pomnika przyrody. Nasz system poprowadzi Cię przez każdy krok procesu.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Przewodnik krok po kroku</li>
                <li>• Walidacja danych</li>
                <li>• Zapisywanie postępu</li>
              </ul>
            </div>

            {/* Wnioski */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Wnioski i Raporty</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Twórz profesjonalne wnioski o uznanie drzew za pomniki przyrody. Nasze szablony ułatwiają proces składania dokumentów.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Gotowe szablony wniosków</li>
                <li>• Automatyczne generowanie</li>
                <li>• Śledzenie statusu</li>
              </ul>
            </div>

            {/* Gatunki */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Encyklopedia Gatunków</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Poznaj różne gatunki drzew i ich charakterystyki. Dowiedz się, które drzewa mogą zostać uznane za pomniki przyrody.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Szczegółowe opisy gatunków</li>
                <li>• Zdjęcia i charakterystyki</li>
                <li>• Wymagania ochronne</li>
              </ul>
            </div>

            {/* Feed */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Społeczność</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Dołącz do społeczności miłośników przyrody. Dziel się zdjęciami, komentuj i wspieraj innych w ich działaniach.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Dzielenie się zdjęciami</li>
                <li>• Komentarze i dyskusje</li>
                <li>• Wsparcie społeczności</li>
              </ul>
            </div>

            {/* Profil */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Profil Użytkownika</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Zarządzaj swoim profilem, śledź swoje zgłoszenia i wnioski. Personalizuj ustawienia aplikacji.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Historia zgłoszeń</li>
                <li>• Personalizacja ustawień</li>
                <li>• Statystyki aktywności</li>
              </ul>
            </div>
          </div>

          {/* Dlaczego my? */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Dlaczego nasza aplikacja?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Bezpieczeństwo</h3>
                <p className="text-gray-300 text-center">
                  Twoje dane są bezpieczne. Używamy najnowszych standardów szyfrowania i ochrony prywatności.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Szybkość</h3>
                <p className="text-gray-300 text-center">
                  Proces zgłaszania i tworzenia wniosków nigdy nie był tak szybki i prosty. Wszystko w jednym miejscu.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dostępność</h3>
                <p className="text-gray-300 text-center">
                  Dostępne na wszystkich urządzeniach. Pracuj na telefonie, tablecie lub komputerze.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-white">
                    {authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
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