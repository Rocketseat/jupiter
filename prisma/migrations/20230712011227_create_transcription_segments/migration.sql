-- AlterTable
ALTER TABLE "Transcription" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "TranscriptionSegment" (
    "id" TEXT NOT NULL,
    "transcriptionId" TEXT NOT NULL,
    "start" DECIMAL(65,30) NOT NULL,
    "end" DECIMAL(65,30) NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "TranscriptionSegment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TranscriptionSegment" ADD CONSTRAINT "TranscriptionSegment_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "Transcription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
