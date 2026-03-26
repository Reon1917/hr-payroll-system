import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getOptionalEnv } from '../config/env';
import * as schema from './schema';

const databaseUrl = getOptionalEnv('DATABASE_URL');

function shouldUseSsl(connectionString: string): boolean {
  return !connectionString.includes('sslmode=disable');
}

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: shouldUseSsl(databaseUrl)
        ? { rejectUnauthorized: false }
        : undefined,
    })
  : null;

export const db = databaseUrl
  ? drizzle({
      client: pool!,
      schema,
    })
  : null;
