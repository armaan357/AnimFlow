/*
  Warnings:

  - A unique constraint covering the columns `[versionNo,animationId]` on the table `animationVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "animationVersion_animationId_key";

-- DropIndex
DROP INDEX "animationVersion_versionNo_key";

-- AlterTable
ALTER TABLE "animation" ADD COLUMN     "currentVersionId" TEXT;

-- AlterTable
ALTER TABLE "animationVersion" ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "renderTimeMs" INTEGER;

-- CreateIndex
CREATE INDEX "animation_userId_idx" ON "animation"("userId");

-- CreateIndex
CREATE INDEX "animationVersion_animationId_idx" ON "animationVersion"("animationId");

-- CreateIndex
CREATE UNIQUE INDEX "animationVersion_versionNo_animationId_key" ON "animationVersion"("versionNo", "animationId");
