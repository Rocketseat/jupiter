/*
  Warnings:

  - You are about to alter the column `start` on the `TranscriptionSegment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `end` on the `TranscriptionSegment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "TranscriptionSegment" ALTER COLUMN "start" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "end" SET DATA TYPE DECIMAL(10,2);
