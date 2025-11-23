/*
  Warnings:

  - You are about to alter the column `outstandingShares` on the `StockData` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StockData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issuerName" TEXT NOT NULL,
    "sector" TEXT,
    "netProfit" REAL NOT NULL,
    "eps" REAL NOT NULL,
    "outstandingShares" BIGINT NOT NULL,
    "currentPrice" REAL NOT NULL,
    "totalEquity" REAL NOT NULL,
    "totalDebt" REAL NOT NULL,
    "dividends" REAL NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL
);
INSERT INTO "new_StockData" ("currentPrice", "dividends", "eps", "id", "issuerName", "netProfit", "outstandingShares", "quarter", "sector", "totalDebt", "totalEquity", "year") SELECT "currentPrice", "dividends", "eps", "id", "issuerName", "netProfit", "outstandingShares", "quarter", "sector", "totalDebt", "totalEquity", "year" FROM "StockData";
DROP TABLE "StockData";
ALTER TABLE "new_StockData" RENAME TO "StockData";
CREATE UNIQUE INDEX "StockData_issuerName_quarter_year_key" ON "StockData"("issuerName", "quarter", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
