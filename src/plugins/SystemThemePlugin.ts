import { Capacitor } from '@capacitor/core';

export interface SystemThemePlugin {
  setStatusBarColor(options: { color: string }): Promise<void>;
  setNavigationBarColor(options: { color: string }): Promise<void>;
  setSystemUITheme(options: { isDark: boolean }): Promise<void>;
}

class SystemThemePluginWeb implements SystemThemePlugin {
  async setStatusBarColor(options: { color: string }): Promise<void> {
    // Web doesn't have system bars
    console.log('Web: Status bar color would be set to', options.color);
  }

  async setNavigationBarColor(options: { color: string }): Promise<void> {
    // Web doesn't have system bars
    console.log('Web: Navigation bar color would be set to', options.color);
  }

  async setSystemUITheme(options: { isDark: boolean }): Promise<void> {
    // Web doesn't have system bars
    console.log('Web: System UI theme would be set to', options.isDark ? 'dark' : 'light');
  }
}

class SystemThemePluginNative implements SystemThemePlugin {
  async setStatusBarColor(options: { color: string }): Promise<void> {
    const { SystemThemePlugin } = await import('@capacitor/core');
    return (SystemThemePlugin as any).setStatusBarColor(options);
  }

  async setNavigationBarColor(options: { color: string }): Promise<void> {
    const { SystemThemePlugin } = await import('@capacitor/core');
    return (SystemThemePlugin as any).setNavigationBarColor(options);
  }

  async setSystemUITheme(options: { isDark: boolean }): Promise<void> {
    const { SystemThemePlugin } = await import('@capacitor/core');
    return (SystemThemePlugin as any).setSystemUITheme(options);
  }
}

export const SystemTheme = Capacitor.isNativePlatform() 
  ? new SystemThemePluginNative() 
  : new SystemThemePluginWeb();
