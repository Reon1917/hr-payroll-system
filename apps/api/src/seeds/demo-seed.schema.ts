import type {
  AdjustmentKind,
  AdjustmentType,
  EmploymentStatus,
  Role,
  SalaryType,
  WorkerType,
} from '@hr-payroll/shared';

export type DemoAccountKey = 'admin' | 'employee';
export type DemoEmployeeKey =
  | 'salariedEmployee'
  | 'dailyEmployee'
  | 'hourlyEmployee';
export type DemoPayPeriodKey = 'current' | 'historical';

export interface DemoAccountSeed {
  key: DemoAccountKey;
  role: Role;
  name: string;
  description: string;
}

export interface DemoEmployeeSeed {
  key: DemoEmployeeKey;
  accountKey?: DemoAccountKey;
  employeeCode: string;
  fullName: string;
  email?: string;
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
}

export interface DemoPayPeriodSeed {
  key: DemoPayPeriodKey;
  name: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
}

export interface DemoPayrollAdjustmentSeed {
  kind: AdjustmentKind;
  type: AdjustmentType;
  label: string;
  amount: number;
  note: string | null;
}

export interface DemoDraftPayrollSeed {
  payPeriodKey: DemoPayPeriodKey;
  employeeKey: DemoEmployeeKey;
  payUnits: number;
}

export interface DemoHistoricalPayrollSeed extends DemoDraftPayrollSeed {
  status: 'paid';
  paymentNote: string;
  paymentReference: string;
  approvedAt: string;
  paidAt: string;
  adjustments: DemoPayrollAdjustmentSeed[];
}

export interface DemoSeedSchema {
  accounts: DemoAccountSeed[];
  employees: DemoEmployeeSeed[];
  payPeriods: DemoPayPeriodSeed[];
  draftPayroll: DemoDraftPayrollSeed[];
  historicalPayroll: DemoHistoricalPayrollSeed[];
}

export const demoSeedSchema = {
  accounts: [
    {
      key: 'admin',
      role: 'admin',
      name: 'HR Admin',
      description: 'Full HR access',
    },
    {
      key: 'employee',
      role: 'employee',
      name: 'Nok Payroll',
      description: 'Self-service access',
    },
  ],
  employees: [
    {
      key: 'salariedEmployee',
      accountKey: 'employee',
      employeeCode: 'EMP-001',
      fullName: 'Nok Payroll',
      employmentStatus: 'active',
      workerType: 'thai',
      nationality: 'Thai',
      nationalId: '1103700000001',
      passportNumber: null,
      taxId: '1103700000001',
      socialSecurityNumber: '1103700000001',
      socialSecurityEnabled: true,
      hireDate: '2024-01-02',
      department: 'Operations',
      position: 'Payroll Specialist',
      salaryType: 'monthly',
      baseRate: 42000,
      bankName: 'Bangkok Bank',
      bankAccountName: 'Nok Payroll',
      bankAccountNumber: '123-4-56789-0',
      workPermitNumber: null,
      workPermitExpiryDate: null,
      visaType: null,
      visaExpiryDate: null,
    },
    {
      key: 'dailyEmployee',
      employeeCode: 'EMP-002',
      fullName: 'Somchai Daily',
      email: 'somchai.daily@company.test',
      employmentStatus: 'active',
      workerType: 'thai',
      nationality: 'Thai',
      nationalId: '1103700000002',
      passportNumber: null,
      taxId: '1103700000002',
      socialSecurityNumber: '1103700000002',
      socialSecurityEnabled: true,
      hireDate: '2025-05-12',
      department: 'Warehouse',
      position: 'Warehouse Associate',
      salaryType: 'daily',
      baseRate: 850,
      bankName: 'Kasikornbank',
      bankAccountName: 'Somchai Daily',
      bankAccountNumber: '987-6-54321-0',
      workPermitNumber: null,
      workPermitExpiryDate: null,
      visaType: null,
      visaExpiryDate: null,
    },
    {
      key: 'hourlyEmployee',
      employeeCode: 'EMP-003',
      fullName: 'Anan Hourly',
      email: 'anan.hourly@company.test',
      employmentStatus: 'active',
      workerType: 'foreign',
      nationality: 'Myanmar',
      nationalId: null,
      passportNumber: 'MM09445521',
      taxId: null,
      socialSecurityNumber: 'F-33210019',
      socialSecurityEnabled: true,
      hireDate: '2025-08-01',
      department: 'Support',
      position: 'Customer Support',
      salaryType: 'hourly',
      baseRate: 160,
      bankName: 'Krungthai Bank',
      bankAccountName: 'Anan Hourly',
      bankAccountNumber: '555-0-12345-9',
      workPermitNumber: 'WP-2025-7781',
      workPermitExpiryDate: '2026-12-31',
      visaType: 'Non-LA',
      visaExpiryDate: '2026-11-30',
    },
  ],
  payPeriods: [
    {
      key: 'current',
      name: 'April 2026 Payroll',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      paymentDate: '2026-05-01',
    },
    {
      key: 'historical',
      name: 'March 2026 Payroll',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      paymentDate: '2026-04-01',
    },
  ],
  draftPayroll: [
    {
      payPeriodKey: 'current',
      employeeKey: 'salariedEmployee',
      payUnits: 1,
    },
    {
      payPeriodKey: 'current',
      employeeKey: 'dailyEmployee',
      payUnits: 0,
    },
    {
      payPeriodKey: 'current',
      employeeKey: 'hourlyEmployee',
      payUnits: 0,
    },
  ],
  historicalPayroll: [
    {
      payPeriodKey: 'historical',
      employeeKey: 'salariedEmployee',
      payUnits: 1,
      status: 'paid',
      paymentNote: 'Manual transfer completed',
      paymentReference: 'MARCH-2026-BATCH',
      approvedAt: '2026-03-31T09:00:00.000Z',
      paidAt: '2026-04-01T03:00:00.000Z',
      adjustments: [
        {
          kind: 'addition',
          type: 'allowance',
          label: 'Transport allowance',
          amount: 1500,
          note: null,
        },
        {
          kind: 'deduction',
          type: 'tax',
          label: 'Tax withholding',
          amount: 2400,
          note: null,
        },
      ],
    },
    {
      payPeriodKey: 'historical',
      employeeKey: 'dailyEmployee',
      payUnits: 26,
      status: 'paid',
      paymentNote: 'Manual transfer completed',
      paymentReference: 'MARCH-2026-BATCH',
      approvedAt: '2026-03-31T09:00:00.000Z',
      paidAt: '2026-04-01T03:00:00.000Z',
      adjustments: [
        {
          kind: 'addition',
          type: 'overtime',
          label: 'Overtime',
          amount: 1200,
          note: null,
        },
      ],
    },
    {
      payPeriodKey: 'historical',
      employeeKey: 'hourlyEmployee',
      payUnits: 168,
      status: 'paid',
      paymentNote: 'Manual transfer completed',
      paymentReference: 'MARCH-2026-BATCH',
      approvedAt: '2026-03-31T09:00:00.000Z',
      paidAt: '2026-04-01T03:00:00.000Z',
      adjustments: [
        {
          kind: 'deduction',
          type: 'social_security',
          label: 'Social security',
          amount: 750,
          note: null,
        },
      ],
    },
  ],
} as const satisfies DemoSeedSchema;
