/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "authKeyName" TEXT,
ADD COLUMN     "authType" TEXT;

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndpointConfig" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndpointConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeSource_productId_idx" ON "KnowledgeSource"("productId");

-- CreateIndex
CREATE INDEX "EndpointConfig_productId_idx" ON "EndpointConfig"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "EndpointConfig_productId_operationId_key" ON "EndpointConfig"("productId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_apiKey_key" ON "Product"("apiKey");

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndpointConfig" ADD CONSTRAINT "EndpointConfig_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
