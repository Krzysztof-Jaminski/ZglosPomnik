import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "kontakt@zglospomnik.pl",
      description: "Napisz do nas wiadomość"
    },
    {
      icon: Phone,
      title: "Telefon",
      value: "+48 123 456 789",
      description: "Zadzwoń do nas"
    },
    {
      icon: MapPin,
      title: "Adres",
      value: "ul. Przyrodnicza 123, 00-001 Warszawa",
      description: "Odwiedź nas w biurze"
    },
    {
      icon: Clock,
      title: "Godziny pracy",
      value: "Poniedziałek - Piątek: 9:00 - 17:00",
      description: "Jesteśmy dostępni"
    }
  ];

  return (
    <section id="contact" className="relative py-20 bg-gradient-to-b from-gray-900/90 to-gray-900/98">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Kontakt
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Masz pytania? Chcesz się dowiedzieć więcej o ochronie pomników przyrody? Skontaktuj się z nami!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-8">
              Informacje kontaktowe
            </h3>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
        <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
                   className="flex items-start gap-4 p-6 bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/70 hover:border-green-400/50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                    <info.icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-green-400 transition-colors duration-300">
                      {info.title}
                    </h4>
                    <p className="text-gray-300 font-medium mb-1">
                      {info.value}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {info.description}
                    </p>
                  </div>
                </motion.div>
              ))}
                </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
             <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/70">
              <h3 className="text-2xl font-bold text-white mb-6">
                Wyślij wiadomość
              </h3>
              
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Wiadomość została wysłana!
                  </h4>
                  <p className="text-gray-300">
                    Dziękujemy za kontakt. Odpowiemy w ciągu 24 godzin.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                      placeholder="Jan Kowalski"
                    />
                </div>
                
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                      placeholder="jan@example.com"
                    />
                </div>
                
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Wiadomość
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 resize-none"
                      placeholder="Opisz swoje pytanie lub sugestię..."
                    />
            </div>
            
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  Wyślij wiadomość
                  </motion.button>
              </form>
              )}
            </div>
          </motion.div>
          </div>
      </div>
    </section>
  );
};
