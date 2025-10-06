import { motion } from 'framer-motion';
import { MapPin, FileText, BarChart3, Shield, Users, Clock } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Interaktywna mapa",
      description: "Przeglądaj drzewa już zgłoszone na interaktywnej mapie. Korzystaj z precyzyjnego GPS i mapy satelitarnej, aby znaleźć dokładne miejsca i pozycje.",
      image: "/LandPagePhotos/1.jpg",
      features: [
        "Przeglądanie istniejących zgłoszeń",
        "Precyzyjne GPS i lokalizacja",
        "Mapa satelitarna"
      ],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: FileText,
      title: "Zgłaszanie pomników",
      description: "Zgłaszaj nowe pomniki przyrody wykorzystując swoją lokalną lokalizację. Dodawaj zdjęcia, mierz wysokość drzew i wszystkie kluczowe informacje.",
      image: "/LandPagePhotos/2.jpg",
      features: [
        "Automatyczne zapisywanie lokalizacji",
        "Dodawanie zdjęć i pomiarów",
        "Walidacja danych"
      ],
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: BarChart3,
      title: "Wnioski i dokumenty",
      description: "Twórz profesjonalne wnioski krok po kroku z gotowymi szablonami. Automatyczne generowanie dokumentów zgodnych ze standardami gmin.",
      image: "/LandPagePhotos/3.jpg",
      features: [
        "Gotowe szablony wniosków",
        "Automatyczne generowanie PDF",
        "Zgodność ze standardami gmin"
      ],
      color: "from-purple-500 to-indigo-600"
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Bezpieczeństwo",
      description: "Twoje dane są chronione najwyższymi standardami bezpieczeństwa"
    },
    {
      icon: Users,
      title: "Społeczność",
      description: "Dołącz do społeczności miłośników przyrody"
    },
    {
      icon: Clock,
      title: "Status w czasie rzeczywistym",
      description: "Śledź postęp swoich zgłoszeń na bieżąco"
    }
  ];

  return (
    <section id="features" className="relative py-20 bg-gradient-to-b from-gray-900/70 to-gray-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Jak działa nasza aplikacja?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Przejdź przez każdą funkcjonalność i zobacz, jak skutecznie chronić pomniki przyrody
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    {index + 1}. {feature.title}
                  </h3>
                </div>
                
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-4">
                  {feature.features.map((feat, featIndex) => (
                    <motion.div
                      key={featIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: featIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20`}></div>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full opacity-60 animate-pulse delay-500"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Dodatkowe korzyści
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/70 hover:border-green-400/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
