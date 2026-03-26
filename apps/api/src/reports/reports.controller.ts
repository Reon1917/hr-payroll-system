import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ReportsService } from './reports.service';
import { requireString } from '../utils/validation';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('payroll-summary')
  getPayrollSummary(@Query() query: Record<string, unknown>) {
    const periodId = requireString(query.periodId, 'periodId');
    return this.reportsService.getPayrollSummary(periodId);
  }
}
