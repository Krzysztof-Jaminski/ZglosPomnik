import { motion } from 'framer-motion';

interface GuidesSectionProps {
  onShowAuthModal: (mode: 'login' | 'register') => void;
}

export const GuidesSection = ({ onShowAuthModal }: GuidesSectionProps) => {
  const guides = [
    {
      title: "Jak rozpoznać pomnik przyrody",
      description: "Praktyczny przewodnik po identyfikacji drzew i obszarów, które mogą zostać uznane za pomniki przyrody."
    },
    {
      title: "Procedura składania wniosków",
      description: "Krok po kroku wyjaśniamy, jak prawidłowo złożyć wniosek o uznanie drzewa za pomnik przyrody."
    },
    {
      title: "Fotografowanie dokumentacyjne",
      description: "Jak robić zdjęcia, które będą miały wartość dokumentacyjną w procesie ochrony pomników przyrody."
    },
    {
      title: "Pomiary i ocena stanu drzew",
      description: "Naucz się prawidłowo mierzyć obwód pnia i oceniać stan zdrowotny drzew."
    },
    {
      title: "Współpraca z organami",
      description: "Jak skutecznie komunikować się z urzędami i organami odpowiedzialnymi za ochronę przyrody."
    },
    {
      title: "Monitoring i opieka",
      description: "Jak monitorować stan pomników przyrody i dbać o ich ochronę w dłuższej perspektywie."
    }
  ];

  return (
    <section id="guides" className="relative z-10 py-24 bg-gray-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Poradniki i przewodniki
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Praktyczne poradniki, które pomogą Ci skutecznie chronić pomniki przyrody
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {guides.map((guide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onShowAuthModal('login')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-green-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-400/30 transition-colors duration-300">
                <span className="text-green-400 text-xl font-bold">{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">{guide.title}</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{guide.description}</p>
              <div className="mt-4 text-green-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Kliknij aby przejść →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
