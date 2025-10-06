import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

const FAQItem = ({ question, answer, index }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
       className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/70 overflow-hidden hover:border-green-400/50 transition-all duration-300"
    >
      <motion.button
        whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-6 text-left flex justify-between items-center text-white transition-all duration-300"
      >
        <span className="font-semibold text-lg pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          {isOpen ? (
            <Minus className="w-6 h-6 text-green-400" />
          ) : (
            <Plus className="w-6 h-6 text-green-400" />
          )}
        </motion.div>
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
            <div className="px-6 pb-6 pt-2 text-gray-300 leading-relaxed">
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
      question: "Czy aplikacja jest bezpłatna?",
      answer: "Tak, aplikacja jest w pełni darmowa dla wszystkich użytkowników. Możesz zgłaszać pomniki przyrody, tworzyć wnioski, korzystać z encyklopedii gatunków i społeczności bez żadnych opłat. Wszystkie podstawowe funkcjonalności są dostępne za darmo."
    },
    {
      question: "Jak działa system lokalizacji GPS?",
      answer: "Aplikacja wykorzystuje precyzyjny GPS do automatycznego określania lokalizacji drzew. Możesz też ręcznie dostosować pozycję na mapie. Wszystkie współrzędne są zapisywane z dokładnością do kilku metrów, co zapewnia precyzyjne oznaczenie lokalizacji pomnika przyrody."
    },
    {
      question: "Czy mogę edytować zgłoszenie po jego wysłaniu?",
      answer: "Tak, możesz edytować swoje zgłoszenia w określonych ramach czasowych. Po wysłaniu wniosku do urzędu, możesz jeszcze wprowadzać poprawki przez 48 godzin. Po tym czasie zgłoszenie przechodzi do procesu weryfikacji i edycja nie jest już możliwa."
    }
  ];

  return (
    <section id="faq" className="relative py-20 bg-gradient-to-b from-gray-900/85 to-gray-900/95">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Najczęściej zadawane pytania
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Odpowiedzi na najważniejsze pytania dotyczące ochrony pomników przyrody
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <FAQItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer} 
              index={index} 
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
           <div className="bg-gradient-to-r from-green-500/15 to-blue-500/15 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/70">
            <h3 className="text-2xl font-bold text-white mb-4">
              Nie znalazłeś odpowiedzi?
            </h3>
            <p className="text-gray-300 mb-6">
              Skontaktuj się z naszym zespołem, a chętnie pomożemy Ci w ochronie pomników przyrody
            </p>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Skontaktuj się z nami
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
