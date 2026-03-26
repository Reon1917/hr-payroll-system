import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import type {
  AdjustmentKind,
  AdjustmentType,
  EmploymentStatus,
  Role,
  SalaryType,
  WorkerType,
} from '@hr-payroll/shared';
import { db } from '../db';
import {
  employees,
  payPeriods,
  payrollAdjustments,
  payrollRecords,
  userProfiles,
} from '../db/schema';
import type { AppRepository } from './app-repository';
import type {
  CreateEmployeeInput,
  CreatePayPeriodInput,
  CreatePayrollRecordInput,
  EmployeeEntity,
  EmployeeFilters,
  PayPeriodEntity,
  PayrollAdjustmentEntity,
  PayrollRecordEntity,
  ReplacePayrollAdjustmentsInput,
  UpdateEmployeeInput,
  UpdatePayPeriodInput,
  UpdatePayrollRecordInput,
  UpsertUserProfileInput,
  UserProfileEntity,
} from './entities';

function requireDb() {
  if (!db) {
    throw new Error(
      'DATABASE_URL is required when APP_STORAGE_DRIVER=drizzle.',
    );
  }

  return db;
}

function toUserProfileEntity(row: {
  id: string;
  authUserId: string;
  role: string;
  employeeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProfileEntity {
  return {
    ...row,
    role: row.role as Role,
  };
}

function toEmployeeEntity(row: {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  employmentStatus: string;
  workerType: string;
  nationality: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  taxId: string | null;
  socialSecurityNumber: string | null;
  socialSecurityEnabled: boolean;
  hireDate: string | null;
  department: string;
  position: string;
  salaryType: string;
  baseRate: number;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  workPermitNumber: string | null;
  workPermitExpiryDate: string | null;
  visaType: string | null;
  visaExpiryDate: string | null;
  linkedAuthUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): EmployeeEntity {
  return {
    ...row,
    employmentStatus: row.employmentStatus as EmploymentStatus,
    workerType: row.workerType as WorkerType,
    salaryType: row.salaryType as SalaryType,
  };
}

function toPayrollRecordEntity(row: {
  id: string;
  payPeriodId: string;
  employeeId: string;
  employeeCodeSnapshot: string;
  employeeNameSnapshot: string;
  employeeEmailSnapshot: string;
  departmentSnapshot: string;
  positionSnapshot: string;
  salaryTypeSnapshot: string;
  baseRateSnapshot: number;
  payUnits: number;
  basePay: number;
  additionsTotal: number;
  deductionsTotal: number;
  netPay: number;
  status: string;
  paymentDate: string | null;
  paymentNote: string | null;
  paymentReference: string | null;
  createdByUserId: string;
  updatedByUserId: string;
  approvedByUserId: string | null;
  approvedAt: Date | null;
  paidByUserId: string | null;
  paidAt: Date | null;
  cancelledByUserId: string | null;
  cancelledAt: Date | null;
  reopenedByUserId: string | null;
  reopenedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PayrollRecordEntity {
  return {
    ...row,
    salaryTypeSnapshot: row.salaryTypeSnapshot as SalaryType,
    status: row.status as PayrollRecordEntity['status'],
  };
}

function toPayrollAdjustmentEntity(row: {
  id: string;
  payrollRecordId: string;
  kind: string;
  type: string;
  label: string;
  amount: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PayrollAdjustmentEntity {
  return {
    ...row,
    kind: row.kind as AdjustmentKind,
    type: row.type as AdjustmentType,
  };
}

@Injectable()
export class DrizzleAppRepository implements AppRepository {
  async resetAll(): Promise<void> {
    const database = requireDb();

    await database.delete(payrollAdjustments);
    await database.delete(payrollRecords);
    await database.delete(userProfiles);
    await database.delete(payPeriods);
    await database.delete(employees);
  }

  async findUserProfileByAuthUserId(
    authUserId: string,
  ): Promise<UserProfileEntity | null> {
    const database = requireDb();
    const [profile] = await database
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.authUserId, authUserId))
      .limit(1);

    return profile ? toUserProfileEntity(profile) : null;
  }

  async upsertUserProfile(
    input: UpsertUserProfileInput,
  ): Promise<UserProfileEntity> {
    const database = requireDb();
    const existing = await this.findUserProfileByAuthUserId(input.authUserId);

    if (existing) {
      const [updated] = await database
        .update(userProfiles)
        .set({
          role: input.role,
          employeeId: input.employeeId,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.authUserId, input.authUserId))
        .returning();

      return toUserProfileEntity(updated);
    }

    const [created] = await database
      .insert(userProfiles)
      .values({
        authUserId: input.authUserId,
        role: input.role,
        employeeId: input.employeeId,
      })
      .returning();

    return toUserProfileEntity(created);
  }

  async listEmployees(filters?: EmployeeFilters): Promise<EmployeeEntity[]> {
    const database = requireDb();
    const conditions: SQL[] = [];

    if (filters?.employmentStatus) {
      conditions.push(eq(employees.employmentStatus, filters.employmentStatus));
    }

    if (filters?.workerType) {
      conditions.push(eq(employees.workerType, filters.workerType));
    }

    if (filters?.salaryType) {
      conditions.push(eq(employees.salaryType, filters.salaryType));
    }

    if (filters?.search) {
      const query = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(employees.employeeCode, query),
          ilike(employees.fullName, query),
          ilike(employees.email, query),
          ilike(employees.nationality, query),
          ilike(employees.nationalId, query),
          ilike(employees.passportNumber, query),
          ilike(employees.department, query),
          ilike(employees.position, query),
        )!,
      );
    }

    const rows = await database
      .select()
      .from(employees)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(employees.employeeCode));

    return rows.map(toEmployeeEntity);
  }

  async getEmployeeById(id: string): Promise<EmployeeEntity | null> {
    const database = requireDb();
    const [employee] = await database
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);

    return employee ? toEmployeeEntity(employee) : null;
  }

  async createEmployee(input: CreateEmployeeInput): Promise<EmployeeEntity> {
    const database = requireDb();
    const [employee] = await database
      .insert(employees)
      .values(input)
      .returning();

    return toEmployeeEntity(employee);
  }

  async updateEmployee(
    id: string,
    input: UpdateEmployeeInput,
  ): Promise<EmployeeEntity | null> {
    const database = requireDb();
    const [employee] = await database
      .update(employees)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id))
      .returning();

    return employee ? toEmployeeEntity(employee) : null;
  }

  async listPayPeriods(): Promise<PayPeriodEntity[]> {
    const database = requireDb();
    return database
      .select()
      .from(payPeriods)
      .orderBy(desc(payPeriods.startDate));
  }

  async getPayPeriodById(id: string): Promise<PayPeriodEntity | null> {
    const database = requireDb();
    const [payPeriod] = await database
      .select()
      .from(payPeriods)
      .where(eq(payPeriods.id, id))
      .limit(1);

    return payPeriod ?? null;
  }

  async createPayPeriod(input: CreatePayPeriodInput): Promise<PayPeriodEntity> {
    const database = requireDb();
    const [payPeriod] = await database
      .insert(payPeriods)
      .values(input)
      .returning();

    return payPeriod;
  }

  async updatePayPeriod(
    id: string,
    input: UpdatePayPeriodInput,
  ): Promise<PayPeriodEntity | null> {
    const database = requireDb();
    const [payPeriod] = await database
      .update(payPeriods)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(payPeriods.id, id))
      .returning();

    return payPeriod ?? null;
  }

  async listPayrollRecordsByPayPeriod(
    payPeriodId: string,
  ): Promise<PayrollRecordEntity[]> {
    const database = requireDb();
    const rows = await database
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.payPeriodId, payPeriodId))
      .orderBy(asc(payrollRecords.employeeNameSnapshot));

    return rows.map(toPayrollRecordEntity);
  }

  async getPayrollRecordById(id: string): Promise<PayrollRecordEntity | null> {
    const database = requireDb();
    const [record] = await database
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.id, id))
      .limit(1);

    return record ? toPayrollRecordEntity(record) : null;
  }

  async getPayrollRecordByEmployeeAndPeriod(
    employeeId: string,
    payPeriodId: string,
  ): Promise<PayrollRecordEntity | null> {
    const database = requireDb();
    const [record] = await database
      .select()
      .from(payrollRecords)
      .where(
        and(
          eq(payrollRecords.employeeId, employeeId),
          eq(payrollRecords.payPeriodId, payPeriodId),
        ),
      )
      .limit(1);

    return record ? toPayrollRecordEntity(record) : null;
  }

  async createPayrollRecord(
    input: CreatePayrollRecordInput,
  ): Promise<PayrollRecordEntity> {
    const database = requireDb();
    const [record] = await database
      .insert(payrollRecords)
      .values({
        ...input,
        paymentDate: input.paymentDate ?? null,
        paymentNote: input.paymentNote ?? null,
        paymentReference: input.paymentReference ?? null,
      })
      .returning();

    return toPayrollRecordEntity(record);
  }

  async updatePayrollRecord(
    id: string,
    input: UpdatePayrollRecordInput,
  ): Promise<PayrollRecordEntity | null> {
    const database = requireDb();
    const [record] = await database
      .update(payrollRecords)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(payrollRecords.id, id))
      .returning();

    return record ? toPayrollRecordEntity(record) : null;
  }

  async listPayrollAdjustmentsByRecordId(
    payrollRecordId: string,
  ): Promise<PayrollAdjustmentEntity[]> {
    const database = requireDb();
    const rows = await database
      .select()
      .from(payrollAdjustments)
      .where(eq(payrollAdjustments.payrollRecordId, payrollRecordId))
      .orderBy(asc(payrollAdjustments.createdAt));

    return rows.map(toPayrollAdjustmentEntity);
  }

  async replacePayrollAdjustments(
    input: ReplacePayrollAdjustmentsInput,
  ): Promise<PayrollAdjustmentEntity[]> {
    const database = requireDb();
    await database
      .delete(payrollAdjustments)
      .where(eq(payrollAdjustments.payrollRecordId, input.payrollRecordId));

    if (input.adjustments.length === 0) {
      return [];
    }

    const rows = await database
      .insert(payrollAdjustments)
      .values(
        input.adjustments.map((adjustment) => ({
          payrollRecordId: input.payrollRecordId,
          kind: adjustment.kind,
          type: adjustment.type,
          label: adjustment.label,
          amount: adjustment.amount,
          note: adjustment.note ?? null,
        })),
      )
      .returning();

    return rows.map(toPayrollAdjustmentEntity);
  }
}
