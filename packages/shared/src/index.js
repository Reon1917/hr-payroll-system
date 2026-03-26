export const ROLES = ["admin", "employee"];

export const EMPLOYMENT_STATUSES = [
  "active",
  "inactive",
  "resigned",
  "terminated",
];

export const WORKER_TYPES = ["thai", "foreign"];

export const SALARY_TYPES = ["monthly", "daily", "hourly"];

export const PAYROLL_STATUSES = [
  "draft",
  "calculated",
  "approved",
  "paid",
  "cancelled",
];

export const ADJUSTMENT_KINDS = ["addition", "deduction"];

export const ADDITION_TYPES = [
  "overtime",
  "bonus",
  "allowance",
  "other_addition",
];

export const DEDUCTION_TYPES = [
  "unpaid_leave",
  "late_penalty",
  "tax",
  "social_security",
  "loan",
  "other_deduction",
];

export const ADJUSTMENT_TYPES = [...ADDITION_TYPES, ...DEDUCTION_TYPES];

export const PAYROLL_STATUS_LABELS = {
  draft: "Draft",
  calculated: "Calculated",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const EMPLOYMENT_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  resigned: "Resigned",
  terminated: "Terminated",
};

export const WORKER_TYPE_LABELS = {
  thai: "Thai national",
  foreign: "Foreign employee",
};

export const SALARY_TYPE_LABELS = {
  monthly: "Monthly salary",
  daily: "Daily wage",
  hourly: "Hourly wage",
};
