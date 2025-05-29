/*
  Warnings:

  - You are about to drop the column `isVatFree` on the `Product` table. All the data in the column will be lost.
  - Made the column `vatRate` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isVatFree",
ALTER COLUMN "vatRate" SET NOT NULL;
