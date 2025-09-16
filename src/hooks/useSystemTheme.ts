import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SystemTheme } from '../plugins/SystemThemePlugin';

export const useSystemTheme = (actualTheme: 'light' | 'dark') => {
  const location = useLocation();

  useEffect(() => {
    const updateSystemUI = async () => {
      try {
        const isLandingPage = location.pathname === '/';
        let shouldUseDarkTheme = actualTheme === 'dark';
        let statusBarColor = '#111827'; // gray-900
        let navigationBarColor = '#111827'; // gray-900
        
        // Landing page always uses dark theme
        if (isLandingPage) {
          shouldUseDarkTheme = true;
          statusBarColor = '#111827'; // gray-900
          navigationBarColor = '#111827'; // gray-900
        } else if (actualTheme === 'dark') {
          // Dark theme colors
          statusBarColor = '#111827'; // gray-900
          navigationBarColor = '#111827'; // gray-900
        } else {
          // Light theme colors
          statusBarColor = '#ffffff'; // white
          navigationBarColor = '#ffffff'; // white
        }
        
        await SystemTheme.setStatusBarColor({ color: statusBarColor });
        await SystemTheme.setNavigationBarColor({ color: navigationBarColor });
        await SystemTheme.setSystemUITheme({ isDark: shouldUseDarkTheme });
      } catch (error) {
        console.log('System UI update not available on this platform:', error);
      }
    };
    
    updateSystemUI();
  }, [actualTheme, location.pathname]);
};
