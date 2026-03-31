import { resetMemoryStore, appMemoryStore } from '../storage/memory-db';
import { syncAppUserProfile } from './profile-sync';

describe('syncAppUserProfile', () => {
  beforeEach(() => {
    resetMemoryStore();
  });

  it('creates a demo employee profile for a brand new signup', async () => {
    await syncAppUserProfile({
      authUserId: 'auth-demo-user-1',
      email: 'jane.doe@example.com',
      name: 'Jane Doe',
    });

    expect(appMemoryStore.employees).toHaveLength(1);
    expect(appMemoryStore.userProfiles).toHaveLength(1);

    const [employee] = appMemoryStore.employees;
    const [profile] = appMemoryStore.userProfiles;

    expect(employee.fullName).toBe('Jane Doe');
    expect(employee.email).toBe('jane.doe@example.com');
    expect(employee.department).toBe('Demo workspace');
    expect(employee.position).toBe('Demo employee');
    expect(employee.linkedAuthUserId).toBe('auth-demo-user-1');
    expect(employee.employeeCode).toMatch(/^DEMO-/);
    expect(profile.authUserId).toBe('auth-demo-user-1');
    expect(profile.employeeId).toBe(employee.id);
    expect(profile.role).toBe('employee');
  });

  it('links to an existing employee record when the email already exists', async () => {
    appMemoryStore.employees.push({
      id: 'employee-1',
      employeeCode: 'EMP-001',
      fullName: 'Existing Employee',
      email: 'existing@example.com',
      employmentStatus: 'active',
      workerType: 'thai',
      nationality: 'Thai',
      nationalId: null,
      passportNumber: null,
      taxId: null,
      socialSecurityNumber: null,
      socialSecurityEnabled: true,
      hireDate: '2026-01-01',
      department: 'Operations',
      position: 'Coordinator',
      salaryType: 'monthly',
      baseRate: 28000,
      bankName: 'Demo Bank',
      bankAccountName: 'Existing Employee',
      bankAccountNumber: '1234567890',
      workPermitNumber: null,
      workPermitExpiryDate: null,
      visaType: null,
      visaExpiryDate: null,
      linkedAuthUserId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await syncAppUserProfile({
      authUserId: 'auth-existing-user',
      email: 'existing@example.com',
      name: 'Existing Employee',
    });

    expect(appMemoryStore.employees).toHaveLength(1);
    expect(appMemoryStore.employees[0]?.linkedAuthUserId).toBe(
      'auth-existing-user',
    );
    expect(appMemoryStore.userProfiles[0]?.employeeId).toBe('employee-1');
  });
});
