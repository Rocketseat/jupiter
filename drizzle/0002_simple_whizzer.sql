ALTER TABLE "Session" ALTER COLUMN "expires" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Tag" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Transcription" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Transcription" ALTER COLUMN "reviewedAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "UploadBatch" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "VerificationToken" ALTER COLUMN "expires" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Video" ALTER COLUMN "processedAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Video" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Webhook" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Webhook" ALTER COLUMN "finishedAt" SET DATA TYPE timestamp (3);