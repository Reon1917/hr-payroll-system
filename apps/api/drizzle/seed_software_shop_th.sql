BEGIN;

-- Thailand-based software shop demo seed (see apps/api/src/db/schema.ts).
-- Populates: employees, pay_periods, payroll_records, payroll_adjustments.
-- Does not touch: user / session / account / user_profiles (link auth separately).
-- Thai nationals: work_permit_* and visa_* left NULL (not applicable).
-- Foreign nationals: national_id NULL; passport + Thai tax id + permit/visa filled.
-- All monetary values in this script are THB.
-- This script is additive and safe to rerun for the same seed dataset.

CREATE TEMP TABLE tmp_seed_employees (
  employee_code text PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  employment_status text NOT NULL,
  worker_type text NOT NULL,
  nationality text,
  national_id text,
  passport_number text,
  tax_id text,
  social_security_number text,
  social_security_enabled boolean NOT NULL,
  hire_date date,
  department text NOT NULL,
  position text NOT NULL,
  salary_type text NOT NULL,
  base_rate numeric(12, 2) NOT NULL,
  bank_name text NOT NULL,
  bank_account_name text NOT NULL,
  bank_account_number text NOT NULL,
  work_permit_number text,
  work_permit_expiry_date date,
  visa_type text,
  visa_expiry_date date
) ON COMMIT DROP;

