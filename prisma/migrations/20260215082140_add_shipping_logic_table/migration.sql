-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "expedition" TEXT,
ADD COLUMN     "resi" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(15,2) NOT NULL DEFAULT 0;
