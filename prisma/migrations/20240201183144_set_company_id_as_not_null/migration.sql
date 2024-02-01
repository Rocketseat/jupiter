/*
  Warnings:

  - Made the column `companyId` on table `Tag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `UploadBatch` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_companyId_fkey";

-- DropForeignKey
ALTER TABLE "UploadBatch" DROP CONSTRAINT "UploadBatch_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_companyId_fkey";

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UploadBatch" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "companyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
