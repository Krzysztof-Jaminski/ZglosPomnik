import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';

export const ContactSection = () => {
  return (
    <section id="contact" className="relative z-10 py-24 bg-gray-900/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Kontakt
          </h2>
          <p className="text-lg text-gray-300">
            Masz pytania? Potrzebujesz pomocy? Chcesz się podzielić swoją historią? Napisz do nas!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/logo.png" 
                  alt="ZgłośPomnik" 
                  className="w-12 h-12"
                />
                <h3 className="text-xl font-bold text-white">Informacje kontaktowe</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Email:</span>
                  <span className="text-gray-300">kontakt@zglospomnik.pl</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Telefon:</span>
                  <span className="text-gray-300">+48 123 456 789</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Adres:</span>
                  <span className="text-gray-300">ul. Przyrodnicza 123, 00-001 Warszawa</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Godziny:</span>
                  <span className="text-gray-300">Pon-Pt: 9:00-17:00</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Wyślij wiadomość</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Imię i nazwisko"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                />
                <textarea
                  placeholder="Twoja wiadomość"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none"
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
