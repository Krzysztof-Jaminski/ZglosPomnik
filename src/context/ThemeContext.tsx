import React, { createContext, useContext, useEffect, useState } from 'react';
import { SystemTheme } from '../plugins/SystemThemePlugin';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'auto';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'auto') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setActualTheme(systemTheme);
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateActualTheme);
      return () => mediaQuery.removeEventListener('change', updateActualTheme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', actualTheme === 'dark');
    
    // Update system UI colors based on theme
    const updateSystemUI = async () => {
      try {
        if (actualTheme === 'dark') {
          // Dark theme colors
          await SystemTheme.setStatusBarColor({ color: '#111827' }); // gray-900
          await SystemTheme.setNavigationBarColor({ color: '#111827' }); // gray-900
          await SystemTheme.setSystemUITheme({ isDark: true });
        } else {
          // Light theme colors
          await SystemTheme.setStatusBarColor({ color: '#ffffff' }); // white
          await SystemTheme.setNavigationBarColor({ color: '#ffffff' }); // white
          await SystemTheme.setSystemUITheme({ isDark: false });
        }
      } catch (error) {
        console.log('System UI update not available on this platform:', error);
      }
    };
    
    updateSystemUI();
  }, [theme, actualTheme]);

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};