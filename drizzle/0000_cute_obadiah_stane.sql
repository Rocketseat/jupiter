DO $$ BEGIN
 CREATE TYPE "WebhookStatus" AS ENUM('ERROR', 'SUCCESS', 'RUNNING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "WebhookType" AS ENUM('CREATE_SUBTITLES_FROM_TRANSCRIPTION', 'UPDATE_EXTERNAL_PROVIDER_STATUS', 'UPLOAD_TO_EXTERNAL_PROVIDER', 'CREATE_TRANSCRIPTION', 'PROCESS_VIDEO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"scope" text,
	"accessToken" text,
	"expiresAt" integer,
	"idToken" text,
	"refreshToken" text,
	"sessionState" text,
	"tokenType" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"companyId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_TagToVideo" (
	"A" uuid NOT NULL,
	"B" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Transcription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"videoId" uuid NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"reviewedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TranscriptionSegment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcriptionId" uuid NOT NULL,
	"start" numeric(10, 2) NOT NULL,
	"end" numeric(10, 2) NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UploadBatch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"companyId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp(3),
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration" integer NOT NULL,
	"title" text NOT NULL,
	"storageKey" text,
	"description" text,
	"uploadBatchId" uuid,
	"companyId" uuid NOT NULL,
	"externalProviderId" text,
	"audioStorageKey" text,
	"processedAt" timestamp(3),
	"sizeInBytes" integer NOT NULL,
	"uploadOrder" integer NOT NULL,
	"commitUrl" text,
	"subtitlesStorageKey" text,
	"language" text DEFAULT 'pt' NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Webhook" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"videoId" uuid NOT NULL,
	"type" "WebhookType" NOT NULL,
	"status" "WebhookStatus" DEFAULT 'RUNNING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"finishedAt" timestamp(3),
	"metadata" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account" ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Company_domain_key" ON "Company" ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session" ("sessionToken");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_TagToVideo_AB_unique" ON "_TagToVideo" ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_TagToVideo_B_index" ON "_TagToVideo" ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Transcription_videoId_key" ON "Transcription" ("videoId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken" ("identifier","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Video_externalProviderId_key" ON "Video" ("externalProviderId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_TagToVideo" ADD CONSTRAINT "_TagToVideo_A_Tag_id_fk" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_TagToVideo" ADD CONSTRAINT "_TagToVideo_B_Video_id_fk" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_videoId_Video_id_fk" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TranscriptionSegment" ADD CONSTRAINT "TranscriptionSegment_transcriptionId_Transcription_id_fk" FOREIGN KEY ("transcriptionId") REFERENCES "Transcription"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Video" ADD CONSTRAINT "Video_uploadBatchId_UploadBatch_id_fk" FOREIGN KEY ("uploadBatchId") REFERENCES "UploadBatch"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Video" ADD CONSTRAINT "Video_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_videoId_Video_id_fk" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
