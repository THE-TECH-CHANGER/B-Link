import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thetechchanger.blink',
  appName: 'B-Link',
  webDir: 'out',
  server: {
    url: 'https://THE-TECH-CHANGER.github.io/B-Link',
    cleartext: true
  }
};

export default config;
