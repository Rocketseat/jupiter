ALTER TABLE "UploadBatch" RENAME COLUMN "userId" TO "authorId";--> statement-breakpoint
ALTER TABLE "Video" RENAME COLUMN "userId" TO "authorId";--> statement-breakpoint
ALTER TABLE "UploadBatch" DROP CONSTRAINT "UploadBatch_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Video" ADD CONSTRAINT "Video_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
