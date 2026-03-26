import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const money = (name: string) =>
  numeric(name, { precision: 12, scale: 2, mode: 'number' });

const quantity = (name: string) =>
  numeric(name, { precision: 10, scale: 2, mode: 'number' });

export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role').notNull().default('employee'),
    banned: boolean('banned').notNull().default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    roleIndex: index('user_role_idx').on(table.role),
  }),
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    impersonatedBy: text('impersonated_by'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIndex: index('session_user_id_idx').on(table.userId),
    expiresAtIndex: index('session_expires_at_idx').on(table.expiresAt),
  }),
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    idToken: text('id_token'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIndex: index('account_user_id_idx').on(table.userId),
    providerAccountIndex: uniqueIndex('account_provider_account_idx').on(
      table.providerId,
      table.accountId,
    ),
  }),
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    identifierIndex: index('verification_identifier_idx').on(table.identifier),
    expiresAtIndex: index('verification_expires_at_idx').on(table.expiresAt),
  }),
);

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    authUserId: text('auth_user_id').notNull().unique(),
    role: text('role').notNull(),
    employeeId: uuid('employee_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    employeeIdIndex: uniqueIndex('user_profiles_employee_id_idx').on(
      table.employeeId,
    ),
  }),
);

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeCode: text('employee_code').notNull().unique(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    employmentStatus: text('employment_status').notNull(),
    workerType: text('worker_type').notNull().default('thai'),
    nationality: text('nationality'),
    nationalId: text('national_id'),
    passportNumber: text('passport_number'),
    taxId: text('tax_id'),
    socialSecurityNumber: text('social_security_number'),
    socialSecurityEnabled: boolean('social_security_enabled')
      .notNull()
      .default(true),
    hireDate: date('hire_date', { mode: 'string' }),
    department: text('department').notNull(),
    position: text('position').notNull(),
    salaryType: text('salary_type').notNull(),
    baseRate: money('base_rate').notNull(),
    bankName: text('bank_name').notNull(),
    bankAccountName: text('bank_account_name').notNull(),
    bankAccountNumber: text('bank_account_number').notNull(),
    workPermitNumber: text('work_permit_number'),
    workPermitExpiryDate: date('work_permit_expiry_date', { mode: 'string' }),
    visaType: text('visa_type'),
    visaExpiryDate: date('visa_expiry_date', { mode: 'string' }),
    linkedAuthUserId: text('linked_auth_user_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    statusIndex: index('employees_status_idx').on(table.employmentStatus),
    linkedAuthUserIdIndex: uniqueIndex('employees_linked_auth_idx').on(
      table.linkedAuthUserId,
    ),
  }),
);

export const payPeriods = pgTable(
  'pay_periods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }).notNull(),
    paymentDate: date('payment_date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    startDateIndex: index('pay_periods_start_date_idx').on(table.startDate),
  }),
);

export const payrollRecords = pgTable(
  'payroll_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    payPeriodId: uuid('pay_period_id')
      .notNull()
      .references(() => payPeriods.id),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id),
    employeeCodeSnapshot: text('employee_code_snapshot').notNull(),
    employeeNameSnapshot: text('employee_name_snapshot').notNull(),
    employeeEmailSnapshot: text('employee_email_snapshot').notNull(),
    departmentSnapshot: text('department_snapshot').notNull(),
    positionSnapshot: text('position_snapshot').notNull(),
    salaryTypeSnapshot: text('salary_type_snapshot').notNull(),
    baseRateSnapshot: money('base_rate_snapshot').notNull(),
    payUnits: quantity('pay_units').notNull().default(0),
    basePay: money('base_pay').notNull().default(0),
    additionsTotal: money('additions_total').notNull().default(0),
    deductionsTotal: money('deductions_total').notNull().default(0),
    netPay: money('net_pay').notNull().default(0),
    status: text('status').notNull().default('draft'),
    paymentDate: date('payment_date', { mode: 'string' }),
    paymentNote: text('payment_note'),
    paymentReference: text('payment_reference'),
    createdByUserId: text('created_by_user_id').notNull(),
    updatedByUserId: text('updated_by_user_id').notNull(),
    approvedByUserId: text('approved_by_user_id'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    paidByUserId: text('paid_by_user_id'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    cancelledByUserId: text('cancelled_by_user_id'),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    reopenedByUserId: text('reopened_by_user_id'),
    reopenedAt: timestamp('reopened_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    periodEmployeeIndex: uniqueIndex('payroll_records_period_employee_idx').on(
      table.payPeriodId,
      table.employeeId,
    ),
    statusIndex: index('payroll_records_status_idx').on(table.status),
  }),
);

export const payrollAdjustments = pgTable(
  'payroll_adjustments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    payrollRecordId: uuid('payroll_record_id')
      .notNull()
      .references(() => payrollRecords.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    type: text('type').notNull(),
    label: text('label').notNull(),
    amount: money('amount').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    recordIndex: index('payroll_adjustments_record_idx').on(
      table.payrollRecordId,
    ),
  }),
);

export const now = () => sql`CURRENT_TIMESTAMP`;
