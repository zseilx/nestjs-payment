-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'BOOK';
ALTER TYPE "PaymentMethod" ADD VALUE 'CULTURE';
ALTER TYPE "PaymentMethod" ADD VALUE 'SMART_CULTURE';
ALTER TYPE "PaymentMethod" ADD VALUE 'HAPPY_MONEY';
ALTER TYPE "PaymentMethod" ADD VALUE 'MOBILE_POP';
ALTER TYPE "PaymentMethod" ADD VALUE 'TEEN_CASH';
ALTER TYPE "PaymentMethod" ADD VALUE 'T_MONEY';
ALTER TYPE "PaymentMethod" ADD VALUE 'CVS';
ALTER TYPE "PaymentMethod" ADD VALUE 'EGG_MONEY';
ALTER TYPE "PaymentMethod" ADD VALUE 'ON_CASH';
ALTER TYPE "PaymentMethod" ADD VALUE 'PHONE_BILL';
ALTER TYPE "PaymentMethod" ADD VALUE 'CASH_BEE';
ALTER TYPE "PaymentMethod" ADD VALUE 'KAKAO_PAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYCO';
ALTER TYPE "PaymentMethod" ADD VALUE 'CHECK_PAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'TOSS';
ALTER TYPE "PaymentMethod" ADD VALUE 'SSG_PAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'NAVER_PAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'SAMSUNG_PAY';
ALTER TYPE "PaymentMethod" ADD VALUE 'APPLE_PAY';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
