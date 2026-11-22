type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatLog = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  const tag = `[${timestamp}] [${level.toUpperCase()}]`;
  if (meta !== undefined) {
    return `${tag} ${message} ${typeof meta === 'object' ? JSON.stringify(meta) : meta}`;
  }
  return `${tag} ${message}`;
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(formatLog('info', message, meta));
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(formatLog('warn', message, meta));
  },
  error: (message: string, meta?: unknown) => {
    console.error(formatLog('error', message, meta));
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('debug', message, meta));
    }
  },
};
