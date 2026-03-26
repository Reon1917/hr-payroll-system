import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../common/auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.employeesService.list(query);
  }

  @Get(':employeeId')
  getById(@Param('employeeId') employeeId: string) {
    return this.employeesService.getById(employeeId);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.employeesService.create(body);
  }

  @Patch(':employeeId')
  update(
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.employeesService.update(employeeId, body);
  }

  @Post(':employeeId/provision-account')
  provisionPortalAccount(
    @Req() request: Request,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.employeesService.provisionPortalAccount(
      request,
      employeeId,
      body,
    );
  }

  @Post(':employeeId/reset-password')
  resetPortalPassword(
    @Req() request: Request,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.employeesService.resetPortalPassword(request, employeeId, body);
  }
}
