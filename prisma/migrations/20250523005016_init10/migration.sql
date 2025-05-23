/*
  Warnings:

  - You are about to drop the column `mobileUrl` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `onlineUrl` on the `PayletterDetail` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "PayletterDetail" DROP COLUMN "mobileUrl",
DROP COLUMN "onlineUrl";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "mobileUrl" TEXT,
ADD COLUMN     "onlineUrl" TEXT;
