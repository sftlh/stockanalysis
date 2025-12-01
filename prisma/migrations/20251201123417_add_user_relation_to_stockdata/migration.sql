/*
  Warnings:

  - A unique constraint covering the columns `[issuerName,quarter,year,userId]` on the table `StockData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "StockData_issuerName_quarter_year_key";

-- AlterTable
ALTER TABLE "StockData" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "StockData_issuerName_quarter_year_userId_key" ON "StockData"("issuerName", "quarter", "year", "userId");

-- AddForeignKey
ALTER TABLE "StockData" ADD CONSTRAINT "StockData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
