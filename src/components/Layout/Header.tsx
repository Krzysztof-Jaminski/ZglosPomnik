import React from 'react';
import { Trees as Tree, Moon, Sun, Monitor, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { GlassButton } from '../UI/GlassButton';

export const Header: React.FC = () => {
  const { theme, actualTheme, setTheme } = useTheme();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Monitor
  };

  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 h-14 sm:h-18 w-full">
      <div className="w-full px-3">
        <div className="flex justify-between items-center h-14 sm:h-18 w-full">
          <div className="flex items-center space-x-4 focus:outline-none focus:ring-0 focus:ring-offset-0">
            <Link to="/map" className="flex items-center space-x-1 sm:space-x-2 focus:outline-none focus:ring-0 focus:ring-offset-0">
              <img 
                src="/green_tree_icon.svg" 
                alt="ZgłośPomnik" 
                className="w-12 h-12 sm:w-10 sm:h-10"
              />
              <h1 className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 focus:outline-none focus:ring-0 focus:ring-offset-0">
                ZgłośPomnik
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center justify-end flex-1 space-x-2">
            <GlassButton
              onClick={cycleTheme}
              size="xs"
              variant="secondary"
              title={`Current theme: ${theme}`}
              icon={ThemeIcon}
            >
              <span className="sr-only">Toggle theme</span>
            </GlassButton>
            <Link to="/profile" className="focus:outline-none">
              <GlassButton
                size="xs"
                variant="secondary"
                title="Profil użytkownika"
                icon={User}
              >
                <span className="sr-only">Profil</span>
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};