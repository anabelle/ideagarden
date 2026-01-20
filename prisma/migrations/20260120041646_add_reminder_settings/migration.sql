-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reminderTime" TEXT NOT NULL DEFAULT '09:00',
ADD COLUMN     "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';
