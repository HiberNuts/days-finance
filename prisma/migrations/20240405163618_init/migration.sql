-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT NOT NULL DEFAULT 'no-token';
