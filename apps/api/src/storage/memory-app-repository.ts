import { randomUUID } from 'node:crypto';
import { APP_REPOSITORY, AppRepository } from './app-repository';
import {
  appMemoryStore,
  type AppMemoryStore,
  resetMemoryStore,
} from './memory-db';
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

function now(): Date {
  return new Date();
}

function matchesEmployeeFilters(
  employee: EmployeeEntity,
  filters?: EmployeeFilters,
): boolean {
  if (!filters) {
    return true;
  }

  if (
    filters.employmentStatus &&
    employee.employmentStatus !== filters.employmentStatus
  ) {
    return false;
  }

  if (filters.workerType && employee.workerType !== filters.workerType) {
    return false;
  }

  if (filters.salaryType && employee.salaryType !== filters.salaryType) {
    return false;
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    const haystack = [
      employee.employeeCode,
      employee.fullName,
      employee.email,
      employee.nationality ?? '',
      employee.nationalId ?? '',
      employee.passportNumber ?? '',
      employee.department,
      employee.position,
    ]
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
}

export class MemoryAppRepository implements AppRepository {
  constructor(private readonly store: AppMemoryStore = appMemoryStore) {}

  async resetAll(): Promise<void> {
    resetMemoryStore();
  }

  async findUserProfileByAuthUserId(
    authUserId: string,
  ): Promise<UserProfileEntity | null> {
    return (
      this.store.userProfiles.find(
        (profile) => profile.authUserId === authUserId,
      ) ?? null
    );
  }

  async upsertUserProfile(
    input: UpsertUserProfileInput,
  ): Promise<UserProfileEntity> {
    const existing = this.store.userProfiles.find(
      (profile) => profile.authUserId === input.authUserId,
    );

    if (existing) {
      existing.role = input.role;
      existing.employeeId = input.employeeId;
      existing.updatedAt = now();
      return existing;
    }

    const profile: UserProfileEntity = {
      id: randomUUID(),
      authUserId: input.authUserId,
      role: input.role,
      employeeId: input.employeeId,
      createdAt: now(),
      updatedAt: now(),
    };

    this.store.userProfiles.push(profile);
    return profile;
  }

  async listEmployees(filters?: EmployeeFilters): Promise<EmployeeEntity[]> {
    return this.store.employees
      .filter((employee) => matchesEmployeeFilters(employee, filters))
      .toSorted((left, right) =>
        left.employeeCode.localeCompare(right.employeeCode),
      );
  }

  async getEmployeeById(id: string): Promise<EmployeeEntity | null> {
    return this.store.employees.find((employee) => employee.id === id) ?? null;
  }

  async createEmployee(input: CreateEmployeeInput): Promise<EmployeeEntity> {
    const entity: EmployeeEntity = {
      id: randomUUID(),
      ...input,
      workerType: input.workerType,
      nationality: input.nationality ?? null,
      nationalId: input.nationalId ?? null,
      passportNumber: input.passportNumber ?? null,
      taxId: input.taxId ?? null,
      socialSecurityNumber: input.socialSecurityNumber ?? null,
      socialSecurityEnabled: input.socialSecurityEnabled ?? true,
      hireDate: input.hireDate ?? null,
      workPermitNumber: input.workPermitNumber ?? null,
      workPermitExpiryDate: input.workPermitExpiryDate ?? null,
      visaType: input.visaType ?? null,
      visaExpiryDate: input.visaExpiryDate ?? null,
      linkedAuthUserId: input.linkedAuthUserId ?? null,
      createdAt: now(),
      updatedAt: now(),
    };

    this.store.employees.push(entity);
    return entity;
  }

  async updateEmployee(
    id: string,
    input: UpdateEmployeeInput,
  ): Promise<EmployeeEntity | null> {
    const employee = await this.getEmployeeById(id);

    if (!employee) {
      return null;
    }

    Object.assign(employee, input, {
      updatedAt: now(),
      linkedAuthUserId:
        input.linkedAuthUserId === undefined
          ? employee.linkedAuthUserId
          : input.linkedAuthUserId,
    });

    return employee;
  }

  async listPayPeriods(): Promise<PayPeriodEntity[]> {
    return this.store.payPeriods.toSorted((left, right) =>
      right.startDate.localeCompare(left.startDate),
    );
  }

  async getPayPeriodById(id: string): Promise<PayPeriodEntity | null> {
    return this.store.payPeriods.find((period) => period.id === id) ?? null;
  }

  async createPayPeriod(input: CreatePayPeriodInput): Promise<PayPeriodEntity> {
    const entity: PayPeriodEntity = {
      id: randomUUID(),
      createdAt: now(),
      updatedAt: now(),
      ...input,
    };

    this.store.payPeriods.push(entity);
    return entity;
  }

  async updatePayPeriod(
    id: string,
    input: UpdatePayPeriodInput,
  ): Promise<PayPeriodEntity | null> {
    const payPeriod = await this.getPayPeriodById(id);

    if (!payPeriod) {
      return null;
    }

    Object.assign(payPeriod, input, {
      updatedAt: now(),
    });

    return payPeriod;
  }

  async listPayrollRecordsByPayPeriod(
    payPeriodId: string,
  ): Promise<PayrollRecordEntity[]> {
    return this.store.payrollRecords
      .filter((record) => record.payPeriodId === payPeriodId)
      .toSorted((left, right) =>
        left.employeeNameSnapshot.localeCompare(right.employeeNameSnapshot),
      );
  }

  async getPayrollRecordById(id: string): Promise<PayrollRecordEntity | null> {
    return this.store.payrollRecords.find((record) => record.id === id) ?? null;
  }

  async getPayrollRecordByEmployeeAndPeriod(
    employeeId: string,
    payPeriodId: string,
  ): Promise<PayrollRecordEntity | null> {
    return (
      this.store.payrollRecords.find(
        (record) =>
          record.employeeId === employeeId &&
          record.payPeriodId === payPeriodId,
      ) ?? null
    );
  }

  async createPayrollRecord(
    input: CreatePayrollRecordInput,
  ): Promise<PayrollRecordEntity> {
    const entity: PayrollRecordEntity = {
      id: randomUUID(),
      paymentDate: input.paymentDate ?? null,
      paymentNote: input.paymentNote ?? null,
      paymentReference: input.paymentReference ?? null,
      approvedByUserId: null,
      approvedAt: null,
      paidByUserId: null,
      paidAt: null,
      cancelledByUserId: null,
      cancelledAt: null,
      reopenedByUserId: null,
      reopenedAt: null,
      createdAt: now(),
      updatedAt: now(),
      ...input,
    };

    this.store.payrollRecords.push(entity);
    return entity;
  }

  async updatePayrollRecord(
    id: string,
    input: UpdatePayrollRecordInput,
  ): Promise<PayrollRecordEntity | null> {
    const record = await this.getPayrollRecordById(id);

    if (!record) {
      return null;
    }

    Object.assign(record, input, {
      updatedAt: now(),
      paymentDate:
        input.paymentDate === undefined
          ? record.paymentDate
          : input.paymentDate,
      paymentNote:
        input.paymentNote === undefined
          ? record.paymentNote
          : input.paymentNote,
      paymentReference:
        input.paymentReference === undefined
          ? record.paymentReference
          : input.paymentReference,
    });

    return record;
  }

  async listPayrollAdjustmentsByRecordId(
    payrollRecordId: string,
  ): Promise<PayrollAdjustmentEntity[]> {
    return this.store.payrollAdjustments.filter(
      (adjustment) => adjustment.payrollRecordId === payrollRecordId,
    );
  }

  async replacePayrollAdjustments(
    input: ReplacePayrollAdjustmentsInput,
  ): Promise<PayrollAdjustmentEntity[]> {
    this.store.payrollAdjustments = this.store.payrollAdjustments.filter(
      (adjustment) => adjustment.payrollRecordId !== input.payrollRecordId,
    );

    const created = input.adjustments.map((adjustment) => ({
      id: randomUUID(),
      payrollRecordId: input.payrollRecordId,
      kind: adjustment.kind,
      type: adjustment.type,
      label: adjustment.label,
      amount: adjustment.amount,
      note: adjustment.note ?? null,
      createdAt: now(),
      updatedAt: now(),
    }));

    this.store.payrollAdjustments.push(...created);
    return created;
  }
}

export const memoryRepositoryProvider = {
  provide: APP_REPOSITORY,
  useValue: new MemoryAppRepository(),
};
