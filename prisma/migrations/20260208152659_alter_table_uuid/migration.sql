/*
  Warnings:

  - The primary key for the `AppConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idConfig` on the `AppConfig` table. All the data in the column will be lost.
  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idCard` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `idDetail` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `idTypeCard` on the `Card` table. All the data in the column will be lost.
  - The primary key for the `Cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idCart` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `idUsr` on the `Cart` table. All the data in the column will be lost.
  - The primary key for the `CartItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idCard` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `idCart` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `idCartItem` on the `CartItem` table. All the data in the column will be lost.
  - The primary key for the `Discount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `discount` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `idDiscount` on the `Discount` table. All the data in the column will be lost.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idEvent` on the `Event` table. All the data in the column will be lost.
  - The primary key for the `EventImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idEvent` on the `EventImage` table. All the data in the column will be lost.
  - You are about to drop the column `idImage` on the `EventImage` table. All the data in the column will be lost.
  - The primary key for the `Menu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idMenu` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `parentCode` on the `Menu` table. All the data in the column will be lost.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idRole` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idTrx` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `idUsr` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Transaction` table. All the data in the column will be lost.
  - The primary key for the `TransactionItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idCard` on the `TransactionItem` table. All the data in the column will be lost.
  - You are about to drop the column `idTrx` on the `TransactionItem` table. All the data in the column will be lost.
  - You are about to drop the column `idTrxItem` on the `TransactionItem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `TransactionItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `subtotal` on the `TransactionItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The primary key for the `TypeCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idTypeCard` on the `TypeCard` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idRole` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `idUsr` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `DetailCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `AppConfig` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Card` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Card` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Cart` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cartId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `CartItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Discount` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `type` to the `Discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Discount` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Event` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `eventId` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `EventImage` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Menu` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Role` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Transaction` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `subTotalPrice` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardId` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TransactionItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `transactionId` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TypeCard` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('NOMINAL', 'PERCENTAGE');

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_idDetail_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_idTypeCard_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_idUsr_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_idCard_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_idCart_fkey";

-- DropForeignKey
ALTER TABLE "DetailCard" DROP CONSTRAINT "DetailCard_idDiscount_fkey";

-- DropForeignKey
ALTER TABLE "DetailCard" DROP CONSTRAINT "DetailCard_idImage_fkey";

-- DropForeignKey
ALTER TABLE "EventImage" DROP CONSTRAINT "EventImage_idEvent_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_parentCode_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_idUsr_fkey";

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_idCard_fkey";

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_idTrx_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_idRole_fkey";

-- DropIndex
DROP INDEX "AppConfig_code_key";

-- DropIndex
DROP INDEX "Cart_idUsr_key";

-- DropIndex
DROP INDEX "CartItem_idCart_idCard_key";

-- DropIndex
DROP INDEX "Menu_code_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "TypeCard_name_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "AppConfig" DROP CONSTRAINT "AppConfig_pkey",
DROP COLUMN "idConfig",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Card" DROP CONSTRAINT "Card_pkey",
DROP COLUMN "idCard",
DROP COLUMN "idDetail",
DROP COLUMN "idTypeCard",
ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Card_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_pkey",
DROP COLUMN "idCart",
DROP COLUMN "idUsr",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Cart_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_pkey",
DROP COLUMN "idCard",
DROP COLUMN "idCart",
DROP COLUMN "idCartItem",
ADD COLUMN     "cardHistoryId" TEXT,
ADD COLUMN     "cardId" TEXT NOT NULL,
ADD COLUMN     "cartId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Discount" DROP CONSTRAINT "Discount_pkey",
DROP COLUMN "discount",
DROP COLUMN "idDiscount",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" "DiscountType" NOT NULL,
ADD COLUMN     "value" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Discount_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey",
DROP COLUMN "idEvent",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EventImage" DROP CONSTRAINT "EventImage_pkey",
DROP COLUMN "idEvent",
DROP COLUMN "idImage",
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_pkey",
DROP COLUMN "idMenu",
DROP COLUMN "parentCode",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentId" TEXT,
ADD CONSTRAINT "Menu_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "idRole",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_pkey",
DROP COLUMN "idTrx",
DROP COLUMN "idUsr",
DROP COLUMN "totalAmount",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subTotalPrice" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_pkey",
DROP COLUMN "idCard",
DROP COLUMN "idTrx",
DROP COLUMN "idTrxItem",
ADD COLUMN     "cardHistoryId" TEXT,
ADD COLUMN     "cardId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "transactionHistoryId" TEXT,
ADD COLUMN     "transactionId" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TypeCard" DROP CONSTRAINT "TypeCard_pkey",
DROP COLUMN "idTypeCard",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "TypeCard_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "idRole",
DROP COLUMN "idUsr",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "roleId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "DetailCard";

-- DropTable
DROP TABLE "Image";

-- CreateTable
CREATE TABLE "CardTypeCard" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "typeCardId" TEXT NOT NULL,
    "cardHistoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardTypeCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardHistory" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "discountId" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageCard" (
    "id" TEXT NOT NULL,
    "cardId" TEXT,
    "cardHistoryId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItemHistory" (
    "id" TEXT NOT NULL,
    "cartItemHistoryId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "cardHistoryId" TEXT,
    "quantity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItemHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionHistory" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subTotalPrice" DECIMAL(15,2) NOT NULL,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "snapAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItemHistory" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "transactionHistoryId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "cardHistoryId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionItemHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTypeCard" ADD CONSTRAINT "CardTypeCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTypeCard" ADD CONSTRAINT "CardTypeCard_typeCardId_fkey" FOREIGN KEY ("typeCardId") REFERENCES "TypeCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTypeCard" ADD CONSTRAINT "CardTypeCard_cardHistoryId_fkey" FOREIGN KEY ("cardHistoryId") REFERENCES "CardHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCard" ADD CONSTRAINT "ImageCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCard" ADD CONSTRAINT "ImageCard_cardHistoryId_fkey" FOREIGN KEY ("cardHistoryId") REFERENCES "CardHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cardHistoryId_fkey" FOREIGN KEY ("cardHistoryId") REFERENCES "CardHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemHistory" ADD CONSTRAINT "CartItemHistory_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemHistory" ADD CONSTRAINT "CartItemHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemHistory" ADD CONSTRAINT "CartItemHistory_cardHistoryId_fkey" FOREIGN KEY ("cardHistoryId") REFERENCES "CardHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_cardHistoryId_fkey" FOREIGN KEY ("cardHistoryId") REFERENCES "CardHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionHistoryId_fkey" FOREIGN KEY ("transactionHistoryId") REFERENCES "TransactionHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItemHistory" ADD CONSTRAINT "TransactionItemHistory_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItemHistory" ADD CONSTRAINT "TransactionItemHistory_transactionHistoryId_fkey" FOREIGN KEY ("transactionHistoryId") REFERENCES "TransactionHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItemHistory" ADD CONSTRAINT "TransactionItemHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItemHistory" ADD CONSTRAINT "TransactionItemHistory_cardHistoryId_fkey" FOREIGN KEY ("cardHistoryId") REFERENCES "CardHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
