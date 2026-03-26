import type { PayrollSummaryReport, PayrollStatus } from '@hr-payroll/shared';
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

export const APP_REPOSITORY = Symbol('APP_REPOSITORY');

export interface AppRepository {
  resetAll(): Promise<void>;
  findUserProfileByAuthUserId(
    authUserId: string,
  ): Promise<UserProfileEntity | null>;
  upsertUserProfile(input: UpsertUserProfileInput): Promise<UserProfileEntity>;
  listEmployees(filters?: EmployeeFilters): Promise<EmployeeEntity[]>;
  getEmployeeById(id: string): Promise<EmployeeEntity | null>;
  createEmployee(input: CreateEmployeeInput): Promise<EmployeeEntity>;
  updateEmployee(
    id: string,
    input: UpdateEmployeeInput,
  ): Promise<EmployeeEntity | null>;
  listPayPeriods(): Promise<PayPeriodEntity[]>;
  getPayPeriodById(id: string): Promise<PayPeriodEntity | null>;
  createPayPeriod(input: CreatePayPeriodInput): Promise<PayPeriodEntity>;
  updatePayPeriod(
    id: string,
    input: UpdatePayPeriodInput,
  ): Promise<PayPeriodEntity | null>;
  listPayrollRecordsByPayPeriod(
    payPeriodId: string,
  ): Promise<PayrollRecordEntity[]>;
  getPayrollRecordById(id: string): Promise<PayrollRecordEntity | null>;
  getPayrollRecordByEmployeeAndPeriod(
    employeeId: string,
    payPeriodId: string,
  ): Promise<PayrollRecordEntity | null>;
  createPayrollRecord(
    input: CreatePayrollRecordInput,
  ): Promise<PayrollRecordEntity>;
  updatePayrollRecord(
    id: string,
    input: UpdatePayrollRecordInput,
  ): Promise<PayrollRecordEntity | null>;
  listPayrollAdjustmentsByRecordId(
    payrollRecordId: string,
  ): Promise<PayrollAdjustmentEntity[]>;
  replacePayrollAdjustments(
    input: ReplacePayrollAdjustmentsInput,
  ): Promise<PayrollAdjustmentEntity[]>;
}

export interface AuthenticatedActor {
  authUserId: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  employeeId: string | null;
}

export type StatusCounts = Record<PayrollStatus, number>;

export function createEmptyStatusCounts(): StatusCounts {
  return {
    draft: 0,
    calculated: 0,
    approved: 0,
    paid: 0,
    cancelled: 0,
  };
}

export function buildPayrollSummaryReport(input: {
  payPeriodId: string;
  payPeriodName: string;
  records: PayrollRecordEntity[];
}): PayrollSummaryReport {
  const statusCounts = createEmptyStatusCounts();

  let totalAdditions = 0;
  let totalDeductions = 0;
  let totalNetPay = 0;
  let numberOfPaidEmployees = 0;

  for (const record of input.records) {
    statusCounts[record.status] += 1;
    totalAdditions += record.additionsTotal;
    totalDeductions += record.deductionsTotal;
    totalNetPay += record.netPay;

    if (record.status === 'paid') {
      numberOfPaidEmployees += 1;
    }
  }

  return {
    payPeriodId: input.payPeriodId,
    payPeriodName: input.payPeriodName,
    totalPayrollCost: Number(totalNetPay.toFixed(2)),
    numberOfPaidEmployees,
    totalAdditions: Number(totalAdditions.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    totalNetPay: Number(totalNetPay.toFixed(2)),
    statusCounts,
  };
}
