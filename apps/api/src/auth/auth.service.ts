import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { sql } from 'drizzle-orm';
import { appEnv } from '../config/env';
import { db } from '../db';
import { authMemoryStore } from '../storage/memory-db';
import { auth } from './better-auth';
import type { AuthSession } from '../types/auth';

type AuthHeaders = globalThis.Headers;

@Injectable()
export class AuthService {
  async getSessionFromRequest(request: Request): Promise<AuthSession | null> {
    return this.getSessionFromHeaders(fromNodeHeaders(request.headers));
  }

  async getSessionFromHeaders(
    headers: AuthHeaders,
  ): Promise<AuthSession | null> {
    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      return null;
    }

    return session as AuthSession;
  }

  async signUpUser(input: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'employee';
  }): Promise<{ user: { id: string; email: string; name: string } }> {
    const result = await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
    });

    if (input.role === 'admin') {
      await this.setAuthUserRole(result.user.id, 'admin');
    }

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    };
  }

  async createUserAsAdmin(
    request: Request,
    input: {
      email: string;
      password: string;
      name: string;
      role: 'employee';
    },
  ): Promise<{ user: { id: string; email: string; name: string } }> {
    const { role: _role, ...body } = input;

    const result = await auth.api.createUser({
      headers: fromNodeHeaders(request.headers),
      body,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    };
  }

  async resetUserPasswordAsAdmin(
    request: Request,
    input: {
      userId: string;
      newPassword: string;
    },
  ): Promise<void> {
    await auth.api.setUserPassword({
      headers: fromNodeHeaders(request.headers),
      body: input,
    });
  }

  async setAuthUserRole(
    userId: string,
    role: 'admin' | 'employee',
  ): Promise<void> {
    if (appEnv.storageDriver === 'memory') {
      const users = authMemoryStore.user ?? [];
      const user = users.find((item) => item.id === userId);

      if (user) {
        user.role = role;
      }

      return;
    }

    if (!db) {
      throw new Error(
        'DATABASE_URL is required when APP_STORAGE_DRIVER=drizzle.',
      );
    }

    await db.execute(
      sql`update "user" set "role" = ${role} where "id" = ${userId}`,
    );
  }
}
