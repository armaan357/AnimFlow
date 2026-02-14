-- AlterTable
ALTER TABLE "animationVersion" ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "renderTimeMs" INTEGER;
