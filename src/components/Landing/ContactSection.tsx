import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';

export const ContactSection = () => {
  return (
    <section id="contact" className="relative z-10 py-12 bg-gray-900/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Kontakt
          </h2>
          <p className="text-sm text-gray-300">
            Masz pytania? Napisz do nas!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-3 lg:mb-6 text-center">
                <h3 className="text-sm lg:text-lg font-bold text-white">Informacje kontaktowe</h3>
              </div>
              <div className="grid grid-cols-2 lg:block gap-2 lg:gap-0">
                {/* Email */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-2 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-4">
                    <span className="text-gray-400 text-xs lg:text-sm font-medium mb-0.5 lg:mb-0 lg:mr-3 lg:w-20">Email:</span>
                    <span className="text-gray-300 text-xs lg:text-base">kontakt@zglospomnik.pl</span>
                  </div>
                </div>
                
                {/* Telefon */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-2 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-4">
                    <span className="text-gray-400 text-xs lg:text-sm font-medium mb-0.5 lg:mb-0 lg:mr-3 lg:w-20">Telefon:</span>
                    <span className="text-gray-300 text-xs lg:text-base">+48 123 456 789</span>
                  </div>
                </div>
                
                {/* Adres */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-2 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-4">
                    <span className="text-gray-400 text-xs lg:text-sm font-medium mb-0.5 lg:mb-0 lg:mr-3 lg:w-20">Adres:</span>
                    <span className="text-gray-300 text-xs lg:text-base">ul. Przyrodnicza 123</span>
                  </div>
                </div>
                
                {/* Miasto */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-2 lg:p-0 border border-gray-700/30">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-4">
                    <span className="text-gray-400 text-xs lg:text-sm font-medium mb-0.5 lg:mb-0 lg:mr-3 lg:w-20">Miasto:</span>
                    <span className="text-gray-300 text-xs lg:text-base">00-001 Warszawa</span>
                  </div>
                </div>
                
                {/* Godziny */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-md lg:bg-transparent lg:border-none p-2 lg:p-0 border border-gray-700/30 col-span-2 lg:col-span-1">
                  <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:mb-4">
                    <span className="text-gray-400 text-xs lg:text-sm font-medium mb-0.5 lg:mb-0 lg:mr-3 lg:w-20">Godziny:</span>
                    <span className="text-gray-300 text-xs lg:text-base">Poniedziałek - Piątek: 9:00 - 17:00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm lg:text-lg font-bold text-white mb-3 lg:mb-6">Wyślij wiadomość</h3>
              <form className="space-y-2 lg:space-y-4">
                <input
                  type="text"
                  placeholder="Imię i nazwisko"
                  className="w-full px-2 lg:px-4 py-1.5 lg:py-3 bg-gray-700/50 border border-gray-600 rounded-md lg:rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none text-xs lg:text-base"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-2 lg:px-4 py-1.5 lg:py-3 bg-gray-700/50 border border-gray-600 rounded-md lg:rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none text-xs lg:text-base"
                />
                <textarea
                  placeholder="Twoja wiadomość"
                  rows={3}
                  className="w-full px-2 lg:px-4 py-1.5 lg:py-3 bg-gray-700/50 border border-gray-600 rounded-md lg:rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none text-xs lg:text-base"
                />
                <DarkGlassButton
                  onClick={() => {}}
                  className="w-full"
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
