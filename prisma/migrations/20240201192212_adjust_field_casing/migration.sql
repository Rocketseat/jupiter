/*
  Warnings:

  - You are about to drop the column `token_type` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "token_type",
ADD COLUMN     "tokenType" TEXT;
