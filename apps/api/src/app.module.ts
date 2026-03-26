import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EmployeesController } from './employees/employees.controller';
import { EmployeesService } from './employees/employees.service';
import { MeController } from './me/me.controller';
import { MeService } from './me/me.service';
import { PayPeriodsController } from './pay-periods/pay-periods.controller';
import { PayPeriodsService } from './pay-periods/pay-periods.service';
import { PayrollController } from './payroll/payroll.controller';
import { PayrollService } from './payroll/payroll.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';
import { SeedsController } from './seeds/seeds.controller';
import { SeedsService } from './seeds/seeds.service';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [
    AppController,
    MeController,
    EmployeesController,
    PayPeriodsController,
    PayrollController,
    ReportsController,
    SeedsController,
  ],
  providers: [
    AppService,
    MeService,
    EmployeesService,
    PayPeriodsService,
    PayrollService,
    ReportsService,
    SeedsService,
  ],
})
export class AppModule {}
