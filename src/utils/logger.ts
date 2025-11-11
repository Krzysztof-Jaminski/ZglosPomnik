const envFlag = (import.meta.env.VITE_ENV || import.meta.env.VITE_APP_ENV || '').toLowerCase();
const isDevelopment = envFlag === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('DEV:', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('DEV:', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error('DEV:', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('DEV:', ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug('DEV:', ...args);
    }
  },
};


