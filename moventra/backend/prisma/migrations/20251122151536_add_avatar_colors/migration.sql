/*
  Warnings:

  - You are about to drop the column `skinTone` on the `UserAvatar` table. All the data in the column will be lost.
  - Made the column `hairColor` on table `UserAvatar` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserAvatar" DROP COLUMN "skinTone",
ADD COLUMN     "pantsColor" TEXT NOT NULL DEFAULT '#111827',
ADD COLUMN     "shirtColor" TEXT NOT NULL DEFAULT '#3b82f6',
ADD COLUMN     "skinColor" TEXT NOT NULL DEFAULT '#f3c9a8',
ALTER COLUMN "hairColor" SET NOT NULL,
ALTER COLUMN "hairColor" SET DEFAULT '#facc15';
