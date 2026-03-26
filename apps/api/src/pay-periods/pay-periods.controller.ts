import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentActor } from '../common/current-actor.decorator';
import { AuthGuard } from '../common/auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import type { CurrentUser } from '@hr-payroll/shared';
import { PayPeriodsService } from './pay-periods.service';
import { PayrollService } from '../payroll/payroll.service';

@Controller('pay-periods')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class PayPeriodsController {
  constructor(
    private readonly payPeriodsService: PayPeriodsService,
    private readonly payrollService: PayrollService,
  ) {}

  @Get()
  list() {
    return this.payPeriodsService.list();
  }

  @Get(':payPeriodId')
  getDetail(@Param('payPeriodId') payPeriodId: string) {
    return this.payrollService.getPayPeriodDetail(payPeriodId);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.payPeriodsService.create(body);
  }

  @Patch(':payPeriodId')
  update(
    @Param('payPeriodId') payPeriodId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.payPeriodsService.update(payPeriodId, body);
  }

  @Post(':payPeriodId/generate-drafts')
  generateDrafts(
    @Param('payPeriodId') payPeriodId: string,
    @CurrentActor() actor: CurrentUser,
  ) {
    return this.payrollService.generateDrafts(payPeriodId, actor);
  }

  @Post(':payPeriodId/calculate')
  calculate(
    @Param('payPeriodId') payPeriodId: string,
    @CurrentActor() actor: CurrentUser,
  ) {
    return this.payrollService.calculate(payPeriodId, actor);
  }

  @Post(':payPeriodId/approve')
  approve(
    @Param('payPeriodId') payPeriodId: string,
    @CurrentActor() actor: CurrentUser,
  ) {
    return this.payrollService.approve(payPeriodId, actor);
  }

  @Post(':payPeriodId/mark-paid')
  markPaid(
    @Param('payPeriodId') payPeriodId: string,
    @CurrentActor() actor: CurrentUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.payrollService.markPaid(payPeriodId, actor, body);
  }

  @Post(':payPeriodId/reopen')
  reopen(
    @Param('payPeriodId') payPeriodId: string,
    @CurrentActor() actor: CurrentUser,
  ) {
    return this.payrollService.reopen(payPeriodId, actor);
  }

  @Post(':payPeriodId/cancel')
  cancel(
    @Param('payPeriodId') payPeriodId: string,
    @CurrentActor() actor: CurrentUser,
  ) {
    return this.payrollService.cancel(payPeriodId, actor);
  }
}
