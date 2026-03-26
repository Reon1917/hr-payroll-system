import { Injectable } from '@nestjs/common';
import type { CurrentUser } from '@hr-payroll/shared';
import { cloneActor } from '../utils/mappers';
import { PayrollService } from '../payroll/payroll.service';

@Injectable()
export class MeService {
  constructor(private readonly payrollService: PayrollService) {}

  getCurrentUser(actor: CurrentUser) {
    return cloneActor(actor);
  }

  getPayslips(actor: CurrentUser) {
    return this.payrollService.getEmployeePayslips(actor);
  }

  getPayslip(actor: CurrentUser, payrollRecordId: string) {
    return this.payrollService.getEmployeePayslip(actor, payrollRecordId);
  }
}
