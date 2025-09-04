import { useState, useEffect } from 'react';
import { Info, MapPin, FileText, Users, BarChart3, Settings, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../components/UI/DarkGlassButton';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'menu'>('menu');
  const [error, setError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Bezpieczne używanie kontekstu autoryzacji
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Jeśli kontekst nie jest dostępny, użyj domyślnych wartości
    authContext = {
      login: async () => {},
      register: async () => {},
      isLoading: false
    };
  }
  
  const { login, register, isLoading } = authContext;

  // Dane dla animowanego telefonu
  const phoneScreens = [
    {
      id: 1,
      image: '/LandPagePhotos/1756984976104.jpg',
      title: 'Mapa Interaktywna',
      description: 'Odkryj pomniki przyrody w swojej okolicy dzięki intuicyjnej mapie. Kliknij na lokalizację, aby zobaczyć szczegóły i zgłosić nowy pomnik.',
      features: ['Interaktywna mapa', 'Lokalizacja GPS', 'Szczegóły pomników'],
      icon: MapPin
    },
    {
      id: 2,
      image: '/LandPagePhotos/1756984976108.jpg',
      title: 'Profil i Logowanie',
      description: 'Zaloguj się do swojego konta lub utwórz nowe. Zarządzaj swoimi zgłoszeniami, ustawieniami i preferencjami.',
      features: ['Bezpieczne logowanie', 'Zarządzanie kontem', 'Ustawienia prywatności'],
      icon: Settings
    },
    {
      id: 3,
      image: '/LandPagePhotos/1756984976112.jpg',
      title: 'Status Zgłoszeń',
      description: 'Śledź status swoich zgłoszeń w czasie rzeczywistym. Otrzymuj powiadomienia o zmianach i postępach w procesie.',
      features: ['Status w czasie rzeczywistym', 'Historia zgłoszeń', 'Powiadomienia push'],
      icon: BarChart3
    },
    {
      id: 4,
      image: '/LandPagePhotos/1756984976115.jpg',
      title: 'Społeczność',
      description: 'Dołącz do społeczności miłośników przyrody. Dziel się zdjęciami, komentuj i wspieraj innych w ochronie pomników.',
      features: ['Galeria zdjęć', 'System komentarzy', 'Oceny i reakcje'],
      icon: Users
    },
    {
      id: 5,
      image: '/LandPagePhotos/1756984976118.jpg',
      title: 'Encyklopedia Przyrody',
      description: 'Poznaj różne gatunki drzew i roślin. Nasza encyklopedia pomoże Ci zidentyfikować i lepiej zrozumieć pomniki przyrody.',
      features: ['Baza wiedzy', 'Identyfikacja gatunków', 'Ciekawostki przyrodnicze'],
      icon: Info
    },
    {
      id: 6,
      image: '/LandPagePhotos/1756984976121.jpg',
      title: 'Formularz Zgłoszenia',
      description: 'Wypełnij szczegółowy formularz zgłoszenia pomnika przyrody. Nasz system poprowadzi Cię przez każdy krok procesu.',
      features: ['Przewodnik krok po kroku', 'Walidacja danych', 'Zapisywanie postępu'],
      icon: FileText
    }
  ];

  // Animacja telefonu
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % phoneScreens.length);
    }, 5000); // 5 sekund
    
    return () => clearInterval(interval);
  }, [isPlaying, phoneScreens.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePhoneClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleContentClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleContinueWithoutLogin = () => {
    navigate('/map');
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img 
                src="/green_tree_icon.svg" 
                alt="ZgłośPomnik" 
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              <span className="text-xs sm:text-sm font-bold text-white">ZgłośPomnik</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              <div className="hidden lg:flex items-center gap-3 sm:gap-4">
                <a href="#" className="text-gray-400 hover:text-green-400 text-xs">HOME</a>
                <a href="#" className="text-gray-400 hover:text-green-400 text-xs">O NAS</a>
                <a href="#" className="text-gray-400 hover:text-green-400 text-xs">POMOC</a>
                <a href="#" className="text-gray-400 hover:text-green-400 text-xs">KONTAKT</a>
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
                <DarkGlassButton
                  onClick={handleContinueWithoutLogin}
                  variant="primary"
                  size="xs"
                  className="text-xs px-2 sm:px-3 py-1"
                >
                  ROZPOCZNIJ
                </DarkGlassButton>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated Phone Section */}
      <section className="relative z-10 min-h-screen flex items-center pt-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Phone Mockup - Left side */}
            <div className="relative flex items-center justify-center order-1 lg:order-1">
              <div className="relative">
                <div 
                  className="relative w-96 sm:w-[28rem] lg:w-[32rem] h-[800px] sm:h-[900px] lg:h-[1000px] bg-black rounded-[2.5rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] cursor-pointer"
                  onClick={handlePhoneClick}
                >
                  <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-3 sm:h-4 bg-black rounded-b-xl z-10"></div>
                    
                    {/* Screen */}
                    <div className="w-full h-full flex flex-col">
                      <div className="h-1 sm:h-2"></div>
                      <div className="flex-1 relative px-0.5">
                        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
                          <AnimatePresence mode="wait">
                            <motion.img 
                              key={currentScreen}
                              src={phoneScreens[currentScreen].image} 
                              alt={phoneScreens[currentScreen].title}
                              className="w-full h-full object-cover object-top"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1 }}
                            />
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="h-2 sm:h-3"></div>
                    </div>
                  </div>
                </div>
                
                {/* Screen indicator dots */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
                  {phoneScreens.map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        dotIndex === currentScreen ? 'bg-green-400' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: Description below phone */}
            <div className="lg:hidden order-2 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1 }}
                >
                  <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-md mx-auto">
                    {phoneScreens[currentScreen].description}
                  </p>

                  <div className="space-y-3 mb-8 max-w-sm mx-auto">
                    {phoneScreens[currentScreen].features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <DarkGlassButton
                      onClick={handleContinueWithoutLogin}
                      variant="primary"
                      size="md"
                      className="text-base px-8 py-3"
                    >
                      WYPRÓBUJ TERAZ
                    </DarkGlassButton>
                    
                    <button
                      onClick={togglePlayPause}
                      className="p-3 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop: Content - Right side with animation */}
            <div 
              className="hidden lg:flex flex-col justify-center max-w-lg mx-auto lg:mx-0 order-2 lg:order-2 cursor-pointer"
              onClick={handleContentClick}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const IconComponent = phoneScreens[currentScreen].icon;
                      return <IconComponent className="w-8 h-8 text-green-400" />;
                    })()}
                    <h2 className="text-4xl font-bold text-white">
                      {phoneScreens[currentScreen].title}
                    </h2>
                  </div>
                  
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                    {phoneScreens[currentScreen].description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {phoneScreens[currentScreen].features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center gap-4">
                <DarkGlassButton
                  onClick={handleContinueWithoutLogin}
                  variant="primary"
                  size="sm"
                  className="text-sm sm:text-base w-fit"
                >
                  WYPRÓBUJ TERAZ
                </DarkGlassButton>
                
                <button
                  onClick={togglePlayPause}
                  className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-gray-500">
            <p className="text-xs sm:text-sm">© 2024 ZgłośPomnik. Wszystkie prawa zastrzeżone.</p>
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
                      onClose={() => setShowAuthModal(false)}
                      isLoading={isLoading}
                    />
                  ) : (
                    <RegisterForm
                      onSubmit={handleRegister}
                      onSwitchToLogin={() => setAuthMode('login')}
                      onClose={() => setShowAuthModal(false)}
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