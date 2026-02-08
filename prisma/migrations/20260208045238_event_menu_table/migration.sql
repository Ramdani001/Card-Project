-- CreateTable
CREATE TABLE "Menu" (
    "idMenu" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "parentCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("idMenu")
);

-- CreateTable
CREATE TABLE "Event" (
    "idEvent" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("idEvent")
);

-- CreateTable
CREATE TABLE "EventImage" (
    "idImage" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "idEvent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("idImage")
);

-- CreateIndex
CREATE UNIQUE INDEX "Menu_code_key" ON "Menu"("code");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "Menu"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_idEvent_fkey" FOREIGN KEY ("idEvent") REFERENCES "Event"("idEvent") ON DELETE CASCADE ON UPDATE CASCADE;
