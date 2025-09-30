import React from 'react';
import { Moon, Sun, Monitor, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { triggerLightHaptic } = useHapticFeedback();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Monitor
  };

  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    triggerLightHaptic();
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 h-10 sm:h-12 w-full">
      <div className="w-full">
        <div className="flex justify-between items-center h-10 sm:h-12 w-full">
          <div className="flex items-center space-x-2 focus:outline-none focus:ring-0 focus:ring-offset-0 pl-2">
            <Link to="/map" className="flex items-center space-x-1 focus:outline-none focus:ring-0 focus:ring-offset-0">
              <img 
                src="/logo.png" 
                alt="ZgłośPomnik" 
                className="w-8 h-8 sm:w-7 sm:h-7"
              />
              <h1 className="text-sm sm:text-lg font-bold focus:outline-none focus:ring-0 focus:ring-offset-0 -mt-0.5" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                <span className="text-blue-600 dark:text-blue-500">Zgłoś</span><span className="text-green-600 dark:text-green-400">Pomnik</span>
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center justify-end flex-1 space-x-2 pr-2">
            <button
              onClick={cycleTheme}
              title={`Current theme: ${theme}`}
              className="flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <ThemeIcon className="w-5 h-5" />
              <span className="sr-only">Toggle theme</span>
            </button>
            <Link to="/profile" className="focus:outline-none">
              <button
                title="Profil użytkownika"
                className="flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <User className="w-5 h-5" />
                <span className="sr-only">Profil</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};