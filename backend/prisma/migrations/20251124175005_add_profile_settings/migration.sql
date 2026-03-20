-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "showGroups" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showInterests" BOOLEAN NOT NULL DEFAULT true;
