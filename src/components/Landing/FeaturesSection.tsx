import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileText, BarChart3, Info, Users, Settings } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "1. Interaktywna mapa",
      description: "Przeglądaj drzewa już zgłoszone na interaktywnej mapie. Korzystaj z precyzyjnego GPS i mapy satelitarnej, aby znaleźć dokładne miejsca i pozycje.",
      image: "/LandPagePhotos/1.jpg",
      icon: MapPin,
      features: [
        "Przeglądanie istniejących zgłoszeń",
        "Precyzyjne GPS i lokalizacja",
        "Mapa satelitarna"
      ]
    },
    {
      id: 2,
      title: "2. Zgłaszanie pomników",
      description: "Zgłaszaj nowe pomniki przyrody wykorzystując swoją lokalną lokalizację. Dodawaj zdjęcia, mierz wysokość drzew i wszystkie kluczowe informacje.",
      image: "/LandPagePhotos/2.jpg",
      icon: FileText,
      features: [
        "Automatyczne zapisywanie lokalizacji",
        "Dodawanie zdjęć i pomiarów",
        "Walidacja danych"
      ]
    },
    {
      id: 3,
      title: "3. Wnioski i dokumenty",
      description: "Twórz profesjonalne wnioski krok po kroku z gotowymi szablonami. Automatyczne generowanie dokumentów zgodnych ze standardami gmin.",
      image: "/LandPagePhotos/3.jpg",
      icon: BarChart3,
      features: [
        "Gotowe szablony wniosków",
        "Automatyczne generowanie PDF",
        "Zgodność ze standardami gmin"
      ]
    }
  ];

  return (
    <section id="features" className="relative z-10">
      {/* Pierwsza sekcja z tłem */}
      <div className="py-8 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-white mb-2">
              Jak działa nasza aplikacja?
            </h2>
            <p className="text-sm text-gray-300 dark:text-gray-300 max-w-2xl mx-auto">
              Przejdź przez każdą funkcjonalność i zobacz, jak skutecznie chronić pomniki przyrody
            </p>
          </motion.div>

          {/* Pierwsza funkcja */}
          <motion.div
            key={features[0].id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div className="order-1 lg:order-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[0].icon, { className: "w-4 h-4 text-green-400" })}
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white">{features[0].title}</h3>
              </div>
              <p className="text-sm text-gray-300 dark:text-gray-300 mb-3 leading-relaxed">
                {features[0].description}
              </p>
              <div className="space-y-2">
                {features[0].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                    <span className="text-xs text-gray-300 dark:text-gray-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-2 lg:order-2 flex justify-center">
              <div className="relative w-64 h-[32rem]">
                <div className="absolute inset-0 bg-black rounded-[1.5rem] p-1 shadow-[0_0_20px_rgba(0,0,0,0.3)] phone-gradient-border">
                  <div className="absolute inset-1 bg-black rounded-[1rem] overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black rounded-b-lg z-20"></div>
                    <div className="absolute inset-0 flex flex-col">
                      <div className="h-1"></div>
                      <div className="flex-1 relative px-0.5">
                        <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                          <img
                            src={features[0].image}
                            alt={features[0].title}
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
          </motion.div>
        </div>
      </div>

       {/* Druga funkcja z lżejszym tłem */}
       <div className="py-8 bg-transparent backdrop-blur-sm">
         <div className="max-w-5xl mx-auto px-3 sm:px-4">
           <motion.div
             key={features[1].id}
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
           >
             <div className="order-1 lg:order-2">
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                   {React.createElement(features[1].icon, { className: "w-4 h-4 text-green-400" })}
                 </div>
                 <h3 className="text-lg font-bold text-white dark:text-white">{features[1].title}</h3>
               </div>
               <p className="text-sm text-gray-300 dark:text-gray-300 mb-3 leading-relaxed">
                 {features[1].description}
               </p>
               <div className="space-y-2">
                 {features[1].features.map((feat, featIndex) => (
                   <div key={featIndex} className="flex items-start gap-2">
                     <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                     <span className="text-xs text-gray-300 dark:text-gray-300">{feat}</span>
                   </div>
                 ))}
                </div>
             </div>
             <div className="order-2 lg:order-1 flex justify-center">
               <div className="relative w-64 h-[32rem]">
                 <div className="absolute inset-0 bg-black rounded-[1.5rem] p-1 shadow-[0_0_20px_rgba(0,0,0,0.3)] phone-gradient-border">
                   <div className="absolute inset-1 bg-black rounded-[1rem] overflow-hidden">
                     <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black rounded-b-lg z-20"></div>
                     <div className="absolute inset-0 flex flex-col">
                       <div className="h-1"></div>
                       <div className="flex-1 relative px-0.5">
                         <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                           <img
                             src={features[1].image}
                             alt={features[1].title}
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
          </motion.div>
        </div>
      </div>

      {/* Trzecia funkcja z ciemnym tłem */}
      <div className="py-8 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <motion.div
            key={features[2].id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div className="order-1 lg:order-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[2].icon, { className: "w-4 h-4 text-green-400" })}
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white">{features[2].title}</h3>
              </div>
              <p className="text-sm text-gray-300 dark:text-gray-300 mb-3 leading-relaxed">
                {features[2].description}
              </p>
              <div className="space-y-2">
                {features[2].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                    <span className="text-xs text-gray-300 dark:text-gray-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-2 lg:order-2 flex justify-center">
              <div className="relative w-64 h-[32rem]">
                <div className="absolute inset-0 bg-black rounded-[1.5rem] p-1 shadow-[0_0_20px_rgba(0,0,0,0.3)] phone-gradient-border">
                  <div className="absolute inset-1 bg-black rounded-[1rem] overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black rounded-b-lg z-20"></div>
                    <div className="absolute inset-0 flex flex-col">
                      <div className="h-1"></div>
                      <div className="flex-1 relative px-0.5">
                        <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                          <img
                            src={features[2].image}
                            alt={features[2].title}
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
          </motion.div>
        </div>
      </div>

    </section>
  );
};