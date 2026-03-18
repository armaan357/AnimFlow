/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "providerURL" TEXT DEFAULT 'email/password',
ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");
