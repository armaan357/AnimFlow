/*
  Warnings:

  - A unique constraint covering the columns `[animationId,hash]` on the table `animationVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "animationVersion" ADD COLUMN     "hash" TEXT;

-- CreateIndex
CREATE INDEX "animationVersion_hash_idx" ON "animationVersion"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "animationVersion_animationId_hash_key" ON "animationVersion"("animationId", "hash");
