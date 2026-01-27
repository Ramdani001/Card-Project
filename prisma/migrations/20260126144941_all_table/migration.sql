-- CreateTable
CREATE TABLE "TypeCard" (
    "idTypeCard" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "TypeCard_pkey" PRIMARY KEY ("idTypeCard")
);

-- CreateTable
CREATE TABLE "Card" (
    "idCard" SERIAL NOT NULL,
    "idDetail" INTEGER NOT NULL,
    "idTypeCard" INTEGER NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("idCard")
);

-- CreateTable
CREATE TABLE "DetailCard" (
    "idDetail" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "idDiscount" INTEGER,
    "note" TEXT,
    "idImage" INTEGER,

    CONSTRAINT "DetailCard_pkey" PRIMARY KEY ("idDetail")
);

-- CreateTable
CREATE TABLE "Discount" (
    "idDiscount" SERIAL NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("idDiscount")
);

-- CreateTable
CREATE TABLE "Image" (
    "idImage" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("idImage")
);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_idDetail_fkey" FOREIGN KEY ("idDetail") REFERENCES "DetailCard"("idDetail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_idTypeCard_fkey" FOREIGN KEY ("idTypeCard") REFERENCES "TypeCard"("idTypeCard") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailCard" ADD CONSTRAINT "DetailCard_idDiscount_fkey" FOREIGN KEY ("idDiscount") REFERENCES "Discount"("idDiscount") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailCard" ADD CONSTRAINT "DetailCard_idImage_fkey" FOREIGN KEY ("idImage") REFERENCES "Image"("idImage") ON DELETE SET NULL ON UPDATE CASCADE;
