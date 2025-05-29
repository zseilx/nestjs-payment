/*
  Warnings:

  - Added the required column `vatAmount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatRate` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "vatAmount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isVatFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vatRate" DOUBLE PRECISION DEFAULT 0.1;
