-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_CANCELED', 'CANCELED', 'FAILED');

-- CreateEnum
CREATE TYPE "PgProviderType" AS ENUM ('PAYLETTER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'MOBILE', 'POINT', 'VOUCHER', 'BOOK', 'CULTURE', 'SMART_CULTURE', 'HAPPY_MONEY', 'MOBILE_POP', 'TEEN_CASH', 'T_MONEY', 'CVS', 'EGG_MONEY', 'ON_CASH', 'PHONE_BILL', 'CASH_BEE', 'KAKAO_PAY', 'PAYCO', 'CHECK_PAY', 'TOSS', 'SSG_PAY', 'NAVER_PAY', 'SAMSUNG_PAY', 'APPLE_PAY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CREDIT');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "imageUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "stock" INTEGER,
    "type" "ProductType" NOT NULL,
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
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "paidAmount" DECIMAL(65,30),
    "vatAmount" DECIMAL(65,30),
    "refundedAmount" DECIMAL(65,30),
    "paymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundableDate" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "canceledQty" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "productName" TEXT NOT NULL,
    "optionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "pgProvider" "PgProviderType" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "serviceName" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "onlineUrl" TEXT,
    "mobileUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "successRedirectUrl" TEXT NOT NULL,
    "failureRedirectUrl" TEXT NOT NULL,
    "cancelRedirectUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayletterDetail" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
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
    "disposableCupDeposit" DECIMAL(65,30),
    "amount" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30),
    "taxfreeAmount" DECIMAL(65,30),
    "nonsettleAmount" DECIMAL(65,30),
    "couponAmount" DECIMAL(65,30),
    "receiptFlag" TEXT,
    "receiptPossibleAmount" DECIMAL(65,30),
    "installMonth" INTEGER,
    "cashReceiptCid" TEXT,
    "cashReceiptCode" TEXT,
    "cashReceiptDealNo" TEXT,
    "cashReceiptIssueType" TEXT,
    "cashReceiptMessage" TEXT,
    "cashReceiptPayerSid" TEXT,
    "cashReceiptType" TEXT,
    "accountNo" TEXT,
    "accountName" TEXT,
    "accountHolder" TEXT,
    "bankCode" TEXT,
    "bankName" TEXT,
    "issueTid" TEXT,
    "expireDate" TEXT,
    "expireTime" TEXT,
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
    "amount" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER,
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayletterDetail_paymentId_key" ON "PayletterDetail"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PayletterDetail_tid_key" ON "PayletterDetail"("tid");

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
