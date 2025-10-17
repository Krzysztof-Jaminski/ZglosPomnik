import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Phone, Check, X as XIcon } from 'lucide-react';
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
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validation, setValidation] = useState({
    firstName: { isValid: false, message: '' },
    lastName: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    phone: { isValid: false, message: '' },
    password: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false
    },
    passwordsMatch: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sprawdź wszystkie wymagane pola
    const requiredFieldsValid = validation.firstName.isValid && 
                               validation.lastName.isValid && 
                               validation.email.isValid &&
                               Object.values(validation.password).every(Boolean) &&
                               validation.passwordsMatch;
    
    // Telefon jest opcjonalny, więc nie blokuje rejestracji
    const phoneValid = validation.phone.isValid;
    
    if (!requiredFieldsValid) {
      alert('Proszę poprawić wszystkie błędy w wymaganych polach przed rejestracją');
      return;
    }
    
    if (!phoneValid) {
      alert('Proszę poprawić format numeru telefonu lub zostawić pole puste');
      return;
    }
    
    const userData: RegisterRequest = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone.trim()
    };
    
    onSubmit(userData);
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
      case 'firstName':
        const firstNameValid = value.trim().length >= 2 && value.trim().length <= 50;
        setValidation(prev => ({
          ...prev,
          firstName: {
            isValid: firstNameValid,
            message: value.trim().length === 0 
              ? 'Imię jest wymagane' 
              : !firstNameValid 
                ? 'Imię musi mieć od 2 do 50 znaków'
                : ''
          }
        }));
        break;
        
      case 'lastName':
        const lastNameValid = value.trim().length >= 2 && value.trim().length <= 50;
        setValidation(prev => ({
          ...prev,
          lastName: {
            isValid: lastNameValid,
            message: value.trim().length === 0 
              ? 'Nazwisko jest wymagane' 
              : !lastNameValid 
                ? 'Nazwisko musi mieć od 2 do 50 znaków'
                : ''
          }
        }));
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValid = emailRegex.test(value) && value.length <= 100;
        setValidation(prev => ({
          ...prev,
          email: {
            isValid: emailValid,
            message: value.trim().length === 0 
              ? 'Email jest wymagany' 
              : !emailValid 
                ? value.length > 100 
                  ? 'Email nie może mieć więcej niż 100 znaków'
                  : 'Nieprawidłowy format email'
                : ''
          }
        }));
        break;
        
      case 'phone':
        // Telefon jest opcjonalny, więc walidujemy tylko jeśli jest wypełniony
        const phoneRegex = /^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/;
        const phoneValid = value === '' || (phoneRegex.test(value) && value.length <= 20);
        
        let phoneMessage = '';
        if (value && !phoneValid) {
          if (value.length > 20) {
            phoneMessage = 'Numer telefonu nie może mieć więcej niż 20 znaków';
          } else if (!phoneRegex.test(value)) {
            phoneMessage = 'Nieprawidłowy format numeru telefonu';
          }
        }
        
        setValidation(prev => ({
          ...prev,
          phone: {
            isValid: phoneValid,
            message: phoneMessage
          }
        }));
        break;
        
      case 'password':
        validatePassword(value);
        break;
        
      case 'confirmPassword':
        validatePasswordMatch(formData.password, value);
        break;
    }
  };

  const validatePassword = (password: string) => {
    setValidation(prev => ({
      ...prev,
      password: {
        minLength: password.length >= 6 && password.length <= 100,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    }));
  };

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    const passwordsMatch = password === confirmPassword && password.length > 0;
    setValidation(prev => ({
      ...prev,
      passwordsMatch: passwordsMatch
    }));
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
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
                  onFocus={() => handleFieldFocus('firstName')}
                  onBlur={handleFieldBlur}
                  required
                  className={`w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm ${
                    formData.firstName && !validation.firstName.isValid 
                      ? 'border-red-500/50' 
                      : formData.firstName && validation.firstName.isValid 
                        ? 'border-green-500/50' 
                        : 'border-gray-600/50'
                  }`}
                  placeholder="Imię"
                />
                {formData.firstName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validation.firstName.isValid ? (
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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('lastName')}
                  onBlur={handleFieldBlur}
                  required
                  className={`w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm ${
                    formData.lastName && !validation.lastName.isValid 
                      ? 'border-red-500/50' 
                      : formData.lastName && validation.lastName.isValid 
                        ? 'border-green-500/50' 
                        : 'border-gray-600/50'
                  }`}
                  placeholder="Nazwisko"
                />
                {formData.lastName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validation.lastName.isValid ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <XIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
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
                onFocus={() => handleFieldFocus('email')}
                onBlur={handleFieldBlur}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm ${
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
                type={showPasswords.password ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleFieldFocus('password')}
                onBlur={handleFieldBlur}
                required
                className={`w-full pl-10 pr-12 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm ${
                  formData.password && !Object.values(validation.password).every(Boolean)
                    ? 'border-red-500/50' 
                    : formData.password && Object.values(validation.password).every(Boolean)
                      ? 'border-green-500/50' 
                      : 'border-gray-600/50'
                }`}
                placeholder="Hasło"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => handleFieldFocus('confirmPassword')}
                onBlur={handleFieldBlur}
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm ${
                  formData.confirmPassword && !validation.passwordsMatch
                    ? 'border-red-500/50' 
                    : formData.confirmPassword && validation.passwordsMatch
                      ? 'border-green-500/50' 
                      : 'border-gray-600/50'
                }`}
                placeholder="Potwierdź hasło"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                onFocus={() => handleFieldFocus('phone')}
                onBlur={handleFieldBlur}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 text-sm ${
                  formData.phone && !validation.phone.isValid 
                    ? 'border-red-500/50' 
                    : formData.phone && validation.phone.isValid 
                      ? 'border-green-500/50' 
                      : 'border-gray-600/50'
                }`}
                placeholder="+48 123 456 789 (opcjonalne)"
              />
              {formData.phone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.phone.isValid ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel wymagań imienia - tylko gdy pole jest aktywne */}
          {focusedField === 'firstName' && formData.firstName && (
            <div className="mt-2 p-2 bg-gray-800/20 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {formData.firstName.trim().length >= 2 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.firstName.trim().length >= 2 ? 'text-green-400' : 'text-red-400'}`}>
                    Minimum 2 znaki
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.firstName.trim().length <= 50 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.firstName.trim().length <= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    Maksymalnie 50 znaków
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Panel wymagań nazwiska - tylko gdy pole jest aktywne */}
          {focusedField === 'lastName' && formData.lastName && (
            <div className="mt-2 p-2 bg-gray-800/20 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {formData.lastName.trim().length >= 2 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.lastName.trim().length >= 2 ? 'text-green-400' : 'text-red-400'}`}>
                    Minimum 2 znaki
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.lastName.trim().length <= 50 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.lastName.trim().length <= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    Maksymalnie 50 znaków
                  </span>
                </div>
              </div>
            </div>
          )}

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

          {/* Panel wymagań telefonu - tylko gdy pole jest aktywne */}
          {focusedField === 'phone' && formData.phone && (
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <h4 className="text-xs font-medium text-gray-300 mb-2">
                Wymagania numeru telefonu:
              </h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-400">
                    Pole opcjonalne (można zostawić puste)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.phone.length <= 20 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${formData.phone.length <= 20 ? 'text-green-400' : 'text-red-400'}`}>
                    Maksymalnie 20 znaków
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(formData.phone) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${/^(\+48\s?)?(\d{3}\s?){2}\d{3}$|^\d{9}$|^(\+\d{1,3}\s?)?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/.test(formData.phone) ? 'text-green-400' : 'text-red-400'}`}>
                    Prawidłowy format: +48 123 456 789, 123456789, +1 234 567 890
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Panel walidacji hasła - tylko gdy pole jest aktywne */}
          {focusedField === 'password' && formData.password && (
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <h4 className="text-xs font-medium text-gray-300 mb-2">
                Wymagania hasła:
              </h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {validation.password.minLength ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${validation.password.minLength ? 'text-green-400' : 'text-red-400'}`}>
                    Od 6 do 100 znaków
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {validation.password.hasUppercase ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${validation.password.hasUppercase ? 'text-green-400' : 'text-red-400'}`}>
                    Co najmniej jedna wielka litera
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {validation.password.hasLowercase ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${validation.password.hasLowercase ? 'text-green-400' : 'text-red-400'}`}>
                    Co najmniej jedna mała litera
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {validation.password.hasNumber ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${validation.password.hasNumber ? 'text-green-400' : 'text-red-400'}`}>
                    Co najmniej jedna cyfra
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {validation.password.hasSpecialChar ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <XIcon className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${validation.password.hasSpecialChar ? 'text-green-400' : 'text-red-400'}`}>
                    Co najmniej jeden znak specjalny
                  </span>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2">
                    {validation.passwordsMatch ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${validation.passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                      Hasła są identyczne
                    </span>
                  </div>
                )}
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
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
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