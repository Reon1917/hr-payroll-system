import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { after, before, beforeEach, describe, it } from 'node:test';
import type {
  CurrentUser,
  EmployeeDetail,
  EmployeeSummary,
  PayPeriodDetail,
  PayPeriodSummary,
  PayslipView,
  PayrollRecordDetail,
  PayrollSummaryReport,
} from '@hr-payroll/shared';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as authModule from '../src/auth/better-auth';
import * as appModule from '../src/app.module';

const authExports = (authModule.default ??
  authModule['module.exports'] ??
  authModule) as {
  authHandler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
};
const appModuleExports = (appModule.default ??
  appModule['module.exports'] ??
  appModule) as {
  AppModule: new (...args: never[]) => unknown;
};
const { authHandler } = authExports;
const { AppModule } = appModuleExports;

interface SeedResponse {
  credentials: {
    admin: {
      email: string;
      password: string;
    };
    employee: {
      email: string;
      password: string;
    };
  };
}

describe('HR Payroll API (e2e)', () => {
  let app: INestApplication;
  let seed: SeedResponse;

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.all(/^\/auth\/.*/, authHandler);
    await app.init();
  });

  beforeEach(async () => {
    seed = await resetSeed();
  });

  after(async () => {
    await app.close();
  });

  it('allows public sign-up and keeps admin employee provisioning flows intact', async () => {
    const adminAgent = await signIn(
      seed.credentials.admin.email,
      seed.credentials.admin.password,
    );
    const meResponse = await adminAgent.get('/me').expect(200);
    assert.equal((meResponse.body as CurrentUser).role, 'admin');

    const createEmployeeResponse = await adminAgent
      .post('/employees')
      .send({
        employeeCode: 'EMP-100',
        fullName: 'Ploy New Hire',
        email: 'public@company.test',
        employmentStatus: 'active',
        department: 'Finance',
        position: 'Payroll Analyst',
        salaryType: 'monthly',
        baseRate: 35000,
        bankName: 'SCB',
        bankAccountName: 'Ploy New Hire',
        bankAccountNumber: '111-2-33333-4',
      })
      .expect(201);
    const employee = createEmployeeResponse.body as EmployeeDetail;

    const publicAgent = request.agent(app.getHttpServer());
    await publicAgent
      .post('/auth/sign-up/email')
      .set('origin', 'http://localhost:3000')
      .send({
        email: employee.email,
        password: 'Public123!',
        name: employee.fullName,
      })
      .expect(200);

    const publicMeResponse = await publicAgent.get('/me').expect(200);
    const publicUser = publicMeResponse.body as CurrentUser;
    assert.equal(publicUser.role, 'employee');
    assert.equal(publicUser.employee?.id, employee.id);

    await adminAgent
      .post('/employees')
      .send({
        employeeCode: employee.employeeCode,
        fullName: 'Duplicate Ploy',
        email: employee.email,
        employmentStatus: 'active',
        department: 'Finance',
        position: 'Payroll Analyst',
        salaryType: 'monthly',
        baseRate: 35000,
        bankName: 'SCB',
        bankAccountName: 'Duplicate Ploy',
        bankAccountNumber: '111-2-33333-5',
      })
      .expect(409);

    const provisionResponse = await adminAgent
      .post(`/employees/${employee.id}/provision-account`)
      .send({
        password: 'TempPass123!',
      })
      .expect(201);

    assert.equal(provisionResponse.body.portalAccount.email, employee.email);
    assert.equal(
      provisionResponse.body.portalAccount.temporaryPassword,
      'TempPass123!',
    );

    const employeeAgent = await signIn(employee.email, 'TempPass123!');
    const employeeMeResponse = await employeeAgent.get('/me').expect(200);
    assert.equal((employeeMeResponse.body as CurrentUser).role, 'employee');
    await employeeAgent.get('/employees').expect(403);

    await adminAgent
      .post(`/employees/${employee.id}/reset-password`)
      .send({
        password: 'ResetPass123!',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/sign-in/email')
      .set('origin', 'http://localhost:3000')
      .send({
        email: employee.email,
        password: 'TempPass123!',
      })
      .expect(401);

    const resetEmployeeAgent = await signIn(employee.email, 'ResetPass123!');
    await resetEmployeeAgent.get('/me').expect(200);
  });

  it('runs the seeded admin payroll flow from draft to paid and preserves record snapshots', async () => {
    const adminAgent = await signIn(
      seed.credentials.admin.email,
      seed.credentials.admin.password,
    );

    const employeesResponse = await adminAgent.get('/employees').expect(200);
    const employees = employeesResponse.body as EmployeeSummary[];
    const dailyEmployee = employees.find(
      (employee) => employee.employeeCode === 'EMP-002',
    );
    assert.ok(dailyEmployee);

    const createPayPeriodResponse = await adminAgent
      .post('/pay-periods')
      .send({
        name: 'May 2026 Payroll',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        paymentDate: '2026-06-01',
      })
      .expect(201);
    const payPeriod = createPayPeriodResponse.body as PayPeriodSummary;

    const generatedOnceResponse = await adminAgent
      .post(`/pay-periods/${payPeriod.id}/generate-drafts`)
      .expect(201);
    const generatedOnce = generatedOnceResponse.body as PayPeriodDetail;
    assert.equal(generatedOnce.totalRecords, 3);

    const generatedTwiceResponse = await adminAgent
      .post(`/pay-periods/${payPeriod.id}/generate-drafts`)
      .expect(201);
    const generatedTwice = generatedTwiceResponse.body as PayPeriodDetail;
    assert.equal(generatedTwice.totalRecords, 3);

    const dailyRecord = generatedTwice.records.find(
      (record) => record.employeeCode === 'EMP-002',
    );
    assert.ok(dailyRecord);

    const updatedRecordResponse = await adminAgent
      .patch(`/payroll-records/${dailyRecord?.id}`)
      .send({
        payUnits: 22,
        adjustments: [
          {
            kind: 'addition',
            type: 'overtime',
            label: 'Overtime',
            amount: 500,
          },
          {
            kind: 'deduction',
            type: 'tax',
            label: 'Tax withholding',
            amount: 200,
          },
        ],
      })
      .expect(200);
    const updatedRecord = updatedRecordResponse.body as PayrollRecordDetail;
    assert.equal(updatedRecord.basePay, 18700);
    assert.equal(updatedRecord.netPay, 19000);

    await adminAgent
      .patch(`/employees/${dailyEmployee?.id}`)
      .send({
        fullName: 'Somchai Updated',
        baseRate: 900,
      })
      .expect(200);

    const detailAfterEmployeeChangeResponse = await adminAgent
      .get(`/pay-periods/${payPeriod.id}`)
      .expect(200);
    const detailAfterEmployeeChange =
      detailAfterEmployeeChangeResponse.body as PayPeriodDetail;
    const snapshotRecord = getRecordByCode(
      detailAfterEmployeeChange,
      'EMP-002',
    );
    assert.equal(snapshotRecord.employeeName, 'Somchai Daily');
    assert.equal(snapshotRecord.baseRate, 850);

    const calculatedResponse = await adminAgent
      .post(`/pay-periods/${payPeriod.id}/calculate`)
      .expect(201);
    expectAllStatuses(calculatedResponse.body as PayPeriodDetail, 'calculated');

    const approvedResponse = await adminAgent
      .post(`/pay-periods/${payPeriod.id}/approve`)
      .expect(201);
    expectAllStatuses(approvedResponse.body as PayPeriodDetail, 'approved');

    const paidResponse = await adminAgent
      .post(`/pay-periods/${payPeriod.id}/mark-paid`)
      .send({
        paymentDate: '2026-06-01',
        paymentNote: 'Manual transfer batch',
        paymentReference: 'MAY-2026-BATCH',
      })
      .expect(201);
    const paidDetail = paidResponse.body as PayPeriodDetail;
    expectAllStatuses(paidDetail, 'paid');
    assert.equal(
      getRecordByCode(paidDetail, 'EMP-002').paymentReference,
      'MAY-2026-BATCH',
    );

    await adminAgent
      .patch(`/payroll-records/${updatedRecord.id}`)
      .send({
        payUnits: 20,
        adjustments: [],
      })
      .expect(403);

    await adminAgent.post(`/pay-periods/${payPeriod.id}/reopen`).expect(409);

    const reportResponse = await adminAgent
      .get(`/reports/payroll-summary?periodId=${payPeriod.id}`)
      .expect(200);
    const report = reportResponse.body as PayrollSummaryReport;
    assert.equal(report.statusCounts.paid, 3);
    assert.equal(report.numberOfPaidEmployees, 3);
    assert.ok(report.totalNetPay > 0);
  });

  it('restricts employees to their own payroll data', async () => {
    const adminAgent = await signIn(
      seed.credentials.admin.email,
      seed.credentials.admin.password,
    );
    const periodsResponse = await adminAgent.get('/pay-periods').expect(200);
    const periods = periodsResponse.body as PayPeriodSummary[];
    const historicalPeriod = periods.find(
      (period) => period.name === 'March 2026 Payroll',
    );
    assert.ok(historicalPeriod);

    const historicalDetailResponse = await adminAgent
      .get(`/pay-periods/${historicalPeriod?.id}`)
      .expect(200);
    const historicalDetail = historicalDetailResponse.body as PayPeriodDetail;
    const otherEmployeeRecord = historicalDetail.records.find(
      (record) => record.employeeCode !== 'EMP-001',
    );
    assert.ok(otherEmployeeRecord);

    const employeeAgent = await signIn(
      seed.credentials.employee.email,
      seed.credentials.employee.password,
    );
    const meResponse = await employeeAgent.get('/me').expect(200);
    const me = meResponse.body as CurrentUser;
    assert.equal(me.role, 'employee');
    assert.equal(me.employee?.employeeCode, 'EMP-001');

    const payslipsResponse = await employeeAgent
      .get('/me/payslips')
      .expect(200);
    const payslips = payslipsResponse.body as PayslipView[];
    assert.ok(payslips.length > 0);
    assert.equal(
      payslips.every((payslip) => payslip.employee.employeeCode === 'EMP-001'),
      true,
    );

    const ownPayslipResponse = await employeeAgent
      .get(`/me/payslips/${payslips[0]?.payrollRecordId}`)
      .expect(200);
    const ownPayslip = ownPayslipResponse.body as PayslipView;
    assert.equal(ownPayslip.employee.employeeCode, 'EMP-001');

    await employeeAgent
      .get(`/me/payslips/${otherEmployeeRecord?.id}`)
      .expect(403);

    await employeeAgent
      .get(`/reports/payroll-summary?periodId=${historicalPeriod?.id}`)
      .expect(403);
  });

  async function resetSeed(): Promise<SeedResponse> {
    const response = await request(app.getHttpServer())
      .post('/seeds/reset')
      .expect(201);

    return response.body as SeedResponse;
  }

  async function signIn(email: string, password: string) {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/sign-in/email')
      .set('origin', 'http://localhost:3000')
      .send({
        email,
        password,
      })
      .expect(200);

    return agent;
  }
});

function getRecordByCode(
  detail: PayPeriodDetail,
  employeeCode: string,
): PayrollRecordDetail {
  const record = detail.records.find(
    (item) => item.employeeCode === employeeCode,
  );

  if (!record) {
    throw new Error(`Payroll record for ${employeeCode} was not found.`);
  }

  return record;
}

function expectAllStatuses(
  detail: PayPeriodDetail,
  status: PayrollRecordDetail['status'],
): void {
  assert.equal(detail.records.length, 3);
  assert.equal(
    detail.records.every((record) => record.status === status),
    true,
  );
}
