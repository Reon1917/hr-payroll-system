export function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value ? value : undefined;
}

const inferredStorageDriver =
  process.env.NODE_ENV === 'test'
    ? 'memory'
    : process.env.DATABASE_URL
      ? 'drizzle'
      : 'memory';

const storageDriver =
  (process.env.APP_STORAGE_DRIVER as 'drizzle' | 'memory' | undefined) ??
  inferredStorageDriver;

export const appEnv = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  authUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  authSecret: process.env.BETTER_AUTH_SECRET ?? 'dev-secret-change-me',
  storageDriver,
  autoSeed:
    process.env.APP_AUTO_SEED === undefined
      ? process.env.NODE_ENV === 'test' || storageDriver === 'memory'
      : process.env.APP_AUTO_SEED === 'true',
  demoAdminEmail: process.env.DEMO_ADMIN_EMAIL ?? 'admin@company.test',
  demoAdminPassword: process.env.DEMO_ADMIN_PASSWORD ?? 'Admin123!',
  demoEmployeeEmail: process.env.DEMO_EMPLOYEE_EMAIL ?? 'employee@company.test',
  demoEmployeePassword: process.env.DEMO_EMPLOYEE_PASSWORD ?? 'Employee123!',
};
