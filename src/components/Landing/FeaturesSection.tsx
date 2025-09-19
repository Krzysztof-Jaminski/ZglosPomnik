import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileText, BarChart3, Info, Users, Settings } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "1. Interaktywna mapa",
      description: "Przeglądaj drzewa już zgłoszone na interaktywnej mapie. Korzystaj z precyzyjnego GPS i mapy satelitarnej, aby znaleźć dokładne miejsca i pozycje. Odkrywaj nowe lokalizacje i śledź status istniejących pomników przyrody.",
      image: "/LandPagePhotos/1.jpg",
      icon: MapPin,
      features: [
        "Przeglądanie istniejących zgłoszeń",
        "Precyzyjne GPS i lokalizacja",
        "Mapa satelitarna",
        "Oznaczanie nowych lokalizacji"
      ]
    },
    {
      id: 2,
      title: "2. Zgłaszanie pomników",
      description: "Zgłaszaj nowe pomniki przyrody wykorzystując swoją lokalną lokalizację. Dodawaj zdjęcia, mierz wysokość drzew, dodawaj uwagi i opisy oraz wszystkie kluczowe informacje. Dzięki temu będą one mogły być w przyszłości szybko wczytane do wniosków.",
      image: "/LandPagePhotos/2.jpg",
      icon: FileText,
      features: [
        "Automatyczne zapisywanie lokalizacji",
        "Dodawanie zdjęć i pomiarów",
        "Walidacja danych",
        "Szczegółowe opisy"
      ]
    },
    {
      id: 3,
      title: "3. Wnioski i dokumenty",
      description: "Twórz profesjonalne wnioski krok po kroku z gotowymi szablonami. Automatyczne generowanie dokumentów zgodnych ze standardami gmin. Nasza aplikacja tworzy PDF-y na podstawie drzew i daje instrukcje jak je wysłać.",
      image: "/LandPagePhotos/3.jpg",
      icon: BarChart3,
      features: [
        "Gotowe szablony wniosków",
        "Automatyczne generowanie PDF",
        "Zgodność ze standardami gmin",
        "Instrukcje wysyłki"
      ]
    },
    {
      id: 4,
      title: "4. Encyklopedia gatunków",
      description: "Kompleksowa baza wiedzy o gatunkach drzew i roślin. Ucz się rozpoznawać różne gatunki, poznawaj ich cechy charakterystyczne i dowiaduj się, które z nich mogą zostać uznane za pomniki przyrody.",
      image: "/LandPagePhotos/4.jpg",
      icon: Info,
      features: [
        "Baza gatunków drzew",
        "Cechy charakterystyczne",
        "Zdjęcia i opisy",
        "Wskazówki identyfikacji"
      ]
    },
    {
      id: 5,
      title: "5. Społeczność i feed",
      description: "Dołącz do społeczności miłośników przyrody. Przeglądaj posty i drzewa innych użytkowników, dziel się swoimi odkryciami i ucz się od doświadczonych entuzjastów ochrony przyrody.",
      image: "/LandPagePhotos/5.jpg",
      icon: Users,
      features: [
        "Feed społecznościowy",
        "Udostępnianie odkryć",
        "Interakcja z użytkownikami",
        "Wymiana doświadczeń"
      ]
    },
    {
      id: 6,
      title: "6. Profil i ustawienia",
      description: "Zarządzaj swoim profilem, śledź swoje zgłoszenia i wnioski. Personalizuj ustawienia aplikacji i monitoruj swoją aktywność w ochronie pomników przyrody.",
      image: "/LandPagePhotos/6.jpg",
      icon: Settings,
      features: [
        "Historia zgłoszeń",
        "Statystyki aktywności",
        "Personalizacja ustawień"
      ]
    }
  ];

  return (
    <section id="features" className="relative z-10">
      {/* Pierwsza sekcja z tłem */}
      <div className="py-32 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Jak działa nasza aplikacja?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="order-1 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[0].icon, { className: "w-6 h-6 text-green-400" })}
                </div>
                <h3 className="text-2xl font-bold text-white">{features[0].title}</h3>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {features[0].description}
              </p>
              <div className="space-y-4">
                {features[0].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-2 lg:order-2 flex justify-center">
              <div className="relative w-96 h-[48rem]">
                <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] phone-gradient-border">
                  <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
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
       <div className="py-32 bg-transparent backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-6 sm:px-8">
           <motion.div
             key={features[1].id}
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
           >
             <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[1].icon, { className: "w-6 h-6 text-green-400" })}
                </div>
                <h3 className="text-2xl font-bold text-white">{features[1].title}</h3>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {features[1].description}
              </p>
              <div className="space-y-4">
                {features[1].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">{feat}</span>
                  </div>
                ))}
               </div>
             </div>
             <div className="order-2 lg:order-1 flex justify-center">
               <div className="relative w-96 h-[48rem]">
                 <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] phone-gradient-border">
                   <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                     <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
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
      <div className="py-32 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            key={features[2].id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="order-1 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[2].icon, { className: "w-6 h-6 text-green-400" })}
                </div>
                <h3 className="text-2xl font-bold text-white">{features[2].title}</h3>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {features[2].description}
              </p>
              <div className="space-y-4">
                {features[2].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-2 lg:order-2 flex justify-center">
              <div className="relative w-96 h-[48rem]">
                <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] phone-gradient-border">
                  <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
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

       {/* Czwarta funkcja z lżejszym tłem */}
       <div className="py-32 bg-transparent backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-6 sm:px-8">
           <motion.div
             key={features[3].id}
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
           >
             <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[3].icon, { className: "w-6 h-6 text-green-400" })}
                </div>
                <h3 className="text-2xl font-bold text-white">{features[3].title}</h3>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {features[3].description}
              </p>
              <div className="space-y-4">
                {features[3].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">{feat}</span>
                  </div>
                ))}
               </div>
             </div>
             <div className="order-2 lg:order-1 flex justify-center">
               <div className="relative w-96 h-[48rem]">
                 <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] phone-gradient-border">
                   <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                     <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
                     <div className="absolute inset-0 flex flex-col">
                       <div className="h-1"></div>
                       <div className="flex-1 relative px-0.5">
                         <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                           <img
                             src={features[3].image}
                             alt={features[3].title}
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

      {/* Piąta funkcja z ciemnym tłem */}
      <div className="py-32 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            key={features[4].id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="order-1 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[4].icon, { className: "w-6 h-6 text-green-400" })}
                </div>
                <h3 className="text-2xl font-bold text-white">{features[4].title}</h3>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {features[4].description}
              </p>
              <div className="space-y-4">
                {features[4].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-2 lg:order-2 flex justify-center">
              <div className="relative w-96 h-[48rem]">
                <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] phone-gradient-border">
                  <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
                    <div className="absolute inset-0 flex flex-col">
                      <div className="h-1"></div>
                      <div className="flex-1 relative px-0.5">
                        <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                          <img
                            src={features[4].image}
                            alt={features[4].title}
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

       {/* Szósta funkcja z lżejszym tłem */}
       <div className="py-32 bg-transparent backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-6 sm:px-8">
           <motion.div
             key={features[5].id}
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
           >
             <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                  {React.createElement(features[5].icon, { className: "w-6 h-6 text-green-400" })}
                </div>
                <h3 className="text-2xl font-bold text-white">{features[5].title}</h3>
              </div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {features[5].description}
              </p>
              <div className="space-y-4">
                {features[5].features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">{feat}</span>
                  </div>
                ))}
               </div>
             </div>
             <div className="order-2 lg:order-1 flex justify-center">
               <div className="relative w-96 h-[48rem]">
                 <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)] phone-gradient-border">
                   <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                     <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
                     <div className="absolute inset-0 flex flex-col">
                       <div className="h-1"></div>
                       <div className="flex-1 relative px-0.5">
                         <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                           <img
                             src={features[5].image}
                             alt={features[5].title}
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