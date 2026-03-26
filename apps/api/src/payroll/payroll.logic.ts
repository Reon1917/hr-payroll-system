import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type {
  AdjustmentKind,
  PayrollAdjustmentView,
  PayrollStatus,
  SalaryType,
} from '@hr-payroll/shared';
import type {
  EmployeeEntity,
  PayrollAdjustmentEntity,
  PayrollRecordEntity,
} from '../storage/entities';

export interface EditableAdjustmentInput {
  kind: AdjustmentKind;
  type: PayrollAdjustmentView['type'];
  label: string;
  amount: number;
  note?: string | null;
}

export function assertEmployeePayrollReady(employee: EmployeeEntity): void {
  if (employee.employmentStatus !== 'active') {
    throw new ConflictException(
      `${employee.fullName} is not active and cannot be included in payroll.`,
    );
  }

  if (!employee.department || !employee.position || employee.baseRate <= 0) {
    throw new BadRequestException(
      `${employee.fullName} is missing required payroll data.`,
    );
  }
}

export function canEditPayrollStatus(status: PayrollStatus): boolean {
  return status === 'draft' || status === 'calculated';
}

export function assertEditableStatus(status: PayrollStatus): void {
  if (!canEditPayrollStatus(status)) {
    throw new ForbiddenException(
      'Only draft or calculated payroll records can be edited.',
    );
  }
}

export function calculateBasePay(input: {
  salaryType: SalaryType;
  baseRate: number;
  payUnits: number;
}): number {
  if (input.salaryType === 'monthly') {
    return Number(input.baseRate.toFixed(2));
  }

  if (input.payUnits <= 0) {
    throw new BadRequestException(
      'Daily and hourly payroll records require pay units greater than zero.',
    );
  }

  return Number((input.baseRate * input.payUnits).toFixed(2));
}

export function sumAdjustments(
  adjustments: Array<EditableAdjustmentInput | PayrollAdjustmentEntity>,
  kind: AdjustmentKind,
): number {
  return Number(
    adjustments
      .filter((adjustment) => adjustment.kind === kind)
      .reduce((total, adjustment) => total + adjustment.amount, 0)
      .toFixed(2),
  );
}

export function recalculatePayrollTotals(input: {
  salaryType: SalaryType;
  baseRate: number;
  payUnits: number;
  adjustments: Array<EditableAdjustmentInput | PayrollAdjustmentEntity>;
}): {
  basePay: number;
  additionsTotal: number;
  deductionsTotal: number;
  netPay: number;
} {
  const payUnits =
    input.salaryType === 'monthly' ? 1 : Number(input.payUnits.toFixed(2));
  const basePay = calculateBasePay({
    salaryType: input.salaryType,
    baseRate: input.baseRate,
    payUnits,
  });
  const additionsTotal = sumAdjustments(input.adjustments, 'addition');
  const deductionsTotal = sumAdjustments(input.adjustments, 'deduction');
  const netPay = Number(
    (basePay + additionsTotal - deductionsTotal).toFixed(2),
  );

  return {
    basePay,
    additionsTotal,
    deductionsTotal,
    netPay,
  };
}

export function assertCanTransitionToCalculated(
  records: PayrollRecordEntity[],
): void {
  if (records.length === 0) {
    throw new BadRequestException(
      'Create payroll drafts before running calculation.',
    );
  }

  const invalid = records.find(
    (record) => !canEditPayrollStatus(record.status),
  );

  if (invalid) {
    throw new ConflictException(
      'Only draft or calculated records can be recalculated.',
    );
  }
}

export function assertCanApprove(records: PayrollRecordEntity[]): void {
  if (records.length === 0) {
    throw new BadRequestException('No payroll records exist for this period.');
  }

  if (records.some((record) => record.status !== 'calculated')) {
    throw new ConflictException(
      'All payroll records must be calculated before approval.',
    );
  }
}

export function assertCanMarkPaid(records: PayrollRecordEntity[]): void {
  if (records.length === 0) {
    throw new BadRequestException('No payroll records exist for this period.');
  }

  if (records.some((record) => record.status !== 'approved')) {
    throw new ConflictException(
      'Only approved payroll records can be marked as paid.',
    );
  }
}

export function assertCanReopen(records: PayrollRecordEntity[]): void {
  if (records.some((record) => record.status === 'paid')) {
    throw new ConflictException(
      'Paid payroll records cannot be reopened. Cancel them instead.',
    );
  }

  if (
    records.some(
      (record) => record.status !== 'approved' && record.status !== 'cancelled',
    )
  ) {
    throw new ConflictException(
      'Only approved or cancelled payroll can be reopened.',
    );
  }
}

export function assertCanCancel(records: PayrollRecordEntity[]): void {
  if (records.length === 0) {
    throw new BadRequestException('No payroll records exist for this period.');
  }

  if (records.some((record) => record.status === 'cancelled')) {
    throw new ConflictException('Payroll is already cancelled.');
  }
}
