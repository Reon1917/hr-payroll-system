import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type {
  CurrentUser,
  PayPeriodDetail,
  PayslipView,
  PayrollSummaryReport,
} from '@hr-payroll/shared';
import { ADJUSTMENT_KINDS, ADJUSTMENT_TYPES } from '@hr-payroll/shared';
import {
  APP_REPOSITORY,
  buildPayrollSummaryReport,
  type AppRepository,
} from '../storage/app-repository';
import {
  mapPayPeriodDetail,
  mapPayslipView,
  mapPayrollRecordDetail,
} from '../utils/mappers';
import {
  assertFound,
  optionalString,
  requireArray,
  requireDateString,
  requireEnum,
  requireNumber,
  requireString,
} from '../utils/validation';
import {
  assertCanApprove,
  assertCanCancel,
  assertCanMarkPaid,
  assertCanReopen,
  assertCanTransitionToCalculated,
  assertEditableStatus,
  assertEmployeePayrollReady,
  recalculatePayrollTotals,
  type EditableAdjustmentInput,
} from './payroll.logic';

@Injectable()
export class PayrollService {
  constructor(
    @Inject(APP_REPOSITORY)
    private readonly repository: AppRepository,
  ) {}

  async getPayPeriodDetail(payPeriodId: string): Promise<PayPeriodDetail> {
    const payPeriod = assertFound(
      await this.repository.getPayPeriodById(payPeriodId),
      'Pay period not found.',
    );
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(payPeriodId);
    const detailedRecords = await Promise.all(
      records.map(async (record) => ({
        record,
        adjustments: await this.repository.listPayrollAdjustmentsByRecordId(
          record.id,
        ),
      })),
    );

    return mapPayPeriodDetail({
      payPeriod,
      records: detailedRecords,
    });
  }

  async generateDrafts(
    payPeriodId: string,
    actor: CurrentUser,
  ): Promise<PayPeriodDetail> {
    const payPeriod = assertFound(
      await this.repository.getPayPeriodById(payPeriodId),
      'Pay period not found.',
    );
    const employees = await this.repository.listEmployees({
      employmentStatus: 'active',
    });

    for (const employee of employees) {
      assertEmployeePayrollReady(employee);

      const existing =
        await this.repository.getPayrollRecordByEmployeeAndPeriod(
          employee.id,
          payPeriodId,
        );

      if (existing) {
        continue;
      }

      const payUnits = employee.salaryType === 'monthly' ? 1 : 0;
      const totals =
        employee.salaryType === 'monthly'
          ? recalculatePayrollTotals({
              salaryType: employee.salaryType,
              baseRate: employee.baseRate,
              payUnits,
              adjustments: [],
            })
          : {
              basePay: 0,
              additionsTotal: 0,
              deductionsTotal: 0,
              netPay: 0,
            };

      await this.repository.createPayrollRecord({
        payPeriodId: payPeriod.id,
        employeeId: employee.id,
        employeeCodeSnapshot: employee.employeeCode,
        employeeNameSnapshot: employee.fullName,
        employeeEmailSnapshot: employee.email,
        departmentSnapshot: employee.department,
        positionSnapshot: employee.position,
        salaryTypeSnapshot: employee.salaryType,
        baseRateSnapshot: employee.baseRate,
        payUnits,
        basePay: totals.basePay,
        additionsTotal: totals.additionsTotal,
        deductionsTotal: totals.deductionsTotal,
        netPay: totals.netPay,
        status: 'draft',
        createdByUserId: actor.authUserId,
        updatedByUserId: actor.authUserId,
      });
    }

    return this.getPayPeriodDetail(payPeriodId);
  }

  async updatePayrollRecord(
    recordId: string,
    actor: CurrentUser,
    body: Record<string, unknown>,
  ) {
    const record = assertFound(
      await this.repository.getPayrollRecordById(recordId),
      'Payroll record not found.',
    );
    assertEditableStatus(record.status);

    const adjustments = this.parseAdjustments(body.adjustments);
    const payUnits =
      body.payUnits === undefined
        ? record.payUnits
        : requireNumber(body.payUnits, 'payUnits');
    const totals = recalculatePayrollTotals({
      salaryType: record.salaryTypeSnapshot,
      baseRate: record.baseRateSnapshot,
      payUnits,
      adjustments,
    });

    await this.repository.replacePayrollAdjustments({
      payrollRecordId: record.id,
      adjustments,
    });

    const updated = assertFound(
      await this.repository.updatePayrollRecord(record.id, {
        payUnits,
        basePay: totals.basePay,
        additionsTotal: totals.additionsTotal,
        deductionsTotal: totals.deductionsTotal,
        netPay: totals.netPay,
        status: 'draft',
        updatedByUserId: actor.authUserId,
      }),
      'Payroll record not found.',
    );
    const savedAdjustments =
      await this.repository.listPayrollAdjustmentsByRecordId(updated.id);

    return mapPayrollRecordDetail({
      record: updated,
      adjustments: savedAdjustments,
    });
  }

  async calculate(
    payPeriodId: string,
    actor: CurrentUser,
  ): Promise<PayPeriodDetail> {
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(payPeriodId);
    assertCanTransitionToCalculated(records);

    for (const record of records) {
      const adjustments =
        await this.repository.listPayrollAdjustmentsByRecordId(record.id);
      const totals = recalculatePayrollTotals({
        salaryType: record.salaryTypeSnapshot,
        baseRate: record.baseRateSnapshot,
        payUnits: record.payUnits,
        adjustments,
      });

      await this.repository.updatePayrollRecord(record.id, {
        basePay: totals.basePay,
        additionsTotal: totals.additionsTotal,
        deductionsTotal: totals.deductionsTotal,
        netPay: totals.netPay,
        status: 'calculated',
        updatedByUserId: actor.authUserId,
      });
    }

    return this.getPayPeriodDetail(payPeriodId);
  }

