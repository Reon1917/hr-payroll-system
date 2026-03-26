import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import type { CurrentUser } from '@hr-payroll/shared';
import { AuthGuard } from '../common/auth.guard';
import { CurrentActor } from '../common/current-actor.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { PayrollService } from './payroll.service';

@Controller('payroll-records')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Patch(':recordId')
  updatePayrollRecord(
    @Param('recordId') recordId: string,
    @CurrentActor() actor: CurrentUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.payrollService.updatePayrollRecord(recordId, actor, body);
  }
}
