import { Injectable } from '@nestjs/common';
import { PayrollService } from '../payroll/payroll.service';

@Injectable()
export class ReportsService {
  constructor(private readonly payrollService: PayrollService) {}

  getPayrollSummary(periodId: string) {
    return this.payrollService.getPayrollSummary(periodId);
  }
}
