import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { APP_REPOSITORY, type AppRepository } from '../storage/app-repository';
import { mapPayPeriodSummary } from '../utils/mappers';
import {
  assertFound,
  optionalString,
  requireDateString,
  requireString,
} from '../utils/validation';

@Injectable()
export class PayPeriodsService {
  constructor(
    @Inject(APP_REPOSITORY)
    private readonly repository: AppRepository,
  ) {}

  async list() {
    const periods = await this.repository.listPayPeriods();
    return Promise.all(
      periods.map(async (period) =>
        mapPayPeriodSummary({
          payPeriod: period,
          records: await this.repository.listPayrollRecordsByPayPeriod(
            period.id,
          ),
        }),
      ),
    );
  }

  async create(body: Record<string, unknown>) {
    const input = {
      name: requireString(body.name, 'name'),
      startDate: requireDateString(body.startDate, 'startDate'),
      endDate: requireDateString(body.endDate, 'endDate'),
      paymentDate: requireDateString(body.paymentDate, 'paymentDate'),
    };

    const existing = await this.repository.listPayPeriods();
    if (
      existing.some(
        (payPeriod) =>
          payPeriod.name.toLowerCase() === input.name.toLowerCase(),
      )
    ) {
      throw new ConflictException('Pay period name already exists.');
    }

    const payPeriod = await this.repository.createPayPeriod(input);
    return mapPayPeriodSummary({
      payPeriod,
      records: [],
    });
  }

  async update(payPeriodId: string, body: Record<string, unknown>) {
    const existing = assertFound(
      await this.repository.getPayPeriodById(payPeriodId),
      'Pay period not found.',
    );

    const input = {
      name: optionalString(body.name),
      startDate:
        body.startDate === undefined
          ? undefined
          : requireDateString(body.startDate, 'startDate'),
      endDate:
        body.endDate === undefined
          ? undefined
          : requireDateString(body.endDate, 'endDate'),
      paymentDate:
        body.paymentDate === undefined
          ? undefined
          : requireDateString(body.paymentDate, 'paymentDate'),
    };

    const allPeriods = await this.repository.listPayPeriods();
    if (
      input.name &&
      allPeriods.some(
        (period) =>
          period.id !== payPeriodId &&
          period.name.toLowerCase() === input.name?.toLowerCase(),
      )
    ) {
      throw new ConflictException('Pay period name already exists.');
    }

    const payPeriod = assertFound(
      await this.repository.updatePayPeriod(payPeriodId, input),
      'Pay period not found.',
    );
    const records = await this.repository.listPayrollRecordsByPayPeriod(
      existing.id,
    );

    return mapPayPeriodSummary({
      payPeriod,
      records,
    });
  }
}
