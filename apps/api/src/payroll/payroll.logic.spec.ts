import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { EmployeeEntity, PayrollRecordEntity } from '../storage/entities';
import {
  assertCanApprove,
  assertCanCancel,
  assertCanMarkPaid,
  assertCanReopen,
  assertCanTransitionToCalculated,
  assertEditableStatus,
  assertEmployeePayrollReady,
  calculateBasePay,
  recalculatePayrollTotals,
} from './payroll.logic';

function createEmployee(
  overrides: Partial<EmployeeEntity> = {},
): EmployeeEntity {
  return {
    id: 'employee-1',
    employeeCode: 'EMP-001',
    fullName: 'Nok Payroll',
    email: 'nok@company.test',
    employmentStatus: 'active',
    workerType: 'thai',
    nationality: 'Thai',
    nationalId: '1103700000001',
    passportNumber: null,
    taxId: '1103700000001',
    socialSecurityNumber: '1103700000001',
    socialSecurityEnabled: true,
    hireDate: '2025-01-01',
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
    linkedAuthUserId: 'auth-user-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createRecord(
  status: PayrollRecordEntity['status'],
): PayrollRecordEntity {
  return {
    id: `record-${status}`,
    payPeriodId: 'period-1',
    employeeId: 'employee-1',
    employeeCodeSnapshot: 'EMP-001',
    employeeNameSnapshot: 'Nok Payroll',
    employeeEmailSnapshot: 'nok@company.test',
    departmentSnapshot: 'Operations',
    positionSnapshot: 'Payroll Specialist',
    salaryTypeSnapshot: 'monthly',
    baseRateSnapshot: 42000,
    payUnits: 1,
    basePay: 42000,
    additionsTotal: 0,
    deductionsTotal: 0,
    netPay: 42000,
    status,
    paymentDate: null,
    paymentNote: null,
    paymentReference: null,
    createdByUserId: 'admin-1',
    updatedByUserId: 'admin-1',
    approvedByUserId: null,
    approvedAt: null,
    paidByUserId: null,
    paidAt: null,
    cancelledByUserId: null,
    cancelledAt: null,
    reopenedByUserId: null,
    reopenedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}

describe('payroll.logic', () => {
  it('validates payroll readiness for active employees with complete data', () => {
    expect(() => assertEmployeePayrollReady(createEmployee())).not.toThrow();
    expect(() =>
      assertEmployeePayrollReady(
        createEmployee({
          employmentStatus: 'inactive',
        }),
      ),
    ).toThrow(ConflictException);
    expect(() =>
      assertEmployeePayrollReady(
        createEmployee({
          department: '',
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it('calculates monthly salary with a fixed single pay unit', () => {
    const totals = recalculatePayrollTotals({
      salaryType: 'monthly',
      baseRate: 42000,
      payUnits: 25,
      adjustments: [
        {
          kind: 'addition',
          type: 'allowance',
          label: 'Allowance',
          amount: 1500,
        },
        {
          kind: 'deduction',
          type: 'tax',
          label: 'Tax',
          amount: 2400,
        },
      ],
    });

    expect(totals).toEqual({
      basePay: 42000,
      additionsTotal: 1500,
      deductionsTotal: 2400,
      netPay: 41100,
    });
  });

  it('requires positive pay units for daily and hourly payroll records', () => {
    expect(() =>
      calculateBasePay({
        salaryType: 'daily',
        baseRate: 850,
        payUnits: 0,
      }),
    ).toThrow(BadRequestException);

    expect(
      calculateBasePay({
        salaryType: 'hourly',
        baseRate: 160,
        payUnits: 168,
      }),
    ).toBe(26880);
  });

  it('limits editing to draft and calculated payroll records', () => {
    expect(() => assertEditableStatus('draft')).not.toThrow();
    expect(() => assertEditableStatus('calculated')).not.toThrow();
    expect(() => assertEditableStatus('approved')).toThrow(ForbiddenException);
  });

  it('enforces valid status transitions for calculation, approval, and payment', () => {
    expect(() =>
      assertCanTransitionToCalculated([
        createRecord('draft'),
        createRecord('calculated'),
      ]),
    ).not.toThrow();
    expect(() =>
      assertCanTransitionToCalculated([createRecord('approved')]),
    ).toThrow(ConflictException);

    expect(() =>
      assertCanApprove([
        createRecord('calculated'),
        createRecord('calculated'),
      ]),
    ).not.toThrow();
    expect(() => assertCanApprove([createRecord('draft')])).toThrow(
      ConflictException,
    );

    expect(() =>
      assertCanMarkPaid([createRecord('approved'), createRecord('approved')]),
    ).not.toThrow();
    expect(() => assertCanMarkPaid([createRecord('calculated')])).toThrow(
      ConflictException,
    );
  });

  it('allows reopen only for approved or cancelled records, never paid ones', () => {
    expect(() =>
      assertCanReopen([createRecord('approved'), createRecord('cancelled')]),
    ).not.toThrow();
    expect(() => assertCanReopen([createRecord('paid')])).toThrow(
      ConflictException,
    );
    expect(() => assertCanReopen([createRecord('draft')])).toThrow(
      ConflictException,
    );
  });

  it('prevents cancelling payroll that is already cancelled', () => {
    expect(() => assertCanCancel([createRecord('approved')])).not.toThrow();
    expect(() => assertCanCancel([createRecord('cancelled')])).toThrow(
      ConflictException,
    );
  });
});
