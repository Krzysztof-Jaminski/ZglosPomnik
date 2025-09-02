import React, { useState } from 'react';
import { Trees, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/UI/GlassButton';

export const AuthPage: React.FC = () => {
  const { mode } = useParams<{ mode: 'login' | 'register' }>();
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to map after successful auth
    navigate('/map');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <Trees className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">TreeMapper</span>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-green-800 dark:text-gray-300 mb-2">
                  Imię i nazwisko
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="Jan Kowalski"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-green-800 dark:text-gray-300 mb-2">
                Adres email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="jan@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 dark:text-gray-300 mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-green-800 dark:text-gray-300 mb-2">
                  Potwierdź hasło
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              <GlassButton
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="md"
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isLogin ? 'Logowanie...' : 'Tworzenie konta...'}</span>
                  </div>
                ) : (
                  isLogin ? 'Zaloguj się' : 'Utwórz konto'
                )}
              </GlassButton>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}
              {' '}
              <Link
                to={isLogin ? '/auth/register' : '/auth/login'}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
              >
                {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">lub</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <GlassButton variant="secondary" size="md" className="w-full">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Kontynuuj z Google</span>
              </GlassButton>

              <Link
                to="/map"
              >
                <GlassButton variant="secondary" size="md" className="w-full">
                  Kontynuuj bez logowania
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};