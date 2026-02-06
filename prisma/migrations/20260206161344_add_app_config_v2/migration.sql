/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `AppConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AppConfig" ALTER COLUMN "value" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_code_key" ON "AppConfig"("code");
