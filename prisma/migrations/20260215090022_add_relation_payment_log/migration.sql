/*
  Warnings:

  - Made the column `orderId` on table `PaymentLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaymentLog" ALTER COLUMN "orderId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
