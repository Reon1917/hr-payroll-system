import { randomUUID } from 'node:crypto';
import type { Role } from '@hr-payroll/shared';
import { eq, sql } from 'drizzle-orm';
import { appEnv } from '../config/env';
import { db } from '../db';
import { employees, userProfiles } from '../db/schema';
import { appMemoryStore } from '../storage/memory-db';
import type { CreateEmployeeInput, EmployeeEntity } from '../storage/entities';

interface SyncAppUserProfileInput {
  authUserId: string;
  email: string;
  name?: string;
  role?: Role;
}

function emailMatches(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toDemoSeed(authUserId: string): string {
  return authUserId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 12)
    .padEnd(12, '0');
}

function toDemoBankAccountNumber(authUserId: string): string {
  return Array.from(authUserId)
    .map((character) => String(character.charCodeAt(0) % 10))
    .join('')
    .slice(0, 10)
    .padEnd(10, '0');
}

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function deriveDemoFullName(input: SyncAppUserProfileInput): string {
  const explicitName = input.name?.trim();

  if (explicitName) {
    return explicitName;
  }

  const localPart = input.email.split('@')[0] ?? 'demo-user';
  const words = localPart.split(/[._-]+/).filter(Boolean);

  if (!words.length) {
    return 'Demo User';
  }

  return words.map(toTitleCase).join(' ');
}

function buildDemoEmployeeInput(
  input: SyncAppUserProfileInput,
  now: Date,
): CreateEmployeeInput {
  const fullName = deriveDemoFullName(input);

  return {
    employeeCode: `DEMO-${toDemoSeed(input.authUserId)}`,
    fullName,
    email: input.email,
    employmentStatus: 'active',
    workerType: 'thai',
    nationality: 'Thai',
    socialSecurityEnabled: true,
    hireDate: toDateString(now),
    department: 'Demo workspace',
    position: 'Demo employee',
    salaryType: 'monthly',
    baseRate: 30000,
    bankName: 'Demo Bank',
    bankAccountName: fullName,
    bankAccountNumber: toDemoBankAccountNumber(input.authUserId),
    linkedAuthUserId: input.authUserId,
  };
}

function createMemoryDemoEmployee(
  input: SyncAppUserProfileInput,
  now: Date,
): EmployeeEntity {
  const employee = buildDemoEmployeeInput(input, now);

  return {
    id: randomUUID(),
    ...employee,
    nationality: employee.nationality ?? null,
    nationalId: employee.nationalId ?? null,
    passportNumber: employee.passportNumber ?? null,
    taxId: employee.taxId ?? null,
    socialSecurityNumber: employee.socialSecurityNumber ?? null,
    socialSecurityEnabled: employee.socialSecurityEnabled ?? true,
    hireDate: employee.hireDate ?? null,
    workPermitNumber: employee.workPermitNumber ?? null,
    workPermitExpiryDate: employee.workPermitExpiryDate ?? null,
    visaType: employee.visaType ?? null,
    visaExpiryDate: employee.visaExpiryDate ?? null,
    linkedAuthUserId: employee.linkedAuthUserId ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function ensureLinkedMemoryEmployee(
  input: SyncAppUserProfileInput,
  now: Date,
): string | null {
  const employee = appMemoryStore.employees.find((item) =>
    emailMatches(item.email, input.email),
  );

  if (employee) {
    const employeeId =
      !employee.linkedAuthUserId ||
      employee.linkedAuthUserId === input.authUserId
        ? employee.id
        : null;

    if (employeeId && !employee.linkedAuthUserId) {
      employee.linkedAuthUserId = input.authUserId;
      employee.updatedAt = now;
    }

    return employeeId;
  }

  const demoEmployee = createMemoryDemoEmployee(input, now);
  appMemoryStore.employees.push(demoEmployee);
  return demoEmployee.id;
}

async function ensureLinkedDatabaseEmployee(
  input: SyncAppUserProfileInput,
  now: Date,
): Promise<string | null> {
  if (!db) {
    throw new Error(
      'DATABASE_URL is required when APP_STORAGE_DRIVER=drizzle.',
    );
  }

  const [employee] = await db
    .select({
      id: employees.id,
      linkedAuthUserId: employees.linkedAuthUserId,
    })
    .from(employees)
    .where(sql`lower(${employees.email}) = lower(${input.email})`)
    .limit(1);

  if (employee) {
    const employeeId =
      !employee.linkedAuthUserId ||
      employee.linkedAuthUserId === input.authUserId
        ? employee.id
        : null;

    if (employeeId && !employee.linkedAuthUserId) {
      await db
        .update(employees)
        .set({
          linkedAuthUserId: input.authUserId,
          updatedAt: now,
        })
        .where(eq(employees.id, employee.id));
    }

    return employeeId;
  }

  const [createdEmployee] = await db
    .insert(employees)
    .values(buildDemoEmployeeInput(input, now))
    .returning({ id: employees.id });

  return createdEmployee.id;
}

export async function syncAppUserProfile(
  input: SyncAppUserProfileInput,
): Promise<void> {
  const role = input.role ?? 'employee';
  const now = new Date();

  if (appEnv.storageDriver === 'memory') {
    const employeeId =
      role === 'employee' ? ensureLinkedMemoryEmployee(input, now) : null;

    const existingProfile = appMemoryStore.userProfiles.find(
      (profile) => profile.authUserId === input.authUserId,
    );

    if (existingProfile) {
      existingProfile.role = role;
      existingProfile.employeeId = employeeId;
      existingProfile.updatedAt = now;
      return;
    }

    appMemoryStore.userProfiles.push({
      id: randomUUID(),
      authUserId: input.authUserId,
      role,
      employeeId,
      createdAt: now,
      updatedAt: now,
    });
    return;
  }

  const employeeId =
    role === 'employee'
      ? await ensureLinkedDatabaseEmployee(input, now)
      : null;
  const database = db;

  if (!database) {
    throw new Error(
      'DATABASE_URL is required when APP_STORAGE_DRIVER=drizzle.',
    );
  }

  await database
    .insert(userProfiles)
    .values({
      authUserId: input.authUserId,
      role,
      employeeId,
    })
    .onConflictDoUpdate({
      target: userProfiles.authUserId,
      set: {
        role,
        employeeId,
        updatedAt: now,
      },
    });
}
