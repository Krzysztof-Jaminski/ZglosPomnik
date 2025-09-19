import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';

const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
    >
      <motion.button
        whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center text-white hover:text-green-400 transition-colors duration-300"
      >
        <span className="font-semibold text-lg">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-green-400 text-xl font-bold"
        >
          +
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-gray-300 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQSection = () => {
  const faqData = [
    {
      question: "Jakie drzewa mogą zostać uznane za pomniki przyrody?",
      answer: "Pomnikami przyrody mogą zostać uznane drzewa o obwodzie pnia powyżej 300 cm (mierzonym na wysokości 130 cm), drzewa o szczególnych walorach przyrodniczych, naukowych, kulturowych lub historycznych, a także krzewy, skały, jaskinie, wodospady i inne twory przyrody. Aplikacja automatycznie sprawdzi czy Twoje drzewo spełnia podstawowe kryteria i podpowie jakie dodatkowe informacje mogą być potrzebne."
    },
    {
      question: "Jak długo trwa proces uznania drzewa za pomnik przyrody?",
      answer: "Proces może trwać od 3 do 12 miesięcy w zależności od złożoności sprawy i potrzebnych dodatkowych badań. Nasza aplikacja pomoże Ci śledzić postęp w czasie rzeczywistym i otrzymywać powiadomienia o każdym etapie procedury. Możesz też sprawdzać status swojego wniosku w dowolnym momencie."
    },
    {
      question: "Czy mogę zgłosić drzewo anonimowo?",
      answer: "Tak, możesz zgłosić drzewo anonimowo, ale zalecamy podanie swoich danych kontaktowych, aby organy odpowiedzialne mogły skontaktować się z Tobą w przypadku potrzeby dodatkowych informacji. Dane kontaktowe przyspieszają proces weryfikacji i zwiększają szanse na pozytywne rozpatrzenie wniosku."
    },
    {
      question: "Co się dzieje po złożeniu wniosku?",
      answer: "Po złożeniu wniosku organ odpowiedzialny (gmina, starostwo lub urząd marszałkowski) przeprowadza wizję lokalną, ocenia drzewo pod kątem kryteriów ustawowych i podejmuje decyzję o uznaniu lub odmowie uznania drzewa za pomnik przyrody. Aplikacja będzie Cię informować o każdym etapie tego procesu."
    },
    {
      question: "Jakie dokumenty są potrzebne do złożenia wniosku?",
      answer: "Potrzebne są: szczegółowy opis lokalizacji z koordynatami GPS, wysokiej jakości zdjęcia drzewa z różnych perspektyw, precyzyjne pomiary obwodu pnia na wysokości 130 cm, opis stanu zdrowotnego, uzasadnienie walorów przyrodniczych, kulturowych lub historycznych, oraz informacje o właścicielu terenu. Aplikacja poprowadzi Cię przez wszystkie wymagane elementy."
    },
    {
      question: "Czy aplikacja jest bezpłatna?",
      answer: "Tak, aplikacja jest w pełni darmowa dla wszystkich użytkowników. Możesz zgłaszać pomniki przyrody, tworzyć wnioski, korzystać z encyklopedii gatunków i społeczności bez żadnych opłat. Wszystkie podstawowe funkcjonalności są dostępne za darmo. W przyszłości planujemy wprowadzić opcjonalne funkcje premium dla zaawansowanych użytkowników, ale podstawowa ochrona pomników przyrody pozostanie zawsze bezpłatna."
    },
    {
      question: "Jak działa funkcja mapy satelitarnej?",
      answer: "Aplikacja wykorzystuje mapy satelitarne do precyzyjnego określenia lokalizacji drzew. Możesz zobaczyć drzewo z lotu ptaka, co pomaga w dokładnym opisaniu jego położenia i otoczenia. To szczególnie przydatne przy zgłaszaniu drzew w terenach leśnych lub trudno dostępnych miejscach."
    },
    {
      question: "Czy mogę edytować zgłoszenie po wysłaniu?",
      answer: "Tak, możesz edytować swoje zgłoszenie do momentu rozpoczęcia jego rozpatrywania przez organ. Aplikacja automatycznie zapisuje wszystkie zmiany i informuje o statusie edycji. Po rozpoczęciu procedury urzędowej możesz tylko dodać dodatkowe informacje lub dokumenty."
    }
  ];

  return (
    <section id="faq" className="relative z-10 py-24 bg-gray-900/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Najczęściej zadawane pytania
          </h2>
          <p className="text-lg text-gray-300">
            Odpowiedzi na najważniejsze pytania dotyczące ochrony pomników przyrody
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>

        {/* CTA Button after FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <DarkGlassButton
            onClick={() => {
              // Symulacja pobierania aplikacji
              alert('Funkcja pobierania aplikacji będzie dostępna wkrótce!');
            }}
            className="text-lg px-8 py-4"
          >
            Pobierz aplikację mobilną
          </DarkGlassButton>
        </motion.div>
      </div>
    </section>
  );
};
