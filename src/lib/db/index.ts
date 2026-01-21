import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DrizzleLogger } from '../logger/drizzle-logger';
import { logger } from '../logger/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema, logger: new DrizzleLogger(logger) });

export * from './schema';
