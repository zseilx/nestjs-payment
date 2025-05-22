/*
  Warnings:

  - You are about to drop the column `account_holder` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `account_name` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `account_no` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `bank_code` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `expire_date` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `expire_time` on the `PayletterDetail` table. All the data in the column will be lost.
  - You are about to drop the column `issue_tid` on the `PayletterDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PayletterDetail" DROP COLUMN "account_holder",
DROP COLUMN "account_name",
DROP COLUMN "account_no",
DROP COLUMN "bank_code",
DROP COLUMN "bank_name",
DROP COLUMN "expire_date",
DROP COLUMN "expire_time",
DROP COLUMN "issue_tid",
ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNo" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "expireDate" TEXT,
ADD COLUMN     "expireTime" TEXT,
ADD COLUMN     "issueTid" TEXT;
