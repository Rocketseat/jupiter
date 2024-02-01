-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "UploadBatch" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default values

UPDATE "Tag" SET "companyId" = 'BE7CB85C-E3A4-4B37-908C-400C1A582749' WHERE "companyId" IS NULL;

UPDATE "UploadBatch" SET "companyId" = 'BE7CB85C-E3A4-4B37-908C-400C1A582749' WHERE "companyId" IS NULL;

UPDATE "Video" SET "companyId" = 'BE7CB85C-E3A4-4B37-908C-400C1A582749' WHERE "companyId" IS NULL;