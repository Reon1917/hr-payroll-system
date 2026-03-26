ALTER TABLE "employees" ADD COLUMN "worker_type" text DEFAULT 'thai' NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "nationality" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "national_id" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "passport_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "tax_id" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "social_security_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "social_security_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "hire_date" date;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "work_permit_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "work_permit_expiry_date" date;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "visa_type" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "visa_expiry_date" date;