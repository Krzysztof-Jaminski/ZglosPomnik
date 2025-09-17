import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SystemTheme } from '../plugins/SystemThemePlugin';

export const useSystemTheme = (actualTheme: 'light' | 'dark') => {
  const location = useLocation();

  useEffect(() => {
    const updateSystemUI = async () => {
      try {
        const isLandingPage = location.pathname === '/' || location.pathname === '';
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
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
          statusBarColor = '#f9fafb'; // gray-50
          navigationBarColor = '#f9fafb'; // gray-50
        }
        
        // Special handling for PWA - force dark theme for landing page
        if (isPWA && isLandingPage) {
          shouldUseDarkTheme = true;
          statusBarColor = '#111827';
          navigationBarColor = '#111827';
        }
        
        await SystemTheme.setStatusBarColor({ color: statusBarColor });
        await SystemTheme.setNavigationBarColor({ color: navigationBarColor });
        await SystemTheme.setSystemUITheme({ isDark: shouldUseDarkTheme });
        
        // Additional PWA-specific updates
        if (isPWA) {
          // Force update for PWA
          document.body.style.backgroundColor = navigationBarColor;
          document.documentElement.style.backgroundColor = navigationBarColor;
        }
      } catch (error) {
        console.log('System UI update not available on this platform:', error);
      }
    };
    
    updateSystemUI();
  }, [actualTheme, location.pathname]);
};
