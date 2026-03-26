import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { appEnv } from '../config/env';
import { AuthService } from '../auth/auth.service';
import { APP_REPOSITORY, type AppRepository } from '../storage/app-repository';
import { PayrollService } from '../payroll/payroll.service';
import { recalculatePayrollTotals } from '../payroll/payroll.logic';

@Injectable()
export class SeedsService {
  constructor(
    private readonly authService: AuthService,
    private readonly payrollService: PayrollService,
    @Inject(APP_REPOSITORY)
    private readonly repository: AppRepository,
  ) {}

  async resetAndSeed() {
    await this.repository.resetAll();

    const adminAccount = await this.authService.signUpUser({
      email: appEnv.demoAdminEmail,
      password: appEnv.demoAdminPassword,
      name: 'HR Admin',
      role: 'admin',
    });

    await this.repository.upsertUserProfile({
      authUserId: adminAccount.user.id,
      role: 'admin',
      employeeId: null,
    });

    const employeeAccount = await this.authService.signUpUser({
      email: appEnv.demoEmployeeEmail,
      password: appEnv.demoEmployeePassword,
      name: 'Nok Payroll',
      role: 'employee',
    });

    const salariedEmployee = await this.repository.createEmployee({
      employeeCode: 'EMP-001',
      fullName: 'Nok Payroll',
      email: appEnv.demoEmployeeEmail,
      employmentStatus: 'active',
      workerType: 'thai',
      nationality: 'Thai',
      nationalId: '1103700000001',
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
      linkedAuthUserId: employeeAccount.user.id,
    });

    await this.repository.upsertUserProfile({
      authUserId: employeeAccount.user.id,
      role: 'employee',
      employeeId: salariedEmployee.id,
    });

    const dailyEmployee = await this.repository.createEmployee({
      employeeCode: 'EMP-002',
      fullName: 'Somchai Daily',
      email: 'somchai.daily@company.test',
      employmentStatus: 'active',
      workerType: 'thai',
      nationality: 'Thai',
      nationalId: '1103700000002',
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
    });

    const hourlyEmployee = await this.repository.createEmployee({
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
    });

    const currentPeriod = await this.repository.createPayPeriod({
      name: 'April 2026 Payroll',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      paymentDate: '2026-05-01',
    });

    const historicalPeriod = await this.repository.createPayPeriod({
      name: 'March 2026 Payroll',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      paymentDate: '2026-04-01',
    });

    for (const employee of [salariedEmployee, dailyEmployee, hourlyEmployee]) {
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
        payPeriodId: currentPeriod.id,
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
        createdByUserId: adminAccount.user.id,
        updatedByUserId: adminAccount.user.id,
      });
    }

    const historicalSeed = [
      {
        employee: salariedEmployee,
        payUnits: 1,
        adjustments: [
          {
            kind: 'addition' as const,
            type: 'allowance' as const,
            label: 'Transport allowance',
            amount: 1500,
            note: null,
          },
          {
            kind: 'deduction' as const,
            type: 'tax' as const,
            label: 'Tax withholding',
            amount: 2400,
            note: null,
          },
        ],
      },
      {
        employee: dailyEmployee,
        payUnits: 26,
        adjustments: [
          {
            kind: 'addition' as const,
            type: 'overtime' as const,
            label: 'Overtime',
            amount: 1200,
            note: null,
          },
        ],
      },
      {
        employee: hourlyEmployee,
        payUnits: 168,
        adjustments: [
          {
            kind: 'deduction' as const,
            type: 'social_security' as const,
            label: 'Social security',
            amount: 750,
            note: null,
          },
        ],
      },
    ];

    for (const item of historicalSeed) {
      const totals = recalculatePayrollTotals({
        salaryType: item.employee.salaryType,
        baseRate: item.employee.baseRate,
        payUnits: item.payUnits,
        adjustments: item.adjustments,
      });

      const record = await this.repository.createPayrollRecord({
        payPeriodId: historicalPeriod.id,
        employeeId: item.employee.id,
        employeeCodeSnapshot: item.employee.employeeCode,
        employeeNameSnapshot: item.employee.fullName,
        employeeEmailSnapshot: item.employee.email,
        departmentSnapshot: item.employee.department,
        positionSnapshot: item.employee.position,
        salaryTypeSnapshot: item.employee.salaryType,
        baseRateSnapshot: item.employee.baseRate,
        payUnits: item.payUnits,
        basePay: totals.basePay,
        additionsTotal: totals.additionsTotal,
        deductionsTotal: totals.deductionsTotal,
        netPay: totals.netPay,
        status: 'paid',
        paymentDate: historicalPeriod.paymentDate,
        paymentNote: 'Manual transfer completed',
        paymentReference: 'MARCH-2026-BATCH',
        createdByUserId: adminAccount.user.id,
        updatedByUserId: adminAccount.user.id,
      });

      await this.repository.replacePayrollAdjustments({
        payrollRecordId: record.id,
        adjustments: item.adjustments,
      });

      await this.repository.updatePayrollRecord(record.id, {
        status: 'paid',
        paymentDate: historicalPeriod.paymentDate,
        paymentNote: 'Manual transfer completed',
        paymentReference: 'MARCH-2026-BATCH',
        approvedByUserId: adminAccount.user.id,
        approvedAt: new Date('2026-03-31T09:00:00.000Z'),
        paidByUserId: adminAccount.user.id,
        paidAt: new Date('2026-04-01T03:00:00.000Z'),
        updatedByUserId: adminAccount.user.id,
      });
    }

    return {
      credentials: {
        admin: {
          email: appEnv.demoAdminEmail,
          password: appEnv.demoAdminPassword,
        },
        employee: {
          email: appEnv.demoEmployeeEmail,
          password: appEnv.demoEmployeePassword,
        },
      },
    };
  }

  async ensureSeeded(): Promise<void> {
    const periods = await this.repository.listPayPeriods();

    if (periods.length === 0) {
      await this.resetAndSeed();
    }
  }

  assertSeedingAllowed(): void {
    if (appEnv.nodeEnv === 'production') {
      throw new ForbiddenException('Seeding is disabled in production.');
    }
  }
}
