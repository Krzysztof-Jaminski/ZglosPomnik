import { useState } from 'react';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';

interface HeroSectionProps {
  onShowAuthModal: (mode: 'login' | 'register') => void;
}

export const HeroSection = ({ onShowAuthModal }: HeroSectionProps) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const phoneScreens = [
    {
      id: 1,
      image: '/LandPagePhotos/1.jpg',
      title: 'Mapa Interaktywna',
      description: 'Odkryj pomniki przyrody w swojej okolicy dzięki intuicyjnej mapie. Kliknij na lokalizację, aby zobaczyć szczegóły i zgłosić nowy pomnik.',
      features: ['Interaktywna mapa', 'Lokalizacja GPS', 'Szczegóły pomników']
    },
    {
      id: 2,
      image: '/LandPagePhotos/2.jpg',
      title: 'Formularz Zgłoszenia',
      description: 'Wypełnij szczegółowy formularz zgłoszenia pomnika przyrody. Nasz system poprowadzi Cię przez każdy krok procesu.',
      features: ['Przewodnik krok po kroku', 'Walidacja danych', 'Zapisywanie postępu']
    },
    {
      id: 3,
      image: '/LandPagePhotos/3.jpg',
      title: 'Status Zgłoszeń',
      description: 'Śledź status swoich zgłoszeń w czasie rzeczywistym. Otrzymuj powiadomienia o zmianach i postępach w procesie.',
      features: ['Status w czasie rzeczywistym', 'Historia zgłoszeń', 'Powiadomienia push']
    },
    {
      id: 4,
      image: '/LandPagePhotos/4.jpg',
      title: 'Encyklopedia Przyrody',
      description: 'Poznaj różne gatunki drzew i roślin. Nasza encyklopedia pomoże Ci zidentyfikować i lepiej zrozumieć pomniki przyrody.',
      features: ['Szczegółowe opisy', 'Zdjęcia gatunków', 'Wymagania ochronne']
    },
    {
      id: 5,
      image: '/LandPagePhotos/5.jpg',
      title: 'Społeczność',
      description: 'Dołącz do społeczności miłośników przyrody. Dziel się zdjęciami, komentuj i wspieraj innych w ich działaniach.',
      features: ['Dzielenie się zdjęciami', 'Komentarze', 'Wsparcie społeczności']
    },
    {
      id: 6,
      image: '/LandPagePhotos/6.jpg',
      title: 'Profil i Logowanie',
      description: 'Zaloguj się do swojego konta lub utwórz nowe. Zarządzaj swoimi zgłoszeniami, ustawieniami i preferencjami.',
      features: ['Bezpieczne logowanie', 'Zarządzanie kontem', 'Ustawienia prywatności']
    }
  ];

  return (
    <section className="relative z-10 min-h-screen flex items-center py-8">
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full">
          {/* Phone Mockup - Right side */}
          <div className="relative flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-64 h-[32rem]">
              <div className="absolute inset-0 bg-black rounded-[1.5rem] p-1 shadow-[0_0_20px_rgba(0,0,0,0.3)] phone-gradient-border">
                <div className="absolute inset-1 bg-black rounded-[1rem] overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black rounded-b-lg z-20"></div>
                  
                  {/* Screen */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-1"></div>
                    <div className="flex-1 relative px-0.5">
                      <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                        <motion.img
                          key={currentScreen}
                          src={phoneScreens[currentScreen].image}
                          alt={phoneScreens[currentScreen].title}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8 }}
                          className="absolute inset-0 w-full h-full object-contain z-5"
                        />
                      </div>
                    </div>
                    <div className="h-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Content - Center */}
          <div className="lg:hidden order-1 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-4"
            >
              <h2 className="text-lg font-bold text-white dark:text-white mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                Ochrona pomników przyrody
                <br />
                <span className="text-white dark:text-white">nigdy nie była tak prosta</span>
              </h2>
              <p className="text-gray-300 dark:text-gray-300 text-xs mb-2">
                Platforma do ochrony pomników przyrody. Odkrywaj drzewa na mapie, zgłaszaj lokalizacje z GPS i tworz wnioski zgodne ze standardami gmin.
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="bg-green-400/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Mapa interaktywna</span>
                <span className="bg-green-400/20 text-green-400 text-xs px-2 py-0.5 rounded-full">GPS i lokalizacja</span>
                <span className="bg-green-400/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Wnioski i dokumenty</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center mb-4"
            >
              <DarkGlassButton
                onClick={() => {
                  onShowAuthModal('login');
                }}
                variant="primary"
                size="sm"
                className="text-sm px-4 py-2"
              >
                KONTYNUUJ
              </DarkGlassButton>
            </motion.div>
          </div>

          {/* Desktop: Content - Left side */}
          <div className="hidden lg:flex flex-col justify-center max-w-md mx-auto lg:mx-0 order-1 lg:order-2 text-center">
            <h2 className="text-xl font-bold text-white dark:text-white mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              Ochrona pomników przyrody
              <br />
              <span className="text-white dark:text-white">nigdy nie była tak prosta</span>
            </h2>
            <p className="text-sm text-gray-300 dark:text-gray-300 mb-3 leading-relaxed">
              Platforma do ochrony pomników przyrody. Odkrywaj drzewa na mapie, zgłaszaj lokalizacje z GPS i tworz wnioski zgodne ze standardami gmin.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DarkGlassButton
                  onClick={() => {
                    onShowAuthModal('login');
                  }}
                  variant="primary"
                  size="sm"
                  className="text-xs w-fit px-3 py-1.5"
                >
                  KONTYNUUJ
                </DarkGlassButton>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
