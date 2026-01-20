-- CreateEnum
CREATE TYPE "SeedStatus" AS ENUM ('ACTIVE', 'HARVESTED', 'COMPOSTED');

-- CreateEnum
CREATE TYPE "SeedSection" AS ENUM ('SEEDS', 'SPROUTING', 'READY_TO_HARVEST', 'COMPOST');

-- CreateEnum
CREATE TYPE "Author" AS ENUM ('HUMAN', 'AI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "telegramId" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seed" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "waterings" INTEGER NOT NULL DEFAULT 0,
    "status" "SeedStatus" NOT NULL DEFAULT 'ACTIVE',
    "section" "SeedSection" NOT NULL DEFAULT 'SEEDS',
    "plantedBy" "Author" NOT NULL DEFAULT 'HUMAN',
    "userId" TEXT NOT NULL,
    "mergedIntoId" TEXT,
    "plantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WateringLog" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" "Author" NOT NULL DEFAULT 'HUMAN',
    "seedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WateringLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#4ade80',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedTag" (
    "seedId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "SeedTag_pkey" PRIMARY KEY ("seedId","tagId")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_telegramId_idx" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "Seed_userId_idx" ON "Seed"("userId");

-- CreateIndex
CREATE INDEX "Seed_status_idx" ON "Seed"("status");

-- CreateIndex
CREATE INDEX "Seed_section_idx" ON "Seed"("section");

-- CreateIndex
CREATE INDEX "WateringLog_seedId_idx" ON "WateringLog"("seedId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");

-- AddForeignKey
ALTER TABLE "Seed" ADD CONSTRAINT "Seed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seed" ADD CONSTRAINT "Seed_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "Seed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WateringLog" ADD CONSTRAINT "WateringLog_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "Seed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedTag" ADD CONSTRAINT "SeedTag_seedId_fkey" FOREIGN KEY ("seedId") REFERENCES "Seed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedTag" ADD CONSTRAINT "SeedTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
