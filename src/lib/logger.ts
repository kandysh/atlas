import pino from 'pino';

// Create logger instance with pretty printing in development
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

// Export a function to create child loggers with context
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
