ALTER TYPE "WebhookStatus" RENAME TO "UploadWebhookStatus";--> statement-breakpoint
ALTER TYPE "WebhookType" RENAME TO "UploadWebhookType";--> statement-breakpoint
ALTER TABLE "_TagToVideo" RENAME TO "_TagToUpload";--> statement-breakpoint
ALTER TABLE "Video" RENAME TO "Upload";--> statement-breakpoint
ALTER TABLE "Webhook" RENAME TO "UploadWebhook";--> statement-breakpoint
ALTER TABLE "Transcription" RENAME COLUMN "videoId" TO "uploadId";--> statement-breakpoint
ALTER TABLE "UploadWebhook" RENAME COLUMN "videoId" TO "uploadId";--> statement-breakpoint
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_videoId_Video_id_fk";
--> statement-breakpoint
ALTER TABLE "_TagToUpload" DROP CONSTRAINT "_TagToVideo_A_Tag_id_fk";
--> statement-breakpoint
ALTER TABLE "_TagToUpload" DROP CONSTRAINT "_TagToVideo_B_Video_id_fk";
--> statement-breakpoint
ALTER TABLE "Upload" DROP CONSTRAINT "Video_uploadBatchId_UploadBatch_id_fk";
--> statement-breakpoint
ALTER TABLE "Upload" DROP CONSTRAINT "Video_companyId_Company_id_fk";
--> statement-breakpoint
ALTER TABLE "Upload" DROP CONSTRAINT "Video_authorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "UploadWebhook" DROP CONSTRAINT "Webhook_videoId_Video_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "Transcription_videoId_key";--> statement-breakpoint
DROP INDEX IF EXISTS "_TagToVideo_AB_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "_TagToVideo_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "Video_externalProviderId_key";--> statement-breakpoint
ALTER TABLE "UploadWebhook" ALTER COLUMN "type" SET DATA TYPE "UploadWebhookType";--> statement-breakpoint
ALTER TABLE "UploadWebhook" ALTER COLUMN "status" SET DATA TYPE "UploadWebhookStatus";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Transcription_uploadId_key" ON "Transcription" ("uploadId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_TagToUpload_AB_unique" ON "_TagToUpload" ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_TagToUpload_B_index" ON "_TagToUpload" ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Upload_externalProviderId_key" ON "Upload" ("externalProviderId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_uploadId_Upload_id_fk" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_TagToUpload" ADD CONSTRAINT "_TagToUpload_A_Tag_id_fk" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_TagToUpload" ADD CONSTRAINT "_TagToUpload_B_Upload_id_fk" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Upload" ADD CONSTRAINT "Upload_uploadBatchId_UploadBatch_id_fk" FOREIGN KEY ("uploadBatchId") REFERENCES "UploadBatch"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Upload" ADD CONSTRAINT "Upload_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Upload" ADD CONSTRAINT "Upload_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UploadWebhook" ADD CONSTRAINT "UploadWebhook_uploadId_Upload_id_fk" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
