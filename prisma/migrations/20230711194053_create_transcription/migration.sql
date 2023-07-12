/*
  Warnings:

  - You are about to drop the column `transcription` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "transcription";

-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcription_videoId_key" ON "Transcription"("videoId");

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
