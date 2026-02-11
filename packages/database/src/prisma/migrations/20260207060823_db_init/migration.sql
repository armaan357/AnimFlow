-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "firstPrompt" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "animation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animationVersion" (
    "id" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "videoURL" TEXT,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "animationId" TEXT NOT NULL,

    CONSTRAINT "animationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_userName_key" ON "user"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "animationVersion_versionNo_key" ON "animationVersion"("versionNo");

-- CreateIndex
CREATE UNIQUE INDEX "animationVersion_animationId_key" ON "animationVersion"("animationId");

-- AddForeignKey
ALTER TABLE "animation" ADD CONSTRAINT "animation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animationVersion" ADD CONSTRAINT "animationVersion_animationId_fkey" FOREIGN KEY ("animationId") REFERENCES "animation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
