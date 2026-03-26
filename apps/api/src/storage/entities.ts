import type {
  AdjustmentKind,
  AdjustmentType,
  EmploymentStatus,
  PayrollStatus,
  Role,
  SalaryType,
  WorkerType,
} from '@hr-payroll/shared';

export interface UserProfileEntity {
  id: string;
  authUserId: string;
  role: Role;
  employeeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeEntity {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  employmentStatus: EmploymentStatus;
  workerType: WorkerType;
  nationality: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  taxId: string | null;
  socialSecurityNumber: string | null;
  socialSecurityEnabled: boolean;
  hireDate: string | null;
  department: string;
  position: string;
  salaryType: SalaryType;
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
}

export interface PayPeriodEntity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRecordEntity {
  id: string;
  payPeriodId: string;
  employeeId: string;
  employeeCodeSnapshot: string;
  employeeNameSnapshot: string;
  employeeEmailSnapshot: string;
  departmentSnapshot: string;
  positionSnapshot: string;
  salaryTypeSnapshot: SalaryType;
  baseRateSnapshot: number;
  payUnits: number;
  basePay: number;
  additionsTotal: number;
  deductionsTotal: number;
  netPay: number;
  status: PayrollStatus;
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
}

export interface PayrollAdjustmentEntity {
  id: string;
  payrollRecordId: string;
  kind: AdjustmentKind;
  type: AdjustmentType;
  label: string;
  amount: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeInput {
  employeeCode: string;
  fullName: string;
  email: string;
  employmentStatus: EmploymentStatus;
  workerType: WorkerType;
  nationality?: string | null;
  nationalId?: string | null;
  passportNumber?: string | null;
  taxId?: string | null;
  socialSecurityNumber?: string | null;
  socialSecurityEnabled?: boolean;
  hireDate?: string | null;
  department: string;
  position: string;
  salaryType: SalaryType;
  baseRate: number;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  workPermitNumber?: string | null;
  workPermitExpiryDate?: string | null;
  visaType?: string | null;
  visaExpiryDate?: string | null;
  linkedAuthUserId?: string | null;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {}

export interface EmployeeFilters {
  search?: string;
  employmentStatus?: EmploymentStatus;
  workerType?: WorkerType;
  salaryType?: SalaryType;
}

export interface CreatePayPeriodInput {
  name: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
}

export interface UpdatePayPeriodInput extends Partial<CreatePayPeriodInput> {}

export interface CreatePayrollRecordInput {
  payPeriodId: string;
  employeeId: string;
  employeeCodeSnapshot: string;
  employeeNameSnapshot: string;
  employeeEmailSnapshot: string;
  departmentSnapshot: string;
  positionSnapshot: string;
  salaryTypeSnapshot: SalaryType;
  baseRateSnapshot: number;
  payUnits: number;
  basePay: number;
  additionsTotal: number;
  deductionsTotal: number;
  netPay: number;
  status: PayrollStatus;
  paymentDate?: string | null;
  paymentNote?: string | null;
  paymentReference?: string | null;
  createdByUserId: string;
  updatedByUserId: string;
}

export interface UpdatePayrollRecordInput extends Partial<
  Omit<
    CreatePayrollRecordInput,
    | 'payPeriodId'
    | 'employeeId'
    | 'employeeCodeSnapshot'
    | 'employeeNameSnapshot'
    | 'employeeEmailSnapshot'
    | 'departmentSnapshot'
    | 'positionSnapshot'
    | 'salaryTypeSnapshot'
    | 'baseRateSnapshot'
    | 'createdByUserId'
  >
> {
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  paidByUserId?: string | null;
  paidAt?: Date | null;
  cancelledByUserId?: string | null;
  cancelledAt?: Date | null;
  reopenedByUserId?: string | null;
  reopenedAt?: Date | null;
}

export interface ReplacePayrollAdjustmentsInput {
  payrollRecordId: string;
  adjustments: Array<{
    kind: AdjustmentKind;
    type: AdjustmentType;
    label: string;
    amount: number;
    note?: string | null;
  }>;
}

export interface UpsertUserProfileInput {
  authUserId: string;
  role: Role;
  employeeId: string | null;
}
