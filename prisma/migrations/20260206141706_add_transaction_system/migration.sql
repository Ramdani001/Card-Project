-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'SENT', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Cart" (
    "idCart" SERIAL NOT NULL,
    "idUsr" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("idCart")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "idCartItem" SERIAL NOT NULL,
    "idCart" INTEGER NOT NULL,
    "idCard" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("idCartItem")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "idTrx" SERIAL NOT NULL,
    "idUsr" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "snapAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("idTrx")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "idTrxItem" SERIAL NOT NULL,
    "idTrx" INTEGER NOT NULL,
    "idCard" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("idTrxItem")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_idUsr_key" ON "Cart"("idUsr");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_idCart_idCard_key" ON "CartItem"("idCart", "idCard");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_idUsr_fkey" FOREIGN KEY ("idUsr") REFERENCES "User"("idUsr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_idCart_fkey" FOREIGN KEY ("idCart") REFERENCES "Cart"("idCart") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_idCard_fkey" FOREIGN KEY ("idCard") REFERENCES "Card"("idCard") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_idUsr_fkey" FOREIGN KEY ("idUsr") REFERENCES "User"("idUsr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_idTrx_fkey" FOREIGN KEY ("idTrx") REFERENCES "Transaction"("idTrx") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_idCard_fkey" FOREIGN KEY ("idCard") REFERENCES "Card"("idCard") ON DELETE RESTRICT ON UPDATE CASCADE;
