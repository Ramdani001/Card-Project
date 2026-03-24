-- CreateTable
CREATE TABLE "VoucherCardCategory" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "cardCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherCardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherCard" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherRole" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoucherCardCategory" ADD CONSTRAINT "VoucherCardCategory_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCardCategory" ADD CONSTRAINT "VoucherCardCategory_cardCategoryId_fkey" FOREIGN KEY ("cardCategoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCard" ADD CONSTRAINT "VoucherCard_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCard" ADD CONSTRAINT "VoucherCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRole" ADD CONSTRAINT "VoucherRole_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRole" ADD CONSTRAINT "VoucherRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
