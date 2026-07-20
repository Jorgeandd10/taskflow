import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskflow.app',
  appName: 'TaskFlow',
  webDir: 'dist/taskflow/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#6366f1',
      showSpinner: false,
    },
  },
  // Android-specific configuration
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
