/*
  Warnings:

  - Added the required column `fileName` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `ImageCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `ImageCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `ImageCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `ImageCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `ImageCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventImage" ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ImageCard" ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
