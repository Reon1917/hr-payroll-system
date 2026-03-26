import { randomUUID } from 'node:crypto';
import type { Role } from '@hr-payroll/shared';
import { eq, sql } from 'drizzle-orm';
import { appEnv } from '../config/env';
import { db } from '../db';
import { employees, userProfiles } from '../db/schema';
import { appMemoryStore } from '../storage/memory-db';

interface SyncAppUserProfileInput {
  authUserId: string;
  email: string;
  role?: Role;
}

function emailMatches(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export async function syncAppUserProfile(
  input: SyncAppUserProfileInput,
): Promise<void> {
  const role = input.role ?? 'employee';
  const now = new Date();

  if (appEnv.storageDriver === 'memory') {
    const employee = appMemoryStore.employees.find((item) =>
      emailMatches(item.email, input.email),
    );
    const employeeId =
      employee &&
      (!employee.linkedAuthUserId ||
        employee.linkedAuthUserId === input.authUserId)
        ? employee.id
        : null;

    if (employee && employeeId && !employee.linkedAuthUserId) {
      employee.linkedAuthUserId = input.authUserId;
      employee.updatedAt = now;
    }

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

  const employeeId =
    employee &&
    (!employee.linkedAuthUserId ||
      employee.linkedAuthUserId === input.authUserId)
      ? employee.id
      : null;

  if (employee && employeeId && !employee.linkedAuthUserId) {
    await db
      .update(employees)
      .set({
        linkedAuthUserId: input.authUserId,
        updatedAt: now,
      })
      .where(eq(employees.id, employee.id));
  }

  await db
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
