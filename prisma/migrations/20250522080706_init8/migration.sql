-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cancelRedirectUrl" TEXT,
ADD COLUMN     "failureRedirectUrl" TEXT,
ADD COLUMN     "successRedirectUrl" TEXT;
