import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { getEnv } from '../config/env';
import * as schema from './schema';

const sql = neon(getEnv('DATABASE_URL'));

export const db = drizzle({
  client: sql,
  schema,
});
