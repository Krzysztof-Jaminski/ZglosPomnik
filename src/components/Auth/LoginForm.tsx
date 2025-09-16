import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
import { LoginRequest } from '../../services/authService';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => void;
  onSwitchToRegister: () => void;
  onClose: () => void;
  onBackToMenu?: () => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSwitchToRegister,
  onClose,
  onBackToMenu,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credentials: LoginRequest = {
      email: formData.email,
      password: formData.password
    };
    onSubmit(credentials);
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
              className="w-8 h-8 absolute left-14 top-0"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              <span className="text-blue-600 dark:text-blue-400">Zgłoś</span><span className="text-green-600 dark:text-green-400">Pomnik</span>
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Witaj ponownie
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                placeholder="jan@example.com"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-white/80 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                placeholder="Hasło"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Logowanie...</span>
                </div>
              ) : (
                'Zaloguj się'
              )}
            </GlassButton>
          </div>
          
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
            >
              Nie masz konta? <span className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">Zarejestruj się</span>
            </button>
            {onBackToMenu && (
              <button
                type="button"
                onClick={onBackToMenu}
                className="block w-full text-sm text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 mt-2 transition-colors duration-200"
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