  async approve(
    payPeriodId: string,
    actor: CurrentUser,
  ): Promise<PayPeriodDetail> {
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(payPeriodId);
    assertCanApprove(records);

    const now = new Date();
    for (const record of records) {
      await this.repository.updatePayrollRecord(record.id, {
        status: 'approved',
        updatedByUserId: actor.authUserId,
        approvedByUserId: actor.authUserId,
        approvedAt: now,
      });
    }

    return this.getPayPeriodDetail(payPeriodId);
  }

  async markPaid(
    payPeriodId: string,
    actor: CurrentUser,
    body: Record<string, unknown>,
  ): Promise<PayPeriodDetail> {
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(payPeriodId);
    assertCanMarkPaid(records);

    const paymentDate = requireDateString(body.paymentDate, 'paymentDate');
    const paymentNote = optionalString(body.paymentNote) ?? null;
    const paymentReference = optionalString(body.paymentReference) ?? null;
    const now = new Date();

    for (const record of records) {
      await this.repository.updatePayrollRecord(record.id, {
        status: 'paid',
        paymentDate,
        paymentNote,
        paymentReference,
        updatedByUserId: actor.authUserId,
        paidByUserId: actor.authUserId,
        paidAt: now,
      });
    }

    return this.getPayPeriodDetail(payPeriodId);
  }

  async reopen(
    payPeriodId: string,
    actor: CurrentUser,
  ): Promise<PayPeriodDetail> {
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(payPeriodId);
    assertCanReopen(records);

    for (const record of records) {
      await this.repository.updatePayrollRecord(record.id, {
        status: 'calculated',
        updatedByUserId: actor.authUserId,
        approvedByUserId: null,
        approvedAt: null,
        cancelledByUserId: null,
        cancelledAt: null,
        reopenedByUserId: actor.authUserId,
        reopenedAt: new Date(),
      });
    }

    return this.getPayPeriodDetail(payPeriodId);
  }

  async cancel(
    payPeriodId: string,
    actor: CurrentUser,
  ): Promise<PayPeriodDetail> {
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(payPeriodId);
    assertCanCancel(records);

    const now = new Date();

    for (const record of records) {
      await this.repository.updatePayrollRecord(record.id, {
        status: 'cancelled',
        updatedByUserId: actor.authUserId,
        cancelledByUserId: actor.authUserId,
        cancelledAt: now,
      });
    }

    return this.getPayPeriodDetail(payPeriodId);
  }

  async getEmployeePayslips(actor: CurrentUser) {
    if (!actor.employeeId) {
      throw new ForbiddenException(
        'This account is not linked to an employee record.',
      );
    }

    const periods = await this.repository.listPayPeriods();
    const payslips: PayslipView[] = [];

    for (const payPeriod of periods) {
      const records = await this.repository.listPayrollRecordsByPayPeriod(
        payPeriod.id,
      );
      const record = records.find(
        (item) => item.employeeId === actor.employeeId,
      );

      if (!record || record.status !== 'paid') {
        continue;
      }

      const adjustments =
        await this.repository.listPayrollAdjustmentsByRecordId(record.id);
      payslips.push(
        mapPayslipView({
          payPeriod,
          record,
          adjustments,
        }),
      );
    }

    return payslips.toSorted((left, right) =>
      right.periodStartDate.localeCompare(left.periodStartDate),
    );
  }

  async getEmployeePayslip(actor: CurrentUser, payrollRecordId: string) {
    if (!actor.employeeId) {
      throw new ForbiddenException(
        'This account is not linked to an employee record.',
      );
    }

    const record = assertFound(
      await this.repository.getPayrollRecordById(payrollRecordId),
      'Payslip not found.',
    );

    if (record.employeeId !== actor.employeeId && actor.role !== 'admin') {
      throw new ForbiddenException(
        'You cannot access another employee payslip.',
      );
    }

    if (actor.role !== 'admin' && record.status !== 'paid') {
      throw new ForbiddenException(
        'This payslip is not available to the employee yet.',
      );
    }

    const payPeriod = assertFound(
      await this.repository.getPayPeriodById(record.payPeriodId),
      'Pay period not found.',
    );
    const adjustments = await this.repository.listPayrollAdjustmentsByRecordId(
      record.id,
    );

    return mapPayslipView({
      payPeriod,
      record,
      adjustments,
    });
  }

  async getPayrollSummary(periodId: string): Promise<PayrollSummaryReport> {
    const payPeriod = assertFound(
      await this.repository.getPayPeriodById(periodId),
      'Pay period not found.',
    );
    const records =
      await this.repository.listPayrollRecordsByPayPeriod(periodId);

    return buildPayrollSummaryReport({
      payPeriodId: payPeriod.id,
      payPeriodName: payPeriod.name,
      records,
    });
  }

  private parseAdjustments(value: unknown): EditableAdjustmentInput[] {
    const array = requireArray(value ?? [], 'adjustments');

    return array.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(
          `adjustments[${index}] must be an object.`,
        );
      }

      const adjustment = item as Record<string, unknown>;

      return {
        kind: requireEnum(
          adjustment.kind,
          `adjustments[${index}].kind`,
          ADJUSTMENT_KINDS,
        ),
        type: requireEnum(
          adjustment.type,
          `adjustments[${index}].type`,
          ADJUSTMENT_TYPES,
        ),
        label: requireString(adjustment.label, `adjustments[${index}].label`),
        amount: requireNumber(
          adjustment.amount,
          `adjustments[${index}].amount`,
        ),
        note: optionalString(adjustment.note) ?? null,
      };
    });
  }
}
