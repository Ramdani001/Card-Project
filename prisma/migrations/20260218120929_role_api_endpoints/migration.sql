-- CreateTable
CREATE TABLE "RoleApiAccess" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "apiEndpointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleApiAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiEndpoint" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleApiAccess_roleId_apiEndpointId_key" ON "RoleApiAccess"("roleId", "apiEndpointId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiEndpoint_url_key" ON "ApiEndpoint"("url");

-- AddForeignKey
ALTER TABLE "RoleApiAccess" ADD CONSTRAINT "RoleApiAccess_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleApiAccess" ADD CONSTRAINT "RoleApiAccess_apiEndpointId_fkey" FOREIGN KEY ("apiEndpointId") REFERENCES "ApiEndpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
