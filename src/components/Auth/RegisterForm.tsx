import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from '../UI/GlassButton';
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
    <div className="p-4">
      <h2 className="font-bold text-green-200 mb-3 text-center text-lg">
        Zarejestruj się
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block font-medium text-green-300 mb-1" style={{ fontSize: '10px' }}>
            Imię
          </label>
          <div className="relative">
            <User className="absolute left-2 top-1.5 w-3 h-3 text-green-400" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full pl-7 pr-3 py-1 border border-green-400/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-900/30 text-green-100 placeholder-green-400"
              style={{ fontSize: '10px' }}
              placeholder="Jan"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-green-300 mb-1" style={{ fontSize: '10px' }}>
            Nazwisko
          </label>
          <div className="relative">
            <User className="absolute left-2 top-1.5 w-3 h-3 text-green-400" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full pl-7 pr-3 py-1 border border-green-400/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-900/30 text-green-100 placeholder-green-400"
              style={{ fontSize: '10px' }}
              placeholder="Kowalski"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-green-300 mb-1" style={{ fontSize: '10px' }}>
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-2 top-1.5 w-3 h-3 text-green-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full pl-7 pr-3 py-1 border border-green-400/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-900/30 text-green-100 placeholder-green-400"
              style={{ fontSize: '10px' }}
              placeholder="jan@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-green-300 mb-1" style={{ fontSize: '10px' }}>
            Hasło
          </label>
          <div className="relative">
            <Lock className="absolute left-2 top-1.5 w-3 h-3 text-green-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full pl-7 pr-8 py-1 border border-green-400/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-900/30 text-green-100 placeholder-green-400"
              style={{ fontSize: '10px' }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1.5 text-green-400 hover:text-green-300"
            >
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-green-300 mb-1" style={{ fontSize: '10px' }}>
            Potwierdź hasło
          </label>
          <div className="relative">
            <Lock className="absolute left-2 top-1.5 w-3 h-3 text-green-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full pl-7 pr-3 py-1 border border-green-400/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-900/30 text-green-100 placeholder-green-400"
              style={{ fontSize: '10px' }}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-green-300 mb-1" style={{ fontSize: '10px' }}>
            Telefon
          </label>
          <div className="relative">
            <Phone className="absolute left-2 top-1.5 w-3 h-3 text-green-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full pl-7 pr-3 py-1 border border-green-400/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-900/30 text-green-100 placeholder-green-400"
              style={{ fontSize: '10px' }}
              placeholder="+48 123 456 789"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <GlassButton
            type="button"
            onClick={onClose}
            variant="secondary"
            size="xs"
            className="flex-1"
          >
            <span style={{ fontSize: '10px' }}>Anuluj</span>
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            size="xs"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-1">
                <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                <span style={{ fontSize: '10px' }}>Rejestracja...</span>
              </div>
            ) : (
              <span style={{ fontSize: '10px' }}>Zarejestruj</span>
            )}
          </GlassButton>
        </div>
        
        <div className="text-center pt-2 space-y-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-green-400 hover:text-green-300 block w-full"
            style={{ fontSize: '10px' }}
          >
            Masz już konto? Zaloguj się
          </button>
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="text-slate-400 hover:text-slate-300 block w-full"
              style={{ fontSize: '10px' }}
            >
              ← Powrót do menu
            </button>
          )}
        </div>
      </form>
    </div>
  );
};