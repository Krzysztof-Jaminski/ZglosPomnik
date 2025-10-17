import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { DarkGlassButton } from '../UI/DarkGlassButton';
import { LoginRequest, authService } from '../../services/authService';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => void;
  onSwitchToRegister: () => void;
  onClose: () => void;
  onBackToMenu?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSwitchToRegister,
  onBackToMenu,
  isLoading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [validation, setValidation] = useState({
    email: { isValid: false },
    password: { isValid: false }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sprawdź walidację przed wysłaniem
    if (!validation.email.isValid || !validation.password.isValid) {
      return; // Nie wysyłaj jeśli pola są nieprawidłowe
    }
    
    const credentials: LoginRequest = {
      email: formData.email,
      password: formData.password
    };
    onSubmit(credentials);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Walidacja w czasie rzeczywistym
    validateField(name, value);
  };

  const validateField = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValid = emailRegex.test(value) && value.length <= 100;
        setValidation(prev => ({
          ...prev,
          email: { isValid: emailValid }
        }));
        break;
        
      case 'password':
        const passwordValid = value.length >= 6;
        setValidation(prev => ({
          ...prev,
          password: { isValid: passwordValid }
        }));
        break;
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage('Proszę podać prawidłowy adres email');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const response = await authService.forgotPassword(forgotPasswordEmail);
      
      if (response.success) {
        setForgotPasswordMessage('Email z linkiem do resetowania hasła został wysłany!');
        setForgotPasswordEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage('');
        }, 3000);
      } else {
        setForgotPasswordMessage(response.message || 'Błąd podczas wysyłania emaila');
      }
    } catch (error: any) {
      setForgotPasswordMessage(error.message || 'Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setForgotPasswordLoading(false);
    }
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
          <p className="text-sm text-gray-400">
            Witaj ponownie
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/20 border-2 border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleFieldFocus('email')}
                onBlur={handleFieldBlur}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 ${
                  formData.email && !validation.email.isValid 
                    ? 'border-red-500/50' 
                    : formData.email && validation.email.isValid 
                      ? 'border-green-500/50' 
                      : 'border-gray-600/50'
                }`}
                placeholder="jan@example.com"
              />
              {formData.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.email.isValid ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
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
                onFocus={() => handleFieldFocus('password')}
                onBlur={handleFieldBlur}
                required
                className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 ${
                  formData.password && !validation.password.isValid 
                    ? 'border-red-500/50' 
                    : formData.password && validation.password.isValid 
                      ? 'border-green-500/50' 
                      : 'border-gray-600/50'
                }`}
                placeholder="Hasło"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {formData.password && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  {validation.password.isValid ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel wymagań email - tylko gdy pole jest aktywne */}
          {focusedField === 'email' && formData.email && (
            <div className="mt-2 p-2 bg-gray-800/20 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'text-green-400' : 'text-red-400'}`}>
                    Prawidłowy format email (np. jan@example.com)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.email.length <= 100 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.email.length <= 100 ? 'text-green-400' : 'text-red-400'}`}>
                    Maksymalnie 100 znaków
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Panel wymagań hasła - tylko gdy pole jest aktywne */}
          {focusedField === 'password' && formData.password && (
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <h4 className="text-xs font-medium text-gray-300 mb-2">
                Wymagania hasła:
              </h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {formData.password.length >= 6 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.password.length >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                    Minimum 6 znaków
                  </span>
                </div>
              </div>
            </div>
          )}

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
                  <span>Logowanie...</span>
                </div>
              ) : (
                'Zaloguj się'
              )}
            </DarkGlassButton>
          </div>
          
          <div className="text-center pt-2 space-y-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              Zapomniałeś hasła? <span className="text-blue-400 hover:text-blue-300">Zresetuj</span>
            </button>
            <br />
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
            >
              Nie masz konta? <span className="text-green-400 hover:text-green-300">Zarejestruj się</span>
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

          {/* Formularz resetowania hasła */}
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600/30"
            >
              <h3 className="text-sm font-medium text-gray-300 mb-3">Resetowanie hasła</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Wprowadź swój email"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm"
                />
                {forgotPasswordMessage && (
                  <p className={`text-xs ${forgotPasswordMessage.includes('wysłany') ? 'text-green-400' : 'text-red-400'}`}>
                    {forgotPasswordMessage}
                  </p>
                )}
                <div className="flex gap-2">
                  <DarkGlassButton
                    onClick={handleForgotPassword}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Wysyłanie...' : 'Wyślij email'}
                  </DarkGlassButton>
                  <DarkGlassButton
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordMessage('');
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Anuluj
                  </DarkGlassButton>
                </div>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </motion.div>
  );
};