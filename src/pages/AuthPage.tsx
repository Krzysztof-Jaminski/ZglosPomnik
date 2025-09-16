import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';

export const AuthPage: React.FC = () => {
  const { mode } = useParams<{ mode: 'login' | 'register' }>();
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const isLogin = mode === 'login';
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: any) => {
    try {
      setError(null);
      await login(credentials);
      navigate('/map');
    } catch (error: any) {
      setError(error.message || 'Błąd logowania');
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      setError(null);
      await register(userData);
      navigate('/map');
    } catch (error: any) {
      setError(error.message || 'Błąd rejestracji');
    }
  };

  const handleContinueWithoutLogin = () => {
    // Przejdź do mapy bez logowania - aplikacja będzie używać mock data
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="text-center">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              <span className="text-blue-400">Zgłoś</span><span className="text-green-400">Pomnik</span>
            </span>
          </div>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-xl"
          >
            <p className="text-sm text-red-300 text-center">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        {isLogin ? (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={() => navigate('/auth/register')}
            onClose={() => navigate('/')}
            isLoading={isLoading}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => navigate('/auth/login')}
            onClose={() => navigate('/')}
            isLoading={isLoading}
          />
        )}

        {/* Continue without login button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">lub</span>
            </div>
          </div>
          
          <button
            onClick={handleContinueWithoutLogin}
            className="mt-4 w-full flex justify-center py-3 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white transition-all duration-200 backdrop-blur-sm"
          >
            Kontynuuj bez logowania
          </button>
          
          <p className="mt-2 text-xs text-gray-500 text-center">
            Aplikacja będzie działać z przykładowymi danymi
          </p>
        </motion.div>
      </div>
    </div>
  );
};