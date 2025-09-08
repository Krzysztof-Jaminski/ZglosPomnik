import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface SystemThemePlugin {
  setStatusBarColor(options: { color: string }): Promise<void>;
  setNavigationBarColor(options: { color: string }): Promise<void>;
  setSystemUITheme(options: { isDark: boolean }): Promise<void>;
}

class SystemThemePluginWeb implements SystemThemePlugin {
  async setStatusBarColor(_options: { color: string }): Promise<void> {
  }

  async setNavigationBarColor(_options: { color: string }): Promise<void> {
  }

  async setSystemUITheme(_options: { isDark: boolean }): Promise<void> {
  }
}

class SystemThemePluginNative implements SystemThemePlugin {
  async setStatusBarColor(options: { color: string }): Promise<void> {
    try {
      await StatusBar.setBackgroundColor({ color: options.color });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.error('Failed to set status bar color:', error);
    }
  }

  async setNavigationBarColor(options: { color: string }): Promise<void> {
    try {
      await StatusBar.setBackgroundColor({ color: options.color });
    } catch (error) {
      console.error('Failed to set navigation bar color:', error);
    }
  }

  async setSystemUITheme(options: { isDark: boolean }): Promise<void> {
    try {
      await StatusBar.setStyle({ 
        style: options.isDark ? Style.Dark : Style.Light 
      });
      
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      await StatusBar.show();
    } catch (error) {
      console.error('Failed to set system UI theme:', error);
    }
  }

}

export const SystemTheme = Capacitor.isNativePlatform() 
  ? new SystemThemePluginNative() 
  : new SystemThemePluginWeb();
