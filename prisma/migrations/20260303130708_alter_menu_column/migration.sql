/*
  Warnings:

  - Added the required column `updatedAt` to the `PaymentLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "isDashboardMenu" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PaymentLog" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
