DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";--> statement-breakpoint
DROP INDEX IF EXISTS "Session_sessionToken_key";--> statement-breakpoint
DROP INDEX IF EXISTS "VerificationToken_identifier_token_key";--> statement-breakpoint
ALTER TABLE "Session" ADD PRIMARY KEY ("sessionToken");--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint
ALTER TABLE "Session" DROP COLUMN IF EXISTS "id";