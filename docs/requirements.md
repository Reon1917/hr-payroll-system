# Business Requirements

## 1. System Purpose
The system shall provide a minimal HR payroll management platform for small internal company use.
It shall focus on employee payroll record keeping, salary calculation, payslip generation, and payroll history management.
It shall not include automatic bank transfer or automatic payment execution.
It shall serve mainly as a payroll processing and bookkeeping system.

## 2. Core Users
1. HR Admin shall be the main user of the system.
2. Employee users may have limited self-service access if enabled.
3. Normal employees shall not have access to other employees' payroll data.
4. Only authorized HR/Admin users shall be allowed to manage payroll records.

## 3. Authentication and Access
1. The system shall support authentication using Better Auth.
2. The system shall support login using email and password.
3. The system shall support Google login.
4. The system shall support role-based access control.
5. The system shall provide at least the following roles:
   1. Admin
   2. Employee
6. Admin users shall have full access to payroll management features.
7. Employee users shall only be allowed to view their own payroll-related information and payslips.
8. Unauthorized users shall not be allowed to access payroll data.

## 4. Employee Management
1. The system shall allow Admin users to create employee records.
2. The system shall allow Admin users to update employee records.
3. The system shall allow Admin users to mark employees as active, inactive, resigned, or terminated.
4. The system shall store employee master data required for payroll processing.
5. Employee master data shall include at minimum:
   1. Employee ID
   2. Full name
   3. Email
   4. Employment status
   5. Position or department
   6. Salary type
   7. Base salary or pay rate
   8. Bank/payment details for record keeping
6. An employee must have valid payroll information before being included in payroll calculation.

## 5. Payroll Structure
1. The system shall support a defined payroll period.
2. Each payroll run shall belong to one pay period.
3. A pay period shall include:
   1. Period name
   2. Start date
   3. End date
   4. Payment date
4. The system shall allow only one payroll record per employee per pay period.
5. The system shall prevent duplicate payroll records for the same employee and pay period.

## 6. Salary and Pay Rules
1. The system shall support at least one active salary structure per employee.
2. The system shall support the following salary types:
   1. Monthly salary
   2. Daily wage
   3. Hourly wage
3. The system shall calculate payroll using the formula:

   Net Pay = Base Pay + Additions - Deductions

4. Additions may include:
   1. Overtime
   2. Bonus
   3. Allowance
   4. Other manual additions
5. Deductions may include:
   1. Unpaid leave
   2. Late penalties
   3. Tax
   4. Social security
   5. Loan or advance deduction
   6. Other manual deductions
6. The system shall support manual entry of additions and deductions.
7. The system may support attendance-based adjustments, but attendance tracking shall not be required for the minimal version.
8. The system shall allow payroll processing even if payment is recorded manually outside the system.

## 7. Payroll Processing
1. The system shall allow Admin users to create a pay period.
2. The system shall allow Admin users to input payroll-related adjustments for each employee.
3. The system shall allow Admin users to run payroll calculation for a selected pay period.
4. The system shall validate that only active employees are included in normal payroll processing.
5. The system shall validate that required employee payroll data exists before calculation.
6. The system shall store the final payroll result as a payroll record.
7. The system shall support the following payroll statuses:
   1. Draft
   2. Calculated
   3. Approved
   4. Paid
   5. Cancelled
8. Only payroll records in Draft or Calculated status shall be editable.
9. Approved payroll should be locked from casual editing.
10. Paid payroll shall be treated as finalized bookkeeping data.

## 8. Payslips
1. The system shall generate payslips for processed payroll records.
2. A payslip shall include at minimum:
   1. Employee name
   2. Employee ID
   3. Pay period
   4. Base pay
   5. Additions
   6. Deductions
   7. Net pay
   8. Payment date or payroll status
3. Employees shall only be allowed to view their own payslips.
4. Admin users shall be allowed to view all payslips.
5. The system shall support viewing or downloading payslips.

## 9. Payroll Bookkeeping
1. The system shall be used for payroll record keeping even when actual payment is done manually outside the platform.
2. The system shall allow Admin users to mark payroll as paid after manual payment is completed.
3. The system shall store payment-related bookkeeping information such as:
   1. Payment date
   2. Payment note
   3. Payment method reference if needed
4. The system shall not be required to integrate with banks, payment gateways, or automatic transfer systems.
5. The system shall maintain historical payroll records for audit and reference purposes.

## 10. Historical Data and Audit Rules
1. Past payroll records shall remain unchanged even if employee master data changes later.
2. Each payroll record shall store a snapshot of payroll values used during calculation.
3. Paid payroll records shall not be deleted.
4. If correction is required after finalization, the system should use adjustment, reopening, or cancellation logic instead of hard deletion.
5. Important payroll changes should be traceable.
6. The system should record basic audit information such as:
   1. Who created the payroll
   2. Who updated the payroll
   3. Who approved the payroll
   4. When changes were made

## 11. Employee Self-Service
1. The system may provide a limited employee portal.
2. Employees shall be allowed to log in using Better Auth.
3. Employees shall be allowed to view their own profile basics.
4. Employees shall be allowed to view their own payroll history.
5. Employees shall be allowed to view and download their own payslips.
6. Employees shall not be allowed to edit salary values, payroll calculations, or other employees' data.

## 12. Reporting
1. The system shall provide basic payroll summary reporting.
2. Reports shall include at minimum:
   1. Total payroll cost for a pay period
   2. Number of paid employees
   3. Total additions
   4. Total deductions
   5. Total net pay
3. Reports shall be accessible by Admin users only.

## 13. Technology and Platform Requirements
1. The frontend shall be built using Next.js.
2. The backend shall be built using NestJS.
3. The database shall use NeonDB with PostgreSQL.
4. The ORM shall use Drizzle ORM.
5. The authentication layer shall use Better Auth.
6. The system shall support email/password authentication and Google authentication.
7. The system shall be deployable on a VPS environment.
8. The system architecture shall support separation between frontend and backend while remaining in one overall project environment if needed.

## 14. Minimum MVP Scope
1. Admin login
2. Employee login
3. Employee management
4. Pay period creation
5. Payroll record creation
6. Manual additions and deductions
7. Payroll calculation
8. Payroll approval
9. Mark payroll as paid
10. Payslip generation
11. Employee self-view of payslips
12. Payroll summary reporting

## 15. Out of Scope for Initial Version
1. Automatic salary transfer
2. Bank API integration
3. Tax filing integration
4. Government reporting integration
5. Recruitment features
6. Performance management
7. Leave management with full workflow
8. Advanced attendance machine integration
9. Multi-company enterprise features
10. Complex approval chains beyond minimal payroll approval