import type {
  EmployeeEntity,
  PayPeriodEntity,
  PayrollAdjustmentEntity,
  PayrollRecordEntity,
  UserProfileEntity,
} from './entities';

export interface AppMemoryStore {
  userProfiles: UserProfileEntity[];
  employees: EmployeeEntity[];
  payPeriods: PayPeriodEntity[];
  payrollRecords: PayrollRecordEntity[];
  payrollAdjustments: PayrollAdjustmentEntity[];
}

export const appMemoryStore: AppMemoryStore = {
  userProfiles: [],
  employees: [],
  payPeriods: [],
  payrollRecords: [],
  payrollAdjustments: [],
};

const AUTH_MEMORY_MODELS = [
  'user',
  'session',
  'account',
  'verification',
  'jwks',
  'passkey',
  'twoFactor',
  'backupCode',
] as const;

export const authMemoryStore: Record<string, any[]> = createAuthMemoryStore();

function createAuthMemoryStore(): Record<string, any[]> {
  return Object.fromEntries(
    AUTH_MEMORY_MODELS.map((model) => [model, []]),
  ) as Record<string, any[]>;
}

export function resetMemoryStore(): void {
  appMemoryStore.userProfiles.length = 0;
  appMemoryStore.employees.length = 0;
  appMemoryStore.payPeriods.length = 0;
  appMemoryStore.payrollRecords.length = 0;
  appMemoryStore.payrollAdjustments.length = 0;

  for (const key of Object.keys(authMemoryStore)) {
    delete authMemoryStore[key];
  }

  Object.assign(authMemoryStore, createAuthMemoryStore());
}
