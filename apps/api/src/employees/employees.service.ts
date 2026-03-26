import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { EmployeeDetail } from '@hr-payroll/shared';
import {
  EMPLOYMENT_STATUSES,
  SALARY_TYPES,
  WORKER_TYPES,
} from '@hr-payroll/shared';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { APP_REPOSITORY, type AppRepository } from '../storage/app-repository';
import { mapEmployeeDetail, mapEmployeeSummary } from '../utils/mappers';
import {
  assertConflict,
  assertFound,
  optionalNumber,
  optionalString,
  requireBoolean,
  requireDateString,
  requireEnum,
  requireNumber,
  requireString,
} from '../utils/validation';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly authService: AuthService,
    @Inject(APP_REPOSITORY)
    private readonly repository: AppRepository,
  ) {}

  async list(query: Record<string, unknown>) {
    const employees = await this.repository.listEmployees({
      search: optionalString(query.search),
      employmentStatus: query.employmentStatus
        ? requireEnum(
            query.employmentStatus,
            'employmentStatus',
            EMPLOYMENT_STATUSES,
          )
        : undefined,
      workerType: query.workerType
        ? requireEnum(query.workerType, 'workerType', WORKER_TYPES)
        : undefined,
      salaryType: query.salaryType
        ? requireEnum(query.salaryType, 'salaryType', SALARY_TYPES)
        : undefined,
    });

    return employees.map(mapEmployeeSummary);
  }

  async getById(id: string): Promise<EmployeeDetail> {
    const employee = assertFound(
      await this.repository.getEmployeeById(id),
      'Employee not found.',
    );

    return mapEmployeeDetail(employee);
  }

  async create(body: Record<string, unknown>): Promise<EmployeeDetail> {
    const input = {
      employeeCode: requireString(body.employeeCode, 'employeeCode'),
      fullName: requireString(body.fullName, 'fullName'),
      email: requireString(body.email, 'email'),
      employmentStatus: requireEnum(
        body.employmentStatus,
        'employmentStatus',
        EMPLOYMENT_STATUSES,
      ),
      workerType: body.workerType
        ? requireEnum(body.workerType, 'workerType', WORKER_TYPES)
        : 'thai',
      nationality: optionalString(body.nationality) ?? null,
      nationalId: optionalString(body.nationalId) ?? null,
      passportNumber: optionalString(body.passportNumber) ?? null,
      taxId: optionalString(body.taxId) ?? null,
      socialSecurityNumber: optionalString(body.socialSecurityNumber) ?? null,
      socialSecurityEnabled:
        body.socialSecurityEnabled === undefined
          ? true
          : requireBoolean(body.socialSecurityEnabled, 'socialSecurityEnabled'),
      hireDate:
        body.hireDate === undefined
          ? null
          : requireDateString(body.hireDate, 'hireDate'),
      department: requireString(body.department, 'department'),
      position: requireString(body.position, 'position'),
      salaryType: requireEnum(body.salaryType, 'salaryType', SALARY_TYPES),
      baseRate: requireNumber(body.baseRate, 'baseRate'),
      bankName: requireString(body.bankName, 'bankName'),
      bankAccountName: requireString(body.bankAccountName, 'bankAccountName'),
      bankAccountNumber: requireString(
        body.bankAccountNumber,
        'bankAccountNumber',
      ),
      workPermitNumber: optionalString(body.workPermitNumber) ?? null,
      workPermitExpiryDate:
        body.workPermitExpiryDate === undefined
          ? null
          : requireDateString(
              body.workPermitExpiryDate,
              'workPermitExpiryDate',
            ),
      visaType: optionalString(body.visaType) ?? null,
      visaExpiryDate:
        body.visaExpiryDate === undefined
          ? null
          : requireDateString(body.visaExpiryDate, 'visaExpiryDate'),
    };

    await this.assertEmployeeUniqueness(input.employeeCode, input.email);

    const employee = await this.repository.createEmployee(input);
    return mapEmployeeDetail(employee);
  }

  async update(
    id: string,
    body: Record<string, unknown>,
  ): Promise<EmployeeDetail> {
    const existing = assertFound(
      await this.repository.getEmployeeById(id),
      'Employee not found.',
    );

    const input = {
      employeeCode: optionalString(body.employeeCode),
      fullName: optionalString(body.fullName),
      email: optionalString(body.email),
      employmentStatus: body.employmentStatus
        ? requireEnum(
            body.employmentStatus,
            'employmentStatus',
            EMPLOYMENT_STATUSES,
          )
        : undefined,
      workerType: body.workerType
        ? requireEnum(body.workerType, 'workerType', WORKER_TYPES)
        : undefined,
      nationality:
        body.nationality === undefined
          ? undefined
          : (optionalString(body.nationality) ?? null),
      nationalId:
        body.nationalId === undefined
          ? undefined
          : (optionalString(body.nationalId) ?? null),
      passportNumber:
        body.passportNumber === undefined
          ? undefined
          : (optionalString(body.passportNumber) ?? null),
      taxId:
        body.taxId === undefined
          ? undefined
          : (optionalString(body.taxId) ?? null),
      socialSecurityNumber:
        body.socialSecurityNumber === undefined
          ? undefined
          : (optionalString(body.socialSecurityNumber) ?? null),
      socialSecurityEnabled:
        body.socialSecurityEnabled === undefined
          ? undefined
          : requireBoolean(body.socialSecurityEnabled, 'socialSecurityEnabled'),
      hireDate:
        body.hireDate === undefined
          ? undefined
          : body.hireDate === null || body.hireDate === ''
            ? null
            : requireDateString(body.hireDate, 'hireDate'),
      department: optionalString(body.department),
      position: optionalString(body.position),
      salaryType: body.salaryType
        ? requireEnum(body.salaryType, 'salaryType', SALARY_TYPES)
        : undefined,
      baseRate: optionalNumber(body.baseRate),
      bankName: optionalString(body.bankName),
      bankAccountName: optionalString(body.bankAccountName),
      bankAccountNumber: optionalString(body.bankAccountNumber),
      workPermitNumber:
        body.workPermitNumber === undefined
          ? undefined
          : (optionalString(body.workPermitNumber) ?? null),
      workPermitExpiryDate:
        body.workPermitExpiryDate === undefined
          ? undefined
          : body.workPermitExpiryDate === null ||
              body.workPermitExpiryDate === ''
            ? null
            : requireDateString(
                body.workPermitExpiryDate,
                'workPermitExpiryDate',
              ),
      visaType:
        body.visaType === undefined
          ? undefined
          : (optionalString(body.visaType) ?? null),
      visaExpiryDate:
        body.visaExpiryDate === undefined
          ? undefined
          : body.visaExpiryDate === null || body.visaExpiryDate === ''
            ? null
            : requireDateString(body.visaExpiryDate, 'visaExpiryDate'),
    };

    await this.assertEmployeeUniqueness(
      input.employeeCode ?? existing.employeeCode,
      input.email ?? existing.email,
      id,
    );

    const employee = assertFound(
      await this.repository.updateEmployee(id, input),
      'Employee not found.',
    );

    return mapEmployeeDetail(employee);
  }

  async provisionPortalAccount(
    request: Request,
    employeeId: string,
    body: Record<string, unknown>,
  ) {
    const employee = assertFound(
      await this.repository.getEmployeeById(employeeId),
      'Employee not found.',
    );

    if (employee.linkedAuthUserId) {
      throw new ConflictException(
        'This employee already has a portal account.',
      );
    }

    const password = requireString(body.password, 'password', {
      minLength: 8,
    });

    const result = await this.authService.createUserAsAdmin(request, {
      email: employee.email,
      password,
      name: employee.fullName,
      role: 'employee',
    });

    const updatedEmployee = assertFound(
      await this.repository.updateEmployee(employee.id, {
        linkedAuthUserId: result.user.id,
      }),
      'Employee not found.',
    );

    await this.repository.upsertUserProfile({
      authUserId: result.user.id,
      role: 'employee',
      employeeId: updatedEmployee.id,
    });

    return {
      employee: mapEmployeeDetail(updatedEmployee),
      portalAccount: {
        authUserId: result.user.id,
        email: result.user.email,
        temporaryPassword: password,
      },
    };
  }

  async resetPortalPassword(
    request: Request,
    employeeId: string,
    body: Record<string, unknown>,
  ) {
    const employee = assertFound(
      await this.repository.getEmployeeById(employeeId),
      'Employee not found.',
    );

    if (!employee.linkedAuthUserId) {
      throw new BadRequestException(
        'This employee does not have a portal account yet.',
      );
    }

    const password = requireString(body.password, 'password', {
      minLength: 8,
    });

    await this.authService.resetUserPasswordAsAdmin(request, {
      userId: employee.linkedAuthUserId,
      newPassword: password,
    });

    return {
      authUserId: employee.linkedAuthUserId,
      temporaryPassword: password,
    };
  }

  private async assertEmployeeUniqueness(
    employeeCode: string,
    email: string,
    ignoreEmployeeId?: string,
  ): Promise<void> {
    const employees = await this.repository.listEmployees();

    assertConflict(
      employees.some(
        (employee) =>
          employee.id !== ignoreEmployeeId &&
          employee.employeeCode.toLowerCase() === employeeCode.toLowerCase(),
      ),
      'Employee code already exists.',
    );

    assertConflict(
      employees.some(
        (employee) =>
          employee.id !== ignoreEmployeeId &&
          employee.email.toLowerCase() === email.toLowerCase(),
      ),
      'Employee email already exists.',
    );
  }
}
