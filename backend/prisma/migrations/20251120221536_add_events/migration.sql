/*
  Warnings:

  - You are about to drop the column `address` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `maxParticipants` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Event` table. All the data in the column will be lost.
  - The primary key for the `EventParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `status` on the `EventParticipant` table. All the data in the column will be lost.
  - The primary key for the `UserHobby` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,eventId]` on the table `EventParticipant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,hobbyId]` on the table `UserHobby` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `hobbyId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_hobbyId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "address",
DROP COLUMN "endTime",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "maxParticipants",
DROP COLUMN "startTime",
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "hobbyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_pkey",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserHobby" DROP CONSTRAINT "UserHobby_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserHobby_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_userId_eventId_key" ON "EventParticipant"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHobby_userId_hobbyId_key" ON "UserHobby"("userId", "hobbyId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hobbyId_fkey" FOREIGN KEY ("hobbyId") REFERENCES "Hobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
