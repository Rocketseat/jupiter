CREATE TABLE IF NOT EXISTS "company_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"url" text NOT NULL,
	"events" text[]
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_webhooks" ADD CONSTRAINT "company_webhooks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
