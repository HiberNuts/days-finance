/*
  Warnings:

  - The primary key for the `Organisation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- AlterTable
ALTER TABLE "Organisation" DROP CONSTRAINT "Organisation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "Organisation_id_seq";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "organizationId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_id_key" ON "Organisation"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
