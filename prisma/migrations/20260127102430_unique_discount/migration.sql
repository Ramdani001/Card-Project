/*
  Warnings:

  - A unique constraint covering the columns `[discount]` on the table `Discount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Discount_discount_key" ON "Discount"("discount");
