import React, { useState } from 'react';
import { Trees } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <Trees className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">ZgłośPomnik</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-green-900 dark:text-white mb-2">
            {isLogin ? 'Zaloguj się' : 'Utwórz konto'}
          </h2>
          <p className="text-green-800 dark:text-gray-400">
            {isLogin 
              ? 'Witaj ponownie! Zaloguj się do swojego konta.'
              : 'Dołącz do społeczności ekologów chroniących drzewa.'
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};