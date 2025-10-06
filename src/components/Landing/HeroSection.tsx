import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';
import { ArrowRight, Shield, MapPin, FileText } from 'lucide-react';

interface HeroSectionProps {
  onShowAuthModal: (mode: 'login' | 'register') => void;
}

export const HeroSection = ({ onShowAuthModal }: HeroSectionProps) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: MapPin,
      title: "Mapa Interaktywna",
      description: "Odkryj pomniki przyrody w swojej okolicy"
    },
    {
      icon: FileText,
      title: "Zgłaszanie",
      description: "Zgłaszaj nowe pomniki przyrody"
    },
    {
      icon: Shield,
      title: "Ochrona",
      description: "Chroń przyrodę skutecznie"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Ochrona pomników przyrody
              </span>
              <br />
              <span className="text-white">
                nigdy nie była tak prosta
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Platforma do ochrony pomników przyrody. Odkrywaj drzewa na mapie, zgłaszaj lokalizacje z GPS i tworz wnioski zgodne ze standardami gmin.
            </p>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex justify-center mb-6">
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/60">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    {(() => {
                      const Icon = features[currentFeature].icon;
                      return <Icon className="w-6 h-6 text-green-400" />;
                    })()}
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold text-lg">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Dots */}
            <div className="flex justify-center space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFeature ? 'bg-green-400 w-8' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <DarkGlassButton
              onClick={() => onShowAuthModal('login')}
              variant="primary"
              size="lg"
              className="text-lg px-8 py-4 group"
            >
              Rozpocznij ochronę
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </DarkGlassButton>

            <DarkGlassButton
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              variant="secondary"
              size="lg"
              className="text-lg px-8 py-4"
            >
              Dowiedz się więcej
            </DarkGlassButton>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-gray-400 text-sm">Bezpłatne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">GPS</div>
              <div className="text-gray-400 text-sm">Precyzyjna lokalizacja</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Dostępne zawsze</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};
