/*
  Warnings:

  - You are about to drop the column `newTestColumn` on the `Video` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WebhookType" AS ENUM ('PROCESS_VIDEO', 'CREATE_TRANSCRIPTION', 'UPLOAD_TO_EXTERNAL_PROVIDER');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RUNNING', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "newTestColumn";

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "type" "WebhookType" NOT NULL,
    "status" "WebhookStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "metadata" TEXT,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
