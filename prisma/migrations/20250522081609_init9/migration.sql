/*
  Warnings:

  - Made the column `cancelRedirectUrl` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `failureRedirectUrl` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `successRedirectUrl` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "cancelRedirectUrl" SET NOT NULL,
ALTER COLUMN "failureRedirectUrl" SET NOT NULL,
ALTER COLUMN "successRedirectUrl" SET NOT NULL;
