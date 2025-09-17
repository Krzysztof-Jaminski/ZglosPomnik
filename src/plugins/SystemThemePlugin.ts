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
    // Update Android Chrome navigation bar color
    this.updateAndroidNavigationBarColor(options.color);
    // Additional PWA-specific updates
    this.updatePWANavigationBar(options.color);
  }

  async setSystemUITheme(options: { isDark: boolean }): Promise<void> {
    // Update status bar style for iOS PWA
    this.updateStatusBarStyle(options.isDark);
  }

  private updateThemeColorMeta(color: string): void {
    // Update theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = color;
    
    // Update media-specific theme-color meta tags
    this.updateMediaThemeColorMeta();

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
    document.documentElement.style.setProperty('--android-navbar-color', color);
    
    // Force update body background for PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.body.style.backgroundColor = color;
      document.documentElement.style.backgroundColor = color;
      
      // Force update for PWA
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = color;
      }
    }

    // Update manifest theme_color dynamically
    this.updateManifestThemeColor(color);
    
    // Force update body background for Android Chrome
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.style.backgroundColor = color;
      document.documentElement.style.backgroundColor = color;
    }
  }

  private updateAndroidNavigationBarColor(color: string): void {
    // Update Android Chrome navigation bar color using viewport-fit and CSS
    // This works for PWA and web apps in Chrome on Android
    
    // Set CSS custom property for navigation bar color
    document.documentElement.style.setProperty('--android-navbar-color', color);
    
    // Update viewport meta tag to include viewport-fit=cover for better control
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewportMeta) {
      let content = viewportMeta.content;
      if (!content.includes('viewport-fit=cover')) {
        content += ', viewport-fit=cover';
        viewportMeta.content = content;
      }
    }
    
    // Add CSS for Android navigation bar
    this.updateAndroidNavigationBarCSS(color);
    
    // Force update body background for Android Chrome
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.style.backgroundColor = color;
      document.documentElement.style.backgroundColor = color;
    }
    
    // Additional Android Chrome specific updates
    this.updateAndroidChromeSpecific(color);
  }

  private updateAndroidNavigationBarCSS(color: string): void {
    // Remove existing Android navbar CSS if it exists
    const existingStyle = document.getElementById('android-navbar-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style element for Android navigation bar
    const style = document.createElement('style');
    style.id = 'android-navbar-style';
    style.textContent = `
      /* Android Chrome navigation bar styling */
      @media screen and (display-mode: standalone) {
        body {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Force Android navigation bar color */
        html {
          background-color: ${color} !important;
        }
        
        body {
          background-color: ${color} !important;
        }
        
        /* PWA specific styling for Android */
        @supports (padding: max(0px)) {
          body {
            padding-bottom: max(env(safe-area-inset-bottom), 0px);
          }
        }
      }
      
      /* Additional Android Chrome specific styling */
      @media screen and (max-width: 768px) {
        html {
          background-color: ${color};
        }
        
        body {
          background-color: ${color};
        }
        
        /* Force Android navigation bar color in web view */
        @supports (padding: env(safe-area-inset-bottom)) {
          body {
            padding-bottom: env(safe-area-inset-bottom);
            background-color: ${color} !important;
          }
        }
      }
      
      /* Additional Android Chrome styling for better navigation bar control */
      @media screen and (max-width: 768px) and (orientation: portrait) {
        /* Force full viewport coverage for Android Chrome */
        html, body {
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile browsers */
          background-color: ${color} !important;
        }
        
        /* Ensure the root element also has the correct background */
        #root {
          background-color: ${color};
          min-height: 100vh;
          min-height: 100dvh;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  private updateMediaThemeColorMeta(): void {
    // Update dark theme meta tag - always use dark color for dark theme
    let darkThemeMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]') as HTMLMetaElement;
    if (!darkThemeMeta) {
      darkThemeMeta = document.createElement('meta');
      darkThemeMeta.name = 'theme-color';
      darkThemeMeta.media = '(prefers-color-scheme: dark)';
      document.head.appendChild(darkThemeMeta);
    }
    darkThemeMeta.content = '#111827'; // Always dark for dark theme
    
    // Update light theme meta tag - always use light color for light theme
    let lightThemeMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]') as HTMLMetaElement;
    if (!lightThemeMeta) {
      lightThemeMeta = document.createElement('meta');
      lightThemeMeta.name = 'theme-color';
      lightThemeMeta.media = '(prefers-color-scheme: light)';
      document.head.appendChild(lightThemeMeta);
    }
    lightThemeMeta.content = '#f9fafb'; // Always light for light theme
  }

  private updateManifestThemeColor(color: string): void {
    // Update manifest theme_color by creating a new manifest link with updated content
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      // Create a new manifest with updated theme_color
      const manifest = {
        name: "Zgłoś Pomnik",
        short_name: "ZgłośPomnik",
        description: "ZgłośPomnik",
        theme_color: color,
        background_color: color === '#111827' ? '#111827' : '#f9fafb',
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        display_override: ["standalone", "minimal-ui"],
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ],
        categories: ["productivity", "utilities"],
        lang: "pl",
        dir: "ltr"
      };
      
      // Create a blob URL for the updated manifest
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(manifestBlob);
      
      // Update the manifest link
      manifestLink.href = manifestURL;
    }
  }

  private updateAndroidChromeSpecific(color: string): void {
    // Additional Android Chrome specific updates for better navigation bar control
    
    // Update mobile-web-app-status-bar-style for Android Chrome
    let mobileStatusBarStyle = document.querySelector('meta[name="mobile-web-app-status-bar-style"]') as HTMLMetaElement;
    if (!mobileStatusBarStyle) {
      mobileStatusBarStyle = document.createElement('meta');
      mobileStatusBarStyle.name = 'mobile-web-app-status-bar-style';
      document.head.appendChild(mobileStatusBarStyle);
    }
    mobileStatusBarStyle.content = color === '#111827' ? 'black-translucent' : 'default';
    
    // Force update for Android Chrome
    if (window.matchMedia('(max-width: 768px)').matches) {
      // Update root element background
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = color;
      }
      
      // Force repaint
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
      
      // Additional Android Chrome specific styling
      this.forceAndroidChromeUpdate(color);
    }
  }

  private forceAndroidChromeUpdate(color: string): void {
    // Force Android Chrome to update navigation bar color
    // This is a workaround for Android Chrome's limited support
    
    // Update all possible elements that might affect the navigation bar
    document.documentElement.style.setProperty('--theme-color', color);
    document.documentElement.style.setProperty('--background-color', color);
    
    // Force update viewport
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewport) {
      const currentContent = viewport.content;
      viewport.content = currentContent + ';';
      setTimeout(() => {
        viewport.content = currentContent;
      }, 10);
    }
  }

  private updatePWANavigationBar(color: string): void {
    // Additional PWA-specific updates for navigation bar
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isPWA) {
      // Force update all possible elements
      document.body.style.backgroundColor = color;
      document.documentElement.style.backgroundColor = color;
      
      // Update root element
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = color;
      }
      
      // Force repaint
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
      
      // Update CSS variables
      document.documentElement.style.setProperty('--pwa-navbar-color', color);
      document.documentElement.style.setProperty('--android-navbar-color', color);
      
      // Additional PWA-specific meta tag updates
      this.updatePWAMetaTags(color);
    }
  }

  private updatePWAMetaTags(color: string): void {
    // Update PWA-specific meta tags
    const metaTags = [
      'theme-color',
      'msapplication-navbutton-color',
      'msapplication-TileColor',
      'mobile-web-app-status-bar-style'
    ];
    
    metaTags.forEach(tagName => {
      let meta = document.querySelector(`meta[name="${tagName}"]:not([media])`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = tagName;
        document.head.appendChild(meta);
      }
      
      if (tagName === 'mobile-web-app-status-bar-style') {
        meta.content = color === '#111827' ? 'black-translucent' : 'default';
      } else {
        meta.content = color;
      }
    });
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
