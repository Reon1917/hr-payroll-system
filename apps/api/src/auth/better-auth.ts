import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { toNodeHandler } from 'better-auth/node';
import { admin } from 'better-auth/plugins';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { appEnv } from '../config/env';
import { db } from '../db';
import * as schema from '../db/schema';
import { authMemoryStore } from '../storage/memory-db';
import { syncAppUserProfile } from './profile-sync';

const database =
  appEnv.storageDriver === 'memory'
    ? memoryAdapter(authMemoryStore)
    : drizzleAdapter(
        db ??
          (() => {
            throw new Error(
              'DATABASE_URL is required when APP_STORAGE_DRIVER=drizzle.',
            );
          })(),
        {
          provider: 'pg',
          schema,
        },
      );

export const auth = betterAuth({
  secret: appEnv.authSecret,
  baseURL: appEnv.authUrl,
  basePath: '/auth',
  trustedOrigins: [appEnv.frontendUrl],
  database,
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await syncAppUserProfile({
            authUserId: user.id,
            email: user.email,
            name: user.name,
            role: 'employee',
          });
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'employee',
      adminRoles: ['admin'],
    }),
  ],
});

const nodeHandler = toNodeHandler(auth);

export async function authHandler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await nodeHandler(req, res);
}
