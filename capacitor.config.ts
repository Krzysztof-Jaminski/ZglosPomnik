import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zglospomnik.app',
  appName: 'ZglosPomnik',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000'
    }
  },
  android: {
    icon: 'resources/android/icon/drawable-mdpi-icon.png',
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    icon: 'resources/ios/icon/icon-1024.png'
  },
  server: {
    androidScheme: 'http'
  }
};

export default config;
