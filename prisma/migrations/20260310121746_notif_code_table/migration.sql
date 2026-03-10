-- CreateTable
CREATE TABLE "RoleNotification" (
    "id" TEXT NOT NULL,
    "notificationCode" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoleNotification" ADD CONSTRAINT "RoleNotification_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