INSERT INTO tmp_seed_employees (
  employee_code,
  full_name,
  email,
  employment_status,
  worker_type,
  nationality,
  national_id,
  passport_number,
  tax_id,
  social_security_number,
  social_security_enabled,
  hire_date,
  department,
  position,
  salary_type,
  base_rate,
  bank_name,
  bank_account_name,
  bank_account_number,
  work_permit_number,
  work_permit_expiry_date,
  visa_type,
  visa_expiry_date
)
VALUES
  ('EY-00001', 'Lin Myat Phyo', 'linmyatphyo03@gmail.com', 'active', 'foreign', 'Myanmar', NULL, 'MMR23B1147', '5401267890123', 'FSSO-100001', TRUE, DATE '2020-11-16', 'Human Resources', 'Senior Officer', 'monthly', 50000.00, 'Bangkok Bank', 'Lin Myat Phyo', '418-1-56260-3', 'WP-TH-100001', DATE '2026-08-31', 'Non-B', DATE '2026-07-31'),
  ('EY-00002', 'Arun Phatthana', 'arun.phatthana@eysoftware.test', 'active', 'thai', 'Thai', '1103700000002', 'AB1000001', '1103700000002', '1103701000002', FALSE, DATE '2021-01-05', 'Leadership', 'Managing Director', 'monthly', 180000.00, 'Bangkok Bank', 'Arun Phatthana', '110-2-34567-8', NULL, NULL, NULL, NULL),
  ('EY-00003', 'Narin Wongsawat', 'narin.wongsawat@eysoftware.test', 'active', 'thai', 'Thai', '1103700000003', 'AB1000003', '1103700000003', '1103701000003', TRUE, DATE '2021-07-12', 'Engineering', 'Engineering Manager', 'monthly', 135000.00, 'Kasikornbank', 'Narin Wongsawat', '014-8-76543-2', NULL, NULL, NULL, NULL),
  ('EY-00004', 'Pimchanok Saelim', 'pimchanok.saelim@eysoftware.test', 'active', 'thai', 'Thai', '1103700000004', 'AB1000004', '1103700000004', '1103701000004', TRUE, DATE '2022-02-14', 'Engineering', 'Senior Backend Engineer', 'monthly', 98000.00, 'Siam Commercial Bank', 'Pimchanok Saelim', '408-1-22334-5', NULL, NULL, NULL, NULL),
  ('EY-00005', 'Kittipong Rattanakul', 'kittipong.rattanakul@eysoftware.test', 'active', 'thai', 'Thai', '1103700000005', 'AB1000005', '1103700000005', '1103701000005', TRUE, DATE '2022-05-03', 'Engineering', 'Frontend Engineer', 'monthly', 82000.00, 'Krungthai Bank', 'Kittipong Rattanakul', '778-0-55443-1', NULL, NULL, NULL, NULL),
  ('EY-00006', 'Chayanit Limsakul', 'chayanit.limsakul@eysoftware.test', 'active', 'thai', 'Thai', '1103700000006', 'AB1000006', '1103700000006', '1103701000006', TRUE, DATE '2022-08-22', 'Product', 'Product Manager', 'monthly', 95000.00, 'Bank of Ayudhya', 'Chayanit Limsakul', '157-3-66554-8', NULL, NULL, NULL, NULL),
  ('EY-00007', 'Thanapol Sirisuk', 'thanapol.sirisuk@eysoftware.test', 'active', 'thai', 'Thai', '1103700000007', 'AB1000007', '1103700000007', '1103701000007', TRUE, DATE '2023-01-09', 'Design', 'Product Designer', 'monthly', 72000.00, 'TMBThanachart Bank', 'Thanapol Sirisuk', '612-4-90018-7', NULL, NULL, NULL, NULL),
  ('EY-00008', 'Waranya Boonmee', 'waranya.boonmee@eysoftware.test', 'active', 'thai', 'Thai', '1103700000008', 'AB1000008', '1103700000008', '1103701000008', TRUE, DATE '2023-04-18', 'Quality Assurance', 'QA Automation Engineer', 'monthly', 68000.00, 'Bangkok Bank', 'Waranya Boonmee', '248-9-44001-6', NULL, NULL, NULL, NULL),
  ('EY-00009', 'Apisit Jindarat', 'apisit.jindarat@eysoftware.test', 'active', 'thai', 'Thai', '1103700000009', 'AB1000009', '1103700000009', '1103701000009', TRUE, DATE '2023-07-17', 'Platform', 'DevOps Engineer', 'monthly', 90000.00, 'Kasikornbank', 'Apisit Jindarat', '066-5-70019-3', NULL, NULL, NULL, NULL),
  ('EY-00010', 'Suthida Prasert', 'suthida.prasert@eysoftware.test', 'active', 'thai', 'Thai', '1103700000010', 'AB1000010', '1103700000010', '1103701000010', TRUE, DATE '2023-10-02', 'Data', 'Data Analyst', 'monthly', 70000.00, 'Kiatnakin Phatra Bank', 'Suthida Prasert', '145-8-33771-2', NULL, NULL, NULL, NULL),
  ('EY-00011', 'Ko Min Aung', 'ko.min.aung@eysoftware.test', 'active', 'foreign', 'Myanmar', NULL, 'MMR18A7712', '3100765432101', 'FSSO-110011', TRUE, DATE '2024-03-18', 'Support', 'IT Support Specialist', 'hourly', 220.00, 'Krungthai Bank', 'Ko Min Aung', '821-6-99231-4', 'WP-TH-110011', DATE '2026-12-31', 'Non-LA', DATE '2026-11-30'),
  ('EY-00012', 'Benjamas Kovit', 'benjamas.kovit@eysoftware.test', 'active', 'thai', 'Thai', '1103700000012', 'AB1000012', '1103700000012', '1103701000012', TRUE, DATE '2024-05-06', 'Operations', 'Office Administrator', 'daily', 1150.00, 'Government Savings Bank', 'Benjamas Kovit', '020-1-73319-8', NULL, NULL, NULL, NULL),
  ('EY-00013', 'Siriporn Manee', 'siriporn.manee@eysoftware.test', 'active', 'thai', 'Thai', '1103700000013', 'AB1000013', '1103700000013', '1103701000013', TRUE, DATE '2024-06-17', 'Finance', 'Finance & Payroll Officer', 'monthly', 62000.00, 'UOB Thailand', 'Siriporn Manee', '448-7-20045-9', NULL, NULL, NULL, NULL),
  ('EY-00014', 'Maria Santos', 'maria.santos@eysoftware.test', 'active', 'foreign', 'Philippines', NULL, 'PHL99C4401', '9123456789012', 'FSSO-140014', TRUE, DATE '2025-01-20', 'Customer Success', 'Customer Success Specialist', 'hourly', 240.00, 'CIMB Thai', 'Maria Santos', '553-2-18863-0', 'WP-TH-140014', DATE '2026-10-15', 'Non-B', DATE '2026-09-30'),
  ('EY-00015', 'Ratchanon Yindee', 'ratchanon.yindee@eysoftware.test', 'inactive', 'thai', 'Thai', '1103700000015', 'AB1000015', '1103700000015', '1103701000015', TRUE, DATE '2024-09-02', 'Sales', 'Account Executive', 'monthly', 58000.00, 'Bangkok Bank', 'Ratchanon Yindee', '932-0-51127-4', NULL, NULL, NULL, NULL),
  ('EY-00016', 'Nattaya Sornchai', 'nattaya.sornchai@eysoftware.test', 'resigned', 'thai', 'Thai', '1103700000016', 'AB1000016', '1103700000016', '1103701000016', TRUE, DATE '2023-11-13', 'People Ops', 'HR Generalist', 'monthly', 64000.00, 'Kasikornbank', 'Nattaya Sornchai', '118-4-26770-5', NULL, NULL, NULL, NULL),
  ('EY-00017', 'Pakin Phrom', 'pakin.phrom@eysoftware.test', 'terminated', 'thai', 'Thai', '1103700000017', 'AB1000017', '1103700000017', '1103701000017', TRUE, DATE '2025-02-03', 'Quality Assurance', 'Junior QA Tester', 'daily', 950.00, 'Bank of Ayudhya', 'Pakin Phrom', '265-9-14420-6', NULL, NULL, NULL, NULL);

