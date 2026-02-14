/*
  Warnings:

  - You are about to drop the column `durationSeconds` on the `animationVersion` table. All the data in the column will be lost.
  - You are about to drop the column `fileSizeBytes` on the `animationVersion` table. All the data in the column will be lost.
  - You are about to drop the column `renderTimeMs` on the `animationVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "animationVersion" DROP COLUMN "durationSeconds",
DROP COLUMN "fileSizeBytes",
DROP COLUMN "renderTimeMs";
