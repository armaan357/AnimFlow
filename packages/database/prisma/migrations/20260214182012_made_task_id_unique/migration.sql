/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `animationVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "animationVersion_taskId_key" ON "animationVersion"("taskId");
