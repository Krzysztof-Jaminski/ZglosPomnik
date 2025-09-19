import { motion } from 'framer-motion';
import { MapPin, FileText, BarChart3, Info, Users, Settings } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "1. Mapa Interaktywna",
      description: "Odkryj i przeglądaj pomniki przyrody w swojej okolicy dzięki zaawansowanej mapie interaktywnej. Aplikacja wykorzystuje GPS do precyzyjnej lokalizacji i mapy satelitarne do dokładnego określenia pozycji drzew.",
      image: "/LandPagePhotos/1.jpg",
      icon: MapPin,
      features: [
        "Przeglądanie zgłoszonych drzew",
        "Precyzyjna lokalizacja GPS", 
        "Mapy satelitarne",
        "Zgłaszanie nowych lokalizacji"
      ]
    },
    {
      id: 2,
      title: "2. Zgłaszanie Pomników",
      description: "Kompleksowy formularz zgłaszania pomników przyrody z wykorzystaniem lokalizacji GPS, możliwością dodawania zdjęć i pomiarów. Wszystkie dane są automatycznie zapisywane i walidowane, co ułatwia późniejsze tworzenie wniosków.",
      image: "/LandPagePhotos/2.jpg",
      icon: FileText,
      features: [
        "Lokalizacja GPS",
        "Zdjęcia i pomiary",
        "Automatyczne zapisywanie",
        "Walidacja w czasie rzeczywistym"
      ]
    },
    {
      id: 3,
      title: "3. Wnioski i Raporty",
      description: "Krok po kroku tworzenie wniosków o uznanie drzew za pomniki przyrody. Nasze gotowe szablony są zgodne ze standardami gmin i automatycznie generują PDF-y z instrukcjami wysyłki.",
      image: "/LandPagePhotos/3.jpg",
      icon: BarChart3,
      features: [
        "Gotowe szablony zgodne ze standardami gmin",
        "Automatyczne generowanie PDF-ów",
        "Instrukcje wysyłki",
        "Przewodnik krok po kroku"
      ]
    },
    {
      id: 4,
      title: "4. Encyklopedia Gatunków",
      description: "Poznaj różne gatunki drzew i ich charakterystyki. Dowiedz się, które drzewa mogą zostać uznane za pomniki przyrody i jakie mają wymagania ochronne.",
      image: "/LandPagePhotos/4.jpg",
      icon: Info,
      features: [
        "Szczegółowe opisy",
        "Zdjęcia i charakterystyki",
        "Wymagania ochronne"
      ]
    },
    {
      id: 5,
      title: "5. Społeczność i Feed",
      description: "Dołącz do społeczności miłośników przyrody. Dziel się zdjęciami, komentuj posty innych użytkowników i wspieraj ich w działaniach na rzecz ochrony pomników przyrody.",
      image: "/LandPagePhotos/5.jpg",
      icon: Users,
      features: [
        "Dzielenie się zdjęciami",
        "Komentarze i dyskusje",
        "Wsparcie społeczności"
      ]
    },
    {
      id: 6,
      title: "6. Profil i Ustawienia",
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
    <section id="features" className="relative z-10 py-24 bg-gray-900/50 backdrop-blur-sm">
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

        <div className="space-y-48">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className={`${index % 2 === 1 ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="space-y-4">
                  {feature.features.map((feat, featIndex) => (
                    <div key={featIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{feat}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${index % 2 === 1 ? 'order-1 lg:order-1' : 'order-1 lg:order-2'} flex justify-center`}>
                <div className="relative w-96 h-[48rem]">
                  <div className="absolute inset-0 bg-black rounded-[2rem] p-1 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-1 bg-black rounded-[1.5rem] overflow-hidden">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black rounded-b-xl z-20"></div>
                      <div className="absolute inset-0 flex flex-col">
                        <div className="h-1"></div>
                        <div className="flex-1 relative px-0.5">
                          <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                            <img
                              src={feature.image}
                              alt={feature.title}
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
          ))}
        </div>
      </div>
    </section>
  );
};
