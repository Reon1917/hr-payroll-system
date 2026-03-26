export type Role = "admin" | "employee";

export type EmploymentStatus =
  | "active"
  | "inactive"
  | "resigned"
  | "terminated";

export type WorkerType = "thai" | "foreign";

export type SalaryType = "monthly" | "daily" | "hourly";

export type PayrollStatus =
  | "draft"
  | "calculated"
  | "approved"
  | "paid"
  | "cancelled";

export type AdjustmentKind = "addition" | "deduction";

export type AdjustmentType =
  | "overtime"
  | "bonus"
  | "allowance"
  | "other_addition"
  | "unpaid_leave"
  | "late_penalty"
  | "tax"
  | "social_security"
  | "loan"
  | "other_deduction";

export interface EmployeeSummary {
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
  linkedAuthUserId: string | null;
}

export interface EmployeeDetail extends EmployeeSummary {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  workPermitNumber: string | null;
  workPermitExpiryDate: string | null;
  visaType: string | null;
  visaExpiryDate: string | null;
}

export interface CurrentUser {
  authUserId: string;
  name: string;
  email: string;
  role: Role;
  employeeId: string | null;
  employee: EmployeeSummary | null;
}

export interface PayrollAdjustmentView {
  id: string;
  kind: AdjustmentKind;
  type: AdjustmentType;
  label: string;
  amount: number;
  note: string | null;
}

export interface PayrollRecordDetail {
  id: string;
  payPeriodId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  position: string;
  salaryType: SalaryType;
  baseRate: number;
  payUnits: number;
  basePay: number;
  additionsTotal: number;
  deductionsTotal: number;
  netPay: number;
  status: PayrollStatus;
  paymentDate: string | null;
  paymentNote: string | null;
  paymentReference: string | null;
  updatedAt: string;
  adjustments: PayrollAdjustmentView[];
}

export interface StatusCounts {
  draft: number;
  calculated: number;
  approved: number;
  paid: number;
  cancelled: number;
}

export interface PayPeriodSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
  totalRecords: number;
  statusCounts: StatusCounts;
}

export interface PayPeriodDetail extends PayPeriodSummary {
  records: PayrollRecordDetail[];
}

export interface PayslipView {
  payrollRecordId: string;
  payPeriodName: string;
  periodStartDate: string;
  periodEndDate: string;
  paymentDate: string | null;
  status: PayrollStatus;
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string;
    department: string;
    position: string;
  };
  salaryType: SalaryType;
  baseRate: number;
  payUnits: number;
  basePay: number;
  additions: PayrollAdjustmentView[];
  deductions: PayrollAdjustmentView[];
  additionsTotal: number;
  deductionsTotal: number;
  netPay: number;
}

export interface PayrollSummaryReport {
  payPeriodId: string;
  payPeriodName: string;
  totalPayrollCost: number;
  numberOfPaidEmployees: number;
  totalAdditions: number;
  totalDeductions: number;
  totalNetPay: number;
  statusCounts: StatusCounts;
}

export declare const ROLES: readonly Role[];
export declare const EMPLOYMENT_STATUSES: readonly EmploymentStatus[];
export declare const WORKER_TYPES: readonly WorkerType[];
export declare const SALARY_TYPES: readonly SalaryType[];
export declare const PAYROLL_STATUSES: readonly PayrollStatus[];
export declare const ADJUSTMENT_KINDS: readonly AdjustmentKind[];
export declare const ADDITION_TYPES: readonly AdjustmentType[];
export declare const DEDUCTION_TYPES: readonly AdjustmentType[];
export declare const ADJUSTMENT_TYPES: readonly AdjustmentType[];

export declare const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string>;
export declare const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string>;
export declare const WORKER_TYPE_LABELS: Record<WorkerType, string>;
export declare const SALARY_TYPE_LABELS: Record<SalaryType, string>;
