/*
  Warnings:

  - Added the required column `TaskId` to the `animationVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "animationVersion" ADD COLUMN     "TaskId" TEXT NOT NULL;
