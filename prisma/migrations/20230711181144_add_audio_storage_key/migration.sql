/*
  Warnings:

  - Added the required column `audioStorageKey` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "audioStorageKey" TEXT NOT NULL;
