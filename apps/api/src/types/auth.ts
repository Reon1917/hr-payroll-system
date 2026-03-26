import type { CurrentUser, Role } from '@hr-payroll/shared';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role?: Role;
}

export interface AuthSession {
  user: AuthSessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}

export interface RequestActor extends CurrentUser {}
