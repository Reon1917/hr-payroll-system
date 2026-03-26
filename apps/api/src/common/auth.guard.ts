import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_REPOSITORY, type AppRepository } from '../storage/app-repository';
import type { AuthenticatedRequest } from './auth-request';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    @Inject(APP_REPOSITORY)
    private readonly repository: AppRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = await this.authService.getSessionFromRequest(request);

    if (!session) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const profile = await this.repository.findUserProfileByAuthUserId(
      session.user.id,
    );

    if (!profile) {
      throw new UnauthorizedException(
        'This account has no payroll profile assigned.',
      );
    }

    const employee = profile.employeeId
      ? await this.repository.getEmployeeById(profile.employeeId)
      : null;

    request.actor = {
      authUserId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: profile.role,
      employeeId: profile.employeeId,
      employee: employee
        ? {
            id: employee.id,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            email: employee.email,
            employmentStatus: employee.employmentStatus,
            workerType: employee.workerType,
            nationality: employee.nationality,
            nationalId: employee.nationalId,
            passportNumber: employee.passportNumber,
            taxId: employee.taxId,
            socialSecurityNumber: employee.socialSecurityNumber,
            socialSecurityEnabled: employee.socialSecurityEnabled,
            hireDate: employee.hireDate,
            department: employee.department,
            position: employee.position,
            salaryType: employee.salaryType,
            baseRate: employee.baseRate,
            linkedAuthUserId: employee.linkedAuthUserId,
          }
        : null,
    };

    return true;
  }
}
