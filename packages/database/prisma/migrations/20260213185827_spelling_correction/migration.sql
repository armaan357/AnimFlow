/*
  Warnings:

  - You are about to drop the column `TaskId` on the `animationVersion` table. All the data in the column will be lost.
  - Added the required column `taskId` to the `animationVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "animationVersion" DROP COLUMN "TaskId",
ADD COLUMN     "taskId" TEXT NOT NULL;
