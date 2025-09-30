import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';

export const ContactSection = () => {
  return (
    <section id="contact" className="relative z-10 py-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-3"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
            Kontakt
          </h2>
          <p className="text-xs text-gray-300">
            Masz pytania? Napisz do nas!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="mb-2 lg:mb-3 text-center">
                <h3 className="text-xs lg:text-sm font-bold text-white">Informacje kontaktowe</h3>
              </div>
              <div className="grid grid-cols-2 lg:block gap-1 lg:gap-0">
                {/* Email */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-1 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-2">
                    <span className="text-gray-400 text-xs lg:text-xs font-medium mb-0.5 lg:mb-0 lg:mr-2 lg:w-16">Email:</span>
                    <span className="text-gray-300 text-xs lg:text-sm">kontakt@zglospomnik.pl</span>
                  </div>
                </div>
                
                {/* Telefon */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-1 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-2">
                    <span className="text-gray-400 text-xs lg:text-xs font-medium mb-0.5 lg:mb-0 lg:mr-2 lg:w-16">Telefon:</span>
                    <span className="text-gray-300 text-xs lg:text-sm">+48 123 456 789</span>
                  </div>
                </div>
                
                {/* Adres */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-1 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-2">
                    <span className="text-gray-400 text-xs lg:text-xs font-medium mb-0.5 lg:mb-0 lg:mr-2 lg:w-16">Adres:</span>
                    <span className="text-gray-300 text-xs lg:text-sm">ul. Przyrodnicza 123</span>
                  </div>
                </div>
                
                {/* Miasto */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-1 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-2">
                    <span className="text-gray-400 text-xs lg:text-xs font-medium mb-0.5 lg:mb-0 lg:mr-2 lg:w-16">Miasto:</span>
                    <span className="text-gray-300 text-xs lg:text-sm">00-001 Warszawa</span>
                  </div>
                </div>
                
                {/* Godziny */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-1 lg:p-0 border border-gray-700/30 col-span-2 lg:col-span-1">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-2">
                    <span className="text-gray-400 text-xs lg:text-xs font-medium mb-0.5 lg:mb-0 lg:mr-2 lg:w-16">Godziny:</span>
                    <span className="text-gray-300 text-xs lg:text-sm">Poniedziałek - Piątek: 9:00 - 17:00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xs lg:text-sm font-bold text-white mb-2 lg:mb-3">Wyślij wiadomość</h3>
              <form className="space-y-1 lg:space-y-2">
                <input
                  type="text"
                  placeholder="Imię i nazwisko"
                  className="w-full px-2 lg:px-3 py-1 lg:py-2 bg-gray-700/50 border border-gray-600 rounded-md lg:rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none text-xs lg:text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-2 lg:px-3 py-1 lg:py-2 bg-gray-700/50 border border-gray-600 rounded-md lg:rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none text-xs lg:text-sm"
                />
                <textarea
                  placeholder="Twoja wiadomość"
                  rows={2}
                  className="w-full px-2 lg:px-3 py-1 lg:py-2 bg-gray-700/50 border border-gray-600 rounded-md lg:rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none text-xs lg:text-sm"
                />
                <DarkGlassButton
                  onClick={() => {}}
                  className="w-full text-xs"
                >
                  Wyślij wiadomość
                </DarkGlassButton>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
