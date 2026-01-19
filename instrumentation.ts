export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('pino');
    if (process.env.NODE_ENV === 'development') await import('pino-pretty');
    // @ts-expect-error next-logger has no type declarations
    await import('next-logger');
  }
}
