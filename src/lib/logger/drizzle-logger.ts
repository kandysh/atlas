import { Logger } from 'drizzle-orm/logger';
import pino from 'pino';

export class DrizzleLogger implements Logger {
  constructor(private logger: pino.Logger) {}

  logQuery(query: string, params: unknown[]): void {
    this.logger.trace({ query, params });
  }
}
