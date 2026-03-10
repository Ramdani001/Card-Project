-- DropForeignKey
ALTER TABLE "RoleNotification" DROP CONSTRAINT "RoleNotification_roleId_fkey";

-- AddForeignKey
ALTER TABLE "RoleNotification" ADD CONSTRAINT "RoleNotification_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