CREATE TEMP TABLE tmp_seed_pay_periods (
  name text PRIMARY KEY,
  start_date date NOT NULL,
  end_date date NOT NULL,
  payment_date date NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_seed_pay_periods (name, start_date, end_date, payment_date)
VALUES
  ('Software Shop TH - January 2026', DATE '2026-01-01', DATE '2026-01-31', DATE '2026-02-02'),
  ('Software Shop TH - February 2026', DATE '2026-02-01', DATE '2026-02-28', DATE '2026-03-02'),
  ('Software Shop TH - March 2026', DATE '2026-03-01', DATE '2026-03-31', DATE '2026-04-01');

CREATE TEMP TABLE tmp_seed_record_units (
  pay_period_name text NOT NULL,
  employee_code text NOT NULL,
  pay_units numeric(10, 2) NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_seed_record_units (pay_period_name, employee_code, pay_units)
VALUES
  ('Software Shop TH - January 2026', 'EY-00001', 1.00),
  ('Software Shop TH - January 2026', 'EY-00002', 1.00),
  ('Software Shop TH - January 2026', 'EY-00003', 1.00),
  ('Software Shop TH - January 2026', 'EY-00004', 1.00),
  ('Software Shop TH - January 2026', 'EY-00005', 1.00),
  ('Software Shop TH - January 2026', 'EY-00006', 1.00),
  ('Software Shop TH - January 2026', 'EY-00007', 1.00),
  ('Software Shop TH - January 2026', 'EY-00008', 1.00),
  ('Software Shop TH - January 2026', 'EY-00009', 1.00),
  ('Software Shop TH - January 2026', 'EY-00010', 1.00),
  ('Software Shop TH - January 2026', 'EY-00011', 174.00),
  ('Software Shop TH - January 2026', 'EY-00012', 21.00),
  ('Software Shop TH - January 2026', 'EY-00013', 1.00),
  ('Software Shop TH - January 2026', 'EY-00014', 168.00),
  ('Software Shop TH - February 2026', 'EY-00001', 1.00),
  ('Software Shop TH - February 2026', 'EY-00002', 1.00),
  ('Software Shop TH - February 2026', 'EY-00003', 1.00),
  ('Software Shop TH - February 2026', 'EY-00004', 1.00),
  ('Software Shop TH - February 2026', 'EY-00005', 1.00),
  ('Software Shop TH - February 2026', 'EY-00006', 1.00),
  ('Software Shop TH - February 2026', 'EY-00007', 1.00),
  ('Software Shop TH - February 2026', 'EY-00008', 1.00),
  ('Software Shop TH - February 2026', 'EY-00009', 1.00),
  ('Software Shop TH - February 2026', 'EY-00010', 1.00),
  ('Software Shop TH - February 2026', 'EY-00011', 168.00),
  ('Software Shop TH - February 2026', 'EY-00012', 20.00),
  ('Software Shop TH - February 2026', 'EY-00013', 1.00),
  ('Software Shop TH - February 2026', 'EY-00014', 160.00),
  ('Software Shop TH - March 2026', 'EY-00001', 1.00),
  ('Software Shop TH - March 2026', 'EY-00002', 1.00),
  ('Software Shop TH - March 2026', 'EY-00003', 1.00),
  ('Software Shop TH - March 2026', 'EY-00004', 1.00),
  ('Software Shop TH - March 2026', 'EY-00005', 1.00),
  ('Software Shop TH - March 2026', 'EY-00006', 1.00),
  ('Software Shop TH - March 2026', 'EY-00007', 1.00),
  ('Software Shop TH - March 2026', 'EY-00008', 1.00),
  ('Software Shop TH - March 2026', 'EY-00009', 1.00),
  ('Software Shop TH - March 2026', 'EY-00010', 1.00),
  ('Software Shop TH - March 2026', 'EY-00011', 176.00),
  ('Software Shop TH - March 2026', 'EY-00012', 22.00),
  ('Software Shop TH - March 2026', 'EY-00013', 1.00),
  ('Software Shop TH - March 2026', 'EY-00014', 172.00);

CREATE TEMP TABLE tmp_seed_adjustments (
  pay_period_name text NOT NULL,
  employee_code text NOT NULL,
  kind text NOT NULL,
  type text NOT NULL,
  label text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  note text
) ON COMMIT DROP;

INSERT INTO tmp_seed_adjustments (
  pay_period_name,
  employee_code,
  kind,
  type,
  label,
  amount,
  note
)
VALUES
  ('Software Shop TH - January 2026', 'EY-00003', 'addition', 'allowance', 'Team lead allowance', 3000.00, 'THB monthly leadership stipend'),
  ('Software Shop TH - January 2026', 'EY-00004', 'addition', 'overtime', 'Release weekend support', 4500.00, 'Weekend on-call for production cutover'),
  ('Software Shop TH - January 2026', 'EY-00004', 'deduction', 'tax', 'Withholding tax', 2100.00, 'PND1 per Revenue Department bracket'),
  ('Software Shop TH - January 2026', 'EY-00006', 'addition', 'bonus', 'Product launch bonus', 8500.00, 'Q1 roadmap milestone'),
  ('Software Shop TH - January 2026', 'EY-00008', 'addition', 'allowance', 'Cloud certification allowance', 4000.00, 'AWS Solutions Architect — company policy'),
  ('Software Shop TH - January 2026', 'EY-00008', 'deduction', 'tax', 'Withholding tax', 2500.00, 'PND1 per Revenue Department bracket'),
  ('Software Shop TH - January 2026', 'EY-00010', 'addition', 'other_addition', 'Analytics certification stipend', 2200.00, 'One-time THB stipend'),
  ('Software Shop TH - January 2026', 'EY-00011', 'addition', 'overtime', 'Weekend onsite support', 1800.00, 'Office network refresh window'),
  ('Software Shop TH - January 2026', 'EY-00012', 'deduction', 'unpaid_leave', 'Unpaid leave', 1150.00, '1 work day'),
  ('Software Shop TH - January 2026', 'EY-00013', 'addition', 'allowance', 'Payroll accuracy allowance', 1500.00, 'Year-end close support'),
  ('Software Shop TH - January 2026', 'EY-00013', 'deduction', 'social_security', 'Social security', 750.00, 'Section 33 employee share'),
  ('Software Shop TH - January 2026', 'EY-00014', 'addition', 'overtime', 'After-hours client support', 2500.00, 'APAC timezone coverage'),
  ('Software Shop TH - January 2026', 'EY-00014', 'deduction', 'social_security', 'Social security', 750.00, 'Section 33 employee share'),
  ('Software Shop TH - February 2026', 'EY-00002', 'addition', 'bonus', 'New client win bonus', 15000.00, 'THB bonus for closing enterprise contract'),
  ('Software Shop TH - February 2026', 'EY-00002', 'deduction', 'tax', 'Withholding tax', 3000.00, 'Bonus withholding — PND1'),
  ('Software Shop TH - February 2026', 'EY-00004', 'addition', 'overtime', 'Sprint hardening overtime', 5200.00, 'Pre-release stabilization'),
  ('Software Shop TH - February 2026', 'EY-00005', 'addition', 'allowance', 'Remote work allowance', 2500.00, 'WFH stipend per policy'),
  ('Software Shop TH - February 2026', 'EY-00005', 'deduction', 'tax', 'Withholding tax', 2000.00, 'PND1 per Revenue Department bracket'),
  ('Software Shop TH - February 2026', 'EY-00007', 'addition', 'bonus', 'Design system milestone bonus', 4000.00, 'Figma library v2 shipped'),
  ('Software Shop TH - February 2026', 'EY-00007', 'deduction', 'social_security', 'Social security', 750.00, 'Section 33 employee share'),
  ('Software Shop TH - February 2026', 'EY-00009', 'addition', 'allowance', 'On-call allowance', 3500.00, 'PagerDuty primary rotation'),
  ('Software Shop TH - February 2026', 'EY-00009', 'deduction', 'tax', 'Withholding tax', 2200.00, 'PND1 per Revenue Department bracket'),
  ('Software Shop TH - February 2026', 'EY-00010', 'addition', 'overtime', 'Dashboard delivery overtime', 2100.00, 'Executive metrics pack'),
  ('Software Shop TH - February 2026', 'EY-00010', 'deduction', 'late_penalty', 'Late attendance penalty', 200.00, '2 late arrivals'),
  ('Software Shop TH - February 2026', 'EY-00011', 'addition', 'allowance', 'Office supply allowance', 1000.00, 'Peripherals for hotdesk'),
  ('Software Shop TH - February 2026', 'EY-00013', 'deduction', 'social_security', 'Social security', 750.00, 'Section 33 employee share'),
  ('Software Shop TH - February 2026', 'EY-00014', 'addition', 'overtime', 'Customer onboarding support', 3200.00, 'New enterprise rollout'),
  ('Software Shop TH - February 2026', 'EY-00014', 'deduction', 'unpaid_leave', 'Unpaid leave', 480.00, '2 hours'),
  ('Software Shop TH - March 2026', 'EY-00003', 'addition', 'allowance', 'Team lead allowance', 3000.00, 'Recurring leadership stipend'),
  ('Software Shop TH - March 2026', 'EY-00004', 'addition', 'bonus', 'API stability bonus', 10000.00, 'Pre-closing milestone'),
  ('Software Shop TH - March 2026', 'EY-00004', 'deduction', 'tax', 'Withholding tax', 2500.00, 'PND1 on bonus component'),
  ('Software Shop TH - March 2026', 'EY-00006', 'addition', 'allowance', 'Product discovery allowance', 2000.00, 'Customer research trips'),
  ('Software Shop TH - March 2026', 'EY-00009', 'deduction', 'other_deduction', 'Access card replacement', 300.00, 'Lost office card'),
  ('Software Shop TH - March 2026', 'EY-00011', 'addition', 'overtime', 'Helpdesk migration overtime', 1600.00, 'Zendesk cutover weekend'),
  ('Software Shop TH - March 2026', 'EY-00012', 'deduction', 'unpaid_leave', 'Unpaid leave', 1150.00, '1 work day'),
  ('Software Shop TH - March 2026', 'EY-00013', 'deduction', 'loan', 'Salary advance recovery', 2500.00, 'Installment 2 of 3'),
  ('Software Shop TH - March 2026', 'EY-00014', 'addition', 'overtime', 'Escalation coverage overtime', 2800.00, 'Severity-1 bridge calls'),
  ('Software Shop TH - March 2026', 'EY-00014', 'deduction', 'late_penalty', 'Late attendance penalty', 240.00, '1 late arrival');

INSERT INTO employees (
  employee_code,
  full_name,
  email,
  employment_status,
  worker_type,
  nationality,
  national_id,
  passport_number,
  tax_id,
  social_security_number,
  social_security_enabled,
  hire_date,
  department,
  position,
  salary_type,
  base_rate,
  bank_name,
  bank_account_name,
  bank_account_number,
  work_permit_number,
  work_permit_expiry_date,
  visa_type,
  visa_expiry_date
)
SELECT
  employee_code,
  full_name,
  email,
  employment_status,
  worker_type,
  nationality,
  national_id,
  passport_number,
  tax_id,
  social_security_number,
  social_security_enabled,
  hire_date,
  department,
  position,
  salary_type,
  base_rate,
  bank_name,
  bank_account_name,
  bank_account_number,
  work_permit_number,
  work_permit_expiry_date,
  visa_type,
  visa_expiry_date
FROM tmp_seed_employees
ON CONFLICT (employee_code) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  employment_status = EXCLUDED.employment_status,
  worker_type = EXCLUDED.worker_type,
  nationality = EXCLUDED.nationality,
  national_id = EXCLUDED.national_id,
  passport_number = EXCLUDED.passport_number,
  tax_id = EXCLUDED.tax_id,
  social_security_number = EXCLUDED.social_security_number,
  social_security_enabled = EXCLUDED.social_security_enabled,
  hire_date = EXCLUDED.hire_date,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  salary_type = EXCLUDED.salary_type,
  base_rate = EXCLUDED.base_rate,
  bank_name = EXCLUDED.bank_name,
  bank_account_name = EXCLUDED.bank_account_name,
  bank_account_number = EXCLUDED.bank_account_number,
  work_permit_number = EXCLUDED.work_permit_number,
  work_permit_expiry_date = EXCLUDED.work_permit_expiry_date,
  visa_type = EXCLUDED.visa_type,
  visa_expiry_date = EXCLUDED.visa_expiry_date;

CREATE TEMP TABLE tmp_seeded_employees ON COMMIT DROP AS
SELECT e.*
FROM employees e
JOIN tmp_seed_employees s
  ON e.employee_code = s.employee_code;

INSERT INTO pay_periods (name, start_date, end_date, payment_date)
SELECT name, start_date, end_date, payment_date
FROM tmp_seed_pay_periods
ON CONFLICT (name) DO NOTHING;

CREATE TEMP TABLE tmp_seeded_pay_periods ON COMMIT DROP AS
SELECT p.*
FROM pay_periods p
JOIN tmp_seed_pay_periods s
  ON p.name = s.name;

CREATE TEMP TABLE tmp_seed_records ON COMMIT DROP AS
WITH adjustment_totals AS (
  SELECT
    pay_period_name,
    employee_code,
    COALESCE(SUM(CASE WHEN kind = 'addition' THEN amount ELSE 0 END), 0)::numeric(12, 2) AS additions_total,
    COALESCE(SUM(CASE WHEN kind = 'deduction' THEN amount ELSE 0 END), 0)::numeric(12, 2) AS deductions_total
  FROM tmp_seed_adjustments
  GROUP BY pay_period_name, employee_code
)
SELECT
  p.id AS pay_period_id,
  e.id AS employee_id,
  e.employee_code AS employee_code_snapshot,
  e.full_name AS employee_name_snapshot,
  e.email AS employee_email_snapshot,
  e.department AS department_snapshot,
  e.position AS position_snapshot,
  e.salary_type AS salary_type_snapshot,
  e.base_rate AS base_rate_snapshot,
  CASE
    WHEN e.salary_type = 'monthly' THEN 1.00::numeric(10, 2)
    ELSE ru.pay_units
  END AS pay_units,
  CASE
    WHEN e.salary_type = 'monthly' THEN e.base_rate
    ELSE ROUND(e.base_rate * ru.pay_units, 2)
  END AS base_pay,
  COALESCE(a.additions_total, 0)::numeric(12, 2) AS additions_total,
  COALESCE(a.deductions_total, 0)::numeric(12, 2) AS deductions_total,
  ROUND(
    (
      CASE
        WHEN e.salary_type = 'monthly' THEN e.base_rate
        ELSE e.base_rate * ru.pay_units
      END
    ) + COALESCE(a.additions_total, 0) - COALESCE(a.deductions_total, 0),
    2
  ) AS net_pay,
  CASE
    WHEN ru.pay_period_name IN (
      'Software Shop TH - January 2026',
      'Software Shop TH - February 2026'
    ) THEN 'paid'
    ELSE 'calculated'
  END AS status,
  p.payment_date AS payment_date,
  CASE
    WHEN ru.pay_period_name = 'Software Shop TH - January 2026'
      THEN 'THB transfer via KBank Biz Online'
    WHEN ru.pay_period_name = 'Software Shop TH - February 2026'
      THEN 'THB transfer via SCB Business Anywhere'
    WHEN ru.pay_period_name = 'Software Shop TH - March 2026'
      THEN 'Scheduled payout; calculation locked — transfer not posted yet'
    ELSE NULL
  END AS payment_note,
  CASE
    WHEN ru.pay_period_name = 'Software Shop TH - January 2026'
      THEN 'TH-2026-01-BATCH-01'
    WHEN ru.pay_period_name = 'Software Shop TH - February 2026'
      THEN 'TH-2026-02-BATCH-01'
    WHEN ru.pay_period_name = 'Software Shop TH - March 2026'
      THEN 'TH-2026-03-BATCH-PENDING'
    ELSE NULL
  END AS payment_reference,
  'seed-admin-software-shop-th' AS created_by_user_id,
  'seed-admin-software-shop-th' AS updated_by_user_id,
  CASE
    WHEN ru.pay_period_name IN (
      'Software Shop TH - January 2026',
      'Software Shop TH - February 2026'
    ) THEN 'seed-admin-software-shop-th'
    ELSE NULL
  END AS approved_by_user_id,
  CASE
    WHEN ru.pay_period_name = 'Software Shop TH - January 2026'
      THEN TIMESTAMPTZ '2026-02-01 16:30:00+07'
    WHEN ru.pay_period_name = 'Software Shop TH - February 2026'
      THEN TIMESTAMPTZ '2026-03-01 16:45:00+07'
    ELSE NULL
  END AS approved_at,
  CASE
    WHEN ru.pay_period_name IN (
      'Software Shop TH - January 2026',
      'Software Shop TH - February 2026'
    ) THEN 'seed-admin-software-shop-th'
    ELSE NULL
  END AS paid_by_user_id,
  CASE
    WHEN ru.pay_period_name = 'Software Shop TH - January 2026'
      THEN TIMESTAMPTZ '2026-02-02 09:15:00+07'
    WHEN ru.pay_period_name = 'Software Shop TH - February 2026'
      THEN TIMESTAMPTZ '2026-03-02 09:10:00+07'
    ELSE NULL
  END AS paid_at,
  NULL::text AS cancelled_by_user_id,
  NULL::timestamptz AS cancelled_at,
  NULL::text AS reopened_by_user_id,
  NULL::timestamptz AS reopened_at
FROM tmp_seed_record_units ru
JOIN tmp_seeded_employees e
  ON e.employee_code = ru.employee_code
JOIN tmp_seeded_pay_periods p
  ON p.name = ru.pay_period_name
LEFT JOIN adjustment_totals a
  ON a.pay_period_name = ru.pay_period_name
 AND a.employee_code = ru.employee_code
WHERE e.employment_status = 'active';

INSERT INTO payroll_records (
  pay_period_id,
  employee_id,
  employee_code_snapshot,
  employee_name_snapshot,
  employee_email_snapshot,
  department_snapshot,
  position_snapshot,
  salary_type_snapshot,
  base_rate_snapshot,
  pay_units,
  base_pay,
  additions_total,
  deductions_total,
  net_pay,
  status,
  payment_date,
  payment_note,
  payment_reference,
  created_by_user_id,
  updated_by_user_id,
  approved_by_user_id,
  approved_at,
  paid_by_user_id,
  paid_at,
  cancelled_by_user_id,
  cancelled_at,
  reopened_by_user_id,
  reopened_at
)
SELECT
  pay_period_id,
  employee_id,
  employee_code_snapshot,
  employee_name_snapshot,
  employee_email_snapshot,
  department_snapshot,
  position_snapshot,
  salary_type_snapshot,
  base_rate_snapshot,
  pay_units,
  base_pay,
  additions_total,
  deductions_total,
  net_pay,
  status,
  payment_date,
  payment_note,
  payment_reference,
  created_by_user_id,
  updated_by_user_id,
  approved_by_user_id,
  approved_at,
  paid_by_user_id,
  paid_at,
  cancelled_by_user_id,
  cancelled_at,
  reopened_by_user_id,
  reopened_at
FROM tmp_seed_records
ON CONFLICT (pay_period_id, employee_id) DO UPDATE
SET
  employee_code_snapshot = EXCLUDED.employee_code_snapshot,
  employee_name_snapshot = EXCLUDED.employee_name_snapshot,
  employee_email_snapshot = EXCLUDED.employee_email_snapshot,
  department_snapshot = EXCLUDED.department_snapshot,
  position_snapshot = EXCLUDED.position_snapshot,
  salary_type_snapshot = EXCLUDED.salary_type_snapshot,
  base_rate_snapshot = EXCLUDED.base_rate_snapshot,
  pay_units = EXCLUDED.pay_units,
  base_pay = EXCLUDED.base_pay,
  additions_total = EXCLUDED.additions_total,
  deductions_total = EXCLUDED.deductions_total,
  net_pay = EXCLUDED.net_pay,
  status = EXCLUDED.status,
  payment_date = EXCLUDED.payment_date,
  payment_note = EXCLUDED.payment_note,
  payment_reference = EXCLUDED.payment_reference,
  updated_by_user_id = EXCLUDED.updated_by_user_id,
  approved_by_user_id = EXCLUDED.approved_by_user_id,
  approved_at = EXCLUDED.approved_at,
  paid_by_user_id = EXCLUDED.paid_by_user_id,
  paid_at = EXCLUDED.paid_at,
  cancelled_by_user_id = EXCLUDED.cancelled_by_user_id,
  cancelled_at = EXCLUDED.cancelled_at,
  reopened_by_user_id = EXCLUDED.reopened_by_user_id,
  reopened_at = EXCLUDED.reopened_at;

INSERT INTO payroll_adjustments (
  payroll_record_id,
  kind,
  type,
  label,
  amount,
  note
)
SELECT
  pr.id,
  a.kind,
  a.type,
  a.label,
  a.amount,
  a.note
FROM tmp_seed_adjustments a
JOIN tmp_seeded_employees e
  ON e.employee_code = a.employee_code
 AND e.employment_status = 'active'
JOIN tmp_seeded_pay_periods p
  ON p.name = a.pay_period_name
JOIN payroll_records pr
  ON pr.pay_period_id = p.id
 AND pr.employee_id = e.id
WHERE NOT EXISTS (
  SELECT 1
  FROM payroll_adjustments existing
  WHERE existing.payroll_record_id = pr.id
    AND existing.kind = a.kind
    AND existing.type = a.type
    AND existing.label = a.label
    AND existing.amount = a.amount
    AND COALESCE(existing.note, '') = COALESCE(a.note, '')
);

COMMIT;
