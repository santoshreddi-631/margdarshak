import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { isSupabaseConfigured } from './config/supabase';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`Margdarshak Backend API Service Started Successfully`);
  logger.info(`Environment:       ${env.NODE_ENV}`);
  logger.info(`Listening on:      http://localhost:${env.PORT}`);
  logger.info(`Health check:      http://localhost:${env.PORT}/api/v1/health`);
  logger.info(`Supabase Auth:     ${isSupabaseConfigured() ? 'Connected' : 'Unconfigured (Development Fallback Active)'}`);
  logger.info(`Python Reco Svc:   ${env.RECOMMENDATION_SERVICE_URL}`);
  logger.info(`=======================================================`);
});

// Graceful shutdown handling
const handleGracefulShutdown = (signal: string) => {
  logger.info(`${signal} signal received. Closing HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if hanging
  setTimeout(() => {
    logger.error('Forcefully terminating process after shutdown timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export default server;
