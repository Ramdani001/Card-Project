-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "maxQtyPurchase" INTEGER,
ADD COLUMN     "minQtyPurchase" INTEGER;
