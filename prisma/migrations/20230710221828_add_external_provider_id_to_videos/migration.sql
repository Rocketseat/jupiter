/*
  Warnings:

  - A unique constraint covering the columns `[externalProviderId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "externalProviderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Video_externalProviderId_key" ON "Video"("externalProviderId");
