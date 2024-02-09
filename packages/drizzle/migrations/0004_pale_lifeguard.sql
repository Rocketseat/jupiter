ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_pkey";--> statement-breakpoint;
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_pkey";--> statement-breakpoint;
DROP INDEX IF EXISTS "Account_pkey";--> statement-breakpoint
DROP INDEX IF EXISTS "Session_pkey";--> statement-breakpoint
DROP INDEX IF EXISTS "VerificationToken_token_key";--> statement-breakpoint
ALTER TABLE "Session" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "Session" ADD PRIMARY KEY ("sessionToken");--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_pk" PRIMARY KEY ("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_identifier_token_pk" PRIMARY KEY("identifier","token");