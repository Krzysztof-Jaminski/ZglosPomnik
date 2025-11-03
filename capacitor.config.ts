import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zglospomnik.app',
  appName: 'ZglosPomnik',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000'
    },
    Filesystem: {
      iosIsDocumentPickerEnabled: false
    },
    Share: {}
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'automatic'
  },
  server: {
    androidScheme: 'http'
  }
};

export default config;
