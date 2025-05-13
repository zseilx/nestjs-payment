-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_CANCELED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'MOBILE', 'POINT', 'VOUCHER', 'OTHER');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRefundable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "paidAmount" INTEGER,
    "refundedAmount" INTEGER,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalOrderNo" TEXT,
    "summaryTitle" TEXT,
    "couponAmount" INTEGER,
    "discountAmount" INTEGER,
    "disposableCupDeposit" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "canceledQty" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "optionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "serviceName" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "onlineUrl" TEXT,
    "mobileUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayletterDetail" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "code" TEXT,
    "message" TEXT,
    "tid" TEXT,
    "cid" TEXT,
    "orderNo" TEXT,
    "pgcode" TEXT NOT NULL,
    "serviceName" TEXT,
    "productName" TEXT,
    "payhash" TEXT,
    "payInfo" TEXT,
    "methodInfo" TEXT,
    "domesticFlag" TEXT,
    "billkey" TEXT,
    "cardInfo" TEXT,
    "disposableCupDeposit" INTEGER,
    "taxAmount" INTEGER,
    "taxfreeAmount" INTEGER,
    "nonsettleAmount" INTEGER,
    "couponAmount" INTEGER,
    "receiptPossibleAmount" INTEGER,
    "cashReceiptCode" TEXT,
    "cashReceiptMessage" TEXT,
    "cashReceiptCid" TEXT,
    "cashReceiptDealNo" TEXT,
    "cashReceiptIssueType" TEXT,
    "cashReceiptPayerSid" TEXT,
    "cashReceiptType" TEXT,
    "account_no" TEXT,
    "account_name" TEXT,
    "account_holder" TEXT,
    "bank_code" TEXT,
    "bank_name" TEXT,
    "issue_tid" TEXT,
    "expire_date" TEXT,
    "expire_time" TEXT,
    "transactionDate" TIMESTAMP(3),

    CONSTRAINT "PayletterDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "reason" TEXT,
    "amount" INTEGER NOT NULL,
    "quantity" INTEGER,
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayletterDetail_paymentId_key" ON "PayletterDetail"("paymentId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayletterDetail" ADD CONSTRAINT "PayletterDetail_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
