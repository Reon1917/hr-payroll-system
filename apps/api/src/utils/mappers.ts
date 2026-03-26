import type {
  CurrentUser,
  EmployeeDetail,
  EmployeeSummary,
  PayPeriodDetail,
  PayPeriodSummary,
  PayslipView,
  PayrollAdjustmentView,
  PayrollRecordDetail,
} from '@hr-payroll/shared';
import { createEmptyStatusCounts } from '../storage/app-repository';
import type {
  EmployeeEntity,
  PayPeriodEntity,
  PayrollAdjustmentEntity,
  PayrollRecordEntity,
} from '../storage/entities';

export function toIsoString(value: Date): string {
  return value.toISOString();
}

export function mapEmployeeSummary(employee: EmployeeEntity): EmployeeSummary {
  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    employmentStatus: employee.employmentStatus,
    workerType: employee.workerType,
    nationality: employee.nationality,
    nationalId: employee.nationalId,
    passportNumber: employee.passportNumber,
    taxId: employee.taxId,
    socialSecurityNumber: employee.socialSecurityNumber,
    socialSecurityEnabled: employee.socialSecurityEnabled,
    hireDate: employee.hireDate,
    department: employee.department,
    position: employee.position,
    salaryType: employee.salaryType,
    baseRate: employee.baseRate,
    linkedAuthUserId: employee.linkedAuthUserId,
  };
}

export function mapEmployeeDetail(employee: EmployeeEntity): EmployeeDetail {
  return {
    ...mapEmployeeSummary(employee),
    bankName: employee.bankName,
    bankAccountName: employee.bankAccountName,
    bankAccountNumber: employee.bankAccountNumber,
    workPermitNumber: employee.workPermitNumber,
    workPermitExpiryDate: employee.workPermitExpiryDate,
    visaType: employee.visaType,
    visaExpiryDate: employee.visaExpiryDate,
  };
}

export function mapPayrollAdjustment(
  adjustment: PayrollAdjustmentEntity,
): PayrollAdjustmentView {
  return {
    id: adjustment.id,
    kind: adjustment.kind,
    type: adjustment.type,
    label: adjustment.label,
    amount: adjustment.amount,
    note: adjustment.note,
  };
}

export function mapPayrollRecordDetail(input: {
  record: PayrollRecordEntity;
  adjustments: PayrollAdjustmentEntity[];
}): PayrollRecordDetail {
  return {
    id: input.record.id,
    payPeriodId: input.record.payPeriodId,
    employeeId: input.record.employeeId,
    employeeCode: input.record.employeeCodeSnapshot,
    employeeName: input.record.employeeNameSnapshot,
    employeeEmail: input.record.employeeEmailSnapshot,
    department: input.record.departmentSnapshot,
    position: input.record.positionSnapshot,
    salaryType: input.record.salaryTypeSnapshot,
    baseRate: input.record.baseRateSnapshot,
    payUnits: input.record.payUnits,
    basePay: input.record.basePay,
    additionsTotal: input.record.additionsTotal,
    deductionsTotal: input.record.deductionsTotal,
    netPay: input.record.netPay,
    status: input.record.status,
    paymentDate: input.record.paymentDate,
    paymentNote: input.record.paymentNote,
    paymentReference: input.record.paymentReference,
    updatedAt: toIsoString(input.record.updatedAt),
    adjustments: input.adjustments.map(mapPayrollAdjustment),
  };
}

export function mapPayPeriodSummary(input: {
  payPeriod: PayPeriodEntity;
  records: PayrollRecordEntity[];
}): PayPeriodSummary {
  const statusCounts = createEmptyStatusCounts();

  for (const record of input.records) {
    statusCounts[record.status] += 1;
  }

  return {
    id: input.payPeriod.id,
    name: input.payPeriod.name,
    startDate: input.payPeriod.startDate,
    endDate: input.payPeriod.endDate,
    paymentDate: input.payPeriod.paymentDate,
    totalRecords: input.records.length,
    statusCounts,
  };
}

export function mapPayPeriodDetail(input: {
  payPeriod: PayPeriodEntity;
  records: Array<{
    record: PayrollRecordEntity;
    adjustments: PayrollAdjustmentEntity[];
  }>;
}): PayPeriodDetail {
  return {
    ...mapPayPeriodSummary({
      payPeriod: input.payPeriod,
      records: input.records.map((item) => item.record),
    }),
    records: input.records.map(mapPayrollRecordDetail),
  };
}

export function mapPayslipView(input: {
  payPeriod: PayPeriodEntity;
  record: PayrollRecordEntity;
  adjustments: PayrollAdjustmentEntity[];
}): PayslipView {
  const additions = input.adjustments
    .filter((adjustment) => adjustment.kind === 'addition')
    .map(mapPayrollAdjustment);
  const deductions = input.adjustments
    .filter((adjustment) => adjustment.kind === 'deduction')
    .map(mapPayrollAdjustment);

  return {
    payrollRecordId: input.record.id,
    payPeriodName: input.payPeriod.name,
    periodStartDate: input.payPeriod.startDate,
    periodEndDate: input.payPeriod.endDate,
    paymentDate: input.record.paymentDate,
    status: input.record.status,
    employee: {
      id: input.record.employeeId,
      employeeCode: input.record.employeeCodeSnapshot,
      fullName: input.record.employeeNameSnapshot,
      email: input.record.employeeEmailSnapshot,
      department: input.record.departmentSnapshot,
      position: input.record.positionSnapshot,
    },
    salaryType: input.record.salaryTypeSnapshot,
    baseRate: input.record.baseRateSnapshot,
    payUnits: input.record.payUnits,
    basePay: input.record.basePay,
    additions,
    deductions,
    additionsTotal: input.record.additionsTotal,
    deductionsTotal: input.record.deductionsTotal,
    netPay: input.record.netPay,
  };
}

export function cloneActor(actor: CurrentUser): CurrentUser {
  return {
    ...actor,
    employee: actor.employee ? { ...actor.employee } : null,
  };
}
