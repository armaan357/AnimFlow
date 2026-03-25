/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_githubId_key" ON "user"("githubId");
