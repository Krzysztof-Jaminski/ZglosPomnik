import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';
import { RegisterRequest } from '../../services/authService';

interface RegisterFormProps {
  onSubmit: (userData: RegisterRequest) => void;
  onSwitchToLogin: () => void;
  onClose: () => void;
  onBackToMenu?: () => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  onClose,
  onBackToMenu,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Hasła nie są identyczne');
      return;
    }
    
    const userData: RegisterRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone
    };
    
    onSubmit(userData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Form container */}
      <div className="w-full">
        <div className="text-center mb-6">
          <div className="relative flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="ZgłośPomnik" 
              className="w-10 h-10 absolute"
              style={{ left: 'calc(50% - 105px)', top: '-4px' }}
            />
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              <span className="text-blue-400">Zgłoś</span><span className="text-green-400">Pomnik</span>
            </h2>
          </div>
          <p className="text-sm text-gray-400">
            Dołącz do społeczności
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name fields in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm"
                  placeholder="Imię"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm"
                  placeholder="Nazwisko"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm"
                placeholder="jan@example.com"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-2.5 bg-white/80 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 autofill:bg-white/80 dark:bg-gray-800/50 autofill:text-gray-900 dark:autofill:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm"
                placeholder="Hasło"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm"
                placeholder="Potwierdź hasło"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm"
                placeholder="+48 123 456 789"
              />
            </div>
          </div>

          <div className="pt-2">
            <DarkGlassButton
              type="submit"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Rejestracja...</span>
                </div>
              ) : (
                'Utwórz konto'
              )}
            </DarkGlassButton>
          </div>
          
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
            >
              Masz już konto? <span className="text-green-400 hover:text-green-300">Zaloguj się</span>
            </button>
            {onBackToMenu && (
              <button
                type="button"
                onClick={onBackToMenu}
                className="block w-full text-sm text-gray-500 hover:text-gray-300 mt-2 transition-colors duration-200"
              >
                ← Powrót do menu
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};