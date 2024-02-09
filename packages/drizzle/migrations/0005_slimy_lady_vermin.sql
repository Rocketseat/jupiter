ALTER TABLE "UploadBatch" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "Video" ADD COLUMN "userId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
