ALTER TABLE "Account" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Company" ADD COLUMN "externalId" text;--> statement-breakpoint
ALTER TABLE "Video" ADD COLUMN "externalStatus" text;