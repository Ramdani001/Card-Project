/*
  Warnings:

  - You are about to drop the column `isActive` on the `AppConfig` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `CardCategoryRoleAccess` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `ImageCard` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Voucher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `AppConfig` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId,categoryId]` on the table `CardCategoryRoleAccess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cartId,cardId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoice]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_parentId_fkey";

-- AlterTable
ALTER TABLE "AppConfig" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "CardCategoryRoleAccess" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "EventImage" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ImageCard" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "isActive";

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Card_sku_key" ON "Card"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CardCategoryRoleAccess_roleId_categoryId_key" ON "CardCategoryRoleAccess"("roleId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_cardId_key" ON "CartItem"("cartId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_invoice_key" ON "Transaction"("invoice");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
