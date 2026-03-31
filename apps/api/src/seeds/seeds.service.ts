import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { EmployeeEntity, PayPeriodEntity } from '../storage/entities';
import { appEnv } from '../config/env';
import { AuthService } from '../auth/auth.service';
import { APP_REPOSITORY, type AppRepository } from '../storage/app-repository';
import { PayrollService } from '../payroll/payroll.service';
import { recalculatePayrollTotals } from '../payroll/payroll.logic';
import {
  demoSeedSchema,
  type DemoAccountKey,
  type DemoEmployeeKey,
  type DemoPayPeriodKey,
} from './demo-seed.schema';

@Injectable()
export class SeedsService {
  constructor(
    private readonly authService: AuthService,
    private readonly payrollService: PayrollService,
    @Inject(APP_REPOSITORY)
    private readonly repository: AppRepository,
  ) {}

  private getAccountCredentials(key: DemoAccountKey) {
    if (key === 'admin') {
      return {
        email: appEnv.demoAdminEmail,
        password: appEnv.demoAdminPassword,
      };
    }

    return {
      email: appEnv.demoEmployeeEmail,
      password: appEnv.demoEmployeePassword,
    };
  }

  async resetAndSeed() {
    await this.repository.resetAll();

    const accounts = new Map<
      DemoAccountKey,
      {
        authUserId: string;
        email: string;
        role: 'admin' | 'employee';
      }
    >();

    for (const accountSeed of demoSeedSchema.accounts) {
      const credentials = this.getAccountCredentials(accountSeed.key);
      const account = await this.authService.signUpUser({
        email: credentials.email,
        password: credentials.password,
        name: accountSeed.name,
        role: accountSeed.role,
      });

      accounts.set(accountSeed.key, {
        authUserId: account.user.id,
        email: account.user.email,
        role: accountSeed.role,
      });

      await this.repository.upsertUserProfile({
        authUserId: account.user.id,
        role: accountSeed.role,
        employeeId: null,
      });
    }

    const employees = new Map<DemoEmployeeKey, EmployeeEntity>();

    for (const employeeSeed of demoSeedSchema.employees) {
      const linkedAccountKey =
        'accountKey' in employeeSeed ? employeeSeed.accountKey : undefined;
      const linkedAccount = linkedAccountKey
        ? accounts.get(linkedAccountKey)
        : undefined;
      const seededEmail =
        'email' in employeeSeed ? employeeSeed.email : undefined;
      const email = linkedAccount?.email ?? seededEmail;

      if (!email) {
        throw new Error(`Missing email for seeded employee ${employeeSeed.key}.`);
      }

      const employee = await this.repository.createEmployee({
        employeeCode: employeeSeed.employeeCode,
        fullName: employeeSeed.fullName,
        email,
        employmentStatus: employeeSeed.employmentStatus,
        workerType: employeeSeed.workerType,
        nationality: employeeSeed.nationality,
        nationalId: employeeSeed.nationalId,
        passportNumber: employeeSeed.passportNumber,
        taxId: employeeSeed.taxId,
        socialSecurityNumber: employeeSeed.socialSecurityNumber,
        socialSecurityEnabled: employeeSeed.socialSecurityEnabled,
        hireDate: employeeSeed.hireDate,
        department: employeeSeed.department,
        position: employeeSeed.position,
        salaryType: employeeSeed.salaryType,
        baseRate: employeeSeed.baseRate,
        bankName: employeeSeed.bankName,
        bankAccountName: employeeSeed.bankAccountName,
        bankAccountNumber: employeeSeed.bankAccountNumber,
        workPermitNumber: employeeSeed.workPermitNumber,
        workPermitExpiryDate: employeeSeed.workPermitExpiryDate,
        visaType: employeeSeed.visaType,
        visaExpiryDate: employeeSeed.visaExpiryDate,
        linkedAuthUserId: linkedAccount?.authUserId ?? null,
      });

      employees.set(employeeSeed.key, employee);

      if (linkedAccount?.role === 'employee') {
        await this.repository.upsertUserProfile({
          authUserId: linkedAccount.authUserId,
          role: 'employee',
          employeeId: employee.id,
        });
      }
    }

    const payPeriods = new Map<DemoPayPeriodKey, PayPeriodEntity>();

    for (const payPeriodSeed of demoSeedSchema.payPeriods) {
      const payPeriod = await this.repository.createPayPeriod({
        name: payPeriodSeed.name,
        startDate: payPeriodSeed.startDate,
        endDate: payPeriodSeed.endDate,
        paymentDate: payPeriodSeed.paymentDate,
      });

      payPeriods.set(payPeriodSeed.key, payPeriod);
    }

    const adminAccount = accounts.get('admin');

    if (!adminAccount) {
      throw new Error('Missing seeded admin account.');
    }

    for (const draftRecordSeed of demoSeedSchema.draftPayroll) {
      const employee = employees.get(draftRecordSeed.employeeKey);
      const payPeriod = payPeriods.get(draftRecordSeed.payPeriodKey);

      if (!employee || !payPeriod) {
        throw new Error('Demo draft payroll schema references missing records.');
      }

      const totals =
        employee.salaryType === 'monthly'
          ? recalculatePayrollTotals({
              salaryType: employee.salaryType,
              baseRate: employee.baseRate,
              payUnits: draftRecordSeed.payUnits,
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
        payUnits: draftRecordSeed.payUnits,
        basePay: totals.basePay,
        additionsTotal: totals.additionsTotal,
        deductionsTotal: totals.deductionsTotal,
        netPay: totals.netPay,
        status: 'draft',
        createdByUserId: adminAccount.authUserId,
        updatedByUserId: adminAccount.authUserId,
      });
    }

    for (const historicalRecordSeed of demoSeedSchema.historicalPayroll) {
      const employee = employees.get(historicalRecordSeed.employeeKey);
      const payPeriod = payPeriods.get(historicalRecordSeed.payPeriodKey);

      if (!employee || !payPeriod) {
        throw new Error(
          'Demo historical payroll schema references missing records.',
        );
      }

      const totals = recalculatePayrollTotals({
        salaryType: employee.salaryType,
        baseRate: employee.baseRate,
        payUnits: historicalRecordSeed.payUnits,
        adjustments: historicalRecordSeed.adjustments,
      });

      const record = await this.repository.createPayrollRecord({
        payPeriodId: payPeriod.id,
        employeeId: employee.id,
        employeeCodeSnapshot: employee.employeeCode,
        employeeNameSnapshot: employee.fullName,
        employeeEmailSnapshot: employee.email,
        departmentSnapshot: employee.department,
        positionSnapshot: employee.position,
        salaryTypeSnapshot: employee.salaryType,
        baseRateSnapshot: employee.baseRate,
        payUnits: historicalRecordSeed.payUnits,
        basePay: totals.basePay,
        additionsTotal: totals.additionsTotal,
        deductionsTotal: totals.deductionsTotal,
        netPay: totals.netPay,
        status: historicalRecordSeed.status,
        paymentDate: payPeriod.paymentDate,
        paymentNote: historicalRecordSeed.paymentNote,
        paymentReference: historicalRecordSeed.paymentReference,
        createdByUserId: adminAccount.authUserId,
        updatedByUserId: adminAccount.authUserId,
      });

      await this.repository.replacePayrollAdjustments({
        payrollRecordId: record.id,
        adjustments: historicalRecordSeed.adjustments,
      });

      await this.repository.updatePayrollRecord(record.id, {
        status: historicalRecordSeed.status,
        paymentDate: payPeriod.paymentDate,
        paymentNote: historicalRecordSeed.paymentNote,
        paymentReference: historicalRecordSeed.paymentReference,
        approvedByUserId: adminAccount.authUserId,
        approvedAt: new Date(historicalRecordSeed.approvedAt),
        paidByUserId: adminAccount.authUserId,
        paidAt: new Date(historicalRecordSeed.paidAt),
        updatedByUserId: adminAccount.authUserId,
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
