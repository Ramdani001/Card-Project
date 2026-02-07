/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `TypeCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TypeCard_name_key" ON "TypeCard"("name");
