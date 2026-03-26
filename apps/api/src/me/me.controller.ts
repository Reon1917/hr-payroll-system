import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import type { CurrentUser } from '@hr-payroll/shared';
import { AuthGuard } from '../common/auth.guard';
import { CurrentActor } from '../common/current-actor.decorator';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getCurrentUser(@CurrentActor() actor: CurrentUser) {
    return this.meService.getCurrentUser(actor);
  }

  @Get('payslips')
  getPayslips(@CurrentActor() actor: CurrentUser) {
    return this.meService.getPayslips(actor);
  }

  @Get('payslips/:payrollRecordId')
  getPayslip(
    @CurrentActor() actor: CurrentUser,
    @Param('payrollRecordId') payrollRecordId: string,
  ) {
    return this.meService.getPayslip(actor, payrollRecordId);
  }
}
