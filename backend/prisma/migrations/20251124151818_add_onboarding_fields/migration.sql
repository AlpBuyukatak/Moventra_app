/*
  Warnings:

  - You are about to drop the column `purpose` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "purpose",
ALTER COLUMN "planType" SET DEFAULT 'free';
