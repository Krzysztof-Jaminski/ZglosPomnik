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
    <div className="p-4">
      <h2 className="font-bold text-green-200 mb-3 text-center text-lg">
        Zaloguj się
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block font-medium text-green-300 mb-2 text-sm">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-green-400" />
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
                <span style={{ fontSize: '10px' }}>Logowanie...</span>
              </div>
            ) : (
              <span style={{ fontSize: '10px' }}>Zaloguj</span>
            )}
          </GlassButton>
        </div>
        
        <div className="text-center pt-2 space-y-2">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-green-400 hover:text-green-300 block w-full"
            style={{ fontSize: '10px' }}
          >
            Nie masz konta? Zarejestruj się
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