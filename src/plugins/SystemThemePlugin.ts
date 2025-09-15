import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';

export interface SystemThemePlugin {
  setStatusBarColor(options: { color: string }): Promise<void>;
  setNavigationBarColor(options: { color: string }): Promise<void>;
  setSystemUITheme(options: { isDark: boolean }): Promise<void>;
}

class SystemThemePluginWeb implements SystemThemePlugin {
  async setStatusBarColor(options: { color: string }): Promise<void> {
    // Update theme-color meta tag for PWA
    this.updateThemeColorMeta(options.color);
  }

  async setNavigationBarColor(options: { color: string }): Promise<void> {
    // Update theme-color meta tag for PWA navigation bar
    this.updateThemeColorMeta(options.color);
  }

  async setSystemUITheme(options: { isDark: boolean }): Promise<void> {
    // Update status bar style for iOS PWA
    this.updateStatusBarStyle(options.isDark);
  }

  private updateThemeColorMeta(color: string): void {
    // Update theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = color;

    // Update msapplication-navbutton-color for Windows Phone
    let msNavButtonColor = document.querySelector('meta[name="msapplication-navbutton-color"]') as HTMLMetaElement;
    if (!msNavButtonColor) {
      msNavButtonColor = document.createElement('meta');
      msNavButtonColor.name = 'msapplication-navbutton-color';
      document.head.appendChild(msNavButtonColor);
    }
    msNavButtonColor.content = color;

    // Update msapplication-TileColor for Windows Phone
    let msTileColor = document.querySelector('meta[name="msapplication-TileColor"]') as HTMLMetaElement;
    if (!msTileColor) {
      msTileColor = document.createElement('meta');
      msTileColor.name = 'msapplication-TileColor';
      document.head.appendChild(msTileColor);
    }
    msTileColor.content = color;

    // Update CSS custom property for PWA navbar
    document.documentElement.style.setProperty('--pwa-navbar-color', color);
    
    // Force update body background for PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.body.style.backgroundColor = color;
    }

    // Update manifest theme_color if possible
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      // Note: We can't directly modify manifest.json, but we can update the meta tag
      // The manifest.json would need to be regenerated for a complete solution
    }
  }

  private updateStatusBarStyle(isDark: boolean): void {
    // Update Apple status bar style for iOS PWA
    let statusBarStyleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
    if (!statusBarStyleMeta) {
      statusBarStyleMeta = document.createElement('meta');
      statusBarStyleMeta.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(statusBarStyleMeta);
    }
    statusBarStyleMeta.content = isDark ? 'black-translucent' : 'default';
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
      // Use dedicated NavigationBar plugin
      const isDarkColor = options.color === '#000000' || options.color === '#111827';
      await NavigationBar.setNavigationBarColor({ 
        color: options.color,
        darkButtons: !isDarkColor // Invert logic: light background = dark buttons, dark background = light buttons
      });
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